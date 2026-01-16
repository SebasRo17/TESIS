import { Router } from 'express';
import { ProgressController } from './ProgressController';
import { createAuthMiddleware } from '../../../auth/interface/http/middlewares/AuthMiddleware';
import { JwtTokenService } from '../../../auth/infrastructure/JwtTokenService';

// Import repositories
import { PrismaLessonProgressRepository } from '../../infrastructure/PrismaLessonProgressRepository';
import { PrismaProgressMetricsService } from '../../infrastructure/PrismaProgressMetricsService';

// Import use cases
import { StartLessonProgressUseCase } from '../../application/StartLessonProgressUseCase';
import { UpdateLessonProgressUseCase } from '../../application/UpdateLessonProgressUseCase';
import { CompleteLessonProgressUseCase } from '../../application/CompleteLessonProgressUseCase';
import { GetCourseProgressUseCase } from '../../application/GetCourseProgressUseCase';
import { GetRecentActivityUseCase } from '../../application/GetRecentActivityUseCase';
import { GetLessonProgressDetailUseCase } from '../../application/GetLessonProgressDetailUseCase';

// Import Prisma client
import { prisma } from '../../../../infra/db/prisma';

export const createProgressRouter = (): Router => {
  const router = Router();
  const tokenService = new JwtTokenService();
  const authMiddleware = createAuthMiddleware(tokenService);

  // Inicializar repositorios y servicios
  const progressRepository = new PrismaLessonProgressRepository(prisma);
  const metricsService = new PrismaProgressMetricsService(prisma);

  // Inicializar casos de uso
  const startLessonProgressUseCase = new StartLessonProgressUseCase(progressRepository);
  const updateLessonProgressUseCase = new UpdateLessonProgressUseCase(progressRepository);
  const completeLessonProgressUseCase = new CompleteLessonProgressUseCase(progressRepository);
  const getCourseProgressUseCase = new GetCourseProgressUseCase(
    progressRepository,
    metricsService
  );
  const getRecentActivityUseCase = new GetRecentActivityUseCase(metricsService);
  const getLessonProgressDetailUseCase = new GetLessonProgressDetailUseCase(progressRepository);

  // Inicializar controlador
  const controller = new ProgressController(
    startLessonProgressUseCase,
    updateLessonProgressUseCase,
    completeLessonProgressUseCase,
    getCourseProgressUseCase,
    getRecentActivityUseCase,
    getLessonProgressDetailUseCase
  );

  // Rutas de progreso de lecciones
  router.post(
    '/lessons/:lessonId/progress/start',
    authMiddleware,
    controller.startLessonProgress.bind(controller)
  );

  router.post(
    '/lessons/:lessonId/progress/update',
    authMiddleware,
    controller.updateLessonProgress.bind(controller)
  );

  router.post(
    '/lessons/:lessonId/progress/complete',
    authMiddleware,
    controller.completeLessonProgress.bind(controller)
  );

  router.get(
    '/lessons/:lessonId/progress',
    authMiddleware,
    controller.getLessonProgressDetail.bind(controller)
  );

  // Rutas de métricas agregadas
  router.get(
    '/me/courses/:courseId/progress',
    authMiddleware,
    controller.getCourseProgress.bind(controller)
  );

  router.get(
    '/me/progress/recent',
    authMiddleware,
    controller.getRecentActivity.bind(controller)
  );

  return router;
};
