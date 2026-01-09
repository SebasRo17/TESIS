import type { LessonRepository } from '../domain/LessonPorts';
import { ok, err, type Result } from "../../../utils/result";
import { AppError } from '../../../core/errors/AppError';
import type { Lesson } from '../domain/Lesson';

/**
 * Obtiene todas las lecciones asociadas a un tema específico (por tema principal)
 */
export class GetLessonsByTopicUseCase {
  constructor(private lessonRepository: LessonRepository) {}

  async execute(topicId: number): Promise<Result<Lesson[], AppError>> {
    try {
      if (!topicId || topicId <= 0) {
        return err(new AppError('Topic ID inválido', 400));
      }

      const lessons = await this.lessonRepository.findByPrimaryTopicId(topicId);
      return ok(lessons);
    } catch (e) {
      return err(new AppError('Error al obtener lecciones del tema', 500));
    }
  }
}
