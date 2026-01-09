import { Router } from 'express';
import { createAuthRoutes } from '../modules/auth/interface/http/auth.route';
import { createUsersRoutes } from '../modules/users/interface/http/user.route';
import { createCoursesRoutes } from '../modules/courses/interface/http/courses.route';
import { createTopicsRoutes } from '../modules/topics/interface/http/topics.route';
import { createLessonsRoutes, createLessonsSubroutes } from '../modules/lessons/interface/http/lessons.route';

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

    // Rutas de Lessons (acceso directo a /lessons/:lessonId)
    router.use('/lessons', createLessonsRoutes());

    // Rutas de Lessons desde otros contextos (subrutas)
    const lessonsSubroutes = createLessonsSubroutes();
    
    // GET /courses/:courseId/lessons
    router.get('/courses/:courseId/lessons', (req, res) => 
        lessonsSubroutes.controller.getByCourse(req, res)
    );

    // GET /topics/:topicId/lessons
    router.get('/topics/:topicId/lessons', (req, res) => 
        lessonsSubroutes.controller.getByTopic(req, res)
    );

    return router;
}