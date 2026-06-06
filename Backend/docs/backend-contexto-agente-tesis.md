# Documento de contexto para redaccion de tesis - Backend BASE

## 1. Objetivo del documento

Este documento resume el funcionamiento del backend del proyecto BASE para que un agente de redaccion de tesis pueda comprender la arquitectura, la logica de negocio, los modulos principales, los datos persistidos y el ciclo adaptativo del sistema.

El backend no es solamente una API CRUD. Su funcion central es sostener una plataforma educativa adaptativa: registra usuarios, organiza cursos, temas y lecciones, mide progreso, evalua respuestas, actualiza el nivel de dominio del estudiante, genera o asigna contenidos y construye planes de estudio personalizados con apoyo de un orquestador externo de IA.

## 2. Vision general del sistema

El backend implementa una API HTTP construida con TypeScript, Express y Prisma sobre una base de datos MySQL. La estructura sigue una aproximacion de arquitectura hexagonal y DDD:

- `domain`: define entidades, tipos de dominio y puertos.
- `application`: contiene casos de uso y reglas de negocio.
- `infrastructure`: implementa persistencia con Prisma y clientes externos.
- `interface/http`: expone rutas, controladores, DTOs y validaciones.

El sistema se organiza en modulos funcionales:

- `auth`: registro, login, refresh token, logout, verificacion de correo y recuperacion de contrasena.
- `users`: perfil del usuario y cambio de contrasena.
- `courses`: consulta de cursos.
- `topics`: arbol y detalle de temas/subtemas.
- `lessons`: lecciones y prerequisitos.
- `content`: variantes de contenido, contenido generado por IA y eventos de interaccion.
- `progress`: avance del estudiante en lecciones y metricas agregadas.
- `assesment`: evaluaciones, preguntas, intentos, respuestas y generacion de evaluaciones por IA.
- `mastery`: dominio estimado por tema y bitacora historica.
- `study-rules`: reglas pedagogicas aplicables.
- `study-plans`: hojas de ruta personalizadas.
- `orchestrator`: snapshot del usuario, decision adaptativa e historial de decisiones.

## 3. Proposito academico y logica de negocio

El backend representa el nucleo de una plataforma de aprendizaje adaptativo. La idea principal es que cada estudiante tenga una ruta de estudio dinamica de acuerdo con su desempeno, progreso y dominio por tema.

El ciclo de negocio principal es:

1. El usuario se registra, inicia sesion y accede a cursos, temas, lecciones y contenido.
2. El estudiante estudia una leccion o resuelve una evaluacion.
3. El backend registra progreso, respuestas, tiempos y eventos.
4. Si hay evidencia de aprendizaje, el backend actualiza el dominio del estudiante por tema.
5. Cada cambio de dominio se guarda en una bitacora llamada `mastery_journal`.
6. El backend construye un snapshot del estado actual del estudiante.
7. Ese snapshot se envia al orquestador externo de IA para obtener una decision.
8. La decision se valida, normaliza y persiste.
9. Si la decision contiene un plan, el backend crea una nueva hoja de ruta activa.
10. El frontend puede consultar progreso, plan activo, siguiente actividad y contenido recomendado.

Este flujo permite argumentar en la tesis que el backend funciona como capa de control, trazabilidad y persistencia del sistema adaptativo. La IA externa puede recomendar, pero el backend valida que las recomendaciones sean consistentes con cursos, temas, lecciones y reglas del dominio.

## 4. Tecnologias principales

- Lenguaje: TypeScript.
- Framework HTTP: Express 5.
- ORM: Prisma.
- Base de datos: MySQL.
- Autenticacion: JWT con access token y refresh token.
- Hashing: bcrypt.
- Email: Nodemailer.
- Validacion: Zod en rutas de varios modulos.
- Documentacion API: Swagger UI en `/api-docs`.
- Testing: Vitest.

Scripts relevantes:

- `npm run dev`: levanta el backend en desarrollo.
- `npm run build`: compila TypeScript.
- `npm run test:run`: ejecuta pruebas.

## 5. Configuracion y servicios externos

El backend lee variables desde `.env` mediante `src/config/env.ts`. Las mas relevantes son:

