# Tablas de base de datos del backend BASE

## 1. Proposito

Este documento lista las tablas definidas en `prisma/schema.prisma` para incluirlas en el informe o tesis. El modelo usa MySQL y Prisma como ORM. Las tablas cubren autenticacion, estructura academica, contenido, progreso, evaluaciones, dominio del estudiante, reglas pedagogicas, planes de estudio y decisiones del orquestador.

## 2. Resumen general de tablas

| No. | Tabla | Area | Proposito |
| ---: | --- | --- | --- |
| 1 | `users` | Autenticacion | Cuenta principal del usuario |
| 2 | `user_profile` | Usuario | Datos personales y perfil del estudiante |
| 3 | `auth_sessions` | Autenticacion | Sesiones y refresh tokens hasheados |
| 4 | `email_verifications` | Autenticacion | Tokens para verificacion de correo |
| 5 | `password_resets` | Autenticacion | Tokens para recuperacion de contrasena |
| 6 | `courses` | Academico | Cursos disponibles |
| 7 | `topics` | Academico | Temas y subtemas jerarquicos del curso |
| 8 | `lessons` | Academico | Lecciones del curso asociadas a temas |
| 9 | `lesson_resources` | Academico | Recursos complementarios por leccion |
| 10 | `content_variants` | Contenido | Versiones o modalidades de contenido |
| 11 | `content_prereqs` | Contenido | Prerequisitos de dominio para lecciones |
| 12 | `content_events` | Contenido | Eventos de interaccion o generacion de contenido |
| 13 | `user_content_assignments` | Contenido | Contenido asignado a usuarios |
| 14 | `lesson_progress` | Progreso | Avance del usuario por leccion |
| 15 | `user_skill_mastery` | Dominio | Dominio estimado del usuario por tema |
| 16 | `mastery_journal` | Dominio | Historial de cambios de dominio |
| 17 | `exams` | Evaluacion | Evaluaciones diagnosticas, simuladas o finales |
| 18 | `items` | Evaluacion | Preguntas o items evaluables |
| 19 | `exam_items` | Evaluacion | Relacion entre examenes e items |
| 20 | `exam_attempts` | Evaluacion | Intentos de examen por usuario |
| 21 | `item_responses` | Evaluacion | Respuestas del usuario a items |
| 22 | `study_rules` | Reglas | Reglas pedagogicas configurables |
| 23 | `study_rule_bindings` | Reglas | Aplicacion de reglas por curso, tema o usuario |
| 24 | `plans` | Plan adaptativo | Planes de estudio versionados |
| 25 | `plan_items` | Plan adaptativo | Actividades dentro de un plan |
| 26 | `orchestrator_decisions` | IA adaptativa | Registro de decisiones del orquestador |
| 27 | `user_topic_plan` | Plan adaptativo | Priorizacion de temas por usuario |

## 3. Detalle de tablas

### 3.1 `users`

Tabla principal de usuarios del sistema.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario autoincremental |
| `email` | String | Correo unico del usuario |
| `password_hash` | String | Contrasena hasheada |
| `status` | String | Estado de la cuenta, por ejemplo pendiente o activa |
| `created_at` | DateTime | Fecha de creacion |

Relaciones principales: perfil, sesiones, progreso, intentos de examen, mastery, planes, asignaciones de contenido y decisiones del orquestador.

### 3.2 `user_profile`

Guarda informacion personal complementaria del usuario.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `user_id` | Int | PK y FK hacia `users.id` |
| `first_name` | String | Nombre |
| `last_name` | String | Apellido |
| `document` | String nullable | Documento unico opcional |
| `goal` | String nullable | Objetivo academico o meta |
| `phone` | String nullable | Telefono |
| `birth_date` | Date nullable | Fecha de nacimiento |
| `city` | String nullable | Ciudad |

Relacion: uno a uno con `users`.

### 3.3 `auth_sessions`

Registra sesiones de autenticacion y refresh tokens.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `user_id` | Int | FK hacia `users.id` |
| `refresh_token_hash` | String | Refresh token almacenado como hash |
| `ip` | String nullable | IP de origen |
| `user_agent` | String nullable | Navegador o cliente |

Relacion: muchas sesiones pertenecen a un usuario.

### 3.4 `email_verifications`

Almacena tokens de verificacion de correo.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `user_id` | Int | FK hacia `users.id` |
| `token_hash` | String | Token de verificacion hasheado |
| `expires_at` | DateTime | Fecha de expiracion |
| `used_at` | DateTime nullable | Fecha de uso |
| `ip` | String nullable | IP de solicitud |
| `user_agent` | String nullable | Cliente de solicitud |
| `created_at` | DateTime | Fecha de creacion |

### 3.5 `password_resets`

