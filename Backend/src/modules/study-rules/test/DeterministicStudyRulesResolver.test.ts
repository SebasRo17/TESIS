import { describe, expect, it } from 'vitest';
import { DeterministicStudyRulesResolver } from '../application/DeterministicStudyRulesResolver';
import type { StudyRule, StudyRuleBinding } from '../domain/StudyRule';

function baseRule(input: Partial<StudyRule>): StudyRule {
  return {
    id: input.id ?? 1,
    name: input.name ?? 'rule',
    scope: input.scope ?? 'global',
    isActive: true,
    priority: input.priority ?? 100,
    definition: input.definition ?? {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('DeterministicStudyRulesResolver', () => {
  it('resuelve por jerarquía user > topic > course > global', () => {
    const resolver = new DeterministicStudyRulesResolver();

    const rules: StudyRule[] = [
      baseRule({ id: 1, name: 'global', scope: 'global', priority: 100 }),
      baseRule({ id: 2, name: 'course', scope: 'course', priority: 20 }),
      baseRule({ id: 3, name: 'topic', scope: 'topic', priority: 40 }),
      baseRule({ id: 4, name: 'user', scope: 'user', priority: 5 }),
    ];

    const bindings: StudyRuleBinding[] = [
      { id: 10, ruleId: 2, courseId: 1, topicId: null, userId: null },
      { id: 20, ruleId: 3, courseId: null, topicId: 10, userId: null },
      { id: 30, ruleId: 4, courseId: null, topicId: null, userId: 7 },
    ];

    const resolved = resolver.resolve(rules, bindings, { userId: 7, topicId: 10, courseId: 1 });

    expect(resolved.map((r) => r.rule.name)).toEqual(['user', 'topic', 'course', 'global']);
    expect(resolved.map((r) => r.appliedScope)).toEqual(['user', 'topic', 'course', 'global']);
  });

  it('descarta bindings inconsistentes con el scope de la regla', () => {
    const resolver = new DeterministicStudyRulesResolver();

    const rules: StudyRule[] = [baseRule({ id: 1, name: 'course-rule', scope: 'course', priority: 10 })];
    const bindings: StudyRuleBinding[] = [
      { id: 100, ruleId: 1, courseId: null, topicId: 10, userId: null },
      { id: 101, ruleId: 1, courseId: 1, topicId: null, userId: null },
    ];

    const resolved = resolver.resolve(rules, bindings, { topicId: 10, courseId: 1 });

    expect(resolved).toHaveLength(1);
    expect(resolved[0]?.bindingId).toBe(101);
    expect(resolved[0]?.appliedScope).toBe('course');
  });
});
