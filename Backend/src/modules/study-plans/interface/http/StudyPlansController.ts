import type { Request, Response } from 'express';
import { AppError } from '../../../../core/errors/AppError';
import type { AuthenticatedRequest } from '../../../auth/interface/http/middlewares/AuthMiddleware';
import type { GetActiveStudyPlanUseCase } from '../../application/GetActiveStudyPlanUseCase';
import type { GetNextStudyPlanItemUseCase } from '../../application/GetNextStudyPlanItemUseCase';
import type { UpdateStudyPlanItemStatusUseCase } from '../../application/UpdateStudyPlanItemStatusUseCase';
import type { CreateStudyPlanUseCase } from '../../application/CreateStudyPlanUseCase';
import type { GetStudyPlansHistoryUseCase } from '../../application/GetStudyPlansHistoryUseCase';
import type {
  CourseIdParams,
  CreateStudyPlanBody,
  ItemIdParams,
  UpdatePlanItemStatusBody,
} from './dto/StudyPlansDTO';

export class StudyPlansController {
  constructor(
    private readonly getActivePlanUseCase: GetActiveStudyPlanUseCase,
    private readonly getNextItemUseCase: GetNextStudyPlanItemUseCase,
    private readonly updateItemStatusUseCase: UpdateStudyPlanItemStatusUseCase,
    private readonly createPlanUseCase: CreateStudyPlanUseCase,
    private readonly getHistoryUseCase: GetStudyPlansHistoryUseCase
  ) {}

  async getActivePlan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { courseId } = req.params as unknown as CourseIdParams;
      const result = await this.getActivePlanUseCase.execute(req.user.id, courseId);

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

  async getNextItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { courseId } = req.params as unknown as CourseIdParams;
      const result = await this.getNextItemUseCase.execute(req.user.id, courseId);

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

  async updateItemStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { itemId } = req.params as unknown as ItemIdParams;
      const { status } = req.body as UpdatePlanItemStatusBody;

      const result = await this.updateItemStatusUseCase.execute(req.user.id, itemId, status);
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

  async createPlan(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as CreateStudyPlanBody;
      const result = await this.createPlanUseCase.execute({
        userId: body.userId,
        courseId: body.courseId,
        ...(body.source !== undefined ? { source: body.source } : {}),
        ...(body.state !== undefined ? { state: body.state } : {}),
        items: body.items.map((item) => ({
          contentRefType: item.contentRefType,
          contentRefId: item.contentRefId,
          type: item.type,
          priority: item.priority,
          orderN: item.orderN,
          ...(item.dueAt !== undefined ? { dueAt: new Date(item.dueAt) } : {}),
          ...(item.metadata !== undefined ? { metadata: item.metadata } : {}),
        })),
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

  async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { courseId } = req.params as unknown as CourseIdParams;
      const result = await this.getHistoryUseCase.execute(req.user.id, courseId);

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
