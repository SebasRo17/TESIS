import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../../auth/interface/http/middlewares/AuthMiddleware';
import type { StartLessonProgressUseCase } from '../../application/StartLessonProgressUseCase';
import type { UpdateLessonProgressUseCase } from '../../application/UpdateLessonProgressUseCase';
import type { CompleteLessonProgressUseCase } from '../../application/CompleteLessonProgressUseCase';
import type { GetCourseProgressUseCase } from '../../application/GetCourseProgressUseCase';
import type { GetRecentActivityUseCase } from '../../application/GetRecentActivityUseCase';
import type { GetLessonProgressDetailUseCase } from '../../application/GetLessonProgressDetailUseCase';
import type {
  LessonIdParams,
  CourseIdParams,
  UpdateProgressBody,
} from './dto/ProgressDTO';
import {
  toLessonProgressDTO,
  toLessonProgressDetailDTO,
  toCourseProgressDTO,
  toRecentActivityDTO,
} from './dto/ProgressDTO';

/**
 * Controlador HTTP para el módulo Progress
 */
export class ProgressController {
  constructor(
    private readonly startLessonProgressUseCase: StartLessonProgressUseCase,
    private readonly updateLessonProgressUseCase: UpdateLessonProgressUseCase,
    private readonly completeLessonProgressUseCase: CompleteLessonProgressUseCase,
    private readonly getCourseProgressUseCase: GetCourseProgressUseCase,
    private readonly getRecentActivityUseCase: GetRecentActivityUseCase,
    private readonly getLessonProgressDetailUseCase: GetLessonProgressDetailUseCase
  ) {}

  /**
   * POST /lessons/:lessonId/progress/start
   * Registrar inicio de una lección
   */
  async startLessonProgress(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { lessonId } = req.params as unknown as LessonIdParams;

      const progress = await this.startLessonProgressUseCase.execute(userId, Number(lessonId));

      res.status(201).json({
        success: true,
        data: toLessonProgressDTO(progress),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /lessons/:lessonId/progress/update
   * Actualizar progreso de una lección
   */
  async updateLessonProgress(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { lessonId } = req.params as unknown as LessonIdParams;
      const body = req.body as UpdateProgressBody;

      const progress = await this.updateLessonProgressUseCase.execute(userId, Number(lessonId), body);

      res.status(200).json({
        success: true,
        data: toLessonProgressDTO(progress),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /lessons/:lessonId/progress/complete
   * Marcar lección como completada
   */
  async completeLessonProgress(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { lessonId } = req.params as unknown as LessonIdParams;

      const progress = await this.completeLessonProgressUseCase.execute(userId, Number(lessonId));

      res.status(200).json({
        success: true,
        data: toLessonProgressDTO(progress),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /lessons/:lessonId/progress
   * Obtener detalle del progreso de una lección
   */
  async getLessonProgressDetail(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { lessonId } = req.params as unknown as LessonIdParams;

      const progress = await this.getLessonProgressDetailUseCase.execute(userId, Number(lessonId));

      if (!progress) {
        res.status(404).json({
          success: false,
          error: {
            code: 'PROGRESS_NOT_FOUND',
            message: 'No se encontró progreso para esta lección',
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: toLessonProgressDetailDTO(progress),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /me/courses/:courseId/progress
   * Obtener progreso por curso
   */
  async getCourseProgress(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { courseId } = req.params as unknown as CourseIdParams;

      const courseProgress = await this.getCourseProgressUseCase.execute(userId, Number(courseId));

      res.status(200).json({
        success: true,
        data: toCourseProgressDTO(courseProgress),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /me/progress/recent
   * Obtener actividad reciente
   */
  async getRecentActivity(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;

      const activity = await this.getRecentActivityUseCase.execute(userId);

      res.status(200).json({
        success: true,
        data: toRecentActivityDTO(activity),
      });
    } catch (error) {
      next(error);
    }
  }
}
