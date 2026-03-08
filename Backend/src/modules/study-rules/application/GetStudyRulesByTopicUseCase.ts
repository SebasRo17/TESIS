import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import type { RuleResolver, StudyRulesRepository } from '../domain/StudyRulePorts';

export interface TopicStudyRuleOutput {
  id: number;
  name: string;
  scope: 'global' | 'course' | 'topic' | 'user';
  priority: number;
  definition: unknown;
  appliedScope: 'global' | 'course' | 'topic' | 'user';
  bindingId: number | null;
}

export class GetStudyRulesByTopicUseCase {
  constructor(
    private readonly repo: StudyRulesRepository,
    private readonly resolver: RuleResolver
  ) {}

  async execute(topicId: number): Promise<Result<TopicStudyRuleOutput[], AppError>> {
    try {
      if (!Number.isInteger(topicId) || topicId <= 0) {
        return err(new AppError('topicId inválido', 400));
      }

      const topic = await this.repo.findTopicReferenceById(topicId);
      if (!topic || !topic.isActive) {
        return err(new AppError('Topic no encontrado', 404));
      }

      const rules = await this.repo.findActiveRules();
      const bindings = await this.repo.findBindingsByRuleIds(rules.map((rule) => rule.id));
      const resolved = this.resolver.resolve(rules, bindings, {
        topicId,
        courseId: topic.courseId,
      });

      return ok(
        resolved
          .filter((rule) => rule.appliedScope !== 'user')
          .map((item) => ({
            id: item.rule.id,
            name: item.rule.name,
            scope: item.rule.scope,
            priority: item.rule.priority,
            definition: item.rule.definition,
            appliedScope: item.appliedScope,
            bindingId: item.bindingId,
          }))
      );
    } catch {
      return err(new AppError('Error al obtener reglas por topic', 500));
    }
  }
}
