Documentación del Esquema de Base de Datos - base_tesis

Sistema de estudio inteligente para ingreso a la EPN. Este documento describe todas las tablas, columnas y relaciones (FK) del esquema MySQL.

# Tabla: users

Usuarios del sistema (autenticación y estado).

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREME | NT  | Identificador único. |
| email | VARCHAR(255) | NOT NULL, UNIQUE |     | Correo de acceso. |
| password_hash | VARCHAR(255) | NOT NULL |     | Hash de contraseña. |
| status | VARCHAR(255) | NOT NULL |     | Estado del usuario (activo/bloqueado/etc.). |
| created_at | DATETIME | NOT NULL | CURRENT_<br><br>TIMESTAMP | Fecha de creación |

# Tabla: user_profile

Perfil extendido del usuario (datos personales).

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| user_id | INT UNSIGNED | NOT NULL, PK, FK -> users.id |     | Id del usuario asociado. |
| first_name | VARCHAR(255) | NOT NULL |     | Nombres. |
| last_name | VARCHAR(255) | NOT NULL |     | Apellidos. |
| document | VARCHAR(255) | UNIQUE, NULL |     | Documento de identidad (opcional). |
| goal | VARCHAR(255) | NULL |     | Meta académica declarada. |
| phone | VARCHAR(255) | NULL |     | Teléfono. |
| birth_date | DATE | NULL |     | Fecha de nacimiento. |
| city | VARCHAR(255) | NULL |     | Ciudad. |

| **Columna** | **Tabla destino** | **Columna destino** | **ON DELETE** | **ON UPDATE** |
| --- | --- | --- | --- | --- |
| user_id | users | id  | CASCADE | CASCADE |

# Tabla: auth_sessions

Sesiones de autenticación (tokens de refresco).

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREMENT |     | Identificador de sesión. |
| user_id | INT UNSIGNED | NOT NULL, FK -> users.id |     | Usuario dueño de la sesión. |
| refresh_token_hash | VARCHAR(255) | NOT NULL |     | Hash del refresh token. |
| ip  | VARCHAR(255) | NULL |     | IP de origen. |
| user_agent | VARCHAR(255) | NULL |     | Agente de usuario. |

| **Columna** | **Tabla destino** | **Columna destino** | **ON DELETE** | **ON UPDATE** |
| --- | --- | --- | --- | --- |

| user_id | users | id  | CASCADE | CASCADE |
| --- | --- | --- | --- | --- |

# Tabla: courses

Cursos o áreas base (p. ej. Matemática, Lenguaje).

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREMENT |     | Identificador. |
| code | VARCHAR(255) | NOT NULL, UNIQUE |     | Código único del curso. |
| title | VARCHAR(255) | NOT NULL |     | Título del curso. |
| description | TEXT | NULL |     | Descripción. |
| status | VARCHAR(255) | NOT NULL |     | Estado del curso. |

# Tabla: topics

Temas y subtemas jerárquicos dentro de un curso.

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREMENT |     | Identificador del tema. |
| course_id | INT UNSIGNED | NOT NULL, FK -> courses.id |     | Curso al que pertenece. |
| name | VARCHAR(255) | NOT NULL |     | Nombre del tema. |
| description | TEXT | NULL |     | Descripción. |
| parent_topic_id | INT UNSIGNED | NULL, FK -> topics.id |     | Tema padre (jerarquía). |
| level | SMALLINT UNSIGNED | NOT NULL |     | Nivel de profundidad. |
| is_active | TINYINT(1) | NOT NULL, DEFAULT | 1   | Activo/inactivo. |

| **Columna** | **Tabla destino** | **Columna destino** | **ON DELETE** | **ON UPDATE** |
| --- | --- | --- | --- | --- |
| course_id | courses | id  | CASCADE | CASCADE |
| parent_topic_id | topics | id  | SET NULL | CASCADE |

# Tabla: lessons

