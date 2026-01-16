import type { ILessonProgressRepository, IProgressMetricsService } from '../domain/ProgressPorts';
import type { CourseProgress } from '../domain/CourseProgress';
import { AppError } from '../../../core/errors/AppError';

/**
 * Caso de Uso: Obtener progreso del usuario en un curso
 * Retorna métricas agregadas del avance en el curso
 */
export class GetCourseProgressUseCase {
  constructor(
    private readonly progressRepository: ILessonProgressRepository,
    private readonly metricsService: IProgressMetricsService
  ) {}

  async execute(userId: number, courseId: number): Promise<CourseProgress> {
    // Obtener métricas agregadas del curso
    const courseProgress = await this.metricsService.getCourseProgress(userId, courseId);

    return courseProgress;
  }
}
