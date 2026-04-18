import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import type { ContentRepository } from '../domain/ContentPorts';

export interface ContentVariantDetailOutput {
  id: number;
  lessonId: number;
  modality: string;
  difficultyProfile: string | null;
  readingLevel: string | null;
  isActive: boolean;
  version: number;
  payload: {
    contentUrl: string | null;
    bodyHtml: string | null;
    estimatedMinutes: number | null;
  };
}

export class GetContentVariantByIdUseCase {
  constructor(private readonly repo: ContentRepository) {}

  async execute(variantId: number): Promise<Result<ContentVariantDetailOutput, AppError>> {
    try {
      if (!Number.isInteger(variantId) || variantId <= 0) {
        return err(new AppError('variantId inválido', 400));
      }

      const variant = await this.repo.findVariantById(variantId);
      if (!variant || !variant.isActive) {
        return err(new AppError('Variante no encontrada', 404));
      }

      return ok({
        id: variant.id,
        lessonId: variant.lessonId,
        modality: variant.modality,
        difficultyProfile: variant.difficultyProfile,
        readingLevel: variant.readingLevel,
        isActive: variant.isActive,
        version: variant.version,
        payload: {
          contentUrl: variant.contentUrl,
          bodyHtml: variant.bodyHtml,
          estimatedMinutes: variant.estimatedMinutes,
        },
      });
    } catch {
      return err(new AppError('Error al obtener variante de contenido', 500));
    }
  }
}
