import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import type { OrchestratorRepository } from '../domain/OrchestratorPorts';

export interface GetDecisionHistoryInput {
  userId: number;
  limit?: number;
}

export class GetDecisionHistoryUseCase {
  constructor(private readonly repo: OrchestratorRepository) {}

  async execute(input: GetDecisionHistoryInput): Promise<Result<any[], AppError>> {
    try {
      if (!Number.isInteger(input.userId) || input.userId <= 0) {
        return err(new AppError('userId inválido', 400));
      }

      const limit = input.limit ?? 50;
      if (!Number.isInteger(limit) || limit <= 0 || limit > 200) {
        return err(new AppError('limit inválido (1..200)', 400));
      }

      const history = await this.repo.getDecisionHistory(input.userId, limit);

      return ok(
        history.map((item) => ({
          id: item.id,
          userId: item.userId,
          decisionType: item.decisionType,
          inputSnapshot: item.inputSnapshot,
          output: item.output,
          rationale: item.rationale,
          modelVersion: item.modelVersion,
          correlationId: item.correlationId,
          createdAt: item.createdAt.toISOString(),
        }))
      );
    } catch {
      return err(new AppError('Error al obtener historial de decisiones', 500));
    }
  }
}