Almacena tokens para recuperacion de contrasena.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `user_id` | Int | FK hacia `users.id` |
| `token_hash` | String | Token de reset hasheado |
| `expires_at` | DateTime | Fecha de expiracion |
| `used_at` | DateTime nullable | Fecha de uso |
| `ip` | String nullable | IP de solicitud |
| `user_agent` | String nullable | Cliente de solicitud |
| `created_at` | DateTime | Fecha de creacion |

### 3.6 `courses`

Representa los cursos disponibles en la plataforma.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `code` | String | Codigo unico del curso |
| `title` | String | Titulo del curso |
| `description` | Text nullable | Descripcion |
| `status` | String | Estado del curso |

Relaciones: contiene temas, lecciones, reglas vinculadas y planes tematicos de usuario.

### 3.7 `topics`

Representa temas y subtemas de un curso. Permite jerarquia mediante `parent_topic_id`.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `course_id` | Int | FK hacia `courses.id` |
| `name` | String | Nombre del tema |
| `description` | Text nullable | Descripcion |
| `parent_topic_id` | Int nullable | Tema padre para jerarquia |
| `level` | Int | Nivel jerarquico |
| `is_active` | Boolean | Indica si el tema esta activo |

Relaciones: curso, tema padre, subtemas, lecciones, items evaluables, mastery, reglas y prerequisitos.

### 3.8 `lessons`

Representa lecciones de un curso.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `course_id` | Int | FK hacia `courses.id` |
| `primary_topic_id` | Int nullable | Tema principal asociado |
| `title` | String | Titulo de la leccion |
| `canonical_slug` | String | Slug unico de la leccion |
| `is_active` | Boolean | Indica si la leccion esta activa |
| `version` | Int | Version de la leccion |

Relaciones: curso, tema principal, recursos, progreso, variantes de contenido, prerequisitos y asignaciones.

### 3.9 `lesson_resources`

Recursos complementarios asociados a una leccion.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `lesson_id` | Int | FK hacia `lessons.id` |
| `type` | String | Tipo de recurso |
| `url` | String nullable | URL del recurso |
| `title` | String | Titulo del recurso |
| `description` | Text nullable | Descripcion |

### 3.10 `content_variants`

Contiene variantes de contenido de una leccion, incluyendo contenido semilla o generado por IA.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `lesson_id` | Int | FK hacia `lessons.id` |
| `modality` | String | Modalidad, por ejemplo explicacion o ejercicio |
| `difficulty_profile` | String nullable | Perfil de dificultad |
| `reading_level` | String nullable | Nivel de lectura |
| `content_url` | String nullable | URL del contenido |
| `body_html` | LongText nullable | Contenido HTML persistido |
| `est_minutes` | Int nullable | Minutos estimados |
| `is_active` | Boolean | Estado activo |
| `version` | Int | Version del contenido |

Relaciones: leccion, eventos de contenido y asignaciones a usuarios.

### 3.11 `content_prereqs`

Define prerequisitos de dominio para acceder o recomendar una leccion.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `lesson_id` | Int | FK hacia `lessons.id` |
| `required_topic_id` | Int | FK hacia `topics.id` |
| `min_mastery` | Decimal | Dominio minimo requerido |

### 3.12 `content_events`

Registra eventos de interaccion, apertura, generacion o acciones sobre contenido.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `user_id` | Int | FK hacia `users.id` |
| `lesson_id` | Int nullable | FK opcional hacia `lessons.id` |
| `content_variant_id` | Int nullable | FK opcional hacia `content_variants.id` |
| `event_type` | String | Tipo de evento |
| `event_value` | Json nullable | Metadata o datos adicionales del evento |

### 3.13 `user_content_assignments`

Guarda que contenido fue asignado a que usuario.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `user_id` | Int | FK hacia `users.id` |
| `lesson_id` | Int | FK hacia `lessons.id` |
| `content_variant_id` | Int | FK hacia `content_variants.id` |
| `assigned_by` | String | Fuente de asignacion, por ejemplo usuario u orquestador |
| `rationale` | Text nullable | Justificacion de la asignacion |
| `status` | String | Estado de la asignacion |

### 3.14 `lesson_progress`

Registra el avance de cada estudiante por leccion.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `user_id` | Int | FK hacia `users.id` |
| `lesson_id` | Int | FK hacia `lessons.id` |
| `status` | String | Estado del progreso |
| `last_position` | String nullable | Ultima posicion de lectura o avance |
| `completed_at` | DateTime nullable | Fecha de finalizacion |
| `time_spent_sec` | Int nullable | Tiempo invertido en segundos |

### 3.15 `user_skill_mastery`

Snapshot actual del dominio de un usuario en un tema.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `user_id` | Int | FK hacia `users.id` |
| `topic_id` | Int | FK hacia `topics.id` |
| `mastery` | Decimal | Dominio estimado, usualmente entre 0 y 1 |
| `observations` | Int | Numero de observaciones acumuladas |

