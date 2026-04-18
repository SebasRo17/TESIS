import type { LessonRepository } from '../domain/LessonPorts';
import { ok, err, type Result } from "../../../utils/result";
import { AppError } from '../../../core/errors/AppError';
import { LessonNotFoundError } from '../domain/errors/LessonNotFoundError';
import type { LessonPrerequisite } from '../domain/Lesson';

/**
 * Obtiene los prerequisitos académicos informativos de una lección
 * (Solo lectura, sin validación de acceso)
 */
export class GetLessonPrerequisitesUseCase {
  constructor(private lessonRepository: LessonRepository) {}

  async execute(lessonId: number): Promise<Result<LessonPrerequisite[], AppError>> {
    try {
      if (!lessonId || lessonId <= 0) {
        return err(new AppError('Lesson ID inválido', 400));
      }

      // Verificar que la lección existe
      const lesson = await this.lessonRepository.findById(lessonId);
      if (!lesson) {
        return err(new LessonNotFoundError(`Lección ${lessonId} no encontrada`));
      }

      const prerequisites = await this.lessonRepository.findPrerequisitesByLessonId(lessonId);
      return ok(prerequisites);
    } catch (e) {
      if (e instanceof AppError) {
        return err(e);
      }
      return err(new AppError('Error al obtener prerequisitos de lección', 500));
    }
  }
}
