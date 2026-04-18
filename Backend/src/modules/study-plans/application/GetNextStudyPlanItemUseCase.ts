import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import type { StudyPlansRepository } from '../domain/StudyPlansPorts';

export class GetNextStudyPlanItemUseCase {
  constructor(private readonly repo: StudyPlansRepository) {}

  async execute(userId: number, courseId: number): Promise<Result<any, AppError>> {
    try {
      if (!Number.isInteger(userId) || userId <= 0) return err(new AppError('userId inválido', 400));
      if (!Number.isInteger(courseId) || courseId <= 0) return err(new AppError('courseId inválido', 400));

      const plan = await this.repo.findActivePlanByUserAndCourse(userId, courseId);
      if (!plan) return err(new AppError('Plan activo no encontrado', 404));

      const next = plan.items.find((item) => item.status === 'pending') ?? null;
      return ok(
        next
          ? {
              id: next.id,
              planId: next.planId,
              contentRefType: next.contentRefType,
              contentRefId: next.contentRefId,
              type: next.type,
              status: next.status,
              orderN: next.orderN,
            }
          : null
      );
    } catch {
      return err(new AppError('Error al obtener siguiente actividad', 500));
    }
  }
}