Lecciones asociadas a un curso y tema principal.

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREMENT |     | Identificador de la lección. |
| course_id | INT UNSIGNED | NOT NULL, FK -> courses.id |     | Curso al que pertenece. |
| primary_topic_id | INT UNSIGNED | NULL, FK -> topics.id |     | Tema principal de la lección. |
| title | VARCHAR(255) | NOT NULL |     | Título. |
| canonical_slug | VARCHAR(255) | NOT NULL, UNIQUE |     | Slug canónico. |
| is_active | TINYINT(1) | NOT NULL, DEFAULT | 1   | Activo/inactivo. |
| version | SMALLINT UNSIGNED | NOT NULL, DEFAULT | 1   | Versión de la lección. |

| **Columna** | **Tabla destino** | **Columna destino** | **ON DELETE** | **ON UPDATE** |
| --- | --- | --- | --- | --- |

| course_id | courses | id  | CASCADE | CASCADE |
| --- | --- | --- | --- | --- |
| primary_topic_id | topics | id  | SET NULL | CASCADE |

# Tabla: lesson_resources

Recursos adjuntos a una lección (videos, PDFs, enlaces).

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREMENT |     | Identificador. |
| lesson_id | INT UNSIGNED | NOT NULL, FK -> lessons.id |     | Lección dueña. |
| type | VARCHAR(255) | NOT NULL |     | Tipo de recurso. |
| url | VARCHAR(255) | NULL |     | URL del recurso (si aplica). |
| title | VARCHAR(255) | NOT NULL |     | Título del recurso. |
| description | TEXT | NULL |     | Descripción. |

| **Columna** | **Tabla destino** | **Columna destino** | **ON DELETE** | **ON UPDATE** |
| --- | --- | --- | --- | --- |
| lesson_id | lessons | id  | CASCADE | CASCADE |

# Tabla: content_variants

Versiones/variantes de contenido para una lección (modalidad, dificultad, HTML, etc.).

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREMENT |     | Identificador. |
| lesson_id | INT UNSIGNED | NOT NULL, FK -> lessons.id |     | Lección asociada. |
| modality | VARCHAR(255) | NOT NULL |     | Modalidad (video, lectura, práctica...). |
| difficulty_profile | VARCHAR(255) | NULL |     | Perfil de dificultad. |
| reading_level | VARCHAR(255) | NULL |     | Nivel de lectura. |
| content_url | VARCHAR(255) | NULL |     | URL al contenido externo. |
| body_html | LONGTEXT | NULL |     | Contenido embebido en HTML. |
| est_minutes | INT UNSIGNED | NULL |     | Tiempo estimado en minutos. |
| is_active | TINYINT(1) | NOT NULL, DEFAULT | 1   | Activo/inactivo. |
| version | INT UNSIGNED | NOT NULL, DEFAULT | 1   | Versión. |

| **Columna** | **Tabla destino** | **Columna destino** | **ON DELETE** | **ON UPDATE** |
| --- | --- | --- | --- | --- |
| lesson_id | lessons | id  | CASCADE | CASCADE |

# Tabla: content_prereqs

Prerequisitos (tema y maestría mínima) para cursar una lección.

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREMENT |     | Identificador. |
| lesson_id | INT UNSIGNED | NOT NULL, FK -> lessons.id |     | Lección objetivo. |

| required_topic_id | INT UNSIGNED | NOT NULL, FK -> topics.id |     | Tema requerido. |
| --- | --- | --- | --- | --- |
| min_mastery | DECIMAL(4,3) | NOT NULL |     | Maestría mínima requerida (0..1). |

| **Columna** | **Tabla destino** | **Columna destino** | **ON DELETE** | **ON UPDATE** |
| --- | --- | --- | --- | --- |
| lesson_id | lessons | id  | CASCADE | CASCADE |
| required_topic_id | topics | id  | CASCADE | CASCADE |

# Tabla: content_events

Eventos de interacción del usuario con contenido/variantes.

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREMENT |     | Identificador. |
| user_id | INT UNSIGNED | NOT NULL, FK -> users.id |     | Usuario que realiza el evento. |
| lesson_id | INT UNSIGNED | NULL, FK -> lessons.id |     | Lección asociada (si aplica). |
| content_variant_id | INT UNSIGNED | NULL, FK -> content_variants.id |     | Variante de contenido (si aplica). |
| event_type | VARCHAR(255) | NOT NULL |     | Tipo de evento (view, complete, like...). |
| event_value | JSON | NULL |     | Valores/props del evento. |

