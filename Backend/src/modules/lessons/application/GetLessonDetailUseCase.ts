import type { LessonRepository } from '../domain/LessonPorts';
import { ok, err, type Result } from "../../../utils/result";
import { AppError } from '../../../core/errors/AppError';
import { LessonNotFoundError } from '../domain/errors/LessonNotFoundError';
import type { Lesson } from '../domain/Lesson';

/**
 * Obtiene el detalle completo de una lección específica
 */
export class GetLessonDetailUseCase {
  constructor(private lessonRepository: LessonRepository) {}

  async execute(lessonId: number): Promise<Result<Lesson & { courseTitle?: string; topicName?: string }, AppError>> {
    try {
      if (!lessonId || lessonId <= 0) {
        return err(new AppError('Lesson ID inválido', 400));
      }

      const lesson = await this.lessonRepository.findDetailById(lessonId);
      
      if (!lesson) {
        return err(new LessonNotFoundError(`Lección ${lessonId} no encontrada`));
      }

      return ok(lesson);
    } catch (e) {
      if (e instanceof AppError) {
        return err(e);
      }
      return err(new AppError('Error al obtener detalle de lección', 500));
    }
  }
}
