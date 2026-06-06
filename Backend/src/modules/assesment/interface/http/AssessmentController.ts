import type { Request, Response, NextFunction } from 'express';
import type { GetExamsByCourseUseCase } from '../../application/GetExamsByCourseUseCase';
import type { GetExamItemsUseCase } from '../../application/GetExamItemsUseCase';
import type { StartExamAttemptUseCase } from '../../application/StartExamAttemptUseCase';
import type { SubmitItemResponseUseCase } from '../../application/SubmitItemResponseUseCase';
import type { FinishExamAttemptUseCase } from '../../application/FinishExamAttemptUseCase';
import type { GetExamAttemptDetailUseCase } from '../../application/GetExamAttemptDetailUseCase';
import type { GetExamAttemptReviewUseCase } from '../../application/GetExamAttemptReviewUseCase';
import type { ReplanAfterAssessmentUseCase } from '../../application/ReplanAfterAssessmentUseCase';
import type { GenerateAssessmentUseCase } from '../../application/GenerateAssessmentUseCase';
import type {
  GetExamsByCourseParams,
  GetExamItemsParams,
  StartExamAttemptParams,
  SubmitItemResponseParams,
  SubmitItemResponseBody,
  FinishExamAttemptParams,
  GetExamAttemptDetailParams,
  GenerateAssessmentBody,
  GenerateAssessmentParams,
  ExamDTO,
  ExamItemDTO,
  ExamWithItemsDTO,
  ExamAttemptDTO,
  ItemResponseDTO,
  ExamAttemptDetailDTO,
} from './dto/AssessmentDTO';
import type { Exam } from '../../domain/Exam';
import type { ExamAttempt, ItemResponse, ExamAttemptWithDetails } from '../../domain/ExamAttempt';
import type { PublicExamItem, PublicExamWithItems } from '../../application/GetExamItemsUseCase';

export class AssessmentController {
  constructor(
    private readonly getExamsByCourseUseCase: GetExamsByCourseUseCase,
    private readonly getExamItemsUseCase: GetExamItemsUseCase,
    private readonly startExamAttemptUseCase: StartExamAttemptUseCase,
    private readonly submitItemResponseUseCase: SubmitItemResponseUseCase,
    private readonly finishExamAttemptUseCase: FinishExamAttemptUseCase,
    private readonly getExamAttemptDetailUseCase: GetExamAttemptDetailUseCase,
    private readonly getExamAttemptReviewUseCase: GetExamAttemptReviewUseCase,
    private readonly replanAfterAssessmentUseCase?: ReplanAfterAssessmentUseCase,
    private readonly generateAssessmentUseCase?: GenerateAssessmentUseCase
  ) {}

  async generateAssessment(req: Request, res: Response): Promise<void> {
    try {
      if (!this.generateAssessmentUseCase) {
        res.status(503).json({ error: 'Generacion de evaluaciones no configurada' });
        return;
      }

      const { courseId } = req.params as unknown as GenerateAssessmentParams;
      const body = req.body as GenerateAssessmentBody;
      const userId = (req as any).user.id;

      const generated = await this.generateAssessmentUseCase.execute({
        userId,
        courseId,
        topicId: body.topicId,
        difficulty: body.difficulty,
        questionCount: body.questionCount,
        mode: body.mode as any,
      });

      res.status(201).json({ success: true, data: generated });
    } catch (error) {
      const status = typeof (error as any)?.status === 'number' ? (error as any).status : 500;
      res.status(status).json({ error: error instanceof Error ? error.message : 'Error interno del servidor' });
    }
  }

  /**
   * GET /courses/:courseId/exams
   * Obtener exámenes por curso
   */
  async getExamsByCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params as unknown as GetExamsByCourseParams;

      const exams = await this.getExamsByCourseUseCase.execute(courseId);

      const response: ExamDTO[] = exams.map(this.toExamDTO);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /exams/:examId/items
   * Obtener preguntas públicas de un examen
   */
  async getExamItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { examId } = req.params as unknown as GetExamItemsParams;

      const exam = await this.getExamItemsUseCase.execute(examId);

      const response: ExamWithItemsDTO = this.toExamWithItemsDTO(exam);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /exams/:examId/attempts
   * Iniciar un intento de examen
   */
  async startExamAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { examId } = req.params as unknown as StartExamAttemptParams;
      const userId = (req as any).user.id; // Del middleware de autenticación

      const attempt = await this.startExamAttemptUseCase.execute(examId, userId);

      const response: ExamAttemptDTO = this.toExamAttemptDTO(attempt);

