import { Router } from 'express';
import { createAuthRoutes } from '../modules/auth/interface/http/auth.route';
import { createUsersRoutes } from '../modules/users/interface/http/user.route';
import { createCoursesRoutes } from '../modules/courses/interface/http/courses.route';
import { createTopicsRoutes } from '../modules/topics/interface/http/topics.route';

export function createRouter() {
    const router = Router();

    // Rutas de Auth
    router.use('/auth', createAuthRoutes());

    // Rutas de Users
    router.use('/users', createUsersRoutes());

    // Rutas de Courses
    router.use('/courses', createCoursesRoutes());

    // Rutas de Topics (incluye tanto /topics/:topicId como /courses/:courseId/topics)
    router.use(createTopicsRoutes());

    return router;
}