- `PORT`: puerto del backend, por defecto `3000`.
- `DATABASE_URL`: conexion MySQL.
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: secretos de tokens.
- `FRONTEND_URL`: URL usada para enlaces de verificacion de correo.
- `ORCHESTRATOR_DECIDE_URL`: endpoint del orquestador para decisiones adaptativas.
- `ORCHESTRATOR_QUERY_URL`: endpoint del orquestador para consultas/generacion.
- `VERBAL_MODEL_URL`: servicio especialista verbal.
- `NUMERIC_MODEL_URL`: servicio especialista numerico.
- `MASTERY_INTERNAL_API_KEY`, `STUDY_PLANS_INTERNAL_API_KEY`, `ORCHESTRATOR_INTERNAL_API_KEY`: llaves para endpoints internos.

Servicios esperados:

- Backend BASE: API principal.
- Orquestador/Steven: decide planes y enruta consultas a modelos especialistas.
- Modelo verbal/Alejandro: explicaciones, preguntas verbales o contenido textual.
- Modelo numerico/Elias: apoyo numerico/matematico.

## 6. Entrada de la aplicacion

`src/index.ts` crea la aplicacion y levanta el servidor en el puerto configurado.

`src/app.ts` configura:

- CORS.
- JSON body parser.
- URL encoded parser.
- Swagger en `/api-docs`.
- JSON OpenAPI en `/api-docs-json`.
- logging simple por request.
- rutas principales bajo `/api`.
- health check en `/health`.
- respuesta 404 para rutas no encontradas.

`src/app/router.ts` registra todos los modulos HTTP. Por ejemplo:

- `/api/auth`
- `/api/users`
- `/api/courses`
- `/api/topics`
- `/api/lessons`
- `/api/content`
- `/api/study-plan`
- `/api/orchestrator`

## 7. Modelo de datos principal

El archivo central de datos es `prisma/schema.prisma`. Las tablas principales se pueden explicar asi:

| Tabla | Funcion |
| --- | --- |
| `users` | Cuenta del usuario, email, password hash y estado |
| `user_profile` | Datos personales y academicos basicos del usuario |
| `auth_sessions` | Refresh tokens hasheados por sesion |
| `email_verifications` | Tokens de verificacion de correo |
| `password_resets` | Tokens de recuperacion de contrasena |
| `courses` | Cursos disponibles |
| `topics` | Temas y subtemas jerarquicos por curso |
| `lessons` | Lecciones asociadas a cursos y temas principales |
| `lesson_resources` | Recursos complementarios de lecciones |
| `content_variants` | Versiones o modalidades de contenido de una leccion |
| `content_prereqs` | Prerequisitos de dominio para consumir una leccion |
| `content_events` | Eventos de interaccion o generacion de contenido |
| `user_content_assignments` | Contenido asignado a un usuario especifico |
| `lesson_progress` | Estado de avance del usuario en lecciones |
| `user_skill_mastery` | Dominio estimado por usuario y tema |
| `mastery_journal` | Historial de cambios de dominio |
| `exams` | Evaluaciones diagnosticas, simuladas o finales |
| `items` | Preguntas o items evaluables |
| `exam_items` | Relacion ordenada entre examenes e items |
| `exam_attempts` | Intentos de examen por usuario |
| `item_responses` | Respuestas del usuario a items |
| `study_rules` | Reglas pedagogicas activas |
| `study_rule_bindings` | Vinculacion de reglas a usuario, curso o tema |
| `plans` | Planes de estudio versionados |
| `plan_items` | Actividades concretas dentro de un plan |
| `orchestrator_decisions` | Registro trazable de decisiones de IA |

## 8. Autenticacion y gestion de usuario

El modulo `auth` permite:

- Registrar usuario con perfil.
- Iniciar sesion.
- Refrescar tokens.
- Cerrar sesion.
- Solicitar recuperacion de contrasena.
- Restablecer contrasena.
- Verificar correo electronico.

