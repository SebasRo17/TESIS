import nodemailer from "nodemailer";
import { env } from "../../../config/env";
import type { EmailService } from "../domain/AuthPorts";

export class NodemailerEmailService implements EmailService {
    private transporter;
    private authMode: 'smtp-password' | 'oauth2' | 'none';

    constructor() {
        const hasSmtpPassword = Boolean(env.mail.user && env.mail.pass);
        const hasOauth2 = Boolean(
            env.mail.user &&
            env.gmail.clientId &&
            env.gmail.clientSecret &&
            env.gmail.refreshToken
        );

        this.authMode = hasSmtpPassword ? 'smtp-password' : hasOauth2 ? 'oauth2' : 'none';

        console.log('🔧 [NodemailerEmailService] Inicializando SMTP:', {
            host: env.mail.host,
            port: env.mail.port,
            secure: env.mail.secure,
            user: env.mail.user,
            password: hasSmtpPassword ? '✓' : '✗',
            clientId: env.gmail.clientId ? '✓' : '✗',
            clientSecret: env.gmail.clientSecret ? '✓' : '✗',
            refreshToken: env.gmail.refreshToken ? '✓' : '✗',
            authMode: this.authMode,
        });

        this.transporter = nodemailer.createTransport(this.createTransportOptions());
    }

    private createTransportOptions() {
        const base = {
            host: env.mail.host,
            port: env.mail.port,
            secure: env.mail.secure,
        };

        if (this.authMode === 'smtp-password') {
            return {
                ...base,
                auth: {
                    user: env.mail.user,
                    pass: env.mail.pass,
                },
            };
        }

        if (this.authMode === 'oauth2') {
            return {
                ...base,
                auth: {
                    type: 'OAuth2' as const,
                    user: env.mail.user,
                    clientId: env.gmail.clientId,
                    clientSecret: env.gmail.clientSecret,
                    refreshToken: env.gmail.refreshToken,
                },
            };
        }

        return base;
    }

