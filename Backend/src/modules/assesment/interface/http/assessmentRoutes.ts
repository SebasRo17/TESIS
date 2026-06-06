import { Router } from 'express';
import { env } from '../../../../config/env';
import { AssessmentController } from './AssessmentController';
import { validateRequest } from './middlewares/validation';
import { createAuthMiddleware } from '../../../auth/interface/http/middlewares/AuthMiddleware';
import { JwtTokenService } from '../../../auth/infrastructure/JwtTokenService';
import {
  GetExamsByCourseParamsSchema,
  GetExamItemsParamsSchema,
  StartExamAttemptParamsSchema,
  SubmitItemResponseParamsSchema,
  SubmitItemResponseBodySchema,
  FinishExamAttemptParamsSchema,
  GetExamAttemptDetailParamsSchema,
  GenerateAssessmentParamsSchema,
  GenerateAssessmentBodySchema,
} from './dto/AssessmentDTO';

// Import repositories
import { PrismaExamRepository } from '../../infrastructure/PrismaExamRepository';
import { PrismaItemRepository } from '../../infrastructure/PrismaItemRepository';
import { PrismaExamAttemptRepository } from '../../infrastructure/PrismaExamAttemptRepository';
import { PrismaItemResponseRepository } from '../../infrastructure/PrismaItemResponseRepository';

// Import use cases
import { GetExamsByCourseUseCase } from '../../application/GetExamsByCourseUseCase';
import { GetExamItemsUseCase } from '../../application/GetExamItemsUseCase';
import { StartExamAttemptUseCase } from '../../application/StartExamAttemptUseCase';
import { SubmitItemResponseUseCase } from '../../application/SubmitItemResponseUseCase';
import { FinishExamAttemptUseCase } from '../../application/FinishExamAttemptUseCase';
import { GetExamAttemptDetailUseCase } from '../../application/GetExamAttemptDetailUseCase';
import { GetExamAttemptReviewUseCase } from '../../application/GetExamAttemptReviewUseCase';
import { ReplanAfterAssessmentUseCase } from '../../application/ReplanAfterAssessmentUseCase';
import { GenerateAssessmentUseCase } from '../../application/GenerateAssessmentUseCase';

// Import mastery
import { PrismaMasteryRepository } from '../../../mastery/infrastructure/PrismaMasteryRepository';
import { UpdateMasteryUseCase } from '../../../mastery/application/UpdateMasteryUseCase';
import { PrismaOrchestratorRepository } from '../../../orchestrator/infrastructure/PrismaOrchestratorRepository';
import { HttpOrchestratorModelClient } from '../../../orchestrator/infrastructure/HttpOrchestratorModelClient';
import { DecideForUserUseCase } from '../../../orchestrator/application/DecideForUserUseCase';
import { PrismaStudyPlansRepository } from '../../../study-plans/infrastructure/PrismaStudyPlansRepository';
import { CreateStudyPlanUseCase } from '../../../study-plans/application/CreateStudyPlanUseCase';
import { PrismaContentRepository } from '../../../content/infrastructure/PrismaContentRepository';
import { GetContentVariantsByLessonUseCase } from '../../../content/application/GetContentVariantsByLessonUseCase';
import { RegisterContentEventUseCase } from '../../../content/application/RegisterContentEventUseCase';
import { GenerateContentUseCase } from '../../../content/application/GenerateContentUseCase';

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
  const masteryRepository = new PrismaMasteryRepository(prisma);
  const updateMasteryUseCase = new UpdateMasteryUseCase(masteryRepository);
  const orchestratorRepository = new PrismaOrchestratorRepository(prisma);
  const studyPlansRepository = new PrismaStudyPlansRepository(prisma);
  const contentRepository = new PrismaContentRepository(prisma);
  const decideForUserUseCase = new DecideForUserUseCase(
    orchestratorRepository,
    new HttpOrchestratorModelClient(env.orchestrator.decideUrl),
    new CreateStudyPlanUseCase(studyPlansRepository),
    new GetContentVariantsByLessonUseCase(contentRepository),
    new RegisterContentEventUseCase(contentRepository),
    new GenerateContentUseCase(contentRepository, env.orchestrator.queryUrl)
  );

  // Inicializar casos de uso
  const getExamsByCourseUseCase = new GetExamsByCourseUseCase(examRepository);
  const getExamItemsUseCase = new GetExamItemsUseCase(examRepository, itemRepository);
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
    examRepository,
    itemRepository,
    updateMasteryUseCase
  );
  const getExamAttemptDetailUseCase = new GetExamAttemptDetailUseCase(examAttemptRepository);
  const getExamAttemptReviewUseCase = new GetExamAttemptReviewUseCase(examAttemptRepository, itemRepository);
  const replanAfterAssessmentUseCase = new ReplanAfterAssessmentUseCase(
    examRepository,
    decideForUserUseCase
  );
  const generateAssessmentUseCase = new GenerateAssessmentUseCase(
    examRepository,
    itemRepository,
    env.orchestrator.queryUrl
  );

  // Inicializar controlador
  const controller = new AssessmentController(
    getExamsByCourseUseCase,
    getExamItemsUseCase,
    startExamAttemptUseCase,
    submitItemResponseUseCase,
    finishExamAttemptUseCase,
    getExamAttemptDetailUseCase,
    getExamAttemptReviewUseCase,
    replanAfterAssessmentUseCase,
    generateAssessmentUseCase
  );

  // Rutas
  router.post(
    '/courses/:courseId/assessments/generate',
    authMiddleware,
    validateRequest({
      params: GenerateAssessmentParamsSchema,
      body: GenerateAssessmentBodySchema,
    }),
    controller.generateAssessment.bind(controller)
  );

  router.get(
    '/courses/:courseId/exams',
    authMiddleware,
    validateRequest({ params: GetExamsByCourseParamsSchema }),
    controller.getExamsByCourse.bind(controller)
  );

  router.get(
    '/exams/:examId/items',
    authMiddleware,
    validateRequest({ params: GetExamItemsParamsSchema }),
    controller.getExamItems.bind(controller)
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

  router.get(
    '/exam-attempts/:attemptId/review',
    authMiddleware,
    validateRequest({ params: GetExamAttemptDetailParamsSchema }),
    controller.getExamAttemptReview.bind(controller)
  );

  return router;
};
