import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import type { ContentRepository } from '../domain/ContentPorts';

export interface ContentVariantSummary {
  id: number;
  lessonId: number;
  modality: string;
  difficultyProfile: string | null;
  readingLevel: string | null;
  estimatedMinutes: number | null;
  version: number;
}

export class GetContentVariantsByLessonUseCase {
  constructor(private readonly repo: ContentRepository) {}

  async execute(lessonId: number): Promise<Result<ContentVariantSummary[], AppError>> {
    try {
      if (!Number.isInteger(lessonId) || lessonId <= 0) {
        return err(new AppError('lessonId inválido', 400));
      }

      const lesson = await this.repo.findLessonReferenceById(lessonId);
      if (!lesson || !lesson.isActive) {
        return err(new AppError('Lección no encontrada', 404));
      }

      const variants = await this.repo.findActiveVariantsByLessonId(lessonId);
      return ok(
        variants.map((variant) => ({
          id: variant.id,
          lessonId: variant.lessonId,
          modality: variant.modality,
          difficultyProfile: variant.difficultyProfile,
          readingLevel: variant.readingLevel,
          estimatedMinutes: variant.estimatedMinutes,
          version: variant.version,
        }))
      );
    } catch {
      return err(new AppError('Error al obtener variantes de contenido', 500));
    }
  }
}
