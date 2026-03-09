import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import type { StudyPlanItem } from '../domain/StudyPlan';
import type { StudyPlansRepository } from '../domain/StudyPlansPorts';

function serializeItem(item: StudyPlanItem) {
  return {
    id: item.id,
    planId: item.planId,
    contentRefType: item.contentRefType,
    contentRefId: item.contentRefId,
    type: item.type,
    priority: item.priority,
    orderN: item.orderN,
    dueAt: item.dueAt ? item.dueAt.toISOString() : null,
    metadata: item.metadata,
    status: item.status,
  };
}

export class GetActiveStudyPlanUseCase {
  constructor(private readonly repo: StudyPlansRepository) {}

  async execute(userId: number, courseId: number): Promise<Result<any, AppError>> {
    try {
      if (!Number.isInteger(userId) || userId <= 0) return err(new AppError('userId inválido', 400));
      if (!Number.isInteger(courseId) || courseId <= 0) return err(new AppError('courseId inválido', 400));

      const plan = await this.repo.findActivePlanByUserAndCourse(userId, courseId);
      if (!plan) return err(new AppError('Plan activo no encontrado', 404));

      return ok({
        id: plan.id,
        userId: plan.userId,
        version: plan.version,
        state: plan.state,
        source: plan.source,
        createdAt: plan.createdAt.toISOString(),
        activatedAt: plan.activatedAt ? plan.activatedAt.toISOString() : null,
        items: plan.items.map(serializeItem),
      });
    } catch {
      return err(new AppError('Error al obtener plan activo', 500));
    }
  }
}
