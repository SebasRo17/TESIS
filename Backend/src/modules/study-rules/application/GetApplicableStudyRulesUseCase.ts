import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import type { RuleResolver, StudyRulesRepository } from '../domain/StudyRulePorts';

export interface GetApplicableStudyRulesInput {
  courseId?: number;
  topicId?: number;
  userId?: number;
}

export interface ApplicableStudyRuleOutput {
  id: number;
  name: string;
  scope: 'global' | 'course' | 'topic' | 'user';
  priority: number;
  definition: unknown;
  appliedScope: 'global' | 'course' | 'topic' | 'user';
  bindingId: number | null;
}

export class GetApplicableStudyRulesUseCase {
  constructor(
    private readonly repo: StudyRulesRepository,
    private readonly resolver: RuleResolver
  ) {}

  async execute(input: GetApplicableStudyRulesInput): Promise<Result<ApplicableStudyRuleOutput[], AppError>> {
    try {
      if (input.courseId !== undefined && (!Number.isInteger(input.courseId) || input.courseId <= 0)) {
        return err(new AppError('courseId inválido', 400));
      }

      if (input.topicId !== undefined && (!Number.isInteger(input.topicId) || input.topicId <= 0)) {
        return err(new AppError('topicId inválido', 400));
      }

      if (input.userId !== undefined && (!Number.isInteger(input.userId) || input.userId <= 0)) {
        return err(new AppError('userId inválido', 400));
      }

      let effectiveCourseId = input.courseId;

      if (input.topicId !== undefined) {
        const topic = await this.repo.findTopicReferenceById(input.topicId);
        if (!topic || !topic.isActive) {
          return err(new AppError('Topic no encontrado', 404));
        }

        if (effectiveCourseId === undefined) {
          effectiveCourseId = topic.courseId;
        }
      }

      const rules = await this.repo.findActiveRules();
      const bindings = await this.repo.findBindingsByRuleIds(rules.map((rule) => rule.id));
      const context = {
        ...(effectiveCourseId !== undefined ? { courseId: effectiveCourseId } : {}),
        ...(input.topicId !== undefined ? { topicId: input.topicId } : {}),
        ...(input.userId !== undefined ? { userId: input.userId } : {}),
      };

      const resolved = this.resolver.resolve(rules, bindings, context);

      return ok(
        resolved.map((item) => ({
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
      return err(new AppError('Error al resolver reglas aplicables', 500));
    }
  }
}
