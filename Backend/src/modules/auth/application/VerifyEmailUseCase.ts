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
  constructor(private repo: AuthRepository, private hasher: PasswordHasher) {}

  async execute(input: VerifyEmailInput): Promise<Result<VerifyEmailOutput, AppError>> {
    try {
      if (!input.userId || !input.token) return err(new AppError("Parámetros inválidos", 400));

      // 1) Intentar obtener un token activo
      const tokenRecord = await this.repo.getActiveEmailVerificationToken(input.userId);

      // 2) Si no hay token activo, verificar estado del usuario → idempotente
      if (!tokenRecord) {
        const user = await this.repo.findUserById(input.userId);
        if (user?.status === "active") {
          return ok({ message: "Email ya verificado" });
        }
        return err(new AppError("Token inválido o expirado", 401));
      }

      // 3) Validar expiración y token
      if (tokenRecord.expiresAt <= new Date()) {
        return err(new AppError("Token expirado", 401));
      }
      const isValid = await this.hasher.compare(input.token, tokenRecord.tokenHash);
      if (!isValid) {
        return err(new AppError("Token inválido", 401));
      }

      // 4) Marcar usado y activar usuario (puede ser llamado dos veces sin efectos negativos)
      await this.repo.markEmailVerificationTokenUsed(tokenRecord.id);
      await this.repo.setUserAsVerified(input.userId);

      return ok({ message: "Email verificado correctamente. Ya puedes iniciar sesión." });
    } catch (e) {
      return err(new AppError("Error al verificar email", 500));
    }
  }
}