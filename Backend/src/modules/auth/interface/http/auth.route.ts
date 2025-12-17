import { Router } from "express";
import { AuthController } from "./AuthController"; 
import { LoginUseCase } from "../../application/LoginUseCase"; 
import { RegisterUseCase } from "../../application/RegisterUseCase";  
import { RefreshTokenUseCase } from "../../application/RefreshTokenUseCase";  
import { LogoutUseCase } from "../../application/LogoutUseCase";  
import { PrismaAuthRepository } from "../../infrastructure/PrismaAuthRepository";  
import { BcryptPasswordHasher } from "../../infrastructure/BcryptPasswordHasher";
import { JwtTokenService } from "../../infrastructure/JwtTokenService";  
import { createAuthMiddleware } from "./middlewares/AuthMiddleware";  

export function createAuthRoutes(): Router {
    const router = Router();

    // Inyección de dependencias
    const repository = new PrismaAuthRepository();
    const passwordHasher = new BcryptPasswordHasher();
    const tokenService = new JwtTokenService();

    const loginUseCase = new LoginUseCase(
        repository, 
        passwordHasher, 
        tokenService
    );

    const registerUseCase = new RegisterUseCase(
        repository,
        passwordHasher,
        tokenService
    );

    const refreshTokenUseCase = new RefreshTokenUseCase(
        repository,
        tokenService,
        passwordHasher
    );

    const logoutUseCase = new LogoutUseCase(
        repository,
        passwordHasher
    );

    const authController = new AuthController(
        loginUseCase, 
        registerUseCase,
        refreshTokenUseCase, 
        logoutUseCase
    );
    
    // Middleware de autenticación
    const authMiddleware = createAuthMiddleware(tokenService);

    // Rutas públicas
    router.post('/register', (req, res) => authController.register(req, res));
    router.post('/login', (req, res) => authController.login(req, res));
    router.post('/refresh', (req, res) => authController.refreshToken(req, res));

    // Rutas protegidas
    router.post('/logout', authMiddleware, (req, res) => authController.logout(req, res));

    return router;
}