Esta tabla resume el estado actual; el historial se conserva en `mastery_journal`.

### 3.16 `mastery_journal`

Bitacora de cambios del dominio del estudiante.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `user_id` | Int | FK hacia `users.id` |
| `topic_id` | Int | FK hacia `topics.id` |
| `source` | Enum | Fuente del cambio de dominio |
| `delta` | Decimal | Cambio aplicado al dominio |
| `mastery_before` | Decimal nullable | Dominio antes del cambio |
| `mastery_after` | Decimal nullable | Dominio despues del cambio |
| `evidence` | Json nullable | Evidencia usada para justificar el cambio |
| `at` | DateTime | Fecha del registro |

Esta tabla es fundamental para la trazabilidad del aprendizaje adaptativo.

### 3.17 `exams`

Representa evaluaciones disponibles.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `title` | String | Titulo del examen |
| `mode` | Enum | Tipo: diagnostico, simulacro o final |
| `time_limit_sec` | Int | Tiempo limite en segundos |
| `version` | Int | Version |
| `is_active` | Boolean | Estado activo |
| `created_at` | DateTime | Fecha de creacion |
| `updated_at` | DateTime | Fecha de actualizacion |

### 3.18 `items`

Preguntas o ejercicios evaluables.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `topic_id` | Int | FK hacia `topics.id` |
| `type` | Enum | Tipo de item |
| `stem` | Text | Enunciado |
| `options` | Json nullable | Opciones de respuesta |
| `answer_key` | Json nullable | Respuesta correcta o clave |
| `explanation` | Text nullable | Explicacion |
| `difficulty` | Int | Dificultad numerica |
| `source` | String nullable | Fuente, por ejemplo IA o banco semilla |
| `version` | Int | Version |
| `is_active` | Boolean | Estado activo |
| `created_at` | DateTime | Fecha de creacion |
| `updated_at` | DateTime | Fecha de actualizacion |

### 3.19 `exam_items`

Tabla puente entre examenes e items. Tambien define orden y peso.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `exam_id` | Int | FK hacia `exams.id` |
| `item_id` | Int | FK hacia `items.id` |
| `order_n` | Int | Orden del item dentro del examen |
| `weight` | Decimal | Peso del item |

Clave primaria compuesta: `exam_id`, `item_id`.

### 3.20 `exam_attempts`

Intentos de evaluacion realizados por usuarios.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `user_id` | Int | FK hacia `users.id` |
| `exam_id` | Int | FK hacia `exams.id` |
| `started_at` | DateTime | Fecha de inicio |
| `completed_at` | DateTime nullable | Fecha de finalizacion |
| `duration_sec` | Int nullable | Duracion |
| `score_raw` | Decimal nullable | Puntaje bruto |
| `score_norm` | Decimal nullable | Puntaje normalizado |
| `metadata` | Json nullable | Metricas y datos adicionales |

### 3.21 `item_responses`

Respuestas enviadas por el usuario en un intento.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `attempt_id` | Int | FK hacia `exam_attempts.id` |
| `item_id` | Int | FK hacia `items.id` |
| `answer` | Json nullable | Respuesta del usuario |
| `is_correct` | Boolean nullable | Resultado de correccion |
| `time_spent_sec` | Int nullable | Tiempo usado |
| `hints_used` | Int | Pistas usadas |
| `awarded_score` | Decimal nullable | Puntaje otorgado |
| `created_at` | DateTime | Fecha de respuesta |

Restriccion: una respuesta unica por intento e item.

### 3.22 `study_rules`

Reglas pedagogicas configurables.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `name` | String | Nombre de la regla |
| `scope` | Enum | Alcance: global, curso, tema o usuario |
| `is_active` | Boolean | Estado activo |
| `priority` | Int | Prioridad de aplicacion |
| `definition` | Json | Definicion de la regla |
| `created_at` | DateTime | Fecha de creacion |
| `updated_at` | DateTime | Fecha de actualizacion |

### 3.23 `study_rule_bindings`

Vincula reglas pedagogicas a curso, tema o usuario.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `rule_id` | Int | FK hacia `study_rules.id` |
| `course_id` | Int nullable | FK opcional hacia `courses.id` |
| `topic_id` | Int nullable | FK opcional hacia `topics.id` |
| `user_id` | Int nullable | FK opcional hacia `users.id` |

Permite que una regla sea global o se aplique a un contexto mas especifico.

### 3.24 `plans`

Planes de estudio versionados por usuario.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `user_id` | Int | FK hacia `users.id` |
| `version` | Int | Version del plan por usuario |
| `state` | Enum | Estado: borrador, activo o reemplazado |
| `source` | String | Fuente del plan, normalmente orquestador |
| `created_at` | DateTime | Fecha de creacion |
| `activated_at` | DateTime nullable | Fecha de activacion |
| `superseded_at` | DateTime nullable | Fecha de reemplazo |