En el registro se validan email, contrasena, confirmacion, nombre, apellido y documento. La contrasena se guarda hasheada. El usuario inicia con estado `pending` y se genera un token de verificacion por correo. En desarrollo, si el correo no esta configurado, el backend puede devolver la URL de verificacion para facilitar pruebas.

El middleware de autenticacion valida el access token y coloca el usuario autenticado en la request. La mayoria de rutas academicas estan protegidas con este middleware.

El modulo `users` expone:

- `GET /api/users/me`
- `PATCH /api/users/me`
- `PATCH /api/users/me/password`

## 9. Cursos, temas y lecciones

El modulo `courses` consulta cursos por lista, ID o slug/codigo.

El modulo `topics` expone temas de un curso en dos formas:

- arbol jerarquico: util para mostrar unidades y subtemas.
- lista plana: util para seleccion, filtros o calculos.

Las rutas principales son:

- `GET /api/courses`
- `GET /api/courses/:id`
- `GET /api/courses/slug/:slug`
- `GET /api/courses/:courseId/topics`
- `GET /api/courses/:courseId/topics/tree`
- `GET /api/topics/:topicId`

El modulo `lessons` consulta lecciones y prerequisitos:

- `GET /api/courses/:courseId/lessons`
- `GET /api/topics/:topicId/lessons`
- `GET /api/lessons/:lessonId`
- `GET /api/lessons/:lessonId/prereqs`

Una leccion pertenece a un curso y puede tener un `primary_topic_id`, lo que permite relacionar avance de contenido con dominio por tema.

## 10. Contenido y contenido generado por IA

El modulo `content` maneja variantes de contenido. Una leccion puede tener varias variantes, por ejemplo contenido semilla, explicacion adaptativa, ejercicio generado o evaluacion de respuesta.

Rutas principales:

- `GET /api/lessons/:lessonId/content`
- `GET /api/content/:variantId`
- `GET /api/lessons/:lessonId/content/prereqs`
- `POST /api/content/:variantId/events`
- `POST /api/content/generate`

La generacion de contenido se realiza en `GenerateContentUseCase`:

1. Valida que la leccion exista y este activa.
2. Construye un texto de consulta usando la leccion y el tema.
3. Llama al endpoint `ORCHESTRATOR_QUERY_URL`.
4. Recibe respuesta del modelo.
5. Convierte el contenido a HTML seguro basico.
6. Crea una fila en `content_variants`.
7. Registra un evento `ai_generated` en `content_events`.
8. Crea una asignacion en `user_content_assignments`.

Modos soportados:

- `explicar`
- `generar_ejercicio`
- `evaluar_respuesta`

Este modulo es importante para tesis porque muestra como el sistema puede producir contenido personalizado sin perder trazabilidad: cada contenido generado queda guardado, asociado a usuario, leccion, variante y evento.

## 11. Progreso del estudiante

El modulo `progress` registra el avance de lecciones y calcula metricas agregadas.

Rutas principales:

- `POST /api/lessons/:lessonId/progress/start`
- `POST /api/lessons/:lessonId/progress/update`
- `POST /api/lessons/:lessonId/progress/complete`
- `GET /api/lessons/:lessonId/progress`
- `GET /api/me/courses/:courseId/progress`
- `GET /api/me/progress/recent`
- `GET /api/me/progress/summary`
- `GET /api/me/courses/:courseId/topics/progress`

Al completar una leccion, `CompleteLessonProgressUseCase`:

1. Busca progreso existente del usuario en esa leccion.
2. Verifica que no este ya completada.
3. Cambia el estado a `completed`.
4. Consulta el tema principal de la leccion.
5. Si existe tema principal, actualiza mastery con delta `+0.05`.

La interpretacion pedagogica es que completar una leccion es evidencia positiva de participacion, pero no suficiente para asumir dominio alto. Por eso el incremento es pequeno y no aumenta observaciones evaluativas.

## 12. Evaluaciones

El modulo `assesment` administra examenes, items, intentos y respuestas.

Rutas principales:

- `GET /api/courses/:courseId/exams`
- `GET /api/exams/:examId/items`
- `POST /api/exams/:examId/attempts`
- `POST /api/exam-attempts/:attemptId/responses`
- `POST /api/exam-attempts/:attemptId/finish`
- `GET /api/exam-attempts/:attemptId`
- `GET /api/exam-attempts/:attemptId/review`
- `POST /api/courses/:courseId/assessments/generate`

