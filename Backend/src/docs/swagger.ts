import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TESIS API Documentation",
      version: "1.0.0",
      description: "API REST para plataforma de educación",
      contact: {
        name: "API Support",
        email: "support@tesis.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de desarrollo",
      },
      {
        url: "https://api.tesis.com",
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
        // ============ AUTH SCHEMAS ============
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "usuario@example.com",
              description: "Email del usuario",
            },
            password: {
              type: "string",
              format: "password",
              example: "Password123!",
              description: "Contraseña del usuario",
            },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                id: {
                  type: "number",
                  example: 1,
                },
                email: {
                  type: "string",
                  example: "usuario@example.com",
                },
              },
            },
            accessToken: {
              type: "string",
              example:
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              description: "JWT token para acceso a recursos protegidos",
            },
            refreshToken: {
              type: "string",
              example:
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              description: "JWT token para renovar el accessToken",
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: [
            "email",
            "password",
            "confirmPassword",
            "firstName",
            "lastName",
          ],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "nuevo@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "Password123!",
              description: "Contraseña con al menos 8 caracteres",
            },
            confirmPassword: {
              type: "string",
              format: "password",
              example: "Password123!",
            },
            firstName: {
              type: "string",
              example: "Juan",
            },
            lastName: {
              type: "string",
              example: "Pérez",
            },
            document: {
              type: "string",
              example: "12345678",
              description: "Documento de identidad (opcional)",
            },
            goal: {
              type: "string",
              example: "Aprender programación",
              description: "Objetivo del usuario (opcional)",
            },
            phone: {
              type: "string",
              example: "+34 912 345 678",
              description: "Número de teléfono (opcional)",
            },
            birthDate: {
              type: "string",
              format: "date",
              example: "1990-01-15",
              description: "Fecha de nacimiento (opcional)",
            },
            city: {
              type: "string",
              example: "Madrid",
              description: "Ciudad (opcional)",
            },
          },
        },
        RegisterResponse: {
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                id: {
                  type: "number",
                },
                email: {
                  type: "string",
                },
                firstName: {
                  type: "string",
                },
                lastName: {
                  type: "string",
                },
              },
            },
            message: {
              type: "string",
              example:
                "Usuario registrado exitosamente. Por favor verifica tu email.",
            },
          },
        },
        RefreshTokenRequest: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        RefreshTokenResponse: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            refreshToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        ForgotPasswordRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "usuario@example.com",
            },
          },
        },
        ResetPasswordRequest: {
          type: "object",
          required: ["token", "newPassword", "confirmPassword"],
          properties: {
            token: {
              type: "string",
              example: "abc123def456...",
              description: "Token de recuperación enviado por email",
            },
            newPassword: {
              type: "string",
              format: "password",
              example: "NewPassword123!",
            },
            confirmPassword: {
              type: "string",
              format: "password",
              example: "NewPassword123!",
            },
          },
        },
        VerifyEmailRequest: {
          type: "object",
          required: ["token"],
          properties: {
            token: {
              type: "string",
              example: "abc123def456...",
              description: "Token de verificación enviado por email",
            },
          },
        },
        // ============ USER SCHEMAS ============
        UserProfile: {
          type: "object",
          properties: {
            id: {
              type: "number",
              example: 1,
            },
            email: {
              type: "string",
              example: "usuario@example.com",
            },
            firstName: {
              type: "string",
              example: "Juan",
            },
            lastName: {
              type: "string",
              example: "Pérez",
            },
            document: {
              type: "string",
              example: "12345678",
              nullable: true,
            },
            goal: {
              type: "string",
              example: "Aprender programación",
              nullable: true,
            },
            phone: {
              type: "string",
              example: "+34 912 345 678",
              nullable: true,
            },
            birthDate: {
              type: "string",
              format: "date",
              example: "1990-01-15",
              nullable: true,
            },
            city: {
              type: "string",
              example: "Madrid",
              nullable: true,
            },
            emailVerified: {
              type: "boolean",
              example: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
            },
          },
        },
        UpdateMyProfileRequest: {
          type: "object",
          properties: {
            firstName: {
              type: "string",
              example: "Juan",
              description: "Nombre (opcional)",
            },
            lastName: {
              type: "string",
              example: "Pérez",
              description: "Apellido (opcional)",
            },
            document: {
              type: "string",
              example: "12345678",
              nullable: true,
              description: "Documento (opcional)",
            },
            goal: {
              type: "string",
              example: "Aprender programación",
              nullable: true,
              description: "Objetivo (opcional)",
            },
            phone: {
              type: "string",
              example: "+34 912 345 678",
              nullable: true,
              description: "Teléfono (opcional)",
            },
            birthDate: {
              type: "string",
              format: "date",
              example: "1990-01-15",
              nullable: true,
              description: "Fecha de nacimiento (opcional)",
            },
            city: {
              type: "string",
              example: "Madrid",
              nullable: true,
              description: "Ciudad (opcional)",
            },
          },
        },
        ChangePasswordRequest: {
          type: "object",
          required: ["currentPassword", "newPassword", "confirmPassword"],
          properties: {
            currentPassword: {
              type: "string",
              format: "password",
              example: "OldPassword123!",
              description: "Contraseña actual",
            },
            newPassword: {
              type: "string",
              format: "password",
              example: "NewPassword123!",
              description: "Nueva contraseña",
            },
            confirmPassword: {
              type: "string",
              format: "password",
              example: "NewPassword123!",
              description: "Confirmación de nueva contraseña",
            },
          },
        },
        // ============ ERROR SCHEMAS ============
        ErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "Mensaje de error descriptivo",
            },
          },
        },
      },
    },
  },
  apis: [], // Las rutas se definen directamente aquí
};

export const swaggerSpec = swaggerJsdoc(options);

/**
 * Documentación Swagger inline para la API
 * Se añaden las rutas con comentarios JSDoc
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Registrar nuevo usuario
 *     description: Crea una nueva cuenta de usuario. Se envía un email de verificación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *       400:
 *         description: Datos inválidos o incompletos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: El email ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Iniciar sesión
 *     description: Autentica el usuario y retorna tokens JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Credenciales inválidas o incompletas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Email o contraseña incorrectos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Renovar token de acceso
 *     description: Genera un nuevo accessToken usando el refreshToken
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Token renovado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshTokenResponse'
 *       401:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Cerrar sesión
 *     description: Cierra la sesión del usuario actual
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sesión cerrada exitosamente"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/password/forgot:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Solicitar recuperación de contraseña
 *     description: Envía un email con enlace para recuperar la contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Email de recuperación enviado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Se ha enviado un email con instrucciones para recuperar tu contraseña"
 *       400:
 *         description: Email inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: El email no está registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/password/reset:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Restablecer contraseña
 *     description: Cambia la contraseña usando el token de recuperación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contraseña restablecida exitosamente"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Verificar email
 *     description: Verifica el email del usuario usando el token enviado por correo
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de verificación
 *     responses:
 *       200:
 *         description: Email verificado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email verificado exitosamente"
 *       400:
 *         description: Token no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Obtener perfil del usuario actual
 *     description: Obtiene la información del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/users/me:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Actualizar perfil del usuario
 *     description: Actualiza la información del usuario autenticado. Todos los campos son opcionales
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMyProfileRequest'
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/users/me/password:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Cambiar contraseña
 *     description: Cambia la contraseña del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contraseña actualizada exitosamente"
 *       400:
 *         description: Datos inválidos o contraseña actual incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
