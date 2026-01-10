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
      },
    },
    paths: {
      "/auth/register": {
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
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
