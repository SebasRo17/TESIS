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
    verificationUrl?: string;
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

            const mailConfigured = Boolean(
                env.mail.user &&
                (
                    env.mail.pass ||
                    (env.gmail.clientId && env.gmail.clientSecret && env.gmail.refreshToken)
                )
            );

            if (!mailConfigured) {
                console.warn('[SendVerificationEmailUseCase] Email no configurado; se omite envio SMTP.');
                const output: SendVerificationEmailOutput = {
                    message: "Email de verificación generado.",
                };
                if (env.node_env !== "production") {
                    output.verificationUrl = verificationUrl;
                }
                return ok(output);
            }

            // Enviar email
            try {
                await this.mailer.sendVerificationEmail({
                    to: input.email,
                    verificationUrl,
                });
            } catch (emailError) {
                if (env.node_env === "production") {
                    throw emailError;
                }
                console.warn('[SendVerificationEmailUseCase] No se pudo enviar email; continua en desarrollo.', emailError);
                return ok({
                    message: "Email de verificación generado.",
                    verificationUrl,
                });
            }

            console.log('✅ [SendVerificationEmailUseCase] Email de verificación enviado');
            return ok({ message: "Email de verificación enviado. Revisa tu bandeja de entrada." });
        } catch (error) {
            console.error('🔴 [SendVerificationEmailUseCase] Error:', error);
            return err(new AppError("Error al enviar email de verificación", 500));
        }
    }
}
