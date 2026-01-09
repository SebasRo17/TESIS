# Módulo Lessons

## Descripción General

El módulo **Lessons** gestiona el catálogo de lecciones base del sistema educativo inteligente. Una lección representa una unidad didáctica estructural que actúa como ancla académica para la generación posterior de contenido personalizado.

## Características Principales

- ✅ Gestión de lecciones por curso
- ✅ Consulta de lecciones por tema principal
- ✅ Obtención de detalle completo de lecciones
- ✅ Exposición de prerequisitos académicos (informativo)
- ✅ Solo lectura - no modifica datos del usuario
- ✅ No depende del estado del usuario
- ✅ Información global y reutilizable

## Estructura del Módulo

```
lessons/
├── application/
│   ├── GetLessonsByCourseUseCase.ts      # Obtiene lecciones por curso
│   ├── GetLessonsByTopicUseCase.ts       # Obtiene lecciones por tema
│   ├── GetLessonDetailUseCase.ts         # Detalle de una lección
│   └── GetLessonPrerequisitesUseCase.ts  # Prerequisitos informativos
├── domain/
│   ├── Lesson.ts                         # Entidades y tipos
│   ├── LessonPorts.ts                    # Interfaces del repositorio
│   └── errors/
│       ├── LessonNotFoundError.ts
│       ├── CourseNotFoundError.ts
│       └── TopicNotFoundError.ts
├── infrastructure/
│   └── PrismaLessonRepository.ts          # Implementación con Prisma
└── interface/
    └── http/
        ├── LessonsController.ts          # Manejo de requests HTTP
        ├── lessons.route.ts              # Definición de rutas
        └── dto/
            ├── LessonResponse.ts         # Response para lecciones
            ├── LessonDetailResponse.ts   # Response de detalle
            └── PrerequisiteResponse.ts   # Response de prerequisitos
```

## Endpoints Disponibles

### 1. Obtener lecciones por curso
```http
GET /courses/{courseId}/lessons
```
Retorna todas las lecciones activas asociadas a un curso.

**Parámetros:**
- `courseId` (path): ID del curso

**Respuesta:**
```json
[
  {
    "id": 1,
    "courseId": 1,
    "primaryTopicId": 2,
    "title": "Introducción a Funciones",
    "canonicalSlug": "intro-funciones",
    "isActive": true,
    "version": 1
  }
]
```

### 2. Obtener lecciones por tema
```http
GET /topics/{topicId}/lessons
```
Retorna todas las lecciones cuyo tema principal es el especificado.

**Parámetros:**
- `topicId` (path): ID del tema

**Respuesta:**
```json
[
  {
    "id": 1,
    "courseId": 1,
    "primaryTopicId": 2,
    "title": "Introducción a Funciones",
    "canonicalSlug": "intro-funciones",
    "isActive": true,
    "version": 1
  }
]
```

### 3. Obtener detalle de una lección
```http
GET /lessons/{lessonId}
```
Retorna información detallada de una lección incluyendo curso y tema.

**Parámetros:**
- `lessonId` (path): ID de la lección

**Respuesta:**
```json
{
  "id": 1,
  "courseId": 1,
  "courseTitle": "Matemática",
  "primaryTopicId": 2,
  "topicName": "Funciones",
  "title": "Introducción a Funciones",
  "canonicalSlug": "intro-funciones",
  "isActive": true,
  "version": 1
}
```

### 4. Obtener prerequisitos de una lección
```http
GET /lessons/{lessonId}/prereqs
```
Retorna los prerequisitos académicos de una lección (informativo).

**Parámetros:**
- `lessonId` (path): ID de la lección

**Respuesta:**
```json
[
  {
    "id": 1,
    "lessonId": 1,
    "requiredTopicId": 1,
    "minMastery": 0.75,
    "topicName": "Números Reales"
  }
]
```

## Entidades del Dominio

### Lesson
Representa una unidad didáctica base del sistema.

