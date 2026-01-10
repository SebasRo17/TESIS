import type { ExamAttempt } from '../domain/ExamAttempt';
import type { IExamRepository, IExamAttemptRepository } from '../domain/AssessmentPorts';
import { ExamNotFoundError, ExamNotActiveError } from '../domain/errors/AssessmentErrors';

/**
 * Caso de uso: Iniciar un intento de examen
 * Crea un nuevo intento para el usuario autenticado
 */
export class StartExamAttemptUseCase {
  constructor(
    private readonly examRepository: IExamRepository,
    private readonly examAttemptRepository: IExamAttemptRepository
  ) {}

  async execute(examId: number, userId: number): Promise<ExamAttempt> {
    // Validar que el examen existe
    const exam = await this.examRepository.findById(examId);
    if (!exam) {
      throw new ExamNotFoundError(examId);
    }

    // Validar que el examen está activo
    if (!exam.isActive) {
      throw new ExamNotActiveError(examId);
    }

    // Crear el intento
    const attempt = await this.examAttemptRepository.create({
      userId,
      examId,
      startedAt: new Date(),
      metadata: {
        examTitle: exam.title,
        examMode: exam.mode,
        timeLimitSec: exam.timeLimitSec,
      },
    });

    return attempt;
  }
}