| **Columna** | **Tabla destino** | **Columna destino** | **ON DELETE** | **ON UPDATE** |
| --- | --- | --- | --- | --- |
| user_id | users | id  | CASCADE | CASCADE |
| lesson_id | lessons | id  | SET NULL | CASCADE |
| content_variant_id | content_variants | id  | SET NULL | CASCADE |

# Tabla: lesson_progress

Progreso por lección a nivel de usuario.

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREMENT |     | Identificador. |
| user_id | INT UNSIGNED | NOT NULL, FK -> users.id |     | Usuario. |
| lesson_id | INT UNSIGNED | NOT NULL, FK -> lessons.id |     | Lección. |
| status | VARCHAR(255) | NOT NULL |     | Estado (p. ej. started, completed). |
| last_position | VARCHAR(255) | NULL |     | Última posición (paginado/tiempo). |
| completed_at | DATETIME | NULL |     | Fecha de finalización. |
| time_spent_sec | INT UNSIGNED | NULL |     | Tiempo dedicado en segundos. |

| **Columna** | **Tabla destino** | **Columna destino** | **ON DELETE** | **ON UPDATE** |
| --- | --- | --- | --- | --- |
| user_id | users | id  | CASCADE | CASCADE |
| lesson_id | lessons | id  | CASCADE | CASCADE |

# Tabla: user_content_assignments

Asignaciones explícitas de contenido/variantes a usuarios (por orquestador o manual).

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREMENT |     | Identificador. |
| user_id | INT UNSIGNED | NOT NULL, FK -> users.id |     | Usuario asignado. |
| lesson_id | INT UNSIGNED | NOT NULL, FK -> lessons.id |     | Lección objetivo. |
| content_variant_id | INT UNSIGNED | NOT NULL, FK -> content_variants.id |     | Variante asignada. |
| assigned_by | VARCHAR(255) | NOT NULL |     | Origen de la asignación (orchestrator/ manual). |
| rationale | TEXT | NULL |     | Motivo de la asignación. |
| status | VARCHAR(255) | NOT NULL |     | Estado de la asignación. |

l).

| **Columna** | **Tabla destino** | **Columna destino** | **ON DELETE** | **ON UPDATE** |
| --- | --- | --- | --- | --- |
| user_id | users | id  | CASCADE | CASCADE |
| lesson_id | lessons | id  | CASCADE | CASCADE |
| content_variant_id | content_variants | id  | CASCADE | CASCADE |

# Tabla: items

Banco de preguntas/ítems evaluativos.

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREMENT |     | Identificador. |
| topic_id | INT UNSIGNED | NOT NULL, FK -> topics.id |     | Tema del ítem. |
| type | ENUM('single_choice',<br><br>'multi_choice','open') | NOT NULL |     | Tipo de ítem. |
| stem | TEXT | NOT NULL |     | Enunciado. |
| options | JSON | NULL |     | Opciones (para choice). |
| answer_key | JSON | NULL |     | Clave de respuesta. |
| explanation | TEXT | NULL |     | Explicación/retroalimentación. |
| difficulty | TINYINT UNSIGNED | NOT NULL, DEFAULT 3 | 3   | Dificultad 1..5. |
| source | VARCHAR(255) | NULL |     | Fuente del ítem. |
| version | INT UNSIGNED | NOT NULL, DEFAULT 1 | 1   | Versión. |
| is_active | TINYINT(1) | NOT NULL, DEFAULT 1 | 1   | Activo/inactivo. |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_ TIMESTAMP | CURRENT_TIMESTAMP | Creación. |
| updated_at | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP |     | Actualización. |

| **Columna** | **Tabla destino** | **Columna destino** | **ON DELETE** | **ON UPDATE** |
| --- | --- | --- | --- | --- |
| topic_id | topics | id  | RESTRICT | CASCADE |

