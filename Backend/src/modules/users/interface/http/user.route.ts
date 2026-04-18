import { Router } from "express";
import { UsersController } from "./UsersController";
import { GetMyProfileUseCase } from "../../application/GetMyProfileUseCase";
import { UpdateMyProfileUseCase } from "../../application/UpdateMyProfileUseCase";
import { ChangePasswordUseCase } from "../../application/ChangePasswordUseCase";
import { PrismaUserRepository } from "../../infrastructure/PrismaUserRepository";
import { BcryptPasswordHasher } from "../../../auth/infrastructure/BcryptPasswordHasher";
import { createAuthMiddleware } from "../../../auth/interface/http/middlewares/AuthMiddleware";
import { JwtTokenService } from "../../../auth/infrastructure/JwtTokenService";

export function createUsersRoutes(): Router {
    const router = Router();

    // Inyección de dependencias
    const repository = new PrismaUserRepository();
    const passwordHasher = new BcryptPasswordHasher();
    const tokenService = new JwtTokenService();

    const getMyProfileUseCase = new GetMyProfileUseCase(repository);
    const updateMyProfileUseCase = new UpdateMyProfileUseCase(repository);
    const changePasswordUseCase = new ChangePasswordUseCase(
        repository,
        passwordHasher
    );

    const usersController = new UsersController(
        getMyProfileUseCase,
        updateMyProfileUseCase,
        changePasswordUseCase
    );

    // Middleware de autenticación
    const authMiddleware = createAuthMiddleware(tokenService);

    // Rutas protegidas
    router.get("/me", authMiddleware, (req, res) =>
        usersController.getMyProfile(req, res)
    );
    router.patch("/me", authMiddleware, (req, res) =>
        usersController.updateMyProfile(req, res)
    );
    router.patch("/me/password", authMiddleware, (req, res) =>
        usersController.changePassword(req, res)
    );

    return router;
}
