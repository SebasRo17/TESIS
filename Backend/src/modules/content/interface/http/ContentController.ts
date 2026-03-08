import type { Response } from 'express';
import { AppError } from '../../../../core/errors/AppError';
import type { AuthenticatedRequest } from '../../../auth/interface/http/middlewares/AuthMiddleware';
import type { GetContentVariantsByLessonUseCase } from '../../application/GetContentVariantsByLessonUseCase';
import type { GetContentVariantByIdUseCase } from '../../application/GetContentVariantByIdUseCase';
import type { RegisterContentEventUseCase } from '../../application/RegisterContentEventUseCase';
import type { GetContentPrerequisitesByLessonUseCase } from '../../application/GetContentPrerequisitesByLessonUseCase';
import type { LessonIdParams, RegisterContentEventBody, VariantIdParams } from './dto/ContentDTO';

export class ContentController {
  constructor(
    private readonly getVariantsByLessonUseCase: GetContentVariantsByLessonUseCase,
    private readonly getVariantByIdUseCase: GetContentVariantByIdUseCase,
    private readonly registerContentEventUseCase: RegisterContentEventUseCase,
    private readonly getPrerequisitesUseCase: GetContentPrerequisitesByLessonUseCase
  ) {}

  async getVariantsByLesson(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { lessonId } = req.params as unknown as LessonIdParams;
      const result = await this.getVariantsByLessonUseCase.execute(lessonId);

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

  async getVariantById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { variantId } = req.params as unknown as VariantIdParams;
      const result = await this.getVariantByIdUseCase.execute(variantId);

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

  async registerEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { variantId } = req.params as unknown as VariantIdParams;
      const body = req.body as RegisterContentEventBody;

      const result = await this.registerContentEventUseCase.execute({
        userId: req.user.id,
        variantId,
        eventType: body.eventType,
        ...(body.metadata !== undefined ? { metadata: body.metadata } : {}),
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

  async getPrerequisitesByLesson(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { lessonId } = req.params as unknown as LessonIdParams;
      const result = await this.getPrerequisitesUseCase.execute(lessonId);

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
