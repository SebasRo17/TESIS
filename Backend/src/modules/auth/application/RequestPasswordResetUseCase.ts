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
            if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
                return err(new AppError("Email inválido", 400));
            }

            const user = await this.repo.findUserByEmail(input.email);
            // Responder 200 aunque el usuario no exista para evitar enumeración
            if (!user) return ok({ message: "Si el email existe, se ha enviado un enlace para restablecer la contraseña." });

            if (user.status !== "active") {
                return err(new AppError("El usuario no está activo", 403));
            }

            const rawToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = await this.hasher.hash(rawToken);
            const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

            const resetUrl = `${env.frontendUrl}/reset-password?uid=${user.id}&token=${rawToken}`;

            await this.repo.storePasswordReset(user.id, tokenHash, expiresAt, input.ip, input.userAgent);
            await this.mailer.sendPasswordResetEmail({ to: user.email, resetUrl });

            return ok({ message: "Se ha enviado un enlace de recuperación" });
        } catch (e) {
            return err(new AppError("Error solicitando recuperación", 500));
        }
        
    }
}