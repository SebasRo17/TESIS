import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import type { StudyPlansRepository } from '../domain/StudyPlansPorts';

export class GetStudyPlansHistoryUseCase {
  constructor(private readonly repo: StudyPlansRepository) {}

  async execute(userId: number, courseId: number): Promise<Result<any[], AppError>> {
    try {
      if (!Number.isInteger(userId) || userId <= 0) return err(new AppError('userId inválido', 400));
      if (!Number.isInteger(courseId) || courseId <= 0) return err(new AppError('courseId inválido', 400));

      const plans = await this.repo.findPlansByUserAndCourse(userId, courseId);

      return ok(
        plans.map((plan) => ({
          id: plan.id,
          version: plan.version,
          state: plan.state,
          source: plan.source,
          createdAt: plan.createdAt.toISOString(),
          activatedAt: plan.activatedAt ? plan.activatedAt.toISOString() : null,
          supersededAt: plan.supersededAt ? plan.supersededAt.toISOString() : null,
          itemsCount: plan.items.length,
        }))
      );
    } catch {
      return err(new AppError('Error al obtener historial de planes', 500));
    }
  }
}
