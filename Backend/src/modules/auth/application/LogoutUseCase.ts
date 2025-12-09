import type { AuthRepository } from "../domain/AuthPorts";
import { AppError } from "../../../core/errors/AppError";
import type { Result } from "../../../utils/result";
import { ok, err } from "../../../utils/result";

export interface LogoutInput {
    userId: number;
    refreshToken?: string;  // Si es null, se asume logoutAll
}

export interface LogoutOutput {
    message: string;
}

export class LogoutUseCase {
    constructor(
        private authRepository: AuthRepository
    ){}

    async execute(input: LogoutInput): Promise<Result<LogoutOutput, AppError>> {
        try {
            // Opcion 1: Logout de sesión específica
            if (input.refreshToken) {
                await this.authRepository.revokeRefreshToken(
                    input.userId,
                    input.refreshToken
                );
                return ok({ message: "Sesión cerrada correctamente" });
            }

            // Opcion 2: Logout de todas las sesiones
            await this.authRepository.revokeAllRefreshTokens(input.userId);
            return ok({ message: "Todas las sesiones cerradas correctamente" });
        } catch (error) {
            return err(new AppError("Error al cerrar sesión", 500));
        }
    }
}