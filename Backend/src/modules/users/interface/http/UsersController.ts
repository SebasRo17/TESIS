import type { Request, Response } from "express";
import type { GetMyProfileUseCase } from "../../application/GetMyProfileUseCase";
import type { UpdateMyProfileUseCase } from "../../application/UpdateMyProfileUseCase";
import type { ChangePasswordUseCase } from "../../application/ChangePasswordUseCase";
import type { UpdateMyProfileRequest } from "./dto/UpdateMyProfileRequest";
import type { ChangePasswordRequest } from "./dto/ChangePasswordRequest";
import { AppError } from "../../../../core/errors/AppError";
import type { AuthenticatedRequest } from "../../../auth/interface/http/middlewares/AuthMiddleware";

export class UsersController {
    constructor(
        private getMyProfileUseCase: GetMyProfileUseCase,
        private updateMyProfileUseCase: UpdateMyProfileUseCase,
        private changePasswordUseCase: ChangePasswordUseCase
    ) {}

    async getMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: "No autenticado" });
                return;
            }

            const result = await this.getMyProfileUseCase.execute({
                userId: req.user.id,
            });

            if (!result.ok) {
                const error = result.error as AppError;
                res.status(error.status).json({ error: error.message });
                return;
            }

            res.status(200).json(result.value);
        } catch (error) {
            console.error("Error en getMyProfile:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async updateMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: "No autenticado" });
                return;
            }

            const body = req.body as UpdateMyProfileRequest;

            const input: Record<string, any> = {
                userId: req.user.id,
            };

            if (body.firstName !== undefined) input.firstName = body.firstName;
            if (body.lastName !== undefined) input.lastName = body.lastName;
            if (body.document !== undefined) input.document = body.document;
            if (body.goal !== undefined) input.goal = body.goal;
            if (body.phone !== undefined) input.phone = body.phone;
            if (body.birthDate !== undefined) input.birthDate = body.birthDate;
            if (body.city !== undefined) input.city = body.city;

            const result = await this.updateMyProfileUseCase.execute(input as any);

            if (!result.ok) {
                const error = result.error as AppError;
                res.status(error.status).json({ error: error.message });
                return;
            }

            res.status(200).json(result.value);
        } catch (error) {
            console.error("Error en updateMyProfile:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: "No autenticado" });
                return;
            }

            const body = req.body as ChangePasswordRequest;

            if (!body.currentPassword || !body.newPassword || !body.confirmPassword) {
                res.status(400).json({
                    error: "Contraseña actual, nueva contraseña y confirmación son requeridas",
                });
                return;
            }

            const result = await this.changePasswordUseCase.execute({
                userId: req.user.id,
                currentPassword: body.currentPassword,
                newPassword: body.newPassword,
                confirmPassword: body.confirmPassword,
            });

            if (!result.ok) {
                const error = result.error as AppError;
                res.status(error.status).json({ error: error.message });
                return;
            }

            res.status(200).json(result.value);
        } catch (error) {
            console.error("Error en changePassword:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }
}