    async sendPasswordResetEmail(params: { to: string; resetUrl: string }): Promise<void> {
        try {
            console.log('📧 [NodemailerEmailService] Intentando enviar email:', {
                from: env.mail.from,
                to: params.to,
                host: env.mail.host,
                auth: this.authMode,
            });

            const info = await this.transporter.sendMail({
                from: `"EduPrep - EPN" <${env.mail.from}>`,
                to: params.to,
                subject: "Recupera tu contrasena - EduPrep EPN",
                html: `
                    <!DOCTYPE html>
                    <html lang="es">
                    <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin:0;padding:0;background:#f4f8fb;font-family:Segoe UI, Arial, sans-serif;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:40px 20px;">
                    <tr><td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 15px 40px rgba(0,0,0,0.08);">

                        <tr>
                            <td align="center" style="background:#25c8d8;background-image:linear-gradient(135deg,#25d0c6 0%, #2ea7ff 100%);padding:50px 40px;">
                                <div style="color:rgba(255,255,255,.85);font-size:13px;letter-spacing:3px;font-weight:700;margin-bottom:12px;">
                                    ESCUELA POLITECNICA NACIONAL
                                </div>
                                <div style="color:#ffffff;font-size:42px;font-weight:800;line-height:1;margin-bottom:20px;">
                                    EduPrep
                                </div>
                                <div style="color:rgba(255,255,255,.92);font-size:16px;">
                                    Sistema de Tutoria Inteligente
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:50px 55px;">
                                <h1 style="margin:0 0 20px;color:#1f2937;font-size:30px;line-height:1.3;">
                                    Recuperacion de Contrasena
                                </h1>
                                <p style="margin:0;color:#64748b;font-size:17px;line-height:1.9;">
                                    Has solicitado restablecer tu contrasena en EduPrep.
                                    Haz clic en el siguiente boton para continuar:
                                </p>

                                <div style="height:35px;"></div>

                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr><td align="center">
                                        <a href="${params.resetUrl}" style="background:#16c5d9;color:#ffffff;text-decoration:none;padding:18px 42px;border-radius:14px;font-size:16px;font-weight:700;display:inline-block;box-shadow:0 10px 25px rgba(22,197,217,.35);">
                                            Restablecer Contrasena
                                        </a>
                                    </td></tr>
                                </table>

                                <div style="height:35px;"></div>

                                <div style="background:#f8fbfd;border-left:5px solid #25d0c6;border-radius:12px;padding:20px;">
                                    <div style="color:#475569;font-size:15px;line-height:1.8;">
                                        Este enlace expirara en <strong>30 minutos</strong>.
                                    </div>
                                </div>

                                <div style="height:30px;"></div>

                                <p style="color:#94a3b8;font-size:14px;line-height:1.8;margin:0;">
                                    Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td style="background:#f8fafc;border-top:1px solid #e5e7eb;text-align:center;padding:30px;">
                                <div style="color:#475569;font-size:20px;font-weight:700;margin-bottom:8px;">EduPrep</div>
                                <div style="color:#94a3b8;font-size:13px;">Escuela Politecnica Nacional - Sistema de Tutoria Inteligente</div>
                            </td>
                        </tr>

                    </table>
                    </td></tr>
                    </table>
                    </body>
                    </html>
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

    async sendVerificationEmail(params: { to: string; verificationUrl: string }): Promise<void> {
        try {
            console.log('📧 [NodemailerEmailService] Enviando email de verificación:', {
                from: env.mail.from,
                to: params.to,
            });

            const info = await this.transporter.sendMail({
                from: `"EduPrep - EPN" <${env.mail.from}>`,
                to: params.to,
                subject: "Verifica tu email - EduPrep EPN",
                html: `
                    <!DOCTYPE html>
                    <html lang="es">
                    <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>

                    <body style="
                        margin:0;
                        padding:0;
                        background:#f4f8fb;
                        font-family:Segoe UI, Arial, sans-serif;
                    ">

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:40px 20px;">
                    <tr>
                    <td align="center">

                    <table width="600" cellpadding="0" cellspacing="0" border="0"
                    style="
                        background:#ffffff;
                        border-radius:24px;
                        overflow:hidden;
                        box-shadow:0 15px 40px rgba(0,0,0,0.08);
                    ">

                        <!-- HEADER -->
                        <tr>
                            <td
                                align="center"
                                style="
                                    background:#25c8d8;
                                    background-image:linear-gradient(135deg,#25d0c6 0%, #2ea7ff 100%);
                                    padding:60px 40px;
                                "
                            >

                                <div style="
                                    color:rgba(255,255,255,.85);
                                    font-size:13px;
                                    letter-spacing:3px;
                                    font-weight:700;
                                    margin-bottom:12px;
                                ">
                                    ESCUELA POLITECNICA NACIONAL
                                </div>

                                <div style="
                                    color:#ffffff;
                                    font-size:42px;
                                    font-weight:800;
                                    line-height:1;
                                    margin-bottom:20px;
                                ">
                                    EduPrep
                                </div>

                                <div style="
                                    color:rgba(255,255,255,.92);
                                    font-size:18px;
                                    max-width:400px;
                                    line-height:1.7;
                                    margin:auto;
                                ">
                                    Tu camino al éxito académico comienza aquí.
                                </div>

                            </td>
                        </tr>

                        <!-- BODY -->
                        <tr>
                            <td style="padding:50px 55px;">

                                <h1 style="
                                    margin:0 0 20px;
                                    color:#1f2937;
                                    font-size:34px;
                                    line-height:1.3;
                                ">
                                    Verifica tu correo electrónico
                                </h1>

                                <p style="
                                    margin:0;
                                    color:#64748b;
                                    font-size:17px;
                                    line-height:1.9;
                                ">
                                    Gracias por registrarte en EduPrep.
                                    Para activar tu cuenta y comenzar a acceder a simulacros,
                                    planes de estudio y recomendaciones personalizadas,
                                    confirma tu dirección de correo electrónico.
                                </p>

                                <div style="height:40px;"></div>

                                <!-- BOTÓN -->
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td align="center">

                                            <a href="${params.verificationUrl}"
                                            style="
                                                    background:#16c5d9;
                                                    color:#ffffff;
                                                    text-decoration:none;
                                                    padding:18px 42px;
                                                    border-radius:14px;
                                                    font-size:16px;
                                                    font-weight:700;
                                                    display:inline-block;
                                                    box-shadow:0 10px 25px rgba(22,197,217,.35);
                                            ">
                                                Verificar mi cuenta
                                            </a>

                                        </td>
                                    </tr>
                                </table>

                                <div style="height:40px;"></div>

                                <!-- INFO -->
                                <div style="
                                    background:#f8fbfd;
                                    border-left:5px solid #25d0c6;
                                    border-radius:12px;
                                    padding:20px;
                                ">
                                    <div style="
                                        color:#475569;
                                        font-size:15px;
                                        line-height:1.8;
                                    ">
                                        ⏳ Este enlace de verificación expirará en
                                        <strong>24 horas</strong>.
                                    </div>
                                </div>

                                <div style="height:35px;"></div>

                                <p style="
                                    color:#94a3b8;
                                    font-size:14px;
                                    line-height:1.8;
                                    margin:0;
                                ">
                                    Si no creaste una cuenta en EduPrep, puedes ignorar este
                                    mensaje de forma segura.
                                </p>

                            </td>
                        </tr>

                        <!-- BENEFICIOS -->
                        <tr>
                            <td style="
                                padding:0 55px 45px;
                            ">

                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>

                                        <td width="33%" align="center">
                                            <div style="font-size:26px;">📚</div>
                                            <div style="
                                                margin-top:10px;
                                                color:#475569;
                                                font-size:13px;
                                                font-weight:600;
                                            ">
                                                Simulacros
                                            </div>
                                        </td>

                                        <td width="33%" align="center">
                                            <div style="font-size:26px;">⚡</div>
                                            <div style="
                                                margin-top:10px;
                                                color:#475569;
                                                font-size:13px;
                                                font-weight:600;
                                            ">
                                                Retroalimentación
                                            </div>
                                        </td>

                                        <td width="33%" align="center">
                                            <div style="font-size:26px;">📈</div>
                                            <div style="
                                                margin-top:10px;
                                                color:#475569;
                                                font-size:13px;
                                                font-weight:600;
                                            ">
                                                Seguimiento
                                            </div>
                                        </td>

                                    </tr>
                                </table>

                            </td>
                        </tr>

                        <!-- FOOTER -->
                        <tr>
                            <td style="
                                background:#f8fafc;
                                border-top:1px solid #e5e7eb;
                                text-align:center;
                                padding:30px
                            ">

                                <div style="
                                    color:#475569;
                                    font-size:20px;
                                    font-weight:700;
                                    margin-bottom:8px;
                                ">
                                    EduPrep
                                </div>

                                <div style="
                                    color:#94a3b8;
                                    font-size:13px;
                                ">
                                    Escuela Politecnica Nacional - Sistema de Tutoria Inteligente
                                </div>

                            </td>
                        </tr>

                    </table>

                    </td>
                    </tr>
                    </table>

                    </body>
                    </html>
                    `
            });

            console.log('✅ [NodemailerEmailService] Email de verificación enviado:', {
                messageId: info.messageId,
            });
        } catch (error) {
            console.error('🔴 [NodemailerEmailService] Error al enviar email de verificación:', error);
            throw error;
        }
    }
}
