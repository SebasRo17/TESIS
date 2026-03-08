import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateMasteryUseCase } from '../application/UpdateMasteryUseCase';
import type { MasteryRepository } from '../domain/MasteryPorts';

describe('UpdateMasteryUseCase', () => {
  let useCase: UpdateMasteryUseCase;
  let repo: MasteryRepository;

  beforeEach(() => {
    repo = {
      findActiveTopicById: vi.fn(),
      findActiveCourseById: vi.fn(),
      findActiveTopicsByCourseId: vi.fn(),
      findSnapshotByUserAndTopic: vi.fn(),
      findSnapshotsByUserAndTopicIds: vi.fn(),
      findLatestJournalAtByUserAndTopicIds: vi.fn(),
      findJournalByUserAndTopic: vi.fn(),
      applyMasteryUpdate: vi.fn(),
    };

    useCase = new UpdateMasteryUseCase(repo);
  });

  it('aplica actualización y retorna snapshot + id de journal', async () => {
    const now = new Date('2026-03-07T12:00:00.000Z');

    vi.mocked(repo.findActiveTopicById).mockResolvedValue({
      id: 10,
      courseId: 2,
      name: 'Álgebra',
    });

    vi.mocked(repo.applyMasteryUpdate).mockResolvedValue({
      snapshot: {
        userId: 1,
        topicId: 10,
        mastery: 0.85,
        observations: 7,
        lastUpdatedAt: now,
      },
      journal: {
        id: 99,
        userId: 1,
        topicId: 10,
        source: 'exam',
        delta: 0.15,
        masteryBefore: 0.7,
        masteryAfter: 0.85,
        evidence: { examAttemptId: 5 },
        at: now,
      },
    });

    const result = await useCase.execute({
      userId: 1,
      topicId: 10,
      source: 'exam',
      delta: 0.15,
      evidence: { examAttemptId: 5 },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.mastery).toBe(0.85);
      expect(result.value.observations).toBe(7);
      expect(result.value.journalEntryId).toBe(99);
      expect(result.value.lastUpdatedAt).toBe('2026-03-07T12:00:00.000Z');
    }

    expect(repo.applyMasteryUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        topicId: 10,
        observationsDelta: 1,
      })
    );
  });

  it('retorna error 400 si delta está fuera de rango', async () => {
    const result = await useCase.execute({
      userId: 1,
      topicId: 10,
      source: 'exam',
      delta: 2,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(400);
    }

    expect(repo.findActiveTopicById).not.toHaveBeenCalled();
  });

  it('retorna 404 cuando el topic no existe o está inactivo', async () => {
    vi.mocked(repo.findActiveTopicById).mockResolvedValue(null);

    const result = await useCase.execute({
      userId: 1,
      topicId: 999,
      source: 'manual',
      delta: 0.1,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(404);
    }
  });
});
