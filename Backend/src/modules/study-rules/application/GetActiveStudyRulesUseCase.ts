import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import type { StudyRulesRepository } from '../domain/StudyRulePorts';

export interface StudyRuleSummary {
  id: number;
  name: string;
  scope: 'global' | 'course' | 'topic' | 'user';
  priority: number;
  definition: unknown;
}

export class GetActiveStudyRulesUseCase {
  constructor(private readonly repo: StudyRulesRepository) {}

  async execute(): Promise<Result<StudyRuleSummary[], AppError>> {
    try {
      const rules = await this.repo.findActiveRules();
      const ordered = rules
        .slice()
        .sort((a, b) => (a.priority !== b.priority ? a.priority - b.priority : a.id - b.id))
        .map((rule) => ({
          id: rule.id,
          name: rule.name,
          scope: rule.scope,
          priority: rule.priority,
          definition: rule.definition,
        }));

      return ok(ordered);
    } catch {
      return err(new AppError('Error al obtener reglas activas', 500));
    }
  }
}
