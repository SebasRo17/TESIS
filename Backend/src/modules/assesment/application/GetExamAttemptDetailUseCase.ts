import type { ExamAttemptWithDetails } from '../domain/ExamAttempt';
import type { IExamAttemptRepository } from '../domain/AssessmentPorts';
import {
  ExamAttemptNotFoundError,
  ExamAttemptNotOwnedError,
} from '../domain/errors/AssessmentErrors';

/**
 * Caso de uso: Obtener detalle de un intento
 * Devuelve respuestas, puntaje y métricas del intento
 */
export class GetExamAttemptDetailUseCase {
  constructor(private readonly examAttemptRepository: IExamAttemptRepository) {}

  async execute(attemptId: number, userId: number): Promise<ExamAttemptWithDetails> {
    // Obtener el intento con detalles
    const attempt = await this.examAttemptRepository.findByIdWithDetails(attemptId);
    if (!attempt) {
      throw new ExamAttemptNotFoundError(attemptId);
    }

    // Validar que el intento pertenece al usuario
    if (attempt.userId !== userId) {
      throw new ExamAttemptNotOwnedError(attemptId, userId);
    }

    return attempt;
  }
}
