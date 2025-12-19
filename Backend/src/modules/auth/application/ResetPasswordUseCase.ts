import type { AuthRepository, PasswordHasher } from "../domain/AuthPorts";
import { AppError } from "../../../core/errors/AppError";
import { ok, err, type Result } from "../../../utils/result";

export interface ResetPasswordInput {
  userId: number;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordOutput {
  message: string;
}

export class ResetPasswordUseCase {
  constructor(private repo: AuthRepository, private hasher: PasswordHasher) {}

  async execute(input: ResetPasswordInput): Promise<Result<ResetPasswordOutput, AppError>> {
    try {
      if (!input.userId || !input.token) return err(new AppError("Datos inválidos", 400));
      if (!input.newPassword || input.newPassword.length < 8) return err(new AppError("Contraseña débil", 400));
      if (input.newPassword !== input.confirmPassword) return err(new AppError("Las contraseñas no coinciden", 400));

      const user = await this.repo.findUserById(input.userId);
      if (!user) return err(new AppError("Usuario no encontrado", 404));

      const resets = await this.repo.getActivePasswordResets(user.id);
      let matched: { id: number; tokenHash: string; expiresAt: Date } | null = null;
      for (const r of resets) {
        const okMatch = await this.hasher.compare(input.token, r.tokenHash);
        if (okMatch) { matched = r; break; }
      }
      if (!matched) return err(new AppError("Token inválido o expirado", 401));
      if (matched.expiresAt <= new Date()) return err(new AppError("Token expirado", 401));

      const newHash = await this.hasher.hash(input.newPassword);
      await this.repo.updateUserPassword(user.id, newHash);

      await this.repo.markPasswordResetUsed(matched.id);
      await this.repo.revokeAllRefreshTokens(user.id); // invalidar sesiones previas

      return ok({ message: "Contraseña actualizada correctamente" });
    } catch (e) {
      return err(new AppError("Error al cambiar contraseña", 500));
    }
  }
}