import { Router } from 'express';
import { prisma } from '../../../../infra/db/prisma';
import { createAuthMiddleware } from '../../../auth/interface/http/middlewares/AuthMiddleware';
import { JwtTokenService } from '../../../auth/infrastructure/JwtTokenService';
import { validateRequest } from '../../../assesment/interface/http/middlewares/validation';
import { GetActiveStudyPlanUseCase } from '../../application/GetActiveStudyPlanUseCase';
import { GetNextStudyPlanItemUseCase } from '../../application/GetNextStudyPlanItemUseCase';
import { UpdateStudyPlanItemStatusUseCase } from '../../application/UpdateStudyPlanItemStatusUseCase';
import { CreateStudyPlanUseCase } from '../../application/CreateStudyPlanUseCase';
import { GetStudyPlansHistoryUseCase } from '../../application/GetStudyPlansHistoryUseCase';
import { PrismaStudyPlansRepository } from '../../infrastructure/PrismaStudyPlansRepository';
import { StudyPlansController } from './StudyPlansController';
import {
  CourseIdParamsSchema,
  CreateStudyPlanBodySchema,
  ItemIdParamsSchema,
  UpdatePlanItemStatusBodySchema,
} from './dto/StudyPlansDTO';
import { createInternalStudyPlansAuthMiddleware } from './middlewares/internalAuth';

export function createStudyPlansRoutes(): Router {
  const router = Router();

  const tokenService = new JwtTokenService();
  const authMiddleware = createAuthMiddleware(tokenService);
  const internalMiddleware = createInternalStudyPlansAuthMiddleware();

  const repository = new PrismaStudyPlansRepository(prisma);
  const getActivePlanUseCase = new GetActiveStudyPlanUseCase(repository);
  const getNextItemUseCase = new GetNextStudyPlanItemUseCase(repository);
  const updateItemStatusUseCase = new UpdateStudyPlanItemStatusUseCase(repository);
  const createPlanUseCase = new CreateStudyPlanUseCase(repository);
  const getHistoryUseCase = new GetStudyPlansHistoryUseCase(repository);

  const controller = new StudyPlansController(
    getActivePlanUseCase,
    getNextItemUseCase,
    updateItemStatusUseCase,
    createPlanUseCase,
    getHistoryUseCase
  );

  router.get(
    '/me/courses/:courseId/study-plan',
    authMiddleware,
    validateRequest({ params: CourseIdParamsSchema }),
    controller.getActivePlan.bind(controller)
  );

  router.get(
    '/me/courses/:courseId/study-plan/next',
    authMiddleware,
    validateRequest({ params: CourseIdParamsSchema }),
    controller.getNextItem.bind(controller)
  );

  router.patch(
    '/study-plan/items/:itemId',
    authMiddleware,
    validateRequest({ params: ItemIdParamsSchema, body: UpdatePlanItemStatusBodySchema }),
    controller.updateItemStatus.bind(controller)
  );

  router.post(
    '/study-plans',
    internalMiddleware,
    validateRequest({ body: CreateStudyPlanBodySchema }),
    controller.createPlan.bind(controller)
  );

  router.get(
    '/me/courses/:courseId/study-plans',
    authMiddleware,
    validateRequest({ params: CourseIdParamsSchema }),
    controller.getHistory.bind(controller)
  );

  return router;
}
