import { Router } from 'express';
import { AssessmentController } from './AssessmentController';
import { validateRequest } from './middlewares/validation';
import { createAuthMiddleware } from '../../../auth/interface/http/middlewares/AuthMiddleware';
import { JwtTokenService } from '../../../auth/infrastructure/JwtTokenService';
import {
  GetExamsByCourseParamsSchema,
  StartExamAttemptParamsSchema,
  SubmitItemResponseParamsSchema,
  SubmitItemResponseBodySchema,
  FinishExamAttemptParamsSchema,
  GetExamAttemptDetailParamsSchema,
} from './dto/AssessmentDTO';

// Import repositories
import { PrismaExamRepository } from '../../infrastructure/PrismaExamRepository';
import { PrismaItemRepository } from '../../infrastructure/PrismaItemRepository';
import { PrismaExamAttemptRepository } from '../../infrastructure/PrismaExamAttemptRepository';
import { PrismaItemResponseRepository } from '../../infrastructure/PrismaItemResponseRepository';

// Import use cases
import { GetExamsByCourseUseCase } from '../../application/GetExamsByCourseUseCase';
import { StartExamAttemptUseCase } from '../../application/StartExamAttemptUseCase';
import { SubmitItemResponseUseCase } from '../../application/SubmitItemResponseUseCase';
import { FinishExamAttemptUseCase } from '../../application/FinishExamAttemptUseCase';
import { GetExamAttemptDetailUseCase } from '../../application/GetExamAttemptDetailUseCase';

// Import Prisma client
import { prisma } from '../../../../infra/db/prisma';

export const createAssessmentRouter = (): Router => {
  const router = Router();
  const tokenService = new JwtTokenService();
  const authMiddleware = createAuthMiddleware(tokenService);

  // Inicializar repositorios
  const examRepository = new PrismaExamRepository(prisma);
  const itemRepository = new PrismaItemRepository(prisma);
  const examAttemptRepository = new PrismaExamAttemptRepository(prisma);
  const itemResponseRepository = new PrismaItemResponseRepository(prisma);

  // Inicializar casos de uso
  const getExamsByCourseUseCase = new GetExamsByCourseUseCase(examRepository);
  const startExamAttemptUseCase = new StartExamAttemptUseCase(
    examRepository,
    examAttemptRepository
  );
  const submitItemResponseUseCase = new SubmitItemResponseUseCase(
    examAttemptRepository,
    itemRepository,
    itemResponseRepository,
    examRepository
  );
  const finishExamAttemptUseCase = new FinishExamAttemptUseCase(
    examAttemptRepository,
    itemResponseRepository,
    examRepository
  );
  const getExamAttemptDetailUseCase = new GetExamAttemptDetailUseCase(examAttemptRepository);

  // Inicializar controlador
  const controller = new AssessmentController(
    getExamsByCourseUseCase,
    startExamAttemptUseCase,
    submitItemResponseUseCase,
    finishExamAttemptUseCase,
    getExamAttemptDetailUseCase
  );

  // Rutas
  router.get(
    '/courses/:courseId/exams',
    authMiddleware,
    validateRequest({ params: GetExamsByCourseParamsSchema }),
    controller.getExamsByCourse.bind(controller)
  );

  router.post(
    '/exams/:examId/attempts',
    authMiddleware,
    validateRequest({ params: StartExamAttemptParamsSchema }),
    controller.startExamAttempt.bind(controller)
  );

  router.post(
    '/exam-attempts/:attemptId/responses',
    authMiddleware,
    validateRequest({
      params: SubmitItemResponseParamsSchema,
      body: SubmitItemResponseBodySchema,
    }),
    controller.submitItemResponse.bind(controller)
  );

  router.post(
    '/exam-attempts/:attemptId/finish',
    authMiddleware,
    validateRequest({ params: FinishExamAttemptParamsSchema }),
    controller.finishExamAttempt.bind(controller)
  );

  router.get(
    '/exam-attempts/:attemptId',
    authMiddleware,
    validateRequest({ params: GetExamAttemptDetailParamsSchema }),
    controller.getExamAttemptDetail.bind(controller)
  );

  return router;
};
