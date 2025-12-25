import type { AuthRepository, PasswordHasher } from "../domain/AuthPorts";
import { AppError } from "../../../core/errors/AppError";
import type { Result } from "../../../utils/result";
import { ok, err } from "../../../utils/result";
import { prisma } from "../../../infra/db/prisma";

export interface LogoutInput {
    userId: number;
    refreshToken?: string | null;
}

export interface LogoutOutput {
    message: string;
}

export class LogoutUseCase {
    constructor(
        private authRepository: AuthRepository,
        private passwordHasher: PasswordHasher
    ){}

    async execute(input: LogoutInput): Promise<Result<LogoutOutput, AppError>> {
        try {
            // Opción 1: Logout de sesión específica
            if (input.refreshToken) {
                // Buscar todas las sesiones del usuario
                const sessions = await prisma.authSession.findMany({
                    where: { userId: input.userId },
                });

                // Encontrar la sesión que corresponde a este token
                for (const session of sessions) {
                    const isValid = await this.passwordHasher.compare(
                        input.refreshToken,
                        session.refreshTokenHash
                    );
                    if (isValid) {
                        // Revocar esta sesión específica
                        await this.authRepository.revokeRefreshToken(
                            input.userId,
                            session.refreshTokenHash
                        );
                        return ok({ message: "Sesión cerrada correctamente" });
                    }
                }

                return err(new AppError("Token no encontrado", 401));
            }

            // Opción 2: Logout de todas las sesiones
            await this.authRepository.revokeAllRefreshTokens(input.userId);
            return ok({ message: "Todas las sesiones cerradas correctamente" });
        } catch (error) {
            return err(new AppError("Error al cerrar sesión", 500));
        }
    }
}