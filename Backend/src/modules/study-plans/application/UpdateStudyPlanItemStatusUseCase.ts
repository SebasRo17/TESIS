import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import type { StudyPlanItemStatus } from '../domain/StudyPlan';
import type { StudyPlansRepository } from '../domain/StudyPlansPorts';

export class UpdateStudyPlanItemStatusUseCase {
  constructor(private readonly repo: StudyPlansRepository) {}

  async execute(userId: number, itemId: number, status: StudyPlanItemStatus): Promise<Result<any, AppError>> {
    try {
      if (!Number.isInteger(userId) || userId <= 0) return err(new AppError('userId inválido', 400));
      if (!Number.isInteger(itemId) || itemId <= 0) return err(new AppError('itemId inválido', 400));
      if (!['pending', 'done', 'blocked'].includes(status)) return err(new AppError('status inválido', 400));

      const item = await this.repo.findPlanItemById(itemId);
      if (!item) return err(new AppError('Item no encontrado', 404));

      const plan = await this.repo.findPlanById(item.planId);
      if (!plan) return err(new AppError('Plan no encontrado', 404));
      if (plan.userId !== userId) return err(new AppError('No autorizado para actualizar este item', 403));

      const updated = await this.repo.updatePlanItemStatus(itemId, status);

      return ok({
        id: updated.id,
        status: updated.status,
      });
    } catch {
      return err(new AppError('Error al actualizar estado del item', 500));
    }
  }
}
