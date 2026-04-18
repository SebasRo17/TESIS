import { Router } from 'express';
import { createAuthRoutes } from '../modules/auth/interface/http/auth.route';
import { createUsersRoutes } from '../modules/users/interface/http/user.route';
import { createCoursesRoutes } from '../modules/courses/interface/http/courses.route';
import { createTopicsRoutes } from '../modules/topics/interface/http/topics.route';
import { createLessonsRoutes, createLessonsSubroutes } from '../modules/lessons/interface/http/lessons.route';
import { createAssessmentRouter } from '../modules/assesment/interface/http/assessmentRoutes';
import { createMasteryRoutes } from '../modules/mastery/interface/http/mastery.route';
import { createStudyRulesRoutes } from '../modules/study-rules/interface/http/study-rules.route';
import { createContentRoutes } from '../modules/content/interface/http/content.route';
import { createStudyPlansRoutes } from '../modules/study-plans/interface/http/study-plans.route';
import { createProgressRouter } from '../modules/progress/interface/http/progressRoutes';
import { createOrchestratorRoutes } from '../modules/orchestrator/interface/http/orchestrator.route';

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

    // Rutas de Assessment
    router.use(createAssessmentRouter());

    // Rutas de Mastery
    router.use(createMasteryRoutes());

    // Rutas de Study Rules
    router.use(createStudyRulesRoutes());

    // Rutas de Content
    router.use(createContentRoutes());

    // Rutas de Study Plans
    router.use(createStudyPlansRoutes());

    // Rutas de Progress
    router.use(createProgressRouter());

    // Rutas de Orchestrator
    router.use(createOrchestratorRoutes());

    // Rutas de Lessons desde otros contextos (subrutas)
    const lessonsSubroutes = createLessonsSubroutes();
    
    // GET /courses/:courseId/lessons
    router.get('/courses/:courseId/lessons', lessonsSubroutes.authMiddleware, (req, res) => 
        lessonsSubroutes.controller.getByCourse(req, res)
    );

    // GET /topics/:topicId/lessons
    router.get('/topics/:topicId/lessons', lessonsSubroutes.authMiddleware, (req, res) => 
        lessonsSubroutes.controller.getByTopic(req, res)
    );

    return router;
}