Restriccion: version unica por usuario.

### 3.25 `plan_items`

Actividades o recomendaciones dentro de un plan.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `plan_id` | Int | FK hacia `plans.id` |
| `content_ref_type` | Enum | Tipo de referencia: leccion, variante, item, tema o examen |
| `content_ref_id` | Int | ID de la referencia |
| `type` | String | Tipo semantico de actividad |
| `priority` | Decimal | Prioridad |
| `order_n` | Int | Orden dentro del plan |
| `due_at` | DateTime nullable | Fecha sugerida |
| `metadata` | Json nullable | Estado y datos adicionales |

Restriccion: `order_n` unico dentro de cada plan.

### 3.26 `orchestrator_decisions`

Registra decisiones producidas o recibidas desde el orquestador de IA.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `user_id` | Int | FK hacia `users.id` |
| `decision_type` | Enum | Tipo de decision |
| `input_snapshot` | Json | Estado del usuario enviado al orquestador |
| `output` | Json | Respuesta completa del orquestador |
| `rationale` | Text nullable | Justificacion textual |
| `model_version` | String nullable | Version del modelo |
| `correlation_id` | String nullable | ID de correlacion |
| `created_at` | DateTime | Fecha de registro |

Esta tabla permite auditar que informacion se uso y que decision devolvio el sistema de IA.

### 3.27 `user_topic_plan`

Representa priorizacion de temas por usuario y curso.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Int | Identificador primario |
| `user_id` | Int | FK hacia `users.id` |
| `course_id` | Int | FK hacia `courses.id` |
| `topic_id` | Int | FK hacia `topics.id` |
| `priority` | Int | Prioridad del tema |
| `source` | String | Fuente de la priorizacion |

## 4. Enums del esquema

| Enum | Valores | Uso |
| --- | --- | --- |
| `exams_mode` | `diagnostic`, `mock`, `final` | Tipo de evaluacion |
| `items_type` | `single_choice`, `multi_choice`, `open` | Tipo de pregunta |
| `orchestrator_decisions_decision_type` | `plan`, `next`, `feedback` | Tipo persistido de decision del orquestador |
| `plan_items_content_ref_type` | `lesson`, `variant`, `item`, `topic`, `exam` | Tipo de contenido recomendado |
| `study_rules_scope` | `global`, `course`, `topic`, `user` | Alcance de reglas pedagogicas |
| `mastery_journal_source` | `exam`, `response`, `manual`, `orchestrator` | Fuente del cambio de dominio |
| `plans_state` | `draft`, `active`, `superseded` | Estado de plan de estudio |

## 5. Agrupacion conceptual para el informe

### Identidad y seguridad

Incluye `users`, `user_profile`, `auth_sessions`, `email_verifications` y `password_resets`. Estas tablas permiten registrar usuarios, gestionar sesiones, proteger credenciales y mantener procesos de verificacion y recuperacion.

### Estructura academica

Incluye `courses`, `topics`, `lessons` y `lesson_resources`. Representan la organizacion curricular: cursos, temas jerarquicos, lecciones y materiales complementarios.

### Contenido y personalizacion

Incluye `content_variants`, `content_prereqs`, `content_events` y `user_content_assignments`. Permiten manejar contenido base o generado por IA, prerequisitos, eventos de interaccion y asignaciones personalizadas.

### Progreso y dominio

Incluye `lesson_progress`, `user_skill_mastery` y `mastery_journal`. Estas tablas sostienen el seguimiento del aprendizaje y la evolucion del dominio por tema.

### Evaluacion

Incluye `exams`, `items`, `exam_items`, `exam_attempts` y `item_responses`. Permiten crear evaluaciones, presentar preguntas, registrar intentos, corregir respuestas y calcular resultados.

### Reglas y planes adaptativos

Incluye `study_rules`, `study_rule_bindings`, `plans`, `plan_items` y `user_topic_plan`. Estas tablas permiten aplicar reglas pedagogicas y organizar rutas de estudio personalizadas.

### Orquestacion de IA

Incluye `orchestrator_decisions`. Esta tabla documenta las decisiones tomadas por el orquestador externo y conserva snapshots de entrada y salidas para auditoria.

## 6. Nota para la tesis

La base de datos esta disenada para soportar trazabilidad. No solo guarda el estado actual del estudiante, sino tambien evidencias historicas: respuestas, intentos, eventos de contenido, cambios de dominio, planes versionados y decisiones del orquestador. Esto permite explicar que el sistema adaptativo no depende de recomendaciones aisladas, sino de un registro persistente y auditable del proceso de aprendizaje.
