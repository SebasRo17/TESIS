# Backend Adaptativo E2E - Documentacion Tecnica

## 1. Proposito

Este backend implementa el ciclo adaptativo de la tesis:

```text
usuario estudia / responde evaluacion
-> backend corrige y calcula resultado
-> backend actualiza mastery por tema
-> backend guarda mastery_journal
-> backend llama a Steven
-> Steven devuelve decision o plan
-> backend persiste plans / plan_items
-> frontend refresca dashboard y hoja de ruta
```

El backend es responsable de usuarios, cursos, lecciones, progreso, dominio, planes, persistencia y contratos HTTP. Los modelos externos generan decisiones o contenido, pero el backend valida, normaliza y guarda el resultado.

## 2. Servicios Y Configuracion

Variables principales en `.env`:

```env
ORCHESTRATOR_DECIDE_URL="http://127.0.0.1:8000/decide"
ORCHESTRATOR_QUERY_URL="http://127.0.0.1:8000/query"
VERBAL_MODEL_URL="http://127.0.0.1:8001"
NUMERIC_MODEL_URL="http://127.0.0.1:8080"
```

Servicios esperados:

| Servicio | Puerto | Uso |
| --- | ---: | --- |
| Backend BASE | 3000 | API principal |
| Steven / Orquestador | 8000 | `/decide` y `/query` |
| Alejandro / Verbal | 8001 | Preguntas y explicaciones verbales |
| Elias / Numerico | 8080 | Especialista numerico via llama.cpp |
| Ollama | 11434 | Modelos Qwen usados por Steven |

Health checks utiles:

```bash
curl http://127.0.0.1:3000/health
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8001/health
curl http://127.0.0.1:8080/health
curl http://127.0.0.1:11434/api/tags
```

## 3. Tablas Principales

| Tabla | Funcion |
| --- | --- |
| `courses` | Cursos base comunes para todos |
| `topics` | Temas/subtemas comunes por curso |
| `lessons` | Lecciones base comunes |
| `content_variants` | Contenido generado o semilla por leccion |
| `user_content_assignments` | Variante asignada a un usuario especifico |
| `content_events` | Eventos de lectura/generacion/interaccion |
| `lesson_progress` | Avance estructural por usuario/leccion |
| `user_skill_mastery` | Dominio estimado por usuario/tema |
| `mastery_journal` | Historial de cambios de dominio |
| `exams` | Evaluaciones/simuladores |
| `items` | Preguntas evaluables |
| `exam_items` | Relacion examen-preguntas |
| `exam_attempts` | Intentos de evaluacion por usuario |
| `item_responses` | Respuestas del usuario |
| `plans` | Hoja de ruta activa/historica por usuario |
| `plan_items` | Actividades de la hoja de ruta |
| `orchestrator_decisions` | Registro de decisiones de Steven |

## 4. Logica Adaptativa

### 4.1 Finalizacion De Evaluacion

Endpoint:

```http
POST /api/exam-attempts/:attemptId/finish
Authorization: Bearer <token>
```

Flujo interno:

1. Valida que el intento exista y pertenezca al usuario.
2. Calcula metricas:
   - total de preguntas
   - respondidas
   - correctas
   - `scoreRaw`
   - `scoreNorm`
   - `accuracy`
3. Marca el intento como completado.
4. Agrupa respuestas por `topic_id`.
5. Calcula delta de mastery por tema:

```text
delta = (accuracy - 0.5) * 0.4
```

Ejemplos:

| Accuracy | Delta |
| ---: | ---: |
| 1.00 | +0.20 |
| 0.50 | 0.00 |
| 0.00 | -0.20 |

6. Actualiza `user_skill_mastery`.
7. Inserta evento en `mastery_journal`.
8. Resuelve el `courseId` del examen.
9. Llama internamente a Steven con `DecideForUserUseCase`.
10. Si Steven devuelve plan, crea nuevo `plans` activo y supersede el plan anterior del curso.

Respuesta extendida:

