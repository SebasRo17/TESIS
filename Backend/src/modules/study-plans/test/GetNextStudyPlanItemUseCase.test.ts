import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetNextStudyPlanItemUseCase } from '../application/GetNextStudyPlanItemUseCase';
import type { StudyPlansRepository } from '../domain/StudyPlansPorts';

describe('GetNextStudyPlanItemUseCase', () => {
  let repo: StudyPlansRepository;
  let useCase: GetNextStudyPlanItemUseCase;

  beforeEach(() => {
    repo = {
      findActivePlanByUserAndCourse: vi.fn(),
      findPlansByUserAndCourse: vi.fn(),
      findPlanItemById: vi.fn(),
      findPlanById: vi.fn(),
      updatePlanItemStatus: vi.fn(),
      createStudyPlan: vi.fn(),
      resolveCourseIdForReference: vi.fn(),
    };

    useCase = new GetNextStudyPlanItemUseCase(repo);
  });

  it('retorna el primer item pending en orden', async () => {
    vi.mocked(repo.findActivePlanByUserAndCourse).mockResolvedValue({
      id: 1,
      userId: 7,
      version: 2,
      state: 'active',
      source: 'orchestrator',
      createdAt: new Date(),
      activatedAt: new Date(),
      supersededAt: null,
      items: [
        {
          id: 10,
          planId: 1,
          contentRefType: 'lesson',
          contentRefId: 20,
          type: 'lesson',
          priority: 0.8,
          orderN: 1,
          dueAt: null,
          metadata: { status: 'done' },
          status: 'done',
        },
        {
          id: 11,
          planId: 1,
          contentRefType: 'exam',
          contentRefId: 5,
          type: 'evaluation',
          priority: 0.7,
          orderN: 2,
          dueAt: null,
          metadata: { status: 'pending' },
          status: 'pending',
        },
      ],
    });

    const result = await useCase.execute(7, 1);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value?.id).toBe(11);
      expect(result.value?.status).toBe('pending');
    }
  });

  it('retorna null cuando no hay pendientes', async () => {
    vi.mocked(repo.findActivePlanByUserAndCourse).mockResolvedValue({
      id: 1,
      userId: 7,
      version: 2,
      state: 'active',
      source: 'orchestrator',
      createdAt: new Date(),
      activatedAt: new Date(),
      supersededAt: null,
      items: [],
    });

    const result = await useCase.execute(7, 1);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeNull();
    }
  });
});