### 12.1 Respuesta a una pregunta

`SubmitItemResponseUseCase` aplica validaciones:

1. El intento debe existir.
2. El intento debe pertenecer al usuario autenticado.
3. El intento no debe estar completado.
4. El item debe existir.
5. El item debe pertenecer al examen.
6. No debe existir una respuesta previa para ese item en el mismo intento.

Luego evalua la respuesta segun el tipo de item:

- `single_choice`: compara una opcion.
- `multi_choice`: compara conjuntos ordenados logicamente.
- `open`: compara texto normalizado y respuestas aceptadas.

Si la respuesta es correcta, asigna el peso del item; si no, el puntaje es cero.

### 12.2 Finalizacion de examen y actualizacion de dominio

`FinishExamAttemptUseCase`:

1. Valida existencia, propiedad y estado del intento.
2. Obtiene el examen con sus items.
3. Calcula metricas:
   - total de items.
   - items respondidos.
   - respuestas correctas.
   - accuracy.
   - score raw.
   - score normalizado 0-100.
4. Marca el intento como completado.
5. Agrupa respuestas por `topic_id`.
6. Calcula un delta de dominio por tema:

```text
delta = (accuracy - 0.5) * 0.4
```

Ejemplos:

| Accuracy | Delta |
| ---: | ---: |
| 1.00 | +0.20 |
| 0.50 | 0.00 |
| 0.00 | -0.20 |

7. Llama a `UpdateMasteryUseCase` por cada tema evaluado.
8. Guarda evidencia con attemptId, correctas, total y accuracy.

El intento de examen se finaliza aunque falle la actualizacion de mastery, porque el backend captura ese error y no rompe el flujo principal. Esta decision favorece que la evaluacion del estudiante no se pierda por un fallo secundario.

### 12.3 Replanificacion posterior a evaluacion

En el controlador, despues de finalizar un intento, se llama a `ReplanAfterAssessmentUseCase` si esta configurado. Ese caso de uso resuelve el curso del examen y ejecuta `DecideForUserUseCase`, que puede crear un nuevo plan adaptativo.

## 13. Generacion de evaluaciones por IA

`GenerateAssessmentUseCase` permite crear una evaluacion persistida usando el orquestador:

1. Valida el usuario.
2. Valida que el `topicId` pertenezca al `courseId`.
3. Limita `questionCount` entre 1 y 10.
4. Por cada pregunta, llama a `ORCHESTRATOR_QUERY_URL` con modo `generar_ejercicio`.
5. Solicita JSON estricto al modelo.
6. Si la respuesta no viene en JSON limpio, intenta extraer JSON o parsear texto.
7. Normaliza pregunta, opciones, respuesta correcta y explicacion.
8. Crea items en `items`.
9. Crea examen en `exams`.
10. Crea relaciones en `exam_items`.

La dificultad textual se convierte a numero:

- `basic`: 2.
- `medium`: 3.
- `advanced`: 4.

Este flujo permite que las evaluaciones generadas por IA sean persistentes, revisables y reutilizables dentro del sistema.

## 14. Mastery o dominio por tema

El modulo `mastery` registra el conocimiento estimado del estudiante por tema.

Rutas principales:

- `GET /api/me/topics/:topicId/mastery`
- `GET /api/me/courses/:courseId/mastery`
- `GET /api/me/topics/:topicId/mastery/journal`
- `POST /api/mastery/update` con autenticacion interna.

`UpdateMasteryUseCase`:

1. Valida usuario, tema, source y delta.
2. Exige delta entre `-1` y `1`.
3. Verifica que el tema exista y este activo.
4. Aplica la actualizacion en repositorio.
5. Devuelve el snapshot actualizado y el ID del journal.

Fuentes de dominio:

- `exam`
- `response`
- `manual`
- `orchestrator`

