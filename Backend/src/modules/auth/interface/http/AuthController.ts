import type { Request, Response } from "express";
import type { LoginUseCase } from "../../application/LoginUseCase";
import type { RegisterUseCase } from "../../application/RegisterUseCase";
import type { RefreshTokenUseCase } from "../../application/RefreshTokenUseCase";
import type { LogoutUseCase } from "../../application/LogoutUseCase";
import type { GetCurrentUserUseCase } from "../../application/GetCurrentUserUseCase";
import type { RequestPasswordResetUseCase } from "../../application/RequestPasswordResetUseCase";
import type { ResetPasswordUseCase } from "../../application/ResetPasswordUseCase";
import type { LoginRequest } from "./dto/LoginRequest";
import type { RegisterRequest } from "./dto/RegisterRequest";
import type { RefreshTokenRequest } from "./dto/RefreshTokenRequest";
import type { LogoutRequest } from "./dto/LogoutRequest";
import type { ForgotPasswordRequest } from "./dto/ForgotPasswordRequest";
import type { ResetPasswordRequest } from "./dto/ResetPasswordRequest";
import { AppError } from "../../../../core/errors/AppError";
import type { AuthenticatedRequest } from "./middlewares/AuthMiddleware";

export class AuthController {
    constructor(
        private loginUseCase: LoginUseCase,
        private registerUseCase: RegisterUseCase,
        private refreshTokenUseCase: RefreshTokenUseCase,
        private logoutUseCase: LogoutUseCase,
        private getCurrentUserUseCase: GetCurrentUserUseCase,
        private requestPasswordResetUseCase: RequestPasswordResetUseCase,
        private resetPasswordUseCase: ResetPasswordUseCase
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

            // Validación básica en controller
            if (!email || !password || !confirmPassword || !firstName || !lastName) {
                res.status(400).json({
                    error: "Email, contraseña, nombre y apellido son requeridos",
                });
                return;
            }

            const result = await this.registerUseCase.execute({
                email,
                password,
                confirmPassword,
                firstName,
                lastName,
                document: document ?? null,
                goal: goal ?? null,
                phone: phone ?? null,
                birthDate: birthDate ?? null,
                city: city ?? null,
                ip: req.ip ?? null,
                userAgent: req.get("user-agent") ?? null,
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
                refreshToken: logoutAll ? null : refreshToken ?? null,
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

    async me(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // Validar que el usuario esté autenticado
            if (!req.user) {
                res.status(401).json({
                    error: "No autenticado",
                });
                return;
            }

            // Ejecutar caso de uso
            const result = await this.getCurrentUserUseCase.execute({
                userId: req.user.id,
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
            console.error("Error en me controller:", error);
            res.status(500).json({
                error: "Error interno del servidor",
            });
        }
    }

    async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body as { email?: string };
            const result = await this.requestPasswordResetUseCase.execute({
                email: email ?? "",
                ip: req.ip ?? "",
                userAgent: req.get("user-agent") ?? "",
            });
            if (!result.ok) {
                const error = result.error as AppError;
                res.status(error.status).json({ error: error.message });
                return;
            }
            res.status(200).json(result.value);
        } catch {
            res.status(500).json({ error: "Error solicitando recuperación" });
        }
    }

    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { userId, token, newPassword, confirmPassword } = req.body as {
                userId: number; token: string; newPassword: string; confirmPassword: string;
            };
            const result = await this.resetPasswordUseCase.execute({
                userId, token, newPassword, confirmPassword,
            });
            if (!result.ok) {
                const error = result.error as AppError;
                res.status(error.status).json({ error: error.message });
                return;
            }
            res.status(200).json(result.value);
        } catch {
            res.status(500).json({ error: "Error en cambio de contraseña" });
        }
    }
}