```json
{
  "success": true,
  "data": {
    "id": 10,
    "userId": 5,
    "examId": 2,
    "completedAt": "2026-06-06T20:30:00.000Z",
    "scoreRaw": 3,
    "scoreNorm": 75,
    "metadata": {
      "totalItems": 4,
      "answeredItems": 4,
      "correctAnswers": 3,
      "accuracy": 0.75
    },
    "orchestration": {
      "status": "applied",
      "courseId": 1,
      "decisionRecordId": 25,
      "realDecisionType": "plan",
      "applied": {
        "updatePlan": {}
      }
    }
  }
}
```

Si Steven falla, el examen igual queda finalizado:

```json
{
  "orchestration": {
    "status": "failed",
    "courseId": 1,
    "error": "mensaje del error"
  }
}
```

## 5. Contrato Con Steven

### 5.1 Snapshot

Endpoint de inspeccion:

```http
GET /api/orchestrator/users/:userId/snapshot?courseId=1
```

El snapshot contiene:

- usuario
- curso
- mastery por tema
- journal reciente
- plan activo
- progreso estructural
- reglas aplicables
- elegibilidad por prerequisitos
- ultimas acciones

### 5.2 Decision

Endpoint manual:

```http
POST /api/orchestrator/users/:userId/decide
Content-Type: application/json

{
  "courseId": 1
}
```

Backend envia a Steven:

```json
{
  "user_id": 5,
  "course_id": 1,
  "decision_type": "plan",
  "snapshot": {
    "mastery": {
      "1": 0.2,
      "2": 0.8
    },
    "rule_matches": [],
    "eligible_lessons": [],
    "progress": {},
    "last_actions": {},
    "raw_snapshot": {}
  }
}
```

Backend acepta formato completo:

```json
{
  "decision_type": "plan",
  "plan": {
    "items": [
      {
        "content_ref_type": "lesson",
        "content_ref_id": 1,
        "type": "lesson",
        "priority": 0.8,
        "order_n": 1,
        "due_at": "2026-06-08T00:00:00.000Z",
        "metadata": {
          "status": "pending",
          "rationale": "Refuerzo por bajo dominio"
        }
      }
    ]
  },
  "rationale": "Plan adaptado al dominio actual",
  "model_version": "qwen2.5:14b"
}
```

Backend tambien acepta formato simple heredado:

```json
{
  "decision_type": "plan",
  "plan": {
    "items": [
      {
        "type": "lesson",
        "id": 21,
        "priority": 0.9
      }
    ]
  }
}
```

Normalizacion interna:

| Steven | Backend |
| --- | --- |
| `type` | `contentRefType` si no hay `content_ref_type` |
| `id` | `contentRefId` si no hay `content_ref_id` |
| sin `order_n` | posicion en arreglo + 1 |
| sin `priority` | `0.5` |

## 6. Hoja De Ruta / Study Plan

### 6.1 Obtener Plan Activo

```http
GET /api/me/courses/:courseId/study-plan
```

Devuelve el plan activo del usuario para ese curso.

### 6.2 Obtener Siguiente Actividad

```http
GET /api/me/courses/:courseId/study-plan/next
```

Devuelve el primer `plan_item` con `metadata.status = "pending"`.

### 6.3 Marcar Actividad

```http
PATCH /api/study-plan/items/:itemId
Content-Type: application/json

{
  "status": "done"
}
```

Estados soportados:

- `pending`
- `done`
- `blocked`

El estado se guarda dentro de `plan_items.metadata.status`.

### 6.4 Historial De Planes

```http
GET /api/me/courses/:courseId/study-plans
```

Cuando se crea un nuevo plan activo, el anterior del mismo curso pasa a `superseded`.

## 7. Contenido IA

### 7.1 Generar Contenido

Endpoint:

```http
POST /api/content/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "lessonId": 5,
  "modo": "explicar",
  "query": "Fracciones equivalentes nivel basico"
}
```

Modos soportados:

- `explicar`
- `generar_ejercicio`
- `evaluar_respuesta`

Flujo:

