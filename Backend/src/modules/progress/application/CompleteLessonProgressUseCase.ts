import type { ILessonProgressRepository } from '../domain/ProgressPorts';
import { ProgressStatus, type LessonProgress } from '../domain/LessonProgress';
import { AppError } from '../../../core/errors/AppError';

/**
 * Caso de Uso: Completar progreso de una lección
 * Marca una lección como completada por el usuario
 */
export class CompleteLessonProgressUseCase {
  constructor(private readonly progressRepository: ILessonProgressRepository) {}

  async execute(userId: number, lessonId: number): Promise<LessonProgress> {
    // Buscar el progreso existente
    const existing = await this.progressRepository.findByUserAndLesson(userId, lessonId);

    if (!existing) {
      throw new AppError('No se encontró progreso para esta lección', 404);
    }

    // Validar que no esté ya completada
    if (existing.completedAt) {
      throw new AppError('La lección ya está marcada como completada', 400);
    }

    // Marcar como completada
    const completed = await this.progressRepository.update(existing.id, {
      status: ProgressStatus.COMPLETED,
      completedAt: new Date(),
    });

    return completed;
  }
}
