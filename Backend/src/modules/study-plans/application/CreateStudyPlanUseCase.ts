import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import type { CreateStudyPlanInput } from '../domain/StudyPlan';
import type { StudyPlansRepository } from '../domain/StudyPlansPorts';

export class CreateStudyPlanUseCase {
  constructor(private readonly repo: StudyPlansRepository) {}

  async execute(input: CreateStudyPlanInput): Promise<Result<any, AppError>> {
    try {
      if (!Number.isInteger(input.userId) || input.userId <= 0) {
        return err(new AppError('userId inválido', 400));
      }

      if (!Number.isInteger(input.courseId) || input.courseId <= 0) {
        return err(new AppError('courseId inválido', 400));
      }

      if (!input.items || input.items.length === 0) {
        return err(new AppError('El plan debe contener al menos un item', 400));
      }

      for (const item of input.items) {
        if (!Number.isInteger(item.contentRefId) || item.contentRefId <= 0) {
          return err(new AppError('contentRefId inválido', 400));
        }

        if (!Number.isInteger(item.orderN) || item.orderN <= 0) {
          return err(new AppError('orderN inválido', 400));
        }

        const resolvedCourseId = await this.repo.resolveCourseIdForReference(item.contentRefType, item.contentRefId);
        if (resolvedCourseId === null) {
          return err(new AppError(`Referencia inválida para ${item.contentRefType}:${item.contentRefId}`, 400));
        }

        if (resolvedCourseId !== input.courseId) {
          return err(new AppError(`El item ${item.contentRefType}:${item.contentRefId} no pertenece al curso ${input.courseId}`, 400));
        }
      }

      const created = await this.repo.createStudyPlan(input);

      return ok({
        id: created.id,
        userId: created.userId,
        version: created.version,
        state: created.state,
        source: created.source,
        createdAt: created.createdAt.toISOString(),
        activatedAt: created.activatedAt ? created.activatedAt.toISOString() : null,
        items: created.items.map((item) => ({
          id: item.id,
          orderN: item.orderN,
          contentRefType: item.contentRefType,
          contentRefId: item.contentRefId,
          type: item.type,
          status: item.status,
        })),
      });
    } catch {
      return err(new AppError('Error al crear plan de estudio', 500));
    }
  }
}
