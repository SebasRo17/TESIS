import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import type { OrchestratorDecisionType } from '../domain/Orchestrator';
import type { OrchestratorRepository } from '../domain/OrchestratorPorts';

export interface RegisterDecisionInput {
  userId: number;
  decisionType: OrchestratorDecisionType;
  inputSnapshot: unknown;
  output: unknown;
  rationale?: string;
  modelVersion?: string;
  correlationId?: string;
}

function mapDecisionType(type: OrchestratorDecisionType): 'plan' | 'next' | 'feedback' {
  if (type === 'update_plan') return 'plan';
  if (type === 'next') return 'next';
  return 'feedback';
}

export class RegisterOrchestratorDecisionUseCase {
  constructor(private readonly repo: OrchestratorRepository) {}

  async execute(input: RegisterDecisionInput): Promise<Result<any, AppError>> {
    try {
      if (!Number.isInteger(input.userId) || input.userId <= 0) {
        return err(new AppError('userId inválido', 400));
      }

      const persisted = await this.repo.saveDecision({
        userId: input.userId,
        decisionType: mapDecisionType(input.decisionType),
        inputSnapshot: input.inputSnapshot,
        output: input.output,
        rationale: input.rationale ?? null,
        modelVersion: input.modelVersion ?? null,
        correlationId: input.correlationId ?? null,
      });

      return ok({
        id: persisted.id,
        userId: persisted.userId,
        decisionType: persisted.decisionType,
        inputSnapshot: persisted.inputSnapshot,
        output: persisted.output,
        rationale: persisted.rationale,
        modelVersion: persisted.modelVersion,
        correlationId: persisted.correlationId,
        createdAt: persisted.createdAt.toISOString(),
      });
    } catch {
      return err(new AppError('Error al registrar decisión', 500));
    }
  }
}
