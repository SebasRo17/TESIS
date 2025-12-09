import type { AuthRepository, TokenService, PasswordHasher } from "../domain/AuthPorts";
import { AppError } from "../../../core/errors/AppError";
import type { Result } from "../../../utils/result";
import { ok, err } from "../../../utils/result";

export interface RefreshTokenInput {
    refreshToken: string;
    ip?: string;
    userAgent?: string;
}

export interface RefreshTokenOutput {
    accessToken: string;
    refreshToken: string;
}

export class RefreshTokenUseCase {
    constructor(
        private authRepository: AuthRepository,
        private tokenService: TokenService,
        private passwordHasher: PasswordHasher
    ){}

    async execute(input: RefreshTokenInput): Promise<Result<RefreshTokenOutput, AppError>> {
        try {
            // Paso 1: Validar y decodificar el refresh token
            let decoded;
            try {
                decoded = this.tokenService.verifyRefresh(input.refreshToken);
            } catch (error) {
                return err(new AppError("Token inválido o expirado", 401));
            }

            // Paso 2: Buscar Usuario
            const user = await this.authRepository.findUserById(decoded.id);
            if (!user) {
                return err(new AppError("Usuario no encontrado", 404));
            }

            // Paso 3: Validar el estado del usuario
            if (user.status !== "active") {
                return err(new AppError("Usuario inactivo", 403));
            }

            // Paso 4: Verificar que el refresh token exista en la base de datos
            const refreshHash = await this.passwordHasher.hash(input.refreshToken);
            const tokenExists = await this.authRepository.verifyRefreshTokenExists(
                user.id, 
                refreshHash
            );

            if (!tokenExists) {
                return err(new AppError("Token de actualización no válido", 401));
            }

            //Paso 5: Generar nuevos tokens
            const newAccessToken = this.tokenService.signAccess({
                id: user.id,
                email: user.email,
            });
            const newRefreshToken = this.tokenService.signRefresh({
                id: user.id,
                email: user.email,
            });

            // Paso 6: Revocar token anterior y guardar el nuevo refresh token
            await this.authRepository.revokeRefreshToken(user.id, refreshHash);
            const newRefreshHash = await this.passwordHasher.hash(newRefreshToken);
            await this.authRepository.storeRefreshToken(
                user.id,
                newRefreshHash,
                input.ip,
                input.userAgent
            );

            return ok({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            });
        } catch (error) {
            return err(
                new AppError("Error en el proceso de refresh token", 500)
            );
        }
    }
}