import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import type { ContentRepository } from '../domain/ContentPorts';

export interface RegisterContentEventInput {
  userId: number;
  variantId: number;
  eventType: 'open' | 'progress' | 'interaction';
  metadata?: unknown;
}

export interface RegisterContentEventOutput {
  id: number;
  userId: number;
  lessonId: number | null;
  variantId: number;
  eventType: string;
}

export class RegisterContentEventUseCase {
  constructor(private readonly repo: ContentRepository) {}

  async execute(input: RegisterContentEventInput): Promise<Result<RegisterContentEventOutput, AppError>> {
    try {
      if (!Number.isInteger(input.userId) || input.userId <= 0) {
        return err(new AppError('userId inválido', 400));
      }

      if (!Number.isInteger(input.variantId) || input.variantId <= 0) {
        return err(new AppError('variantId inválido', 400));
      }

      if (!['open', 'progress', 'interaction'].includes(input.eventType)) {
        return err(new AppError('eventType inválido', 400));
      }

      const variant = await this.repo.findVariantById(input.variantId);
      if (!variant || !variant.isActive) {
        return err(new AppError('Variante no encontrada', 404));
      }

      const event = await this.repo.createContentEvent({
        userId: input.userId,
        contentVariantId: input.variantId,
        eventType: input.eventType,
        eventValue: {
          metadata: input.metadata ?? null,
          recordedAt: new Date().toISOString(),
        },
      });

      return ok({
        id: event.id,
        userId: event.userId,
        lessonId: event.lessonId,
        variantId: event.contentVariantId,
        eventType: event.eventType,
      });
    } catch {
      return err(new AppError('Error al registrar evento de contenido', 500));
    }
  }
}