# Tabla: exams

Exámenes/simuladores definidos (plantillas).

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREMENT |     | Identificador. |

| title | VARCHAR(255) | NOT NULL |     | Título del examen. |
| --- | --- | --- | --- | --- |
| mode | ENUM('('diagnostic','mock','final') | NOT NULL |     | Modo del examen. |
| time_limit_sec | INT UNSIGNED | NOT NULL, DEFAULT 0 | 0   | Límite de tiempo en segundos. |
| version | INT UNSIGNED | NOT NULL, DEFAULT 1 | 1   | Versión. |
| is_active | TINYINT(1) | NOT NULL, DEFAULT 1 | 1   | Activo/inactivo. |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_ TIMESTAMP | CURRENT_TIMESTAMP | Creación. |
| updated_at | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP |     | Actualización. |

# Tabla: exam_items

Relación examen  ítems (con orden y peso).

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| exam_id | INT UNSIGNED | NOT NULL, PK, FK -> exams.id |     | Examen dueño. |
| item_id | INT UNSIGNED | NOT NULL, PK, FK -> items.id |     | Ítem incluido. |
| order_n | INT UNSIGNED | NOT NULL |     | Orden en el examen. |
| weight | DECIMAL(5,2) | NOT NULL, DEFAULT 1.00 | 1.00 | Peso del ítem. |

| **Columna** | **Tabla destino** | **Columna destino** | **ON DELETE** | **ON UPDATE** |
| --- | --- | --- | --- | --- |
| exam_id | exams | id  | CASCADE | CASCADE |
| item_id | items | id  | RESTRICT | CASCADE |

# Tabla: exam_attempts

Intentos de examen por usuario.

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREMENT |     | Identificador. |
| user_id | INT UNSIGNED | NOT NULL, FK -> users.id |     | Usuario que rinde. |
| exam_id | INT UNSIGNED | NOT NULL, FK -> exams.id |     | Examen rendido. |
| started_at | DATETIME | NOT NULL, DEFAULT CURRENT_ | CURRENT_TIMESTAMP | Inicio |
| completed_at | DATETIME | NULL |     | Fin (si completó). |
| duration_sec | INT (GENERATED) | STORED |     | Segundos entre start y end. |
| score_raw | DECIMAL(6,2) | NULL |     | Puntaje bruto. |
| score_norm | DECIMAL(6,2) | NULL |     | Puntaje normalizado. |
| metadata | JSON | NULL |     | Datos extra del intento. |

| **Columna** | **Tabla destino** | **Columna destino** | **ON DELETE** | **ON UPDATE** |
| --- | --- | --- | --- | --- |
| user_id | users | id  | CASCADE | CASCADE |
| exam_id | exams | id  | CASCADE | CASCADE |

# Tabla: item_responses

Respuestas por ítem dentro de un intento.

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREMENT |     | Identificador. |
| attempt_id | INT UNSIGNED | NOT NULL, FK -> exam_attempts.id |     | Intento asociado. |
| item_id | INT UNSIGNED | NOT NULL, FK -> items.id |     | Ítem respondido. |
| answer | JSON | NULL |     | Respuesta normalizada. |
| is_correct | TINYINT(1) | NULL |     | Correcto/incorrecto. |
| time_spent_sec | INT UNSIGNED | NULL |     | Tiempo dedicado. |
| hints_used | SMALLINT UNSIGNED | NOT NULL, DEFAULT 0 | 0   | Pistas usadas. |
| awarded_score | DECIMAL(5,2) | NULL |     | Puntaje otorgado. |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP_ | CURRENT_TIMESTAMP_ | Fecha de registro. |

| **Columna** | **Tabla destino** | **Columna destino** | **ON DELETE** | **ON UPDATE** |
| --- | --- | --- | --- | --- |
| attempt_id | exam_attempts | id  | CASCADE | CASCADE |
| item_id | items | id  | RESTRICT | CASCADE |

# Tabla: user_skill_mastery

Maestría del usuario por tema (valor agregado).

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREMENT |     | Identificador. |
| user_id | INT UNSIGNED | NOT NULL, FK -> users.id |     | Usuario. |
| topic_id | INT UNSIGNED | NOT NULL, FK -> topics.id |     | Tema. |
| mastery | DECIMAL(4,3) | NOT NULL |     | Nivel de maestría (0..1). |
| observations | INT UNSIGNED | NOT NULL, DEFAULT 0 | 0   | Cantidad de observaciones/evidencias. |

| **Columna** | **Tabla destino** | **Columna destino** | **ON DELETE** | **ON UPDATE** |
| --- | --- | --- | --- | --- |
| user_id | users | id  | CASCADE | CASCADE |
| topic_id | topics | id  | CASCADE | CASCADE |

# Tabla: mastery_journal

Bitácora de cambios de maestría (trazabilidad).

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREMENT |     | Identificador. |
| user_id | INT UNSIGNED | NOT NULL, FK -> users.id |     | Usuario. |
| topic_id | INT UNSIGNED | NOT NULL, FK -> topics.id |     | Tema. |
| source | ENUM('exam','response','manual','orchestrator') | NOT NULL |     | Origen del cambio. |
| delta | DECIMAL(4,3) | NOT NULL |     | Cambio aplicado (-1..1). |
| mastery_before | DECIMAL(4,3) | NULL |     | Valor previo. |

| mastery_after | DECIMAL(4,3) | NULL |     | Valor resultante. |
| --- | --- | --- | --- | --- |
| evidence | JSON | NULL |     | Evidencia/refs. |
| at  | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP_ | CURRENT_TIMESTAMP_ | Fecha del evento. |

| **Columna** | **Tabla destino** | **Columna destino** | **ON DELETE** | **ON UPDATE** |
| --- | --- | --- | --- | --- |
| user_id | users | id  | CASCADE | CASCADE |
| topic_id | topics | id  | CASCADE | CASCADE |

# Tabla: study_rules

Reglas declarativas para personalización/flujo de estudio.

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREME | NT  | Identificador. |
| name | VARCHAR(255) | NOT NULL |     | Nombre de la regla. |
| scope | ENUM('global','course','topic','user') | NOT NULL, DEFAULT 'global' | global | Ámbito de aplicación. |
| is_active | TINYINT(1) | NOT NULL, DEFAULT 1 | 1   | Activa/inactiva. |
| priority | SMALLINT UNSIGNED | NOT NULL, DEFAULT 100 | 100 | Menor valor = mayor prioridad. |
| definition | JSON | NOT NULL |     | Definición condicional y acciones. |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | CURRENT_TIMESTAMP | Creación. |
| updated_at | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | CURRENT_TIMESTAMP | Actualización. |

# Tabla: study_rule_bindings

Asociación de reglas a curso/tema/usuario específicos.

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREMENT |     | Identificador. |
| rule_id | INT UNSIGNED | NOT NULL, FK -> study_rules.id |     | Regla. |
| course_id | INT UNSIGNED | NULL, FK -> courses.id |     | Curso (opcional). |
| topic_id | INT UNSIGNED | NULL, FK -> topics.id |     | Tema (opcional). |
| user_id | INT UNSIGNED | NULL, FK -> users.id |     | Usuario (opcional). |

| **Columna** | **Tabla destino** | **Columna destino** | **ON DELETE** | **ON UPDATE** |
| --- | --- | --- | --- | --- |
| rule_id | study_rules | id  | CASCADE | CASCADE |
| course_id | courses | id  | CASCADE | CASCADE |
| topic_id | topics | id  | CASCADE | CASCADE |
| user_id | users | id  | CASCADE | CASCADE |

# Tabla: orchestrator_decisions

Registro de decisiones del orquestador (entrada/salida y motivo).

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |

| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREMENT |     | Identificador. |
| --- | --- | --- | --- | --- |
| user_id | INT UNSIGNED | NOT NULL, FK -> users.id |     | Usuario objetivo. |
| decision_type | ENUM('plan','next','feedb | NacOkT') NULL |     | Tipo de decisión. |
| input_snapshot | JSON | NOT NULL |     | Contexto de entrada. |
| output | JSON | NOT NULL |     | Resultado (plan/acciones). |
| rationale | TEXT | NULL |     | Justificación. |
| model_version | VARCHAR(64) | NULL |     | Versión del modelo/algoritmo. |
| correlation_id | VARCHAR(128) | NULL |     | ID de correlación de trazas. |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | CURRENT_TIMESTAMP | Registro. |

| **Columna** | **Tabla destino** | **Columna destino** | **ON DELETE** | **ON UPDATE** |
| --- | --- | --- | --- | --- |
| user_id | users | id  | CASCADE | CASCADE |

# Tabla: plans

Cabecera de planes personalizados por usuario (versionados).

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREME | NT  | Identificador. |
| user_id | INT UNSIGNED | NOT NULL, FK -> users.id |     | Usuario dueño del plan. |
| version | INT UNSIGNED | NOT NULL, DEFAULT 1, UNIQUE con user_id |     | Versión. |
| state | ENUM('draft','active','superseded') | NOT NULL, DEFAULT 'draft' | draft | Estado del plan. |
| source | VARCHAR(32) | NOT NULL, DEFAULT 'orchestrator' |     | Origen. |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | CURRENT_TIMESTAMP | Creacion. |
| activated_at | DATETIME | NULL |     | Activación. |
| superseded_at | DATETIME | NULL |     | Desactivación por nueva versión. |

| **Columna** | **Tabla destino** | **Columna destino** | **ON DELETE** | **ON UPDATE** |
| --- | --- | --- | --- | --- |
| user_id | users | id  | CASCADE | CASCADE |

# Tabla: plan_items

Ítems concretos de un plan (lecciones, temas, exámenes, etc.).

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREMENT |     | Identificador. |
| plan_id | INT UNSIGNED | NOT NULL, FK -> plans.id |     | Plan dueño. |
| content_ref_type | ENUM('lesson','variant','item','topic','exam'),' | NOT NULL |     | Tipo de referencia. |
| content_ref_id | INT UNSIGNED | NOT NULL |     | Id de la entidad referida. |
| type | VARCHAR(32) | NOT NULL |     | Tipo de actividad (lesson/exam/etc.). |
| priority | DECIMAL(3,2) | NOT NULL, DEFAULT 0.50 | 0.50 | Prioridad 0..1. |
| order_n | INT UNSIGNED | NOT NULL |     | Orden dentro del plan. |

| due_at | DATETIME | NULL |     | Fecha objetivo. |
| --- | --- | --- | --- | --- |
| metadata | JSON | NULL |     | Datos adicionales. |

| **Columna** | **Tabla destino** | **Columna destino** | **ON DELETE** | **ON UPDATE** |
| --- | --- | --- | --- | --- |
| plan_id | plans | id  | CASCADE | CASCADE |

# Tabla: user_topic_plan

Plan deseado por usuario-tema (prioridades previas).

| **Columna** | **Tipo** | **Restricciones/NULL** | **Default** | **Descripción** |
| --- | --- | --- | --- | --- |
| id  | INT UNSIGNED | NOT NULL, PK, AUTO_INCREMENT |     | Identificador. |
| user_id | INT UNSIGNED | NOT NULL, FK -> users.id |     | Usuario. |
| course_id | INT UNSIGNED | NOT NULL, FK -> courses.id |     | Curso. |
| topic_id | INT UNSIGNED | NOT NULL, FK -> topics.id |     | Tema. |
| priority | SMALLINT UNSIGNED | NOT NULL |     | Prioridad numérica. |
| source | VARCHAR(255) | NOT NULL |     | Origen. |

| **Columna** | **Tabla destino** | **Columna destino** | **ON DELETE** | **ON UPDATE** |
| --- | --- | --- | --- | --- |
| user_id | users | id  | CASCADE | CASCADE |
| course_id | courses | id  | CASCADE | CASCADE |
| topic_id | topics | id  | CASCADE | CASCADE |