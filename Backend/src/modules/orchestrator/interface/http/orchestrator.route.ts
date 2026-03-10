import { Router } from 'express';
import { prisma } from '../../../../infra/db/prisma';
import { createAuthMiddleware } from '../../../auth/interface/http/middlewares/AuthMiddleware';
import { JwtTokenService } from '../../../auth/infrastructure/JwtTokenService';
import { validateRequest } from '../../../assesment/interface/http/middlewares/validation';
import { CreateStudyPlanUseCase } from '../../../study-plans/application/CreateStudyPlanUseCase';
import { PrismaStudyPlansRepository } from '../../../study-plans/infrastructure/PrismaStudyPlansRepository';
import { BuildUserSnapshotUseCase } from '../../application/BuildUserSnapshotUseCase';
import { DecideForUserUseCase } from '../../application/DecideForUserUseCase';
import { GetDecisionHistoryUseCase } from '../../application/GetDecisionHistoryUseCase';
import { RegisterOrchestratorDecisionUseCase } from '../../application/RegisterOrchestratorDecisionUseCase';
import { PrismaOrchestratorRepository } from '../../infrastructure/PrismaOrchestratorRepository';
import { RuleBasedOrchestratorModelClient } from '../../infrastructure/RuleBasedOrchestratorModelClient';
import { OrchestratorController } from './OrchestratorController';
import {
  DecideBodySchema,
  DecisionHistoryQuerySchema,
  RegisterDecisionBodySchema,
  SnapshotQuerySchema,
  UserIdParamsSchema,
} from './dto/OrchestratorDTO';
import { createInternalOrchestratorAuthMiddleware } from './middlewares/internalAuth';

export function createOrchestratorRoutes(): Router {
  const router = Router();

  const tokenService = new JwtTokenService();
  const authMiddleware = createAuthMiddleware(tokenService);
  const internalMiddleware = createInternalOrchestratorAuthMiddleware();

  const orchestratorRepo = new PrismaOrchestratorRepository(prisma);
  const studyPlansRepo = new PrismaStudyPlansRepository(prisma);

  const buildSnapshotUseCase = new BuildUserSnapshotUseCase(orchestratorRepo);
  const createStudyPlanUseCase = new CreateStudyPlanUseCase(studyPlansRepo);
  const decideForUserUseCase = new DecideForUserUseCase(
    orchestratorRepo,
    new RuleBasedOrchestratorModelClient(),
    createStudyPlanUseCase
  );
  const registerDecisionUseCase = new RegisterOrchestratorDecisionUseCase(orchestratorRepo);
  const getDecisionHistoryUseCase = new GetDecisionHistoryUseCase(orchestratorRepo);

  const controller = new OrchestratorController(
    buildSnapshotUseCase,
    decideForUserUseCase,
    registerDecisionUseCase,
    getDecisionHistoryUseCase
  );

  router.get(
    '/orchestrator/users/:userId/snapshot',
    authMiddleware,
    validateRequest({ params: UserIdParamsSchema, query: SnapshotQuerySchema }),
    controller.getSnapshot.bind(controller)
  );

  router.post(
    '/orchestrator/users/:userId/decide',
    authMiddleware,
    validateRequest({ params: UserIdParamsSchema, body: DecideBodySchema }),
    controller.decide.bind(controller)
  );

  router.post(
    '/orchestrator/decisions',
    internalMiddleware,
    validateRequest({ body: RegisterDecisionBodySchema }),
    controller.registerDecision.bind(controller)
  );

  router.get(
    '/orchestrator/users/:userId/decisions',
    authMiddleware,
    validateRequest({ params: UserIdParamsSchema, query: DecisionHistoryQuerySchema }),
    controller.getDecisionHistory.bind(controller)
  );

  return router;
}
