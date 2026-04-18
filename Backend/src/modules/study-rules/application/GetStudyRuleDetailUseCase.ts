import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import type { StudyRulesRepository } from '../domain/StudyRulePorts';

export interface StudyRuleDetailOutput {
  id: number;
  name: string;
  scope: 'global' | 'course' | 'topic' | 'user';
  priority: number;
  isActive: boolean;
  definition: unknown;
  createdAt: string;
  updatedAt: string;
}

export class GetStudyRuleDetailUseCase {
  constructor(private readonly repo: StudyRulesRepository) {}

  async execute(ruleId: number): Promise<Result<StudyRuleDetailOutput, AppError>> {
    try {
      if (!Number.isInteger(ruleId) || ruleId <= 0) {
        return err(new AppError('ruleId inválido', 400));
      }

      const rule = await this.repo.findRuleById(ruleId);
      if (!rule) {
        return err(new AppError('Regla no encontrada', 404));
      }

      return ok({
        id: rule.id,
        name: rule.name,
        scope: rule.scope,
        priority: rule.priority,
        isActive: rule.isActive,
        definition: rule.definition,
        createdAt: rule.createdAt.toISOString(),
        updatedAt: rule.updatedAt.toISOString(),
      });
    } catch {
      return err(new AppError('Error al obtener detalle de regla', 500));
    }
  }
}
