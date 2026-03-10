import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import type { InputSnapshot } from '../domain/Orchestrator';
import type { OrchestratorRepository } from '../domain/OrchestratorPorts';

export interface BuildUserSnapshotInput {
  userId: number;
  courseId: number;
}

export class BuildUserSnapshotUseCase {
  constructor(private readonly repo: OrchestratorRepository) {}

  async execute(input: BuildUserSnapshotInput): Promise<Result<InputSnapshot, AppError>> {
    try {
      if (!Number.isInteger(input.userId) || input.userId <= 0) {
        return err(new AppError('userId inválido', 400));
      }

      if (!Number.isInteger(input.courseId) || input.courseId <= 0) {
        return err(new AppError('courseId inválido', 400));
      }

      const snapshot = await this.repo.buildSnapshot({
        userId: input.userId,
        courseId: input.courseId,
      });

      if (!snapshot) {
        return err(new AppError('Usuario o curso no encontrado', 404));
      }

      return ok(snapshot);
    } catch {
      return err(new AppError('Error al construir snapshot del usuario', 500));
    }
  }
}
