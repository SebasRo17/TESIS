import type { LessonRepository } from '../domain/LessonPorts';
import { ok, err, type Result } from "../../../utils/result";
import { AppError } from '../../../core/errors/AppError';
import type { Lesson } from '../domain/Lesson';

/**
 * Obtiene todas las lecciones activas de un curso
 */
export class GetLessonsByCourseUseCase {
  constructor(private lessonRepository: LessonRepository) {}

  async execute(courseId: number): Promise<Result<Lesson[], AppError>> {
    try {
      if (!courseId || courseId <= 0) {
        return err(new AppError('Course ID inválido', 400));
      }

      const lessons = await this.lessonRepository.findByCourseId(courseId);
      return ok(lessons);
    } catch (e) {
      return err(new AppError('Error al obtener lecciones del curso', 500));
    }
  }
}