Nota: el codigo de progreso usa tambien `lesson` como fuente al completar una leccion. Para redaccion de tesis conviene mencionar que el dominio puede actualizarse por evidencia evaluativa y por evidencia de avance, aunque en el esquema Prisma el enum visible incluye fuentes principales como examen, respuesta, manual y orquestador.

La tabla `mastery_journal` es clave para trazabilidad: cada cambio guarda tema, usuario, fuente, delta, dominio antes/despues, evidencia y fecha.

## 15. Reglas pedagogicas

El modulo `study-rules` permite manejar reglas aplicables por alcance:

- global.
- curso.
- tema.
- usuario.

Rutas principales:

- `GET /api/study-rules`
- `GET /api/study-rules/applicable`
- `GET /api/topics/:topicId/study-rules`
- `GET /api/study-rules/:ruleId`

`DeterministicStudyRulesResolver` resuelve reglas aplicables con prioridad por especificidad:

1. usuario.
2. tema.
3. curso.
4. global.

Si hay empate, usa prioridad numerica y luego IDs para desempatar. Esto permite explicar que el sistema no depende unicamente de IA; tambien puede aplicar reglas pedagogicas deterministas y auditables.

## 16. Planes de estudio

El modulo `study-plans` maneja hojas de ruta personalizadas.

Rutas principales:

- `GET /api/me/courses/:courseId/study-plan`
- `GET /api/me/courses/:courseId/study-plan/next`
- `PATCH /api/study-plan/items/:itemId`
- `POST /api/study-plans` con autenticacion interna.
- `GET /api/me/courses/:courseId/study-plans`

Un plan (`plans`) tiene:

- usuario.
- version.
- estado: `draft`, `active` o `superseded`.
- fuente, normalmente `orchestrator`.
- fecha de creacion y activacion.

Un item de plan (`plan_items`) tiene:

- tipo de referencia: `lesson`, `variant`, `item`, `topic` o `exam`.
- ID de referencia.
- tipo semantico.
- prioridad.
- orden.
- fecha sugerida.
- metadata, donde se guarda el estado operativo como `pending`, `done` o `blocked`.

`CreateStudyPlanUseCase` valida que:

1. Usuario y curso sean validos.
2. El plan tenga al menos un item.
3. Cada item tenga referencia y orden validos.
4. Cada referencia pertenezca realmente al curso.

Esta validacion es importante porque evita que una decision externa recomiende contenido fuera del curso del estudiante.

## 17. Orquestador adaptativo

El modulo `orchestrator` conecta el backend con el sistema externo de IA.

Rutas principales:

- `GET /api/orchestrator/users/:userId/snapshot?courseId=...`
- `POST /api/orchestrator/users/:userId/decide`
- `POST /api/orchestrator/decisions` con autenticacion interna.
- `GET /api/orchestrator/users/:userId/decisions`

### 17.1 Snapshot del usuario

`BuildUserSnapshotUseCase` valida usuario y curso, y luego el repositorio arma un snapshot completo. `PrismaOrchestratorRepository.buildSnapshot` incluye:

- usuario: id, email y estado.
- curso: id y titulo.
- mastery por tema activo del curso.
- journal reciente de dominio.
- plan activo.
- progreso estructural del curso.
- reglas de estudio aplicables.
- elegibilidad de lecciones por prerequisitos.
- ultimos eventos de contenido.
- ultimos intentos de examen.

Este snapshot es el insumo principal para que la IA tome una decision contextualizada.

### 17.2 Decision del orquestador

`DecideForUserUseCase`:

1. Valida usuario y curso.
2. Construye snapshot.
3. Llama al cliente del modelo externo (`HttpOrchestratorModelClient`) usando `ORCHESTRATOR_DECIDE_URL`.
4. Normaliza el tipo de decision.
5. Ejecuta acciones segun decision.
6. Persiste la decision en `orchestrator_decisions`.

Tipos de decision soportados por el backend:

- `plan`
- `update_plan`
- `next`
- `feedback`
- `reinforce_topic`
- `generate_content`

Acciones aplicables:

- `plan` o `update_plan`: extrae items y crea un plan activo.
- `reinforce_topic`: valida tema, busca leccion activa del tema y registra una interaccion de contenido.
- `generate_content`: valida leccion, llama generacion de contenido y crea variante/asignacion.
- `next` o `feedback`: se persisten como decision, aunque no necesariamente crean plan.

