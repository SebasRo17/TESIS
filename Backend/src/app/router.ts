import { Router } from 'express';
import { createAuthRoutes } from '../modules/auth/interface/http/auth.route';  

export function createRouter() {
    const router = Router();

    // Rutas de Auth
    router.use('/auth', createAuthRoutes());

    return router;
}