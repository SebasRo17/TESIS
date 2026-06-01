import type { ExamAttempt, AttemptMetrics } from '../domain/ExamAttempt';
import type {
  IExamAttemptRepository,
  IItemResponseRepository,
  IExamRepository,
  IItemRepository,
} from '../domain/AssessmentPorts';
import {
  ExamAttemptNotFoundError,
  ExamAttemptAlreadyCompletedError,
  ExamAttemptNotOwnedError,
} from '../domain/errors/AssessmentErrors';
import type { UpdateMasteryUseCase } from '../../mastery/application/UpdateMasteryUseCase';

/**
 * Caso de uso: Finalizar intento de examen
 * Marca el intento como completado, calcula metricas y actualiza mastery por topic
 */
export class FinishExamAttemptUseCase {
  constructor(
    private readonly examAttemptRepository: IExamAttemptRepository,
    private readonly itemResponseRepository: IItemResponseRepository,
    private readonly examRepository: IExamRepository,
    private readonly itemRepository: IItemRepository,
    private readonly updateMasteryUseCase?: UpdateMasteryUseCase
  ) { }

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

    // Validar que el intento no esta completado
    if (attempt.completedAt) {
      throw new ExamAttemptAlreadyCompletedError(attemptId);
    }

    // Obtener informacion del examen
    const exam = await this.examRepository.findByIdWithItems(attempt.examId);
    if (!exam) {
      throw new ExamAttemptNotFoundError(attemptId);
    }

    // Calcular metricas
    const metrics = await this.calculateMetrics(attemptId, exam.items.length);

    // Solo se marca la finalizacion; duration_sec es una columna generada en BD
    const completedAt = new Date();

    // Actualizar el intento
    const updatedAttempt = await this.examAttemptRepository.update(attemptId, {
      completedAt,
      scoreRaw: metrics.scoreRaw,
      scoreNorm: metrics.scoreNorm,
      metadata: {
        ...attempt.metadata,
        ...metrics,
      },
    });

    // Actualizar mastery por topic basado en las respuestas
    await this.updateMasteryFromResponses(attemptId, userId);

    return updatedAttempt;
  }

  /**
   * Actualiza el mastery de cada topic evaluado basandose en la precision
   * de las respuestas del estudiante agrupadas por topic
   */
  private async updateMasteryFromResponses(
    attemptId: number,
    userId: number
  ): Promise<void> {
    if (!this.updateMasteryUseCase) return;

    try {
      const responses = await this.itemResponseRepository.findByAttemptId(attemptId);
      if (responses.length === 0) return;

      // Obtener los items para conocer sus topics
      const itemIds = responses.map((r) => r.itemId);
      const items = await this.itemRepository.findByIds(itemIds);

      // Crear mapa itemId -> topicId
      const itemTopicMap = new Map<number, number>();
      for (const item of items) {
        itemTopicMap.set(item.id, item.topicId);
      }

      // Agrupar respuestas por topic
      const topicStats = new Map<number, { correct: number; total: number }>();
      for (const response of responses) {
        const topicId = itemTopicMap.get(response.itemId);
        if (!topicId) continue;

        const stats = topicStats.get(topicId) || { correct: 0, total: 0 };
        stats.total++;
        if (response.isCorrect === true) {
          stats.correct++;
        }
        topicStats.set(topicId, stats);
      }

      // Calcular delta y actualizar mastery por cada topic
      for (const [topicId, stats] of topicStats) {
        const accuracy = stats.correct / stats.total;

        // Delta basado en precision:
        //   100% correcto -> +0.20
        //   50% correcto  -> +0.00 (neutral)
        //   0% correcto   -> -0.10
        const delta = (accuracy - 0.5) * 0.4;

        await this.updateMasteryUseCase.execute({
          userId,
          topicId,
          source: 'exam',
          delta: Math.round(delta * 1000) / 1000,
          observationsDelta: stats.total,
          evidence: {
            attemptId,
            correct: stats.correct,
            total: stats.total,
            accuracy: Math.round(accuracy * 1000) / 1000,
          },
        });
      }
    } catch (error) {
      // No fallar el flujo principal si mastery update falla
      console.error('[FinishExamAttempt] Error actualizando mastery:', error);
    }
  }

  /**
   * Calcula metricas del intento
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
