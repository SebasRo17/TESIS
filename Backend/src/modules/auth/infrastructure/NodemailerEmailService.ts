import nodemailer from "nodemailer";
import { env } from "../../../config/env";
import type { EmailService } from "../domain/AuthPorts";

export class NodemailerEmailService implements EmailService {
    private transporter;

    constructor() {
        console.log('🔧 [NodemailerEmailService] Inicializando con OAuth2:', {
            host: env.mail.host,
            port: env.mail.port,
            user: env.mail.user,
            clientId: env.gmail.clientId ? '✓' : '✗',
            clientSecret: env.gmail.clientSecret ? '✓' : '✗',
            refreshToken: env.gmail.refreshToken ? '✓' : '✗'
        });

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: env.mail.user,
                clientId: env.gmail.clientId,
                clientSecret: env.gmail.clientSecret,
                refreshToken: env.gmail.refreshToken,
            },
        });
    }

    async sendPasswordResetEmail(params: { to: string; resetUrl: string }): Promise<void> {
        try {
            console.log('📧 [NodemailerEmailService] Intentando enviar email:', {
                from: env.mail.from,
                to: params.to,
                service: 'gmail',
                auth: 'OAuth2'
            });

            const info = await this.transporter.sendMail({
                from: `"Sistema de Recuperación" <${env.mail.from}>`,
                to: params.to,
                subject: "Recupera tu contraseña - Smart Lab",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Recuperación de Contraseña</h2>
                        <p>Has solicitado restablecer tu contraseña.</p>
                        <p>Haz clic en el siguiente enlace para continuar:</p>
                        <p style="margin: 30px 0;">
                            <a href="${params.resetUrl}" 
                               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                                Restablecer Contraseña
                            </a>
                        </p>
                        <p style="color: #666; font-size: 14px;">
                            Este enlace expirará en 30 minutos.
                        </p>
                        <p style="color: #666; font-size: 14px;">
                            Si no solicitaste este cambio, ignora este mensaje.
                        </p>
                        <hr style="border: 1px solid #eee; margin: 30px 0;">
                        <p style="color: #999; font-size: 12px;">
                            Smart Lab - Sistema de Estudio Inteligente
                        </p>
                    </div>
                `,
            });

            console.log('✅ [NodemailerEmailService] Email enviado:', {
                messageId: info.messageId,
                accepted: info.accepted,
                rejected: info.rejected,
                response: info.response
            });
        } catch (error) {
            console.error('🔴 [NodemailerEmailService] Error al enviar email:', error);
            throw error;
        }
    }
}