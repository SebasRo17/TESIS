import type { ILessonProgressRepository } from '../domain/ProgressPorts';
import type { LessonProgress } from '../domain/LessonProgress';
import { AppError } from '../../../core/errors/AppError';

/**
 * Datos para actualizar el progreso
 */
export interface UpdateProgressInput {
  lastPosition?: string;
  timeSpentSec?: number;
}

/**
 * Caso de Uso: Actualizar progreso de una lección
 * Actualiza el estado de avance del usuario en una lección
 */
export class UpdateLessonProgressUseCase {
  constructor(private readonly progressRepository: ILessonProgressRepository) {}

  async execute(
    userId: number,
    lessonId: number,
    input: UpdateProgressInput
  ): Promise<LessonProgress> {
    // Buscar el progreso existente
    const existing = await this.progressRepository.findByUserAndLesson(userId, lessonId);

    if (!existing) {
      throw new AppError('No se encontró progreso para esta lección', 404);
    }

    // No permitir actualizar lecciones ya completadas
    if (existing.completedAt) {
      throw new AppError(
        'No se puede actualizar el progreso de una lección completada',
        400
      );
    }

    // Actualizar solo los campos proporcionados
    const updateData: any = {};

    if (input.lastPosition !== undefined) {
      updateData.lastPosition = input.lastPosition;
    }

    if (input.timeSpentSec !== undefined) {
      updateData.timeSpentSec = input.timeSpentSec;
    }

    const updated = await this.progressRepository.update(existing.id, updateData);

    return updated;
  }
}
