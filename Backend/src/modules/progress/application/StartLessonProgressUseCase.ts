import type { ILessonProgressRepository } from '../domain/ProgressPorts';
import { ProgressStatus, type LessonProgress } from '../domain/LessonProgress';
import { AppError } from '../../../core/errors/AppError';

/**
 * Caso de Uso: Iniciar progreso de una lección
 * Registra que el usuario ha comenzado una lección
 */
export class StartLessonProgressUseCase {
  constructor(private readonly progressRepository: ILessonProgressRepository) {}

  async execute(userId: number, lessonId: number): Promise<LessonProgress> {
    // Validar que no exista ya un progreso
    const existing = await this.progressRepository.findByUserAndLesson(userId, lessonId);

    if (existing) {
      throw new AppError('El progreso de esta lección ya existe', 409);
    }

    // Crear nuevo registro de progreso
    const progress = await this.progressRepository.create({
      userId,
      lessonId,
      status: ProgressStatus.IN_PROGRESS,
      lastPosition: null,
    });

    return progress;
  }
}
