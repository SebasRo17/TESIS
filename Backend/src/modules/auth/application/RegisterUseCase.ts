import type { AuthRepository, PasswordHasher, TokenService, EmailService } from '../domain/AuthPorts';
import type { User } from '../../../shared/domain/User';
import { AppError } from '../../../core/errors/AppError';
import type { Result } from "../../../utils/result";
import { ok, err } from "../../../utils/result";
import { prisma } from "../../../infra/db/prisma";

export interface RegisterInput {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    document?: string | null;
    goal?: string | null;
    phone?: string | null;
    birthDate?: string | null;
    city?: string | null;
    ip?: string | null;
    userAgent?: string | null;
}

export interface RegisterOutput {
    user: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    };
    accessToken: string;
    refreshToken: string;
}

export class RegisterUseCase {
    constructor(
        private authRepository: AuthRepository,
        private passwordHasher: PasswordHasher,
        private tokenService: TokenService,
        private emailService: EmailService
    ) {}

    async execute(input: RegisterInput): Promise<Result<RegisterOutput, AppError>> {
        try {
            // Paso 1: Validar datos de entrada
            const validationError = this.validateInput(input);
            if (validationError) {
                return err(validationError);
            }

            // Paso 2: Verificar que el email no exista
            const existingUser = await this.authRepository.findUserByEmail(input.email);
            if (existingUser) {
                return err(new AppError("El email ya está registrado", 409));
            }

            // Paso 3: Si se proporciona documento, verificar que no exista
            if (input.document) {
                const existingDocumentUser = await prisma.user_profile.findUnique({
                    where: { document: input.document },
                });
                if (existingDocumentUser) {
                    return err(new AppError("El documento ya está registrado", 409));
                }
            }

            // Paso 4: Hashear la contraseña
            const hashedPassword = await this.passwordHasher.hash(input.password);

            // Paso 5: Crear el usuario en transacción
            const newUser = await prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        email: input.email,
                        passwordHash: hashedPassword,
                        status: 'pending', // Estado inicial antes de validación
                    },
                });

                // Crear el perfil del usuario
                await tx.user_profile.create({
                    data: {
                        user_id: user.id,
                        first_name: input.firstName,
                        last_name: input.lastName,
                        document: input.document || null,
                        goal: input.goal || null,
                        phone: input.phone || null,
                        birth_date: input.birthDate ? new Date(input.birthDate) : null,
                        city: input.city || null,
                    },
                });

                return user;
            });

            // Paso 6: Generar tokens
            const accessToken = this.tokenService.signAccess({
                id: newUser.id,
                email: newUser.email,
            });
            const refreshToken = this.tokenService.signRefresh({
                id: newUser.id,
                email: newUser.email,
            });

            // Paso 7: Guardar refresh token en BD
            const refreshHash = await this.passwordHasher.hash(refreshToken);
            await this.authRepository.storeRefreshToken(
                newUser.id,
                refreshHash,
                input.ip ?? undefined,
                input.userAgent ?? undefined
            );

            // Paso 8: Enviar email de verificación
            console.log('📧 [RegisterUseCase] Enviando email de verificación...');
            
            // Usar SendVerificationEmailUseCase aquí
            // Por ahora lo hacemos inline para mantener simplicidad
            const crypto = await import('crypto');
            const rawToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = await this.passwordHasher.hash(rawToken);
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

            await this.authRepository.storeEmailVerificationToken(
                newUser.id,
                tokenHash,
                expiresAt,
                input.ip ?? undefined,
                input.userAgent ?? undefined
            );

            const { env } = await import('../../../config/env');
            const verificationUrl = `${env.frontendUrl}/verify-email?uid=${newUser.id}&token=${rawToken}`;
            
            await this.emailService.sendVerificationEmail({
                to: newUser.email,
                verificationUrl,
            });

            console.log('✅ [RegisterUseCase] Email de verificación enviado');

            return ok({
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    firstName: input.firstName,
                    lastName: input.lastName,
                },
                accessToken,
                refreshToken,
            });
        } catch (error) {
            console.error('RegisterUseCase error:', error);
            return err(
                new AppError('Error interno del servidor durante el registro de usuario', 500)
            );
        }
    }

    private validateInput(input: RegisterInput): AppError | null {
        // ===== Validaciones de Autenticación =====

        // Email requerido
        if (!input.email || input.email.trim() === '') {
            return new AppError('El email es requerido', 400);
        }

        // Email válido
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.email)) {
            return new AppError('El email no es válido', 400);
        }

        // Email no muy largo
        if (input.email.length > 255) {
            return new AppError('Email no puede exceder 255 caracteres', 400);
        }

        // Contraseña requerida
        if (!input.password || input.password.trim() === '') {
            return new AppError('La contraseña es requerida', 400);
        }

        // Longitud mínima de contraseña
        if (input.password.length < 8) {
            return new AppError(
                'La contraseña debe tener al menos 8 caracteres',
                400
            );
        }

        // Longitud máxima de contraseña
        if (input.password.length > 128) {
            return new AppError(
                'La contraseña no debe exceder los 128 caracteres',
                400
            );
        }

        // Confirmación de contraseña requerida
        if (!input.confirmPassword || input.confirmPassword.trim() === '') {
            return new AppError('La confirmación de la contraseña es requerida', 400);
        }

        // Las contraseñas deben coincidir
        if (input.password !== input.confirmPassword) {
            return new AppError('Las contraseñas no coinciden', 400);
        }

        // ===== Validaciones de Perfil Básico =====

        // Nombre requerido
        if (!input.firstName || input.firstName.trim() === '') {
            return new AppError('El nombre es requerido', 400);
        }

        // Nombre válido
        const nameRegex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s\-']+$/;
        if (!nameRegex.test(input.firstName)) {
            return new AppError('Nombre contiene caracteres no válidos', 400);
        }

        // Nombre no muy largo
        if (input.firstName.length > 255) {
            return new AppError('Nombre no puede exceder 255 caracteres', 400);
        }

        // Apellido requerido
        if (!input.lastName || input.lastName.trim() === '') {
            return new AppError('Apellido es requerido', 400);
        }

        // Apellido válido
        if (!nameRegex.test(input.lastName)) {
            return new AppError('Apellido contiene caracteres inválidos', 400);
        }

        // Apellido no muy largo
        if (input.lastName.length > 255) {
            return new AppError('Apellido no puede exceder 255 caracteres', 400);
        }

        // ===== Validaciones de Perfil Extendido (Opcionales) =====

        // Documento (si se proporciona)
        if (input.document && input.document.trim() !== '') {
            if (input.document.length > 255) {
                return new AppError('Documento no puede exceder 255 caracteres', 400);
            }
        }

        // Teléfono (si se proporciona)
        if (input.phone && input.phone.trim() !== '') {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(input.phone)) {
                return new AppError('Teléfono contiene caracteres inválidos', 400);
            }
            if (input.phone.length > 255) {
                return new AppError('Teléfono no puede exceder 255 caracteres', 400);
            }
        }

        // Fecha de nacimiento (si se proporciona)
        if (input.birthDate && input.birthDate.trim() !== '') {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
            if (!dateRegex.test(input.birthDate)) {
                return new AppError('Fecha de nacimiento inválida (formato: YYYY-MM-DD)', 400);
            }

            const birthDate = new Date(input.birthDate);
            if (isNaN(birthDate.getTime())) {
                return new AppError('Fecha de nacimiento inválida', 400);
            }

            // Validar que no sea una fecha futura
            if (birthDate > new Date()) {
                return new AppError('Fecha de nacimiento no puede ser futura', 400);
            }

            // Validar edad mínima (13 años)
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
                ? age - 1
                : age;

            if (actualAge < 13) {
                return new AppError('Debes tener al menos 13 años para registrarte', 400);
            }
        }

        // Ciudad (si se proporciona)
        if (input.city && input.city.trim() !== '') {
            if (input.city.length > 255) {
                return new AppError('Ciudad no puede exceder 255 caracteres', 400);
            }
        }

        // Meta académica (si se proporciona)
        if (input.goal && input.goal.trim() !== '') {
            if (input.goal.length > 255) {
                return new AppError('Meta académica no puede exceder 255 caracteres', 400);
            }
        }

        return null;
    }
}
