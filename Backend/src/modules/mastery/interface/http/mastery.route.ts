import { Router } from 'express';
import { prisma } from '../../../../infra/db/prisma';
import { createAuthMiddleware } from '../../../auth/interface/http/middlewares/AuthMiddleware';
import { JwtTokenService } from '../../../auth/infrastructure/JwtTokenService';
import { validateRequest } from '../../../assesment/interface/http/middlewares/validation';
import {
  CourseIdParamsSchema,
  MasteryJournalQuerySchema,
  TopicIdParamsSchema,
  UpdateMasteryBodySchema,
} from './dto/MasteryDTO';
import { createInternalMasteryAuthMiddleware } from './middlewares/internalAuth';
import { PrismaMasteryRepository } from '../../infrastructure/PrismaMasteryRepository';
import { GetTopicMasteryUseCase } from '../../application/GetTopicMasteryUseCase';
import { GetCourseMasteryUseCase } from '../../application/GetCourseMasteryUseCase';
import { GetTopicMasteryJournalUseCase } from '../../application/GetTopicMasteryJournalUseCase';
import { UpdateMasteryUseCase } from '../../application/UpdateMasteryUseCase';
import { MasteryController } from './MasteryController';

export function createMasteryRoutes(): Router {
  const router = Router();

  const tokenService = new JwtTokenService();
  const authMiddleware = createAuthMiddleware(tokenService);
  const internalAuth = createInternalMasteryAuthMiddleware();

  const repository = new PrismaMasteryRepository(prisma);
  const getTopicMasteryUseCase = new GetTopicMasteryUseCase(repository);
  const getCourseMasteryUseCase = new GetCourseMasteryUseCase(repository);
  const getTopicMasteryJournalUseCase = new GetTopicMasteryJournalUseCase(repository);
  const updateMasteryUseCase = new UpdateMasteryUseCase(repository);

  const controller = new MasteryController(
    getTopicMasteryUseCase,
    getCourseMasteryUseCase,
    getTopicMasteryJournalUseCase,
    updateMasteryUseCase
  );

  router.get(
    '/me/topics/:topicId/mastery',
    authMiddleware,
    validateRequest({ params: TopicIdParamsSchema }),
    controller.getTopicMastery.bind(controller)
  );

  router.get(
    '/me/courses/:courseId/mastery',
    authMiddleware,
    validateRequest({ params: CourseIdParamsSchema }),
    controller.getCourseMastery.bind(controller)
  );

  router.get(
    '/me/topics/:topicId/mastery/journal',
    authMiddleware,
    validateRequest({
      params: TopicIdParamsSchema,
      query: MasteryJournalQuerySchema,
    }),
    controller.getTopicMasteryJournal.bind(controller)
  );

  router.post(
    '/mastery/update',
    internalAuth,
    validateRequest({ body: UpdateMasteryBodySchema }),
    controller.updateMastery.bind(controller)
  );

  return router;
}