1. Valida que la leccion exista y este activa.
2. Llama a `ORCHESTRATOR_QUERY_URL`.
3. Steven enruta a numerico o verbal.
4. Backend convierte respuesta a HTML.
5. Crea `content_variants`.
6. Crea `content_events` con `event_type = "ai_generated"`.
7. Crea `user_content_assignments`.

Respuesta:

```json
{
  "success": true,
  "data": {
    "variant": {
      "id": 46,
      "lessonId": 5,
      "modality": "ai_explicar",
      "difficultyProfile": "adaptive",
      "readingLevel": "B1",
      "bodyHtml": "<article>...</article>"
    },
    "assignment": {
      "id": 12,
      "userId": 5,
      "lessonId": 5,
      "contentVariantId": 46,
      "assignedBy": "user",
      "status": "active"
    },
    "orchestratorResponse": {
      "route": "numerico",
      "latencyCls": 1.2,
      "latencySp": 2.5,
      "modelVersion": "qwen2.5:1.5b"
    }
  }
}
```

### 7.2 Leer Contenido

```http
GET /api/lessons/:lessonId/content
GET /api/content/:variantId
GET /api/lessons/:lessonId/content/prereqs
```

### 7.3 Registrar Evento

```http
POST /api/content/:variantId/events
Content-Type: application/json

{
  "eventType": "open",
  "metadata": {
    "source": "frontend"
  }
}
```

## 8. Evaluaciones IA Persistidas

### 8.1 Generar Evaluacion

Endpoint:

```http
POST /api/courses/:courseId/assessments/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "topicId": 5,
  "difficulty": "basic",
  "questionCount": 3,
  "mode": "diagnostic"
}
```

Validaciones:

- `topicId` debe existir.
- El tema debe pertenecer al `courseId`.
- `questionCount` maximo: 10.
- `mode`: `diagnostic`, `mock` o `final`.

Flujo:

1. Backend valida curso/tema.
2. Llama a `ORCHESTRATOR_QUERY_URL` con `modo = "generar_ejercicio"`.
3. Intenta normalizar la pregunta como JSON.
4. Si el modelo retorna texto, intenta parsear pregunta/opciones/respuesta.
5. Crea registros en `items`.
6. Crea registro en `exams`.
7. Crea relaciones en `exam_items`.

Formato ideal que debe devolver el modelo:

```json
{
  "stem": "Pregunta...",
  "options": [
    { "id": "A", "text": "..." },
    { "id": "B", "text": "..." },
    { "id": "C", "text": "..." },
    { "id": "D", "text": "..." }
  ],
  "answerKey": {
    "correctAnswer": "A"
  },
  "explanation": "..."
}
```

Respuesta:

```json
{
  "success": true,
  "data": {
    "examId": 9,
    "title": "Evaluacion IA - Tema 5",
    "mode": "diagnostic",
    "timeLimitSec": 300,
    "itemsCount": 3,
    "itemIds": [101, 102, 103]
  }
}
```

Despues se puede consumir con:

```http
GET /api/exams/:examId/items
POST /api/exams/:examId/attempts
POST /api/exam-attempts/:attemptId/responses
POST /api/exam-attempts/:attemptId/finish
```

## 9. Evaluaciones Existentes

### 9.1 Listar Examenes Por Curso

```http
GET /api/courses/:courseId/exams
```

### 9.2 Obtener Preguntas Publicas

```http
GET /api/exams/:examId/items
```

No devuelve `answerKey` al frontend.

### 9.3 Iniciar Intento

```http
POST /api/exams/:examId/attempts
```

### 9.4 Responder Item

```http
POST /api/exam-attempts/:attemptId/responses
Content-Type: application/json

{
  "itemId": 10,
  "answer": "A",
  "timeSpentSec": 30,
  "hintsUsed": 0
}
```

### 9.5 Finalizar Intento

```http
POST /api/exam-attempts/:attemptId/finish
```

Este endpoint dispara el ciclo adaptativo completo.

### 9.6 Revision

```http
GET /api/exam-attempts/:attemptId
GET /api/exam-attempts/:attemptId/review
```

