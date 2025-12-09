import type { AuthRepository, PasswordHasher, TokenService } from "../domain/AuthPorts";
import type { User } from "../../../shared/domain/User";
import { AppError } from "../../../core/errors/AppError";
import type { Result } from "../../../utils/result";
import { ok, err } from "../../../utils/result";

export interface LoginInput {
    email: string;
    password: string;
    ip?: string;
    userAgent?: string;
}

export interface LoginOutput {
    user: {
        id: number;
        email: string;
    };
    accessToken: string;
    refreshToken: string;
}

export class LoginUseCase {
    constructor(
        private authRepository: AuthRepository,
        private passwordHasher: PasswordHasher,
        private tokenService: TokenService
    ){}

    async execute(input: LoginInput): Promise<Result<LoginOutput, AppError>> {
        try {
            // Paso 1: Buscar el usuario por email
            const user = await this.authRepository.findUserByEmail(input.email);
            if (!user) {
                return err(new AppError("Credenciales inválidas", 401));
            }

            // Paso 2: Verificar la contraseña
            const isPasswordValid = await this.passwordHasher.compare(
                input.password,
                user.password_hash
            );
            if (!isPasswordValid) {
                return err(new AppError("Credenciales inválidas", 401));
            }

            // Paso 3: Verificar el estado del usuario
            if (user.status !== "active") {
                return err(new AppError("Usuario inactivo", 403));
            }

            // Paso 4: Generar tokens
            const accesToken = this.tokenService.signAccess({
                id: user.id,
                email: user.email
            })
            const refreshToken = this.tokenService.signRefresh({
                id: user.id,
                email: user.email
            });

            // Paso 5: Guardar refresh token en BD
            const refreshHash = await this.passwordHasher.hash(refreshToken);
            await this.authRepository.storeRefreshToken(
                user.id,
                refreshHash,
                input.ip,
                input.userAgent
            );

            return ok({
                user: {
                    id: user.id,
                    email: user.email
                },
                accessToken: accesToken,
                refreshToken: refreshToken
            });
        } catch (error) {
            return err(
                new AppError("Error en el proceso de login", 500)
            );
        }
    }
}