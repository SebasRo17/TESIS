import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateStudyPlanUseCase } from '../application/CreateStudyPlanUseCase';
import type { StudyPlansRepository } from '../domain/StudyPlansPorts';

describe('CreateStudyPlanUseCase', () => {
  let repo: StudyPlansRepository;
  let useCase: CreateStudyPlanUseCase;

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

    useCase = new CreateStudyPlanUseCase(repo);
  });

  it('crea plan cuando las referencias pertenecen al curso', async () => {
    vi.mocked(repo.resolveCourseIdForReference).mockResolvedValue(1);
    vi.mocked(repo.createStudyPlan).mockResolvedValue({
      id: 100,
      userId: 7,
      version: 3,
      state: 'active',
      source: 'orchestrator',
      createdAt: new Date('2026-03-07T12:00:00.000Z'),
      activatedAt: new Date('2026-03-07T12:00:00.000Z'),
      supersededAt: null,
      items: [
        {
          id: 900,
          planId: 100,
          contentRefType: 'lesson',
          contentRefId: 20,
          type: 'lesson',
          priority: 0.9,
          orderN: 1,
          dueAt: null,
          metadata: { status: 'pending' },
          status: 'pending',
        },
      ],
    });

    const result = await useCase.execute({
      userId: 7,
      courseId: 1,
      items: [
        {
          contentRefType: 'lesson',
          contentRefId: 20,
          type: 'lesson',
          priority: 0.9,
          orderN: 1,
        },
      ],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe(100);
      expect(result.value.items[0]?.status).toBe('pending');
    }
  });

  it('retorna error si un item no pertenece al curso', async () => {
    vi.mocked(repo.resolveCourseIdForReference).mockResolvedValue(2);

    const result = await useCase.execute({
      userId: 7,
      courseId: 1,
      items: [
        {
          contentRefType: 'lesson',
          contentRefId: 20,
          type: 'lesson',
          priority: 0.9,
          orderN: 1,
        },
      ],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(400);
    }
  });
});