El backend acepta tanto formato moderno como formato heredado de items de plan. Por ejemplo, puede transformar:

- `content_ref_type` o `contentRefType`.
- `content_ref_id`, `contentRefId`, `id` o `lesson_id`.
- `order_n` u orden implicito por posicion.
- `priority` o valor por defecto `0.5`.

Esto muestra una capa de compatibilidad y robustez frente a salidas variables de modelos.

## 18. Flujo adaptativo completo para describir en tesis

Un flujo representativo seria:

1. El estudiante inicia una evaluacion diagnostica.
2. El backend crea `exam_attempts`.
3. El estudiante responde preguntas.
4. Cada respuesta se guarda en `item_responses` y se corrige.
5. Al finalizar, se actualiza `exam_attempts` con puntajes y metricas.
6. Las respuestas se agrupan por tema.
7. El dominio en `user_skill_mastery` se actualiza por tema.
8. Cada cambio queda en `mastery_journal`.
9. El backend construye un snapshot del estudiante.
10. El snapshot se envia al orquestador.
11. El orquestador devuelve un plan o accion.
12. El backend valida referencias y crea una nueva hoja de ruta en `plans` y `plan_items`.
13. La decision se guarda en `orchestrator_decisions`.
14. El frontend muestra el nuevo plan, progreso y siguiente actividad.

Este flujo permite justificar que el sistema adapta el aprendizaje a partir de evidencias objetivas: respuestas, avance, dominio acumulado, reglas y actividad reciente.

## 19. Seguridad y control

El backend aplica varios mecanismos:

- JWT para rutas privadas.
- Refresh tokens almacenados como hash.
- Passwords almacenadas como hash.
- Tokens de verificacion y reset almacenados como hash.
- Endpoints internos protegidos por API keys.
- Validaciones con Zod en rutas criticas.
- Verificacion de propiedad del intento de examen.
- Validacion de pertenencia tema-curso y leccion-curso.
- No se entrega `answerKey` en la ruta publica de items de examen.

La idea clave para tesis: el backend impone restricciones de dominio para que la IA externa no pueda alterar el sistema sin pasar por validaciones.

## 20. Pruebas existentes

El proyecto incluye pruebas con Vitest en varios modulos:

- evaluaciones: inicio, obtencion de items, finalizacion.
- contenido: variantes y eventos.
- mastery: consulta y actualizacion.
- orquestador: snapshot y decisiones.
- planes: creacion y siguiente item.
- reglas: resolucion deterministica y reglas aplicables.
- lecciones: pruebas unitarias.

Esto respalda que el proyecto no solo contiene endpoints, sino casos de uso testeados en partes relevantes del dominio.

