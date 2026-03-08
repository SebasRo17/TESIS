import { Router } from 'express';
import { prisma } from '../../../../infra/db/prisma';
import { createAuthMiddleware } from '../../../auth/interface/http/middlewares/AuthMiddleware';
import { JwtTokenService } from '../../../auth/infrastructure/JwtTokenService';
import { validateRequest } from '../../../assesment/interface/http/middlewares/validation';
import { GetContentVariantsByLessonUseCase } from '../../application/GetContentVariantsByLessonUseCase';
import { GetContentVariantByIdUseCase } from '../../application/GetContentVariantByIdUseCase';
import { RegisterContentEventUseCase } from '../../application/RegisterContentEventUseCase';
import { GetContentPrerequisitesByLessonUseCase } from '../../application/GetContentPrerequisitesByLessonUseCase';
import { PrismaContentRepository } from '../../infrastructure/PrismaContentRepository';
import { ContentController } from './ContentController';
import {
  LessonIdParamsSchema,
  RegisterContentEventBodySchema,
  VariantIdParamsSchema,
} from './dto/ContentDTO';

export function createContentRoutes(): Router {
  const router = Router();

  const tokenService = new JwtTokenService();
  const authMiddleware = createAuthMiddleware(tokenService);

  const repository = new PrismaContentRepository(prisma);
  const getVariantsByLessonUseCase = new GetContentVariantsByLessonUseCase(repository);
  const getVariantByIdUseCase = new GetContentVariantByIdUseCase(repository);
  const registerContentEventUseCase = new RegisterContentEventUseCase(repository);
  const getPrerequisitesUseCase = new GetContentPrerequisitesByLessonUseCase(repository);

  const controller = new ContentController(
    getVariantsByLessonUseCase,
    getVariantByIdUseCase,
    registerContentEventUseCase,
    getPrerequisitesUseCase
  );

  router.get(
    '/lessons/:lessonId/content',
    authMiddleware,
    validateRequest({ params: LessonIdParamsSchema }),
    controller.getVariantsByLesson.bind(controller)
  );

  router.get(
    '/content/:variantId',
    authMiddleware,
    validateRequest({ params: VariantIdParamsSchema }),
    controller.getVariantById.bind(controller)
  );

  router.post(
    '/content/:variantId/events',
    authMiddleware,
    validateRequest({ params: VariantIdParamsSchema, body: RegisterContentEventBodySchema }),
    controller.registerEvent.bind(controller)
  );

  router.get(
    '/lessons/:lessonId/content/prereqs',
    authMiddleware,
    validateRequest({ params: LessonIdParamsSchema }),
    controller.getPrerequisitesByLesson.bind(controller)
  );

  return router;
}
