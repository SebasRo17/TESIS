import { Request, Response } from "express";
import type { LoginUseCase } from "../../application/LoginUseCase";
import type { RefreshTokenUseCase } from "../../application/RefreshTokenUseCase";
import type { LogoutUseCase } from "../../application/LogoutUseCase";
import type { LoginRequest } from "./dto/LoginRequest";
import type { RefreshTokenRequest } from "./dto/RefreshTokenRequest";
import type { LogoutRequest } from "./dto/LogoutRequest";
import { AppError } from "../../../../core/errors/AppError";
import type { AuthenticatedRequest } from "./middlewares/AuthMiddleware";

export class AuthController {
    constructor(
        private loginUseCase: LoginUseCase,
        private refreshTokenUseCase: RefreshTokenUseCase,
        private logoutUseCase: LogoutUseCase
    ) {}

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body as LoginRequest;

            // Validación básica
            if (!email || !password) {
                res.status(400).json({ 
                    error: 'Email y contraseña son requeridos',
                });
                return;
            }

            // Ejecutar caso de uso
            const result = await this.loginUseCase.execute({
                email,
                password,
                ip: req.ip,
                userAgent: req.get("user-agent"),
            });

            if (!result.ok) {
                const error = result.error as AppError;
                res.status(error.status).json({
                    error: error.message,
                });
                return;
            }

            res.status(200).json(result.value);
        } catch (error) {
            res.status(500).json({
                error: 'Error interno del servidor',
            });
        }
    }

    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body as RefreshTokenRequest;

            if (!refreshToken) {
                res.status(400).json({
                    error: 'El token de actualización es requerido',
                });
                return;
            }

            const result = await this.refreshTokenUseCase.execute({
                refreshToken,
                ip: req.ip,
                userAgent: req.get("user-agent"),
            });

            if (!result.ok) {
                const error = result.error as AppError;
                res.status(error.status).json({
                    error: error.message,
                });
                return;
            }

            res.status(200).json(result.value);
        } catch (error) {
            res.status(500).json({
                error: 'Error al refrescar el token',
            });
        }
    }

    async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    error: 'No autenticado',
                });
                return;
            }

            const { logoutAll, refreshToken } = req.body as LogoutRequest & { refreshToken?: string };

            // Validar que si logoutAll es false, se proporcione refreshToken
            if (!logoutAll && !refreshToken) {
                res.status(400).json({
                    error: 'Se requiere refreshToken o logoutAll=true',
                });
                return;
            }

            const result = await this.logoutUseCase.execute({
                userId: req.user.id,
                refreshToken: logoutAll ? undefined : refreshToken,
            });

            if (!result.ok) {
                const error = result.error as AppError;
                res.status(error.status).json({
                    error: error.message,
                });
                return;
            }

            res.status(200).json(result.value);
        } catch (error) {
            res.status(500).json({
                error: 'Error al cerrar sesión',
            });
        }
    }
}