import type { ExamAttempt, AttemptMetrics } from '../domain/ExamAttempt';
import type {
  IExamAttemptRepository,
  IItemResponseRepository,
  IExamRepository,
} from '../domain/AssessmentPorts';
import {
  ExamAttemptNotFoundError,
  ExamAttemptAlreadyCompletedError,
  ExamAttemptNotOwnedError,
} from '../domain/errors/AssessmentErrors';

/**
 * Caso de uso: Finalizar intento de examen
 * Marca el intento como completado y calcula métricas
 */
export class FinishExamAttemptUseCase {
  constructor(
    private readonly examAttemptRepository: IExamAttemptRepository,
    private readonly itemResponseRepository: IItemResponseRepository,
    private readonly examRepository: IExamRepository
  ) {}

  async execute(attemptId: number, userId: number): Promise<ExamAttempt> {
    // Validar que el intento existe
    const attempt = await this.examAttemptRepository.findById(attemptId);
    if (!attempt) {
      throw new ExamAttemptNotFoundError(attemptId);
    }

    // Validar que el intento pertenece al usuario
    if (attempt.userId !== userId) {
      throw new ExamAttemptNotOwnedError(attemptId, userId);
    }

    // Validar que el intento no está completado
    if (attempt.completedAt) {
      throw new ExamAttemptAlreadyCompletedError(attemptId);
    }

    // Obtener información del examen
    const exam = await this.examRepository.findByIdWithItems(attempt.examId);
    if (!exam) {
      throw new ExamAttemptNotFoundError(attemptId);
    }

    // Calcular métricas
    const metrics = await this.calculateMetrics(attemptId, exam.items.length);

    // Calcular duración
    const completedAt = new Date();
    const durationSec = Math.floor(
      (completedAt.getTime() - attempt.startedAt.getTime()) / 1000
    );

    // Actualizar el intento
    const updatedAttempt = await this.examAttemptRepository.update(attemptId, {
      completedAt,
      durationSec,
      scoreRaw: metrics.scoreRaw,
      scoreNorm: metrics.scoreNorm,
      metadata: {
        ...attempt.metadata,
        ...metrics,
      },
    });

    return updatedAttempt;
  }

  /**
   * Calcula métricas del intento
   */
  private async calculateMetrics(
    attemptId: number,
    totalItems: number
  ): Promise<AttemptMetrics> {
    // Obtener todas las respuestas
    const responses = await this.itemResponseRepository.findByAttemptId(attemptId);

    const answeredItems = responses.length;
    const correctAnswers = responses.filter((r) => r.isCorrect === true).length;

    // Calcular accuracy
    const accuracy = answeredItems > 0 ? correctAnswers / answeredItems : 0;

    // Calcular puntaje bruto (suma de puntajes otorgados)
    const scoreRaw = responses.reduce(
      (sum, r) => sum + (r.awardedScore ?? 0),
      0
    );

    // Calcular puntaje normalizado (0-100)
    const maxScore = totalItems; // Asumiendo peso 1.0 por defecto
    const scoreNorm = maxScore > 0 ? (scoreRaw / maxScore) * 100 : 0;

    return {
      totalItems,
      answeredItems,
      correctAnswers,
      accuracy: Math.round(accuracy * 1000) / 1000, // 3 decimales
      scoreRaw: Math.round(scoreRaw * 100) / 100, // 2 decimales
      scoreNorm: Math.round(scoreNorm * 100) / 100, // 2 decimales
    };
  }
}
