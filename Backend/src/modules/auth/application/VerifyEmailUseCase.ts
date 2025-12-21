import type { AuthRepository, PasswordHasher } from "../domain/AuthPorts";
import { AppError } from "../../../core/errors/AppError";
import { ok, err, type Result } from "../../../utils/result";

export interface VerifyEmailInput {
    userId: number;
    token: string;
}

export interface VerifyEmailOutput {
    message: string;
}

export class VerifyEmailUseCase {
    constructor(
        private repo: AuthRepository,
        private hasher: PasswordHasher
    ) {}

    async execute(input: VerifyEmailInput): Promise<Result<VerifyEmailOutput, AppError>> {
        try {
            console.log('🔵 [VerifyEmailUseCase] Iniciando verificación de email');

            if (!input.userId || !input.token) {
                return err(new AppError("Datos inválidos", 400));
            }

            // Buscar token activo
            const storedToken = await this.repo.getActiveEmailVerificationToken(input.userId);
            if (!storedToken) {
                console.warn('⚠️ [VerifyEmailUseCase] Token no encontrado o expirado');
                return err(new AppError("Token inválido o expirado", 401));
            }

            // Validar expiración
            if (storedToken.expiresAt <= new Date()) {
                console.warn('⚠️ [VerifyEmailUseCase] Token expirado');
                return err(new AppError("Token expirado", 401));
            }

            // Validar token
            const isValid = await this.hasher.compare(input.token, storedToken.tokenHash);
            if (!isValid) {
                console.warn('⚠️ [VerifyEmailUseCase] Token inválido');
                return err(new AppError("Token inválido", 401));
            }

            // Marcar como usado y activar usuario
            await this.repo.markEmailVerificationTokenUsed(storedToken.id);
            await this.repo.setUserAsVerified(input.userId);

            console.log('✅ [VerifyEmailUseCase] Email verificado correctamente');
            return ok({ message: "Email verificado correctamente. Ya puedes iniciar sesión." });
        } catch (error) {
            console.error('🔴 [VerifyEmailUseCase] Error:', error);
            return err(new AppError("Error al verificar email", 500));
        }
    }
}