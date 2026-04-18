import type { Request, Response } from 'express';
import type { GetTopicMasteryUseCase } from '../../application/GetTopicMasteryUseCase';
import type { GetCourseMasteryUseCase } from '../../application/GetCourseMasteryUseCase';
import type { GetTopicMasteryJournalUseCase } from '../../application/GetTopicMasteryJournalUseCase';
import type { UpdateMasteryUseCase } from '../../application/UpdateMasteryUseCase';
import { AppError } from '../../../../core/errors/AppError';
import type { AuthenticatedRequest } from '../../../auth/interface/http/middlewares/AuthMiddleware';
import type {
  CourseIdParams,
  MasteryJournalQuery,
  TopicIdParams,
  UpdateMasteryBody,
} from './dto/MasteryDTO';

export class MasteryController {
  constructor(
    private readonly getTopicMasteryUseCase: GetTopicMasteryUseCase,
    private readonly getCourseMasteryUseCase: GetCourseMasteryUseCase,
    private readonly getTopicMasteryJournalUseCase: GetTopicMasteryJournalUseCase,
    private readonly updateMasteryUseCase: UpdateMasteryUseCase
  ) {}

  async getTopicMastery(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { topicId } = req.params as unknown as TopicIdParams;
      const result = await this.getTopicMasteryUseCase.execute({
        userId: req.user.id,
        topicId,
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

  async getCourseMastery(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { courseId } = req.params as unknown as CourseIdParams;
      const result = await this.getCourseMasteryUseCase.execute({
        userId: req.user.id,
        courseId,
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

  async getTopicMasteryJournal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { topicId } = req.params as unknown as TopicIdParams;
      const { limit, offset } = req.query as unknown as MasteryJournalQuery;

      const result = await this.getTopicMasteryJournalUseCase.execute({
        userId: req.user.id,
        topicId,
        limit,
        offset,
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

  async updateMastery(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as UpdateMasteryBody;
      const payload = {
        userId: body.userId,
        topicId: body.topicId,
        source: body.source,
        delta: body.delta,
        ...(body.evidence !== undefined ? { evidence: body.evidence } : {}),
        ...(body.observationsDelta !== undefined ? { observationsDelta: body.observationsDelta } : {}),
      };

      const result = await this.updateMasteryUseCase.execute(payload);

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
