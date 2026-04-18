import { Router } from 'express';
import { prisma } from '../../../../infra/db/prisma';
import { createAuthMiddleware } from '../../../auth/interface/http/middlewares/AuthMiddleware';
import { JwtTokenService } from '../../../auth/infrastructure/JwtTokenService';
import { validateRequest } from '../../../assesment/interface/http/middlewares/validation';
import { DeterministicStudyRulesResolver } from '../../application/DeterministicStudyRulesResolver';
import { GetActiveStudyRulesUseCase } from '../../application/GetActiveStudyRulesUseCase';
import { GetApplicableStudyRulesUseCase } from '../../application/GetApplicableStudyRulesUseCase';
import { GetStudyRulesByTopicUseCase } from '../../application/GetStudyRulesByTopicUseCase';
import { GetStudyRuleDetailUseCase } from '../../application/GetStudyRuleDetailUseCase';
import { PrismaStudyRulesRepository } from '../../infrastructure/PrismaStudyRulesRepository';
import { StudyRulesController } from './StudyRulesController';
import {
  ApplicableRulesQuerySchema,
  RuleIdParamsSchema,
  TopicIdParamsSchema,
} from './dto/StudyRulesDTO';

export function createStudyRulesRoutes(): Router {
  const router = Router();

  const tokenService = new JwtTokenService();
  const authMiddleware = createAuthMiddleware(tokenService);

  const repository = new PrismaStudyRulesRepository(prisma);
  const resolver = new DeterministicStudyRulesResolver();

  const getActiveRulesUseCase = new GetActiveStudyRulesUseCase(repository);
  const getApplicableRulesUseCase = new GetApplicableStudyRulesUseCase(repository, resolver);
  const getRulesByTopicUseCase = new GetStudyRulesByTopicUseCase(repository, resolver);
  const getRuleDetailUseCase = new GetStudyRuleDetailUseCase(repository);

  const controller = new StudyRulesController(
    getActiveRulesUseCase,
    getApplicableRulesUseCase,
    getRulesByTopicUseCase,
    getRuleDetailUseCase
  );

  router.get('/study-rules', authMiddleware, controller.getActiveRules.bind(controller));

  router.get(
    '/study-rules/applicable',
    authMiddleware,
    validateRequest({ query: ApplicableRulesQuerySchema }),
    controller.getApplicableRules.bind(controller)
  );

  router.get(
    '/topics/:topicId/study-rules',
    authMiddleware,
    validateRequest({ params: TopicIdParamsSchema }),
    controller.getRulesByTopic.bind(controller)
  );

  router.get(
    '/study-rules/:ruleId',
    authMiddleware,
    validateRequest({ params: RuleIdParamsSchema }),
    controller.getRuleDetail.bind(controller)
  );

  return router;
}
