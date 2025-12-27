import { Router } from 'express';
import { createAuthRoutes } from '../modules/auth/interface/http/auth.route';
import { createUsersRoutes } from '../modules/users/interface/user.route';

export function createRouter() {
    const router = Router();

    // Rutas de Auth
    router.use('/auth', createAuthRoutes());

    // Rutas de Users
    router.use('/users', createUsersRoutes());

    return router;
}