```typescript
interface Lesson {
  id: number;
  courseId: number;
  primaryTopicId: number | null;
  title: string;
  canonicalSlug: string;
  isActive: boolean;
  version: number;
}
```

### LessonPrerequisite
Define un prerequisito académico de una lección.

```typescript
interface LessonPrerequisite {
  id: number;
  lessonId: number;
  requiredTopicId: number;
  minMastery: number;
  topicName?: string;
}
```

## Casos de Uso

### GetLessonsByCourseUseCase
Obtiene todas las lecciones activas de un curso específico.

```typescript
const useCase = new GetLessonsByCourseUseCase(repository);
const result = await useCase.execute(courseId);
```

### GetLessonsByTopicUseCase
Obtiene todas las lecciones asociadas a un tema (por tema principal).

```typescript
const useCase = new GetLessonsByTopicUseCase(repository);
const result = await useCase.execute(topicId);
```

### GetLessonDetailUseCase
Obtiene los metadatos completos de una lección.

```typescript
const useCase = new GetLessonDetailUseCase(repository);
const result = await useCase.execute(lessonId);
```

### GetLessonPrerequisitesUseCase
Obtiene los prerequisitos académicos de una lección (solo lectura, informativo).

```typescript
const useCase = new GetLessonPrerequisitesUseCase(repository);
const result = await useCase.execute(lessonId);
```

## Patrones Implementados

- **Clean Architecture**: Separación clara en capas (domain, application, infrastructure, interface)
- **Repository Pattern**: Abstracción de datos mediante `LessonRepository`
- **Use Cases**: Lógica de negocio encapsulada
- **Result Type**: Manejo de errores con `Result<T, E>`
- **DTOs**: Mapeo de entidades a respuestas HTTP

## Interacciones con Otros Módulos

| Módulo | Interacción |
|--------|-------------|
| **courses** | Las lecciones pertenecen a un curso |
| **topics** | Las lecciones se asocian a un tema principal |
| **content** | Las lecciones son base para variantes personalizadas |
| **study-plans** | Las lecciones se incluyen en planes de estudio |
| **orchestrator** | Usa la estructura de lecciones para planificación |
| **frontend** | Visualización de la estructura de aprendizaje |

## Restricciones del Módulo

El módulo **Lessons** NO debe:
- ❌ Almacenar información de progreso del usuario
- ❌ Almacenar contenido personalizado
- ❌ Ejecutar reglas pedagógicas
- ❌ Interactuar directamente con modelos de IA
- ❌ Tomar decisiones de habilitación o bloqueo
- ❌ Requerir autenticación de usuario

## Validaciones y Reglas

1. **Coherencia Referencial**: Todas las lecciones deben pertenecer a un curso válido
2. **Tema Principal Válido**: El `primaryTopicId` debe corresponder a un tema del mismo curso
3. **Estado Activo**: Solo se retornan lecciones con `isActive = true`
4. **Slug Único**: El `canonicalSlug` debe ser único en el sistema

## Errores Manejados

- `LessonNotFoundError`: Lección no encontrada (404)
- `CourseNotFoundError`: Curso inválido (400)
- `TopicNotFoundError`: Tema inválido (400)
- `AppError`: Errores internos del servidor (500)

## Criterios de Aceptación

✅ Se pueden listar lecciones por curso y por tema
✅ Se puede obtener el detalle de una lección específica
✅ No existe dependencia del usuario en ninguna operación
✅ Se mantiene integridad referencial con cursos y temas
✅ El módulo puede ser consumido sin ambigüedad por otros componentes

## Notas de Desarrollo

- El módulo usa Prisma para acceso a datos
- Todas las operaciones son de lectura (no tiene mutaciones)
- Los errores se retornan usando el tipo `Result<T, Error>`
- Las respuestas HTTP se mapean mediante DTOs
- El módulo sigue el patrón de arquitectura del backend
