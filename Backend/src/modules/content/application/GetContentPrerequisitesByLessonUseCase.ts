import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import type { ContentPrerequisite } from '../domain/Content';
import type { ContentRepository } from '../domain/ContentPorts';

export class GetContentPrerequisitesByLessonUseCase {
  constructor(private readonly repo: ContentRepository) {}

  async execute(lessonId: number): Promise<Result<ContentPrerequisite[], AppError>> {
    try {
      if (!Number.isInteger(lessonId) || lessonId <= 0) {
        return err(new AppError('lessonId inválido', 400));
      }

      const lesson = await this.repo.findLessonReferenceById(lessonId);
      if (!lesson || !lesson.isActive) {
        return err(new AppError('Lección no encontrada', 404));
      }

      const prereqs = await this.repo.findPrerequisitesByLessonId(lessonId);
      return ok(prereqs);
    } catch {
      return err(new AppError('Error al obtener prerequisitos de contenido', 500));
    }
  }
}
