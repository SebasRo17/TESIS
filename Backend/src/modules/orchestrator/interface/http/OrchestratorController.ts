import type { Request, Response } from 'express';
import { AppError } from '../../../../core/errors/AppError';
import type { AuthenticatedRequest } from '../../../auth/interface/http/middlewares/AuthMiddleware';
import type { BuildUserSnapshotUseCase } from '../../application/BuildUserSnapshotUseCase';
import type { DecideForUserUseCase } from '../../application/DecideForUserUseCase';
import type { GetDecisionHistoryUseCase } from '../../application/GetDecisionHistoryUseCase';
import type { RegisterOrchestratorDecisionUseCase } from '../../application/RegisterOrchestratorDecisionUseCase';
import type {
  DecideBody,
  DecisionHistoryQuery,
  RegisterDecisionBody,
  SnapshotQuery,
  UserIdParams,
} from './dto/OrchestratorDTO';

export class OrchestratorController {
  constructor(
    private readonly buildSnapshotUseCase: BuildUserSnapshotUseCase,
    private readonly decideForUserUseCase: DecideForUserUseCase,
    private readonly registerDecisionUseCase: RegisterOrchestratorDecisionUseCase,
    private readonly getDecisionHistoryUseCase: GetDecisionHistoryUseCase
  ) {}

  async getSnapshot(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { userId } = req.params as unknown as UserIdParams;
      const { courseId } = (
        (req as AuthenticatedRequest & { validatedQuery?: SnapshotQuery }).validatedQuery ?? req.query
      ) as unknown as SnapshotQuery;

      if (req.user.id !== userId) {
        res.status(403).json({ error: 'No autorizado para consultar este usuario' });
        return;
      }

      const result = await this.buildSnapshotUseCase.execute({ userId, courseId });
      if (!result.ok) {
        const error = result.error as AppError;
        res.status(error.status).json({ error: error.message });
        return;
      }

      res.status(200).json({ success: true, data: result.value });
    } catch {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async decide(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { userId } = req.params as unknown as UserIdParams;
      const { courseId } = req.body as DecideBody;

      if (req.user.id !== userId) {
        res.status(403).json({ error: 'No autorizado para orquestar este usuario' });
        return;
      }

      const result = await this.decideForUserUseCase.execute({ userId, courseId });
      if (!result.ok) {
        const error = result.error as AppError;
        res.status(error.status).json({ error: error.message });
        return;
      }

      res.status(200).json({ success: true, data: result.value });
    } catch {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async registerDecision(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as RegisterDecisionBody;
      const result = await this.registerDecisionUseCase.execute({
        userId: body.userId,
        decisionType: body.decisionType,
        inputSnapshot: body.inputSnapshot,
        output: body.output,
        ...(body.rationale !== undefined ? { rationale: body.rationale } : {}),
        ...(body.modelVersion !== undefined ? { modelVersion: body.modelVersion } : {}),
        ...(body.correlationId !== undefined ? { correlationId: body.correlationId } : {}),
      });

      if (!result.ok) {
        const error = result.error as AppError;
        res.status(error.status).json({ error: error.message });
        return;
      }

      res.status(201).json({ success: true, data: result.value });
    } catch {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async getDecisionHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { userId } = req.params as unknown as UserIdParams;
      const { limit } = (
        (req as AuthenticatedRequest & { validatedQuery?: DecisionHistoryQuery }).validatedQuery ?? req.query
      ) as unknown as DecisionHistoryQuery;

      if (req.user.id !== userId) {
        res.status(403).json({ error: 'No autorizado para consultar este usuario' });
        return;
      }

      const result = await this.getDecisionHistoryUseCase.execute({
        userId,
        ...(limit !== undefined ? { limit } : {}),
      });
      if (!result.ok) {
        const error = result.error as AppError;
        res.status(error.status).json({ error: error.message });
        return;
      }

      res.status(200).json({ success: true, data: result.value });
    } catch {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}
