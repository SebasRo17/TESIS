import type { Request, Response } from "express";
import type { LoginUseCase } from "../../application/LoginUseCase";
import type { RegisterUseCase } from "../../application/RegisterUseCase";
import type { RefreshTokenUseCase } from "../../application/RefreshTokenUseCase";
import type { LogoutUseCase } from "../../application/LogoutUseCase";
import type { LoginRequest } from "./dto/LoginRequest";
import type { RegisterRequest } from "./dto/RegisterRequest";
import type { RefreshTokenRequest } from "./dto/RefreshTokenRequest";
import type { LogoutRequest } from "./dto/LogoutRequest";
import { AppError } from "../../../../core/errors/AppError";
import type { AuthenticatedRequest } from "./middlewares/AuthMiddleware";

export class AuthController {
    constructor(
        private loginUseCase: LoginUseCase,
        private registerUseCase: RegisterUseCase,
        private refreshTokenUseCase: RefreshTokenUseCase,
        private logoutUseCase: LogoutUseCase
    ) {}

    async register(req: Request, res: Response): Promise<void> {
        try {
            const {
                email,
                password,
                confirmPassword,
                firstName,
                lastName,
                document,
                goal,
                phone,
                birthDate,
                city,
            } = req.body as RegisterRequest;

            // Validación básica en controller (validación adicional)
            if (!email || !password || !confirmPassword || !firstName || !lastName) {
                res.status(400).json({
                    error: "Email, contraseña, nombre y apellido son requeridos",
                });
                return;
            }

            // Ejecutar caso de uso
            const result = await this.registerUseCase.execute({
                email,
                password,
                confirmPassword,
                firstName,
                lastName,
                document,
                goal,
                phone,
                birthDate,
                city,
                ip: req.ip || "",
                userAgent: req.get("user-agent") || "",
            });

            if (!result.ok) {
                const error = result.error as AppError;
                res.status(error.status).json({
                    error: error.message,
                });
                return;
            }

            // Status 201 Created
            res.status(201).json(result.value);
        } catch (error) {
            console.error("Error en register controller:", error);
            res.status(500).json({
                error: "Error interno del servidor",
            });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body as LoginRequest;

            if (!email || !password) {
                res.status(400).json({
                    error: "Email y contraseña son requeridos",
                });
                return;
            }

            const result = await this.loginUseCase.execute({
                email,
                password,
                ip: req.ip || "",
                userAgent: req.get("user-agent") || "",
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
                error: "Error interno del servidor",
            });
        }
    }

    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body as RefreshTokenRequest;

            if (!refreshToken) {
                res.status(400).json({
                    error: "El token de actualización es requerido",
                });
                return;
            }

            const result = await this.refreshTokenUseCase.execute({
                refreshToken,
                ip: req.ip || "",
                userAgent: req.get("user-agent") || "",
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
                error: "Error al refrescar el token",
            });
        }
    }

    async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    error: "No autenticado",
                });
                return;
            }

            const { logoutAll, refreshToken } = req.body as LogoutRequest & { refreshToken?: string };

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
                error: "Error al cerrar sesión",
            });
        }
    }
}