      res.status(201).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /exam-attempts/:attemptId/responses
   * Registrar respuesta a un ítem
   */
  async submitItemResponse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { attemptId } = req.params as unknown as SubmitItemResponseParams;
      const { itemId, answer, timeSpentSec, hintsUsed } = req.body as SubmitItemResponseBody;
      const userId = (req as any).user.id;

      const response = await this.submitItemResponseUseCase.execute(
        attemptId,
        itemId,
        answer,
        userId,
        timeSpentSec,
        hintsUsed
      );

      const responseDTO: ItemResponseDTO = this.toItemResponseDTO(response);

      res.status(201).json({
        success: true,
        data: responseDTO,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /exam-attempts/:attemptId/finish
   * Finalizar intento de examen
   */
  async finishExamAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { attemptId } = req.params as unknown as FinishExamAttemptParams;
      const userId = (req as any).user.id;

      const attempt = await this.finishExamAttemptUseCase.execute(attemptId, userId);
      const orchestration = this.replanAfterAssessmentUseCase
        ? await this.replanAfterAssessmentUseCase.execute({ userId, examId: attempt.examId })
        : { status: 'skipped', courseId: null, error: 'Replanificacion no configurada' };

      if (orchestration.status === 'failed') {
        console.error('[AssessmentController] Error recalculando ruta:', orchestration.error);
      }

      const response: ExamAttemptDTO & { orchestration: unknown } = {
        ...this.toExamAttemptDTO(attempt),
        orchestration,
      };

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /exam-attempts/:attemptId
   * Obtener detalle de un intento
   */
  async getExamAttemptDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { attemptId } = req.params as unknown as GetExamAttemptDetailParams;
      const userId = (req as any).user.id;

      const attempt = await this.getExamAttemptDetailUseCase.execute(attemptId, userId);

      const response: ExamAttemptDetailDTO = this.toExamAttemptDetailDTO(attempt);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /exam-attempts/:attemptId/review
   * Obtener revision completa de un intento con preguntas, opciones y explicaciones
   */
  async getExamAttemptReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { attemptId } = req.params as unknown as GetExamAttemptDetailParams;
      const userId = (req as any).user.id;

      const review = await this.getExamAttemptReviewUseCase.execute(attemptId, userId);

      res.status(200).json({
        success: true,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  // Mappers de dominio a DTO
  private toExamDTO(exam: Exam): ExamDTO {
    return {
      id: exam.id,
      title: exam.title,
      mode: exam.mode,
      timeLimitSec: exam.timeLimitSec,
      version: exam.version,
      isActive: exam.isActive,
      createdAt: exam.createdAt.toISOString(),
      updatedAt: exam.updatedAt.toISOString(),
    };
  }

  private toExamAttemptDTO(attempt: ExamAttempt): ExamAttemptDTO {
    return {
      id: attempt.id,
      userId: attempt.userId,
      examId: attempt.examId,
      startedAt: attempt.startedAt.toISOString(),
      completedAt: attempt.completedAt ? attempt.completedAt.toISOString() : null,
      durationSec: attempt.durationSec,
      scoreRaw: attempt.scoreRaw,
      scoreNorm: attempt.scoreNorm,
      metadata: attempt.metadata,
    };
  }

  private toItemResponseDTO(response: ItemResponse): ItemResponseDTO {
    return {
      id: response.id,
      attemptId: response.attemptId,
      itemId: response.itemId,
      answer: response.answer,
      isCorrect: response.isCorrect,
      timeSpentSec: response.timeSpentSec,
      hintsUsed: response.hintsUsed,
      awardedScore: response.awardedScore,
      createdAt: response.createdAt.toISOString(),
    };
  }

  private toExamAttemptDetailDTO(attempt: ExamAttemptWithDetails): ExamAttemptDetailDTO {
    return {
      ...this.toExamAttemptDTO(attempt),
      exam: attempt.exam,
      responses: attempt.responses.map(this.toItemResponseDTO),
    };
  }

  private toExamWithItemsDTO(exam: PublicExamWithItems): ExamWithItemsDTO {
    return {
      id: exam.id,
      title: exam.title,
      mode: exam.mode,
      timeLimitSec: exam.timeLimitSec,
      version: exam.version,
      items: exam.items.map((item) => this.toExamItemDTO(item)),
    };
  }

  private toExamItemDTO(item: PublicExamItem): ExamItemDTO {
    return {
      id: item.id,
      topicId: item.topicId,
      type: item.type,
      stem: item.stem,
      options: item.options,
      difficulty: item.difficulty,
      orderN: item.orderN,
      weight: item.weight,
    };
  }
}
