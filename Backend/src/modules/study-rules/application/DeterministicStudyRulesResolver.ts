import type { ApplicableStudyRule, StudyRule, StudyRuleBinding, StudyRuleScope } from '../domain/StudyRule';
import type { RuleResolver, StudyRulesContext } from '../domain/StudyRulePorts';

type RuleCandidate = {
  rule: StudyRule;
  appliedScope: StudyRuleScope;
  bindingId: number | null;
  rank: number;
};

const scopeRank: Record<StudyRuleScope, number> = {
  user: 1,
  topic: 2,
  course: 3,
  global: 4,
};

function resolveBindingRank(binding: StudyRuleBinding, context: StudyRulesContext): number | null {
  if (binding.userId !== null) {
    if (context.userId === undefined || binding.userId !== context.userId) return null;
    return 1;
  }

  if (binding.topicId !== null) {
    if (context.topicId === undefined || binding.topicId !== context.topicId) return null;
    return 2;
  }

  if (binding.courseId !== null) {
    if (context.courseId === undefined || binding.courseId !== context.courseId) return null;
    return 3;
  }

  return null;
}

export class DeterministicStudyRulesResolver implements RuleResolver {
  resolve(rules: StudyRule[], bindings: StudyRuleBinding[], context: StudyRulesContext): ApplicableStudyRule[] {
    const bindingsByRuleId = new Map<number, StudyRuleBinding[]>();
    for (const binding of bindings) {
      const current = bindingsByRuleId.get(binding.ruleId) ?? [];
      current.push(binding);
      bindingsByRuleId.set(binding.ruleId, current);
    }

    const winners = new Map<number, RuleCandidate>();

    for (const rule of rules) {
      let best: RuleCandidate | null = null;

      if (rule.scope === 'global') {
        best = {
          rule,
          appliedScope: 'global',
          bindingId: null,
          rank: scopeRank.global,
        };
      }

      const ruleBindings = bindingsByRuleId.get(rule.id) ?? [];
      for (const binding of ruleBindings) {
        const rank = resolveBindingRank(binding, context);
        if (rank === null) continue;

        // Asegura consistencia entre scope declarado y binding aplicado
        if (rank !== scopeRank[rule.scope]) continue;

        const candidate: RuleCandidate = {
          rule,
          appliedScope: rank === 1 ? 'user' : rank === 2 ? 'topic' : 'course',
          bindingId: binding.id,
          rank,
        };

        if (!best) {
          best = candidate;
          continue;
        }

        if (candidate.rank < best.rank) {
          best = candidate;
          continue;
        }

        if (candidate.rank === best.rank && candidate.rule.priority < best.rule.priority) {
          best = candidate;
          continue;
        }

        if (candidate.rank === best.rank && candidate.rule.priority === best.rule.priority) {
          const currentBinding = best.bindingId ?? Number.MAX_SAFE_INTEGER;
          const nextBinding = candidate.bindingId ?? Number.MAX_SAFE_INTEGER;
          if (nextBinding < currentBinding) {
            best = candidate;
          }
        }
      }

      if (best) {
        winners.set(rule.id, best);
      }
    }

    return [...winners.values()]
      .sort((a, b) => {
        if (a.rank !== b.rank) return a.rank - b.rank;
        if (a.rule.priority !== b.rule.priority) return a.rule.priority - b.rule.priority;
        return a.rule.id - b.rule.id;
      })
      .map((candidate) => ({
        rule: candidate.rule,
        appliedScope: candidate.appliedScope,
        bindingId: candidate.bindingId,
      }));
  }
}
