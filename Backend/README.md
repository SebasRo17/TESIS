# Backend - Arquitectura Hexagonal con DDD

## 📋 Descripción

Backend desarrollado siguiendo los principios de **Arquitectura Hexagonal (Ports & Adapters)** y **Domain-Driven Design (DDD)**, proporcionando una estructura escalable y mantenible para aplicaciones empresariales.

## 🏗️ Estructura del Proyecto

```
Backend/
├── src/
│   ├── app.ts                      # Configuración principal de la aplicación
│   ├── index.ts                    # Punto de entrada de la aplicación
│   │
│   ├── app/                        # Capa de aplicación
│   │   ├── router.ts               # Configuración de rutas principales
│   │   └── middlewares/            # Middlewares de aplicación
│   │       └── auth.ts             # Middleware de autenticación
│   │
│   ├── config/                     # Configuraciones
│   │   └── env.ts                  # Variables de entorno
│   │
│   ├── core/                       # Núcleo compartido de la aplicación
│   │   ├── errors/                 # Manejo de errores
│   │   │   ├── AppError.ts         # Errores de aplicación
│   │   │   └── DomainError.ts      # Errores de dominio
│   │   ├── events/                 # Sistema de eventos
│   │   │   ├── DomainEvent.ts      # Eventos de dominio
│   │   │   └── EventBus.ts         # Bus de eventos
│   │   ├── logging/                # Sistema de logging
│   │   │   └── logger.ts           # Configuración del logger
│   │   ├── types/                  # Tipos compartidos
│   │   │   └── index.ts            # Tipos TypeScript globales
│   │   └── validation/             # Validación
│   │       └── validator.ts        # Validador de datos
│   │
│   ├── docs/                       # Documentación
│   │   └── swagger.ts              # Configuración de Swagger/OpenAPI
│   │
│   ├── infra/                      # Infraestructura
│   │   ├── db/                     # Base de datos
│   │   │   └── prisma.ts           # Cliente de Prisma
│   │   └── http/                   # Servidor HTTP
│   │       └── server.ts           # Configuración del servidor
│   │
│   ├── modules/                    # Módulos de dominio (Bounded Contexts)
│   │   ├── auth/                   # Módulo de autenticación
│   │   │   ├── application/        # Casos de uso
│   │   │   │   └── RegisterUseCase.ts
│   │   │   ├── domain/             # Lógica de dominio
│   │   │   │   └── AuthPorts.ts    # Puertos (interfaces)
│   │   │   ├── infrastructure/     # Adaptadores
│   │   │   │   └── PrismaAuthRepo.ts
│   │   │   ├── interface/          # Capa de presentación
│   │   │   │   └── http/
│   │   │   │       ├── auth.route.ts
│   │   │   │       └── dto/        # Data Transfer Objects
│   │   │   └── test/               # Tests del módulo
│   │   └── users/                  # Módulo de usuarios (estructura similar)
│   │
│   ├── shared/                     # Código compartido entre módulos
│   │   ├── domain/                 # Entidades y Value Objects compartidos
│   │   └── infrastructure/         # Infraestructura compartida
│   │
│   ├── test/                       # Tests globales
│   │   ├── e2e/                    # Tests end-to-end
│   │   ├── integration/            # Tests de integración
│   │   └── unit/                   # Tests unitarios
│   │
│   └── utils/                      # Utilidades
│       ├── pagination.ts           # Utilidad de paginación
│       └── result.ts               # Patrón Result para manejo de errores
│
├── .gitignore
└── README.md
```

## 🎯 Principios Arquitectónicos

### Arquitectura Hexagonal (Ports & Adapters)

La aplicación sigue el patrón de Arquitectura Hexagonal, separando la lógica de negocio de los detalles de implementación:

- **Domain (Centro)**: Lógica de negocio pura, independiente de frameworks
- **Application**: Casos de uso que orquestan el dominio
- **Infrastructure**: Implementaciones concretas (base de datos, API, etc.)
- **Interface**: Puntos de entrada (HTTP, CLI, etc.)

### Domain-Driven Design (DDD)

- **Bounded Contexts**: Cada módulo representa un contexto delimitado
- **Entities**: Objetos con identidad única
- **Value Objects**: Objetos inmutables sin identidad
- **Aggregates**: Conjuntos de entidades tratadas como unidad
- **Domain Events**: Eventos que representan cambios en el dominio
- **Repositories**: Abstracción para persistencia de datos

## 📁 Descripción de Carpetas

### `/src/core`
Contiene la lógica compartida y transversal a toda la aplicación:
- **errors**: Jerarquía de errores personalizada
- **events**: Sistema de eventos de dominio
- **logging**: Configuración centralizada de logs
- **types**: Tipos TypeScript compartidos
- **validation**: Lógica de validación reutilizable

### `/src/modules`
Cada módulo representa un **Bounded Context** con su propia estructura:

```
module/
├── application/        # Casos de uso (Use Cases)
├── domain/            # Entidades, Value Objects, Ports
├── infrastructure/    # Adaptadores (Repositories, APIs)
├── interface/         # Controllers, Routes, DTOs
└── test/             # Tests específicos del módulo
```

### `/src/infra`
Infraestructura técnica compartida:
- **db**: Configuración de base de datos
- **http**: Configuración del servidor HTTP

### `/src/shared`
Código compartido entre módulos que no forma parte del core:
- **domain**: Entidades y Value Objects reutilizables
- **infrastructure**: Implementaciones compartidas

### `/src/utils`
Utilidades y helpers:
- **pagination**: Manejo de paginación de resultados
- **result**: Patrón Result para manejo funcional de errores

## 🚀 Agregar Nuevos Módulos

Para agregar un nuevo módulo (ej: `products`):

1. Crear la estructura en `/src/modules/products/`
2. Implementar siguiendo las capas:
   - **domain**: Definir entidades, value objects y puertos
   - **application**: Crear casos de uso
   - **infrastructure**: Implementar adaptadores
   - **interface**: Crear rutas y DTOs
3. Registrar las rutas en [`app/router.ts`](src/app/router.ts)

## 🧪 Testing

La estrategia de testing está organizada en tres niveles:

- **unit**: Tests de lógica de negocio aislada
- **integration**: Tests de integración entre capas
- **e2e**: Tests de flujos completos de usuario

Cada módulo también puede tener sus propios tests en `modules/{module}/test/`

## 📚 Tecnologías Principales

- **TypeScript**: Lenguaje de programación
- **Prisma**: ORM para base de datos
- **Swagger**: Documentación de API
- **Express/Fastify**: Framework HTTP (por configurar)

## 🔧 Configuración

Las variables de entorno se gestionan en [`config/env.ts`](src/config/env.ts)

## 📝 Notas

Esta estructura está preparada para escalar y añadir nuevos módulos de forma independiente, siguiendo los principios de **separación de responsabilidades** y **bajo acoplamiento**.