## 21. Endpoints resumidos por modulo

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/password/forgot`
- `POST /api/auth/password/reset`
- `GET /api/auth/verify-email`

### Users

- `GET /api/users/me`
- `PATCH /api/users/me`
- `PATCH /api/users/me/password`

### Courses, topics y lessons

- `GET /api/courses`
- `GET /api/courses/:id`
- `GET /api/courses/slug/:slug`
- `GET /api/courses/:courseId/topics`
- `GET /api/courses/:courseId/topics/tree`
- `GET /api/topics/:topicId`
- `GET /api/courses/:courseId/lessons`
- `GET /api/topics/:topicId/lessons`
- `GET /api/lessons/:lessonId`
- `GET /api/lessons/:lessonId/prereqs`

### Content

- `GET /api/lessons/:lessonId/content`
- `GET /api/content/:variantId`
- `GET /api/lessons/:lessonId/content/prereqs`
- `POST /api/content/:variantId/events`
- `POST /api/content/generate`

### Progress

- `POST /api/lessons/:lessonId/progress/start`
- `POST /api/lessons/:lessonId/progress/update`
- `POST /api/lessons/:lessonId/progress/complete`
- `GET /api/lessons/:lessonId/progress`
- `GET /api/me/courses/:courseId/progress`
- `GET /api/me/progress/recent`
- `GET /api/me/progress/summary`
- `GET /api/me/courses/:courseId/topics/progress`

### Assessment

- `POST /api/courses/:courseId/assessments/generate`
- `GET /api/courses/:courseId/exams`
- `GET /api/exams/:examId/items`
- `POST /api/exams/:examId/attempts`
- `POST /api/exam-attempts/:attemptId/responses`
- `POST /api/exam-attempts/:attemptId/finish`
- `GET /api/exam-attempts/:attemptId`
- `GET /api/exam-attempts/:attemptId/review`

### Mastery

- `GET /api/me/topics/:topicId/mastery`
- `GET /api/me/courses/:courseId/mastery`
- `GET /api/me/topics/:topicId/mastery/journal`
- `POST /api/mastery/update`

### Study rules

- `GET /api/study-rules`
- `GET /api/study-rules/applicable`
- `GET /api/topics/:topicId/study-rules`
- `GET /api/study-rules/:ruleId`

### Study plans

- `GET /api/me/courses/:courseId/study-plan`
- `GET /api/me/courses/:courseId/study-plan/next`
- `PATCH /api/study-plan/items/:itemId`
- `POST /api/study-plans`
- `GET /api/me/courses/:courseId/study-plans`

### Orchestrator

- `GET /api/orchestrator/users/:userId/snapshot`
- `POST /api/orchestrator/users/:userId/decide`
- `POST /api/orchestrator/decisions`
- `GET /api/orchestrator/users/:userId/decisions`

## 22. Ideas utiles para redaccion de tesis

Se puede describir el backend como:

- Una arquitectura modular basada en contextos de dominio educativo.
- Una capa de persistencia y trazabilidad para aprendizaje adaptativo.
- Un mediador entre frontend, base de datos y modelos de IA.
- Un sistema que actualiza conocimiento del estudiante mediante evidencias.
- Una capa de validacion que reduce riesgos de salidas inconsistentes del modelo.
- Un mecanismo de generacion y versionado de rutas personalizadas.
- Un sistema auditable, porque registra respuestas, intentos, dominio, journal, planes y decisiones.

Frases tecnicas utiles:

- "El backend centraliza la logica de negocio del aprendizaje adaptativo y separa la toma de decisiones externa de la aplicacion de dichas decisiones sobre el dominio persistido."
- "La estimacion de dominio se modela por usuario y tema, y se actualiza incrementalmente a partir de evidencias evaluativas y de progreso."
- "El orquestador recibe un snapshot contextualizado del estudiante, pero la persistencia final del plan queda sujeta a validaciones del backend."
- "La bitacora de mastery permite trazabilidad historica de la evolucion del estudiante."
- "Los planes de estudio se versionan, permitiendo reemplazar una ruta anterior sin perder historial."

## 23. Limitaciones o puntos a tratar con cuidado

- El backend depende de servicios externos de IA para decisiones y generacion. Si esos servicios fallan, algunos flujos adaptativos pueden quedar en estado `failed` o no generar contenido.
- La actualizacion de mastery desde finalizacion de examen no revierte la evaluacion si falla; esto protege el registro del examen, pero requiere monitoreo.
- La generacion de evaluaciones por IA incluye normalizacion y fallback, pero la calidad final depende de la respuesta del modelo.
- Algunas fuentes de mastery deben revisarse contra el enum de Prisma si se endurece el tipado de base de datos.
- Existen endpoints internos con API key; deben configurarse correctamente en produccion.

## 24. Resumen ejecutivo

El backend BASE implementa la infraestructura tecnica y de negocio de una plataforma educativa adaptativa. Gestiona identidad, cursos, temas, lecciones, contenido, progreso, evaluaciones, dominio por tema, reglas pedagogicas, planes personalizados y decisiones de IA. Su aporte principal es convertir evidencias de aprendizaje en acciones adaptativas trazables: actualiza el dominio del estudiante, consulta al orquestador con un snapshot completo y persiste planes o contenido recomendado bajo validaciones de dominio. Para la tesis, este backend puede presentarse como el componente que garantiza coherencia, persistencia, auditoria y aplicacion controlada de la personalizacion educativa.
