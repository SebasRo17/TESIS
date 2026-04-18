import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TESIS API Documentation",
      version: "1.0.0",
      description: "API REST para plataforma de educación - Prueba endpoints directamente aquí",
      contact: {
        name: "API Support",
        email: "support@tesis.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Servidor de desarrollo",
      },
      {
        url: "https://api.tesis.com/api",
        description: "Servidor de producción",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token para autenticación",
        },
      },
      schemas: {
                ExamResponse: {
                  type: "object",
                  properties: {
                    id: { type: "number", example: 1 },
                    title: { type: "string", example: "Examen Diagnóstico de Matemáticas" },
                    mode: { type: "string", enum: ["diagnostic", "mock", "final"], example: "diagnostic" },
                    timeLimitSec: { type: "number", example: 3600 },
                    version: { type: "number", example: 1 },
                    isActive: { type: "boolean", example: true },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                  },
                },
                ExamAttemptResponse: {
                  type: "object",
                  properties: {
                    id: { type: "number", example: 100 },
                    userId: { type: "number", example: 10 },
                    examId: { type: "number", example: 1 },
                    startedAt: { type: "string", format: "date-time" },
                    completedAt: { type: "string", format: "date-time", nullable: true },
                    durationSec: { type: "number", nullable: true },
                    scoreRaw: { type: "number", nullable: true },
                    scoreNorm: { type: "number", nullable: true },
                    metadata: { type: "object" },
                  },
                },
                ItemResponseResponse: {
                  type: "object",
                  properties: {
                    id: { type: "number", example: 1 },
                    attemptId: { type: "number", example: 100 },
                    itemId: { type: "number", example: 5 },
                    answer: { type: "object" },
                    isCorrect: { type: "boolean", nullable: true },
                    timeSpentSec: { type: "number", nullable: true },
                    hintsUsed: { type: "number" },
                    awardedScore: { type: "number", nullable: true },
                    createdAt: { type: "string", format: "date-time" },
                  },
                },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "usuario@example.com" },
            password: { type: "string", format: "password", example: "Password123!" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            user: { type: "object", properties: { id: { type: "number" }, email: { type: "string" } } },
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["email", "password", "confirmPassword", "firstName", "lastName"],
          properties: {
            email: { type: "string", format: "email", example: "nuevo@example.com" },
            password: { type: "string", format: "password", example: "Password123!" },
            confirmPassword: { type: "string", format: "password" },
            firstName: { type: "string", example: "Juan" },
            lastName: { type: "string", example: "Pérez" },
            document: { type: "string" },
            goal: { type: "string" },
            phone: { type: "string" },
            birthDate: { type: "string", format: "date" },
            city: { type: "string" },
          },
        },
        RegisterResponse: {
          type: "object",
          properties: {
            user: { type: "object" },
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
            message: { type: "string" },
          },
        },
        RefreshTokenRequest: {
          type: "object",
          required: ["refreshToken"],
          properties: { refreshToken: { type: "string" } },
        },
        RefreshTokenResponse: {
          type: "object",
          properties: { accessToken: { type: "string" }, refreshToken: { type: "string" } },
        },
        ForgotPasswordRequest: {
          type: "object",
          required: ["email"],
          properties: { email: { type: "string", format: "email" } },
        },
        ResetPasswordRequest: {
          type: "object",
          required: ["token", "newPassword", "confirmPassword"],
          properties: {
            token: { type: "string" },
            newPassword: { type: "string", format: "password" },
            confirmPassword: { type: "string", format: "password" },
          },
        },
        VerifyEmailRequest: {
          type: "object",
          properties: { token: { type: "string" } },
        },
        UserProfile: {
          type: "object",
          properties: {
            id: { type: "number" },
            email: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            document: { type: "string" },
            goal: { type: "string" },
            phone: { type: "string" },
            birthDate: { type: "string", format: "date" },
            city: { type: "string" },
            emailVerified: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        UpdateMyProfileRequest: {
          type: "object",
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            document: { type: "string" },
            goal: { type: "string" },
            phone: { type: "string" },
            birthDate: { type: "string", format: "date" },
            city: { type: "string" },
          },
        },
        ChangePasswordRequest: {
          type: "object",
          required: ["currentPassword", "newPassword", "confirmPassword"],
          properties: {
            currentPassword: { type: "string", format: "password" },
            newPassword: { type: "string", format: "password" },
            confirmPassword: { type: "string", format: "password" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: { error: { type: "string" } },
        },
        SuccessMessage: {
          type: "object",
          properties: { message: { type: "string" } },
        },
        CourseResponse: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            code: { type: "string", example: "calculo" },
            title: { type: "string", example: "Cálculo Diferencial e Integral" },
            description: { type: "string", nullable: true, example: "Curso de matemáticas para preparación EPN" },
            status: { type: "string", example: "active" },
          },
        },
        TopicResponse: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            courseId: { type: "number", example: 1 },
            name: { type: "string", example: "Álgebra" },
            description: { type: "string", nullable: true, example: "Fundamentos de álgebra" },
            parentTopicId: { type: "number", nullable: true, example: null },
            level: { type: "number", example: 0 },
          },
        },
        TopicTreeResponse: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            courseId: { type: "number", example: 1 },
            name: { type: "string", example: "Álgebra" },
            description: { type: "string", nullable: true },
            parentTopicId: { type: "number", nullable: true },
            level: { type: "number", example: 0 },
            children: {
              type: "array",
              items: { $ref: "#/components/schemas/TopicTreeResponse" },
            },
          },
        },
        BreadcrumbItem: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            name: { type: "string", example: "Álgebra" },
            level: { type: "number", example: 0 },
          },
        },
        TopicDetailResponse: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            courseId: { type: "number", example: 1 },
            name: { type: "string", example: "Álgebra" },
            description: { type: "string", nullable: true },
            parentTopicId: { type: "number", nullable: true },
            level: { type: "number", example: 0 },
            breadcrumb: {
              type: "array",
              items: { $ref: "#/components/schemas/BreadcrumbItem" },
            },
            children: {
              type: "array",
              items: { $ref: "#/components/schemas/TopicResponse" },
            },
          },
        },
        LessonResponse: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            courseId: { type: "number", example: 1 },
            primaryTopicId: { type: "number", nullable: true, example: 2 },
            title: { type: "string", example: "Introducción a Funciones" },
            canonicalSlug: { type: "string", example: "intro-funciones" },
            isActive: { type: "boolean", example: true },
            version: { type: "number", example: 1 },
          },
        },
        LessonDetailResponse: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            courseId: { type: "number", example: 1 },
            courseTitle: { type: "string", example: "Matemática" },
            primaryTopicId: { type: "number", nullable: true, example: 2 },
            topicName: { type: "string", example: "Funciones" },
            title: { type: "string", example: "Introducción a Funciones" },
            canonicalSlug: { type: "string", example: "intro-funciones" },
            isActive: { type: "boolean", example: true },
            version: { type: "number", example: 1 },
          },
        },
        PrerequisiteResponse: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            lessonId: { type: "number", example: 1 },
            requiredTopicId: { type: "number", example: 1 },
            minMastery: { type: "number", format: "float", example: 0.75 },
            topicName: { type: "string", example: "Números Reales" },
          },
        },
        LessonProgressResponse: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            userId: { type: "number", example: 31 },
            lessonId: { type: "number", example: 1 },
            status: { type: "string", enum: ["not_started", "in_progress", "completed"], example: "in_progress" },
            lastPosition: { type: "string", nullable: true, example: "page-5" },
            completedAt: { type: "string", format: "date-time", nullable: true },
            timeSpentSec: { type: "number", nullable: true, example: 300 },
          },
        },
        LessonProgressDetailResponse: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            userId: { type: "number", example: 31 },
            lessonId: { type: "number", example: 1 },
            status: { type: "string", example: "completed" },
            lastPosition: { type: "string", nullable: true, example: "final-section" },
            completedAt: { type: "string", format: "date-time", nullable: true },
            timeSpentSec: { type: "number", nullable: true, example: 1200 },
            lessonTitle: { type: "string", example: "Introducción a Álgebra" },
            courseTitle: { type: "string", example: "Matemáticas" },
          },
        },
        UpdateProgressRequest: {
          type: "object",
          properties: {
            lastPosition: { type: "string", example: "page-5" },
            timeSpentSec: { type: "number", example: 300 },
          },
        },
        CourseProgressResponse: {
          type: "object",
          properties: {
            courseId: { type: "number", example: 1 },
            userId: { type: "number", example: 31 },
            totalLessons: { type: "number", example: 20 },
            completedLessons: { type: "number", example: 5 },
            inProgressLessons: { type: "number", example: 2 },
            totalTimeSpentSec: { type: "number", example: 3600 },
            completionPercentage: { type: "number", format: "float", example: 25.0 },
            lastActivityAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        RecentActivityResponse: {
          type: "object",
          properties: {
            userId: { type: "number", example: 31 },
            lastLessonActivity: {
              type: "object",
              nullable: true,
              properties: {
                lessonId: { type: "number", example: 1 },
                lessonTitle: { type: "string", example: "Introducción a Álgebra" },
                courseTitle: { type: "string", example: "Matemáticas" },
                status: { type: "string", example: "completed" },
                lastInteraction: { type: "string", format: "date-time" },
              },
            },
            lastExamActivity: {
              type: "object",
              nullable: true,
              properties: {
                examId: { type: "number", example: 3 },
                examTitle: { type: "string", example: "Examen Diagnóstico" },
                attemptId: { type: "number", example: 12 },
                completedAt: { type: "string", format: "date-time", nullable: true },
                lastInteraction: { type: "string", format: "date-time" },
              },
            },
            lastActivityDate: { type: "string", format: "date-time", nullable: true },
          },
        },
      },
    },
    paths: {
            "/courses/{courseId}/exams": {
              get: {
                tags: ["Assessment"],
                summary: "Obtener exámenes activos por curso",
                description: "Retorna exámenes activos asociados al curso",
                security: [{ bearerAuth: [] }],
                parameters: [
                  { in: "path", name: "courseId", required: true, schema: { type: "integer" }, example: 1 },
                ],
                responses: {
                  "200": {
                    description: "Lista de exámenes",
                    content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/ExamResponse" } } } } } },
                  },
                  "401": { description: "No autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                },
              },
            },
            "/exams/{examId}/attempts": {
              post: {
                tags: ["Assessment"],
                summary: "Iniciar intento de examen",
                description: "Crea un intento para el usuario autenticado",
                security: [{ bearerAuth: [] }],
                parameters: [
                  { in: "path", name: "examId", required: true, schema: { type: "integer" }, example: 1 },
                ],
                responses: {
                  "201": {
                    description: "Intento creado",
                    content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/ExamAttemptResponse" } } } } },
                  },
                  "400": { description: "Examen inválido", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                  "401": { description: "No autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                },
              },
            },
            "/exam-attempts/{attemptId}/responses": {
              post: {
                tags: ["Assessment"],
                summary: "Registrar respuesta a ítem",
                description: "Registra una respuesta dentro de un intento",
                security: [{ bearerAuth: [] }],
                parameters: [
                  { in: "path", name: "attemptId", required: true, schema: { type: "integer" }, example: 100 },
                ],
                requestBody: {
                  required: true,
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        required: ["itemId", "answer"],
                        properties: {
                          itemId: { type: "number", example: 5 },
                          answer: { type: "object" },
                          timeSpentSec: { type: "number" },
                          hintsUsed: { type: "number" },
                        },
                      },
                    },
                  },
                },
                responses: {
                  "201": {
                    description: "Respuesta registrada",
                    content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/ItemResponseResponse" } } } } },
                  },
                  "400": { description: "Datos inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                  "401": { description: "No autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                },
              },
            },
            "/exam-attempts/{attemptId}/finish": {
              post: {
                tags: ["Assessment"],
                summary: "Finalizar intento de examen",
                description: "Calcula métricas y marca como completado",
                security: [{ bearerAuth: [] }],
                parameters: [
                  { in: "path", name: "attemptId", required: true, schema: { type: "integer" }, example: 100 },
                ],
                responses: {
                  "200": {
                    description: "Intento finalizado",
                    content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/ExamAttemptResponse" } } } } },
                  },
                  "400": { description: "Intento inválido", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                  "401": { description: "No autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                },
              },
            },
            "/exam-attempts/{attemptId}": {
              get: {
                tags: ["Assessment"],
                summary: "Obtener detalle de intento",
                description: "Devuelve respuestas, puntaje y métricas",
                security: [{ bearerAuth: [] }],
                parameters: [
                  { in: "path", name: "attemptId", required: true, schema: { type: "integer" }, example: 100 },
                ],
                responses: {
                  "200": {
                    description: "Detalle de intento",
                    content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "object" } } } } },
                  },
                  "401": { description: "No autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                  "404": { description: "Intento no encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                },
              },
            },
      "/me/topics/{topicId}/mastery": {
        get: {
          tags: ["Mastery"],
          summary: "Obtener dominio por tema",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "topicId", required: true, schema: { type: "integer" } }],
          responses: {
            "200": { description: "Mastery por topic" },
            "401": { description: "No autenticado" },
            "404": { description: "Topic no encontrado" }
          }
        }
      },
      "/me/courses/{courseId}/mastery": {
        get: {
          tags: ["Mastery"],
          summary: "Obtener dominio por curso",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "courseId", required: true, schema: { type: "integer" } }],
          responses: {
            "200": { description: "Mastery por curso" },
            "401": { description: "No autenticado" },
            "404": { description: "Curso no encontrado" }
          }
        }
      },
      "/me/topics/{topicId}/mastery/journal": {
        get: {
          tags: ["Mastery"],
          summary: "Obtener historial de mastery por tema",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "topicId", required: true, schema: { type: "integer" } },
            { in: "query", name: "limit", required: false, schema: { type: "integer" } },
            { in: "query", name: "offset", required: false, schema: { type: "integer" } }
          ],
          responses: {
            "200": { description: "Journal de mastery" },
            "401": { description: "No autenticado" },
            "404": { description: "Topic no encontrado" }
          }
        }
      },
      "/mastery/update": {
        post: {
          tags: ["Mastery"],
          summary: "Registrar actualizaci�n de mastery (interno)",
          parameters: [{ in: "header", name: "x-internal-api-key", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Mastery actualizado" },
            "401": { description: "No autorizado" },
            "503": { description: "No configurado" }
          }
        }
      },
      "/study-rules": {
        get: {
          tags: ["Study Rules"],
          summary: "Obtener reglas activas",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Reglas activas" },
            "401": { description: "No autenticado" }
          }
        }
      },
      "/study-rules/applicable": {
        get: {
          tags: ["Study Rules"],
          summary: "Obtener reglas aplicables por contexto",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "query", name: "courseId", required: false, schema: { type: "integer" } },
            { in: "query", name: "topicId", required: false, schema: { type: "integer" } },
            { in: "query", name: "userId", required: false, schema: { type: "integer" } }
          ],
          responses: {
            "200": { description: "Reglas aplicables" },
            "400": { description: "Par�metros inv�lidos" },
            "401": { description: "No autenticado" }
          }
        }
      },
      "/topics/{topicId}/study-rules": {
        get: {
          tags: ["Study Rules"],
          summary: "Obtener reglas por tema",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "topicId", required: true, schema: { type: "integer" } }],
          responses: {
            "200": { description: "Reglas del tema" },
            "401": { description: "No autenticado" },
            "404": { description: "Topic no encontrado" }
          }
        }
      },
      "/study-rules/{ruleId}": {
        get: {
          tags: ["Study Rules"],
          summary: "Obtener detalle de regla",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "ruleId", required: true, schema: { type: "integer" } }],
          responses: {
            "200": { description: "Detalle de regla" },
            "401": { description: "No autenticado" },
            "404": { description: "Regla no encontrada" }
          }
        }
      },
      "/lessons/{lessonId}/content": {
        get: {
          tags: ["Content"],
          summary: "Obtener variantes de contenido por lecci�n",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "lessonId", required: true, schema: { type: "integer" } }],
          responses: {
            "200": { description: "Variantes de contenido" },
            "401": { description: "No autenticado" },
            "404": { description: "Lecci�n no encontrada" }
          }
        }
      },
      "/content/{variantId}": {
        get: {
          tags: ["Content"],
          summary: "Obtener detalle de variante",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "variantId", required: true, schema: { type: "integer" } }],
          responses: {
            "200": { description: "Detalle de variante" },
            "401": { description: "No autenticado" },
            "404": { description: "Variante no encontrada" }
          }
        }
      },
      "/content/{variantId}/events": {
        post: {
          tags: ["Content"],
          summary: "Registrar evento de consumo",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "variantId", required: true, schema: { type: "integer" } }],
          responses: {
            "201": { description: "Evento registrado" },
            "400": { description: "Datos inv�lidos" },
            "401": { description: "No autenticado" },
            "404": { description: "Variante no encontrada" }
          }
        }
      },
      "/lessons/{lessonId}/content/prereqs": {
        get: {
          tags: ["Content"],
          summary: "Obtener prerequisitos de contenido",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "lessonId", required: true, schema: { type: "integer" } }],
          responses: {
            "200": { description: "Prerequisitos" },
            "401": { description: "No autenticado" },
            "404": { description: "Lecci�n no encontrada" }
          }
        }
      },
      "/me/courses/{courseId}/study-plan": {
        get: {
          tags: ["Study Plans"],
          summary: "Obtener plan activo",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "courseId", required: true, schema: { type: "integer" } }],
          responses: {
            "200": { description: "Plan activo" },
            "401": { description: "No autenticado" },
            "404": { description: "Plan no encontrado" }
          }
        }
      },
      "/me/courses/{courseId}/study-plan/next": {
        get: {
          tags: ["Study Plans"],
          summary: "Obtener siguiente actividad",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "courseId", required: true, schema: { type: "integer" } }],
          responses: {
            "200": { description: "Siguiente item" },
            "401": { description: "No autenticado" },
            "404": { description: "Plan no encontrado" }
          }
        }
      },
      "/study-plan/items/{itemId}": {
        patch: {
          tags: ["Study Plans"],
          summary: "Actualizar estado de item",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "itemId", required: true, schema: { type: "integer" } }],
          responses: {
            "200": { description: "Item actualizado" },
            "401": { description: "No autenticado" },
            "403": { description: "No autorizado" },
            "404": { description: "Item no encontrado" }
          }
        }
      },
      "/study-plans": {
        post: {
          tags: ["Study Plans"],
          summary: "Crear nuevo plan (interno)",
          parameters: [{ in: "header", name: "x-internal-api-key", required: true, schema: { type: "string" } }],
          responses: {
            "201": { description: "Plan creado" },
            "400": { description: "Datos inv�lidos" },
            "401": { description: "No autorizado" },
            "503": { description: "No configurado" }
          }
        }
      },
      "/me/courses/{courseId}/study-plans": {
        get: {
          tags: ["Study Plans"],
          summary: "Obtener historial de planes",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "courseId", required: true, schema: { type: "integer" } }],
          responses: {
            "200": { description: "Historial de planes" },
            "401": { description: "No autenticado" }
          }
        }
      },      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Registrar nuevo usuario",
          description: "Crea una nueva cuenta de usuario",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } } },
          },
          responses: {
            "201": {
              description: "Usuario registrado exitosamente",
              content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterResponse" } } },
            },
            "400": { description: "Datos inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            "409": { description: "El email ya está registrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Iniciar sesión",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
          },
          responses: {
            "200": {
              description: "Login exitoso",
              content: { "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } } },
            },
            "401": { description: "Credenciales inválidas", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },
      "/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Renovar token",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/RefreshTokenRequest" } } },
          },
          responses: {
            "200": {
              description: "Token renovado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/RefreshTokenResponse" } } },
            },
            "401": { description: "Token inválido", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Cerrar sesión",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Sesión cerrada",
              content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessMessage" } } },
            },
            "401": { description: "No autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },
      "/auth/password/forgot": {
        post: {
          tags: ["Auth"],
          summary: "Solicitar recuperación de contraseña",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/ForgotPasswordRequest" } } },
          },
          responses: {
            "200": {
              description: "Email de recuperación enviado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessMessage" } } },
            },
            "404": { description: "Email no encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },
      "/auth/password/reset": {
        post: {
          tags: ["Auth"],
          summary: "Restablecer contraseña",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/ResetPasswordRequest" } } },
          },
          responses: {
            "200": {
              description: "Contraseña restablecida",
              content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessMessage" } } },
            },
            "401": { description: "Token inválido", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },
      "/auth/verify-email": {
        get: {
          tags: ["Auth"],
          summary: "Verificar email",
          parameters: [
            { in: "query", name: "token", schema: { type: "string" }, example: "abc123def456" },
          ],
          responses: {
            "200": {
              description: "Email verificado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessMessage" } } },
            },
            "401": { description: "Token inválido", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },
      "/users/me": {
        get: {
          tags: ["Users"],
          summary: "Obtener perfil",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Perfil obtenido",
              content: { "application/json": { schema: { $ref: "#/components/schemas/UserProfile" } } },
            },
            "401": { description: "No autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
        patch: {
          tags: ["Users"],
          summary: "Actualizar perfil",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateMyProfileRequest" } } },
          },
          responses: {
            "200": {
              description: "Perfil actualizado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessMessage" } } },
            },
            "401": { description: "No autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },
      "/users/me/password": {
        patch: {
          tags: ["Users"],
          summary: "Cambiar contraseña",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/ChangePasswordRequest" } } },
          },
          responses: {
            "200": {
              description: "Contraseña cambiada",
              content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessMessage" } } },
            },
            "401": { description: "No autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },
      "/courses": {
        get: {
          tags: ["Courses"],
          summary: "Obtener lista de cursos",
          description: "Retorna todos los cursos activos disponibles en la plataforma",
          responses: {
            "200": {
              description: "Lista de cursos obtenida exitosamente",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/CourseResponse" },
                  },
                },
              },
            },
            "500": {
              description: "Error interno del servidor",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/courses/{id}": {
        get: {
          tags: ["Courses"],
          summary: "Obtener curso por ID",
          description: "Retorna el detalle de un curso específico por su ID",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "ID del curso",
              example: 1,
            },
          ],
          responses: {
            "200": {
              description: "Curso encontrado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/CourseResponse" } } },
            },
            "404": {
              description: "Curso no encontrado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "500": {
              description: "Error interno del servidor",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/courses/slug/{slug}": {
        get: {
          tags: ["Courses"],
          summary: "Obtener curso por slug",
          description: "Retorna el detalle de un curso específico por su código/slug",
          parameters: [
            {
              in: "path",
              name: "slug",
              required: true,
              schema: { type: "string" },
              description: "Código o slug del curso",
              example: "calculo",
            },
          ],
          responses: {
            "200": {
              description: "Curso encontrado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/CourseResponse" } } },
            },
            "400": {
              description: "Slug es requerido",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "404": {
              description: "Curso no encontrado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "500": {
              description: "Error interno del servidor",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/courses/{courseId}/topics/tree": {
        get: {
          tags: ["Topics"],
          summary: "Obtener árbol jerárquico de topics",
          description: "Retorna todos los topics de un curso en estructura jerárquica (parent → children)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "courseId",
              required: true,
              schema: { type: "integer" },
              description: "ID del curso",
              example: 1,
            },
          ],
          responses: {
            "200": {
              description: "Árbol de topics obtenido exitosamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/TopicTreeResponse" },
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "CourseId inválido",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "401": {
              description: "No autenticado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "404": {
              description: "Curso no encontrado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "500": {
              description: "Error interno del servidor",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/courses/{courseId}/topics": {
        get: {
          tags: ["Topics"],
          summary: "Obtener lista plana de topics",
          description: "Retorna todos los topics de un curso en lista plana, ordenados por level, parent y nombre",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "courseId",
              required: true,
              schema: { type: "integer" },
              description: "ID del curso",
              example: 1,
            },
          ],
          responses: {
            "200": {
              description: "Lista de topics obtenida exitosamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/TopicResponse" },
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "CourseId inválido",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "401": {
              description: "No autenticado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "404": {
              description: "Curso no encontrado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "500": {
              description: "Error interno del servidor",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/topics/{topicId}": {
        get: {
          tags: ["Topics"],
          summary: "Obtener detalle de un topic",
          description: "Retorna el detalle completo de un topic incluyendo su breadcrumb (ruta desde la raíz) e hijos inmediatos",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "topicId",
              required: true,
              schema: { type: "integer" },
              description: "ID del topic",
              example: 2,
            },
          ],
          responses: {
            "200": {
              description: "Detalle del topic obtenido exitosamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/TopicDetailResponse" },
                    },
                  },
                },
              },
            },
            "400": {
              description: "TopicId inválido",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "401": {
              description: "No autenticado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "404": {
              description: "Topic no encontrado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "500": {
              description: "Error interno del servidor",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/courses/{courseId}/lessons": {
        get: {
          tags: ["Lessons"],
          summary: "Obtener lecciones por curso",
          description: "Retorna todas las lecciones activas de un curso específico",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "courseId",
              required: true,
              schema: { type: "integer" },
              description: "ID del curso",
              example: 1,
            },
          ],
          responses: {
            "200": {
              description: "Lecciones obtenidas exitosamente",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/LessonResponse" },
                  },
                },
              },
            },
            "400": {
              description: "Course ID inválido",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "401": {
              description: "No autenticado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "500": {
              description: "Error interno del servidor",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/topics/{topicId}/lessons": {
        get: {
          tags: ["Lessons"],
          summary: "Obtener lecciones por tema",
          description: "Retorna todas las lecciones activas cuyo tema principal corresponde al tema especificado",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "topicId",
              required: true,
              schema: { type: "integer" },
              description: "ID del tema",
              example: 2,
            },
          ],
          responses: {
            "200": {
              description: "Lecciones obtenidas exitosamente",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/LessonResponse" },
                  },
                },
              },
            },
            "400": {
              description: "Topic ID inválido",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "401": {
              description: "No autenticado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "500": {
              description: "Error interno del servidor",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/lessons/{lessonId}": {
        get: {
          tags: ["Lessons"],
          summary: "Obtener detalle de una lección",
          description: "Retorna la información detallada de una lección específica incluyendo título del curso y nombre del tema",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "lessonId",
              required: true,
              schema: { type: "integer" },
              description: "ID de la lección",
              example: 1,
            },
          ],
          responses: {
            "200": {
              description: "Detalle de lección obtenido exitosamente",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/LessonDetailResponse" },
                },
              },
            },
            "400": {
              description: "Lesson ID inválido",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "401": {
              description: "No autenticado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "404": {
              description: "Lección no encontrada",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "500": {
              description: "Error interno del servidor",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/lessons/{lessonId}/prereqs": {
        get: {
          tags: ["Lessons"],
          summary: "Obtener prerequisitos de una lección",
          description: "Retorna los prerequisitos académicos informativos de una lección (temas requeridos y nivel mínimo de maestría)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "lessonId",
              required: true,
              schema: { type: "integer" },
              description: "ID de la lección",
              example: 1,
            },
          ],
          responses: {
            "200": {
              description: "Prerequisitos obtenidos exitosamente",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/PrerequisiteResponse" },
                  },
                },
              },
            },
            "400": {
              description: "Lesson ID inválido",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "401": {
              description: "No autenticado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "404": {
              description: "Lección no encontrada",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "500": {
              description: "Error interno del servidor",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/lessons/{lessonId}/progress/start": {
        post: {
          tags: ["Progress"],
          summary: "Iniciar progreso de lección",
          description: "Registra que el usuario ha comenzado una lección. Solo se puede iniciar una vez.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "lessonId",
              required: true,
              schema: { type: "integer" },
              description: "ID de la lección",
              example: 1,
            },
          ],
          responses: {
            "201": {
              description: "Progreso iniciado exitosamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/LessonProgressResponse" },
                    },
                  },
                },
              },
            },
            "401": {
              description: "No autenticado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "409": {
              description: "El progreso de esta lección ya existe",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/lessons/{lessonId}/progress/update": {
        post: {
          tags: ["Progress"],
          summary: "Actualizar progreso de lección",
          description: "Actualiza el avance del usuario dentro de una lección (posición actual y tiempo invertido)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "lessonId",
              required: true,
              schema: { type: "integer" },
              description: "ID de la lección",
              example: 1,
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateProgressRequest" },
                examples: {
                  soloPositions: {
                    summary: "Solo actualizar posición",
                    value: { lastPosition: "page-5" },
                  },
                  soloTiempo: {
                    summary: "Solo actualizar tiempo",
                    value: { timeSpentSec: 300 },
                  },
                  ambos: {
                    summary: "Actualizar posición y tiempo",
                    value: { lastPosition: "page-5", timeSpentSec: 300 },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Progreso actualizado exitosamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/LessonProgressResponse" },
                    },
                  },
                },
              },
            },
            "400": {
              description: "No se puede actualizar una lección completada",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "401": {
              description: "No autenticado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "404": {
              description: "No se encontró progreso para esta lección",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/lessons/{lessonId}/progress/complete": {
        post: {
          tags: ["Progress"],
          summary: "Completar lección",
          description: "Marca la lección como completada por el usuario. No se puede modificar después de completada.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "lessonId",
              required: true,
              schema: { type: "integer" },
              description: "ID de la lección",
              example: 1,
            },
          ],
          responses: {
            "200": {
              description: "Lección completada exitosamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/LessonProgressResponse" },
                    },
                  },
                },
              },
            },
            "400": {
              description: "La lección ya está marcada como completada",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "401": {
              description: "No autenticado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "404": {
              description: "No se encontró progreso para esta lección",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/lessons/{lessonId}/progress": {
        get: {
          tags: ["Progress"],
          summary: "Obtener detalle de progreso de lección",
          description: "Retorna el estado actual del progreso del usuario en una lección específica con información extendida",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "lessonId",
              required: true,
              schema: { type: "integer" },
              description: "ID de la lección",
              example: 1,
            },
          ],
          responses: {
            "200": {
              description: "Detalle de progreso obtenido exitosamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/LessonProgressDetailResponse" },
                    },
                  },
                },
              },
            },
            "401": {
              description: "No autenticado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "404": {
              description: "No se encontró progreso para esta lección",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/me/courses/{courseId}/progress": {
        get: {
          tags: ["Progress"],
          summary: "Obtener progreso por curso",
          description: "Retorna métricas agregadas del avance del usuario en un curso específico (lecciones completadas, en progreso, tiempo total, etc.)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "courseId",
              required: true,
              schema: { type: "integer" },
              description: "ID del curso",
              example: 1,
            },
          ],
          responses: {
            "200": {
              description: "Progreso del curso obtenido exitosamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/CourseProgressResponse" },
                    },
                  },
                },
              },
            },
            "401": {
              description: "No autenticado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/me/progress/recent": {
        get: {
          tags: ["Progress"],
          summary: "Obtener actividad reciente",
          description: "Retorna la última actividad registrada del usuario (última lección y último examen)",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Actividad reciente obtenida exitosamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/RecentActivityResponse" },
                    },
                  },
                },
              },
            },
            "401": {
              description: "No autenticado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },

      "/orchestrator/users/{userId}/snapshot": {
        get: {
          tags: ["Orchestrator"],
          summary: "Obtener snapshot del usuario",
          description: "Construye el snapshot completo del usuario para un curso",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "userId",
              required: true,
              schema: { type: "integer" },
              example: 10,
            },
            {
              in: "query",
              name: "courseId",
              required: true,
              schema: { type: "integer" },
              example: 1,
            },
          ],
          responses: {
            "200": {
              description: "Snapshot generado",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { type: "object" },
                    },
                  },
                },
              },
            },
            "401": {
              description: "No autenticado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "403": {
              description: "No autorizado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/orchestrator/users/{userId}/decide": {
        post: {
          tags: ["Orchestrator"],
          summary: "Ejecutar orquestaci?n",
          description: "Construye snapshot, consulta modelo y procesa la decisi?n",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "userId",
              required: true,
              schema: { type: "integer" },
              example: 10,
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["courseId"],
                  properties: {
                    courseId: { type: "integer", example: 1 },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Decisi?n procesada",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { type: "object" },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Decisi?n inv?lida",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "401": {
              description: "No autenticado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/orchestrator/decisions": {
        post: {
          tags: ["Orchestrator"],
          summary: "Registrar decisi?n del modelo",
          description: "Registra una decisi?n de orquestaci?n para auditor?a (uso interno)",
          parameters: [
            {
              in: "header",
              name: "x-internal-api-key",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["userId", "decisionType", "inputSnapshot", "output"],
                  properties: {
                    userId: { type: "integer", example: 10 },
                    decisionType: {
                      type: "string",
                      enum: ["next", "reinforce_topic", "generate_content", "update_plan", "feedback"],
                    },
                    inputSnapshot: { type: "object" },
                    output: { type: "object" },
                    rationale: { type: "string" },
                    modelVersion: { type: "string" },
                    correlationId: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Decisi?n registrada",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { type: "object" },
                    },
                  },
                },
              },
            },
            "401": {
              description: "No autorizado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "503": {
              description: "API key interna no configurada",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/orchestrator/users/{userId}/decisions": {
        get: {
          tags: ["Orchestrator"],
          summary: "Obtener historial de decisiones",
          description: "Retorna el historial de decisiones del usuario",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "userId",
              required: true,
              schema: { type: "integer" },
              example: 10,
            },
            {
              in: "query",
              name: "limit",
              required: false,
              schema: { type: "integer", minimum: 1, maximum: 200 },
              example: 50,
            },
          ],
          responses: {
            "200": {
              description: "Historial obtenido",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { type: "array", items: { type: "object" } },
                    },
                  },
                },
              },
            },
            "401": {
              description: "No autenticado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "403": {
              description: "No autorizado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },

    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);


