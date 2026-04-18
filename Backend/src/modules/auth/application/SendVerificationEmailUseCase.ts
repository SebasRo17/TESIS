import crypto from 'crypto';
import type { AuthRepository, PasswordHasher, EmailService } from "../domain/AuthPorts";
import { AppError } from "../../../core/errors/AppError";
import { ok, err, type Result } from "../../../utils/result";
import { env } from "../../../config/env";

export interface SendVerificationEmailInput {
    userId: number;
    email: string;
    ip?: string | null;
    userAgent?: string | null;
}

export interface SendVerificationEmailOutput {
    message: string;
}

export class SendVerificationEmailUseCase {
    constructor(
        private repo: AuthRepository,
        private hasher: PasswordHasher,
        private mailer: EmailService
    ) {}

    async execute(input: SendVerificationEmailInput): Promise<Result<SendVerificationEmailOutput, AppError>> {
        try {
            console.log('🔵 [SendVerificationEmailUseCase] Iniciando envío de email de verificación');

            // Generar token
            const rawToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = await this.hasher.hash(rawToken);
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

            // Guardar token en BD
            await this.repo.storeEmailVerificationToken(
                input.userId,
                tokenHash,
                expiresAt,
                input.ip,
                input.userAgent
            );

            // Construir URL
            const verificationUrl = `${env.frontendUrl}/verify-email?uid=${input.userId}&token=${rawToken}`;
            console.log('🔗 [SendVerificationEmailUseCase] URL generada:', verificationUrl);

            // Enviar email
            await this.mailer.sendVerificationEmail({
                to: input.email,
                verificationUrl,
            });

            console.log('✅ [SendVerificationEmailUseCase] Email de verificación enviado');
            return ok({ message: "Email de verificación enviado. Revisa tu bandeja de entrada." });
        } catch (error) {
            console.error('🔴 [SendVerificationEmailUseCase] Error:', error);
            return err(new AppError("Error al enviar email de verificación", 500));
        }
    }
}