import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetApplicableStudyRulesUseCase } from '../application/GetApplicableStudyRulesUseCase';
import { DeterministicStudyRulesResolver } from '../application/DeterministicStudyRulesResolver';
import type { StudyRulesRepository } from '../domain/StudyRulePorts';

describe('GetApplicableStudyRulesUseCase', () => {
  let repo: StudyRulesRepository;
  let useCase: GetApplicableStudyRulesUseCase;

  beforeEach(() => {
    repo = {
      findActiveRules: vi.fn(),
      findRuleById: vi.fn(),
      findBindingsByRuleIds: vi.fn(),
      findTopicReferenceById: vi.fn(),
    };

    useCase = new GetApplicableStudyRulesUseCase(repo, new DeterministicStudyRulesResolver());
  });

  it('deriva courseId desde topicId cuando no se envía explícitamente', async () => {
    vi.mocked(repo.findTopicReferenceById).mockResolvedValue({
      id: 10,
      courseId: 1,
      isActive: true,
    });

    vi.mocked(repo.findActiveRules).mockResolvedValue([
      {
        id: 1,
        name: 'global',
        scope: 'global',
        isActive: true,
        priority: 100,
        definition: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'course',
        scope: 'course',
        isActive: true,
        priority: 10,
        definition: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    vi.mocked(repo.findBindingsByRuleIds).mockResolvedValue([
      { id: 20, ruleId: 2, courseId: 1, topicId: null, userId: null },
    ]);

    const result = await useCase.execute({ topicId: 10 });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.map((r) => r.name)).toEqual(['course', 'global']);
    }
  });

  it('retorna 404 cuando topic no existe', async () => {
    vi.mocked(repo.findTopicReferenceById).mockResolvedValue(null);

    const result = await useCase.execute({ topicId: 999 });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(404);
    }
  });
});
