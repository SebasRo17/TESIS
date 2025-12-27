import type { UserRepository, PasswordHasher } from "../domain/UserPorts";
import { AppError } from "../../../core/errors/AppError";
import { ok, err, type Result } from "../../../utils/result";

export interface ChangePasswordInput {
    userId: number;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordOutput {
    message: string;
}

export class ChangePasswordUseCase {
    constructor(
        private userRepository: UserRepository,
        private passwordHasher: PasswordHasher
    ) {}

    async execute(input: ChangePasswordInput): Promise<Result<ChangePasswordOutput, AppError>> {
        try {
            // Validar usuario existe
            const user = await this.userRepository.findUserById(input.userId);
            if (!user) {
                return err(new AppError("Usuario no encontrado", 404));
            }

            // Validar contraseña actual
            const isPasswordValid = await this.passwordHasher.compare(
                input.currentPassword,
                user.password_hash
            );
            if (!isPasswordValid) {
                return err(new AppError("Contraseña actual incorrecta", 401));
            }

            // Validar nueva contraseña
            if (!input.newPassword || input.newPassword.length < 8) {
                return err(new AppError("La contraseña debe tener al menos 8 caracteres", 400));
            }

            if (input.newPassword.length > 128) {
                return err(new AppError("La contraseña no debe exceder 128 caracteres", 400));
            }

            if (input.newPassword !== input.confirmPassword) {
                return err(new AppError("Las contraseñas no coinciden", 400));
            }

            if (input.currentPassword === input.newPassword) {
                return err(new AppError("La nueva contraseña debe ser diferente a la actual", 400));
            }

            // Hashear y guardar
            const newPasswordHash = await this.passwordHasher.hash(input.newPassword);
            await this.userRepository.updateUserPassword(input.userId, newPasswordHash);

            return ok({ message: "Contraseña actualizada correctamente" });
        } catch (error) {
            console.error("ChangePasswordUseCase error:", error);
            return err(new AppError("Error al cambiar contraseña", 500));
        }
    }
}
