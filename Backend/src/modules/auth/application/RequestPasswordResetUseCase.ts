import crypto from 'crypto';
import type { AuthRepository, PasswordHasher, EmailService } from "../domain/AuthPorts";
import { AppError } from "../../../core/errors/AppError";
import { ok, err, type Result } from "../../../utils/result";
import { env } from "../../../config/env";

export interface RequestPasswordResetInput {
    email: string;
    ip?: string;
    userAgent?: string;
}

export interface RequestPasswordResetOutput {
    message: string;
    previewUrl?: string;
}

export class RequestPasswordResetUseCase {
    constructor(
        private repo: AuthRepository,
        private hasher: PasswordHasher,
        private mailer: EmailService
    ) {}

    async execute(input: RequestPasswordResetInput): Promise<Result<RequestPasswordResetOutput, AppError>> {
        try {
            console.log('🔵 [RequestPasswordResetUseCase] Entrada:', input);

            if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
                console.warn('⚠️ [RequestPasswordResetUseCase] Email inválido:', input.email);
                return err(new AppError("Email inválido", 400));
            }

            console.log('🔍 [RequestPasswordResetUseCase] Buscando usuario con email:', input.email);
            const user = await this.repo.findUserByEmail(input.email);
            
            if (!user) {
                console.log('ℹ️ [RequestPasswordResetUseCase] Usuario no encontrado (devolviendo mensaje genérico)');
                return ok({ message: "Si el email existe, se ha enviado un enlace para restablecer la contraseña." });
            }

            console.log('✅ [RequestPasswordResetUseCase] Usuario encontrado:', { id: user.id, email: user.email, status: user.status });

            if (user.status !== "active") {
                console.warn('⚠️ [RequestPasswordResetUseCase] Usuario inactivo:', user.status);
                return err(new AppError("El usuario no está activo", 403));
            }

            console.log('🔑 [RequestPasswordResetUseCase] Generando token...');
            const rawToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = await this.hasher.hash(rawToken);
            const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

            const resetUrl = `${env.frontendUrl}/reset-password?uid=${user.id}&token=${rawToken}`;
            console.log('🔗 [RequestPasswordResetUseCase] Reset URL generada:', resetUrl);

            console.log('💾 [RequestPasswordResetUseCase] Guardando token en BD...');
            await this.repo.storePasswordReset(user.id, tokenHash, expiresAt, input.ip, input.userAgent);
            
            console.log('📧 [RequestPasswordResetUseCase] Enviando email...');
            await this.mailer.sendPasswordResetEmail({ to: user.email, resetUrl });
            
            console.log('✅ [RequestPasswordResetUseCase] Email enviado correctamente');
            return ok({ message: "Se ha enviado un enlace de recuperación" });
        } catch (e) {
            console.error('🔴 [RequestPasswordResetUseCase] Error capturado:', e);
            return err(new AppError("Error solicitando recuperación", 500));
        }
    }
}