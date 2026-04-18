import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BuildUserSnapshotUseCase } from '../application/BuildUserSnapshotUseCase';
import type { OrchestratorRepository } from '../domain/OrchestratorPorts';

describe('BuildUserSnapshotUseCase', () => {
  let repo: OrchestratorRepository;
  let useCase: BuildUserSnapshotUseCase;

  beforeEach(() => {
    repo = {
      buildSnapshot: vi.fn(),
      saveDecision: vi.fn(),
      getDecisionHistory: vi.fn(),
      topicBelongsToCourse: vi.fn(),
      lessonBelongsToCourse: vi.fn(),
      findActiveLessonByTopic: vi.fn(),
    };

    useCase = new BuildUserSnapshotUseCase(repo);
  });

  it('retorna snapshot cuando existe usuario y curso', async () => {
    vi.mocked(repo.buildSnapshot).mockResolvedValue({
      user: { id: 1, email: 'test@example.com', status: 'active' },
      course: { id: 2, title: 'Matematica' },
      mastery: [],
      recentJournal: [],
      plan: null,
      progress: {
        totalLessons: 0,
        completedLessons: 0,
        inProgressLessons: 0,
        completionPercentage: 0,
      },
      studyRules: [],
      eligibility: [],
      lastActions: { contentEvents: [], examAttempts: [] },
    });

    const result = await useCase.execute({ userId: 1, courseId: 2 });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.user.id).toBe(1);
      expect(result.value.course.id).toBe(2);
    }
  });

  it('retorna 404 si snapshot no existe', async () => {
    vi.mocked(repo.buildSnapshot).mockResolvedValue(null);

    const result = await useCase.execute({ userId: 10, courseId: 20 });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(404);
    }
  });
});
