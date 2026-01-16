import type { ILessonProgressRepository } from '../domain/ProgressPorts';
import type { LessonProgressDetail } from '../domain/LessonProgress';
import { AppError } from '../../../core/errors/AppError';

/**
 * Caso de Uso: Obtener detalle del progreso de una lección
 * Retorna el estado actual del progreso con información extendida
 */
export class GetLessonProgressDetailUseCase {
  constructor(private readonly progressRepository: ILessonProgressRepository) {}

  async execute(userId: number, lessonId: number): Promise<LessonProgressDetail | null> {
    // Buscar progreso con detalles
    const progress = await this.progressRepository.findByUserAndLessonWithDetails(
      userId,
      lessonId
    );

    return progress;
  }
}