## 10. Mastery Y Progreso

### 10.1 Mastery

```http
GET /api/me/topics/:topicId/mastery
GET /api/me/courses/:courseId/mastery
GET /api/me/topics/:topicId/mastery/journal
```

Uso:

- Mostrar dominio por tema.
- Mostrar historial de dominio.
- Alimentar dashboards.
- Alimentar snapshot de Steven.

### 10.2 Progreso Estructural

```http
GET /api/me/courses/:courseId/progress
GET /api/me/progress/recent
GET /api/me/progress/summary
GET /api/me/courses/:courseId/topics/progress
```

El progreso estructural es distinto al mastery:

```text
progreso estructural = lecciones completadas / lecciones totales
mastery = dominio estimado por tema en user_skill_mastery
```

## 11. Trazabilidad

Cada decision de Steven se guarda en `orchestrator_decisions`.

Por compatibilidad con el enum actual, la columna `decision_type` guarda:

- `plan`
- `next`
- `feedback`

El tipo real se conserva dentro del JSON `output.decision_type` y en respuestas runtime como `realDecisionType`.

Ejemplo:

```json
{
  "decisionType": "plan",
  "output": {
    "decision_type": "generate_content",
    "payload": {}
  },
  "realDecisionType": "generate_content"
}
```

## 12. Como Probar La Demo E2E

### Paso 1: Confirmar servicios

```bash
curl http://127.0.0.1:3000/health
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8001/health
curl http://127.0.0.1:8080/health
```

### Paso 2: Obtener examenes

```http
GET /api/courses/1/exams
```

### Paso 3: Iniciar intento

```http
POST /api/exams/1/attempts
```

### Paso 4: Responder preguntas

```http
POST /api/exam-attempts/1/responses
```

### Paso 5: Finalizar

```http
POST /api/exam-attempts/1/finish
```

Resultado esperado:

- `exam_attempts` actualizado.
- `user_skill_mastery` actualizado.
- `mastery_journal` con nuevo evento.
- `orchestrator_decisions` con decision nueva.
- `plans` con plan activo nuevo si Steven devolvio plan.
- `plan_items` creados.
- Respuesta HTTP con `orchestration.status = "applied"`.

### Paso 6: Frontend refresca plan

```http
GET /api/me/courses/1/study-plan
GET /api/me/courses/1/study-plan/next
```

## 13. Notas Para El Equipo

### Para Frontend

Consumir principalmente:

- `GET /api/me/courses/:courseId/study-plan`
- `GET /api/me/courses/:courseId/study-plan/next`
- `POST /api/exam-attempts/:attemptId/finish`
- `POST /api/content/generate`
- `POST /api/courses/:courseId/assessments/generate`

Despues de finalizar una evaluacion, refrescar:

- plan activo
- siguiente actividad
- mastery del curso
- progreso del curso

### Para Steven

Devolver preferiblemente plan completo:

```json
{
  "decision_type": "plan",
  "plan": {
    "items": [
      {
        "content_ref_type": "lesson",
        "content_ref_id": 1,
        "type": "lesson",
        "priority": 0.8,
        "order_n": 1,
        "metadata": {
          "status": "pending",
          "rationale": "..."
        }
      }
    ]
  }
}
```

### Para Elias / Alejandro

Para evaluaciones IA, lo mas importante es devolver JSON limpio con:

- `stem`
- `options`
- `answerKey.correctAnswer`
- `explanation`

Si devuelven texto libre, el backend intenta parsearlo, pero JSON estable es mucho mas confiable.

## 14. Verificacion Tecnica

Comandos usados despues de implementar:

```bash
npm run build
npx vitest run src
systemctl --user restart base-backend.service
curl http://127.0.0.1:3000/health
```

Resultado:

- Build TypeScript OK.
- Tests fuente OK.
- Servicio backend activo.

Nota: `npm test -- --run` puede fallar si Vitest recoge tests compilados en `dist/`. Usar temporalmente:

```bash
npx vitest run src
```

