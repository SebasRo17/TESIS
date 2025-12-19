import nodemailer from "nodemailer";
import { env } from "../../../config/env";
import type { EmailService } from "../domain/AuthPorts";

export class NodemailerEmailService implements EmailService {
    private transporter = nodemailer.createTransport({
        host: env.mail.host,
        port: env.mail.port,
        secure: env.mail.secure,
        auth: { user: env.mail.user, pass: env.mail.pass },
    });

    async sendPasswordResetEmail(params: { to: string; resetUrl: string }): Promise<void> {
        await this.transporter.sendMail({
            from: env.mail.from,
            to: params.to,
            subject: "Recupera tu contraseña",
            html: `<p>Haz clic en el enlace para restablecer tu contraseña:</p>
                   <p><a href="${params.resetUrl}">${params.resetUrl}</a></p>
                   <p>Si no solicitaste esto, ignora este mensaje.</p>`,
        });
    }
}