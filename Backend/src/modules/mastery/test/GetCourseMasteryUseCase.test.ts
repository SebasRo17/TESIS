import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetCourseMasteryUseCase } from '../application/GetCourseMasteryUseCase';
import type { MasteryRepository } from '../domain/MasteryPorts';

describe('GetCourseMasteryUseCase', () => {
  let useCase: GetCourseMasteryUseCase;
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

    useCase = new GetCourseMasteryUseCase(repo);
  });

  it('retorna mastery por topics activos del curso', async () => {
    vi.mocked(repo.findActiveCourseById).mockResolvedValue({ id: 1, title: 'Matemática' });
    vi.mocked(repo.findActiveTopicsByCourseId).mockResolvedValue([
      { id: 10, courseId: 1, name: 'Álgebra' },
      { id: 11, courseId: 1, name: 'Funciones' },
    ]);

    vi.mocked(repo.findSnapshotsByUserAndTopicIds).mockResolvedValue([
      {
        userId: 7,
        topicId: 10,
        mastery: 0.6,
        observations: 3,
        lastUpdatedAt: null,
      },
    ]);

    vi.mocked(repo.findLatestJournalAtByUserAndTopicIds).mockResolvedValue(
      new Map<number, Date>([[11, new Date('2026-03-07T09:30:00.000Z')]])
    );

    const result = await useCase.execute({ userId: 7, courseId: 1 });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.topics).toHaveLength(2);
      expect(result.value.topics[0]).toEqual({
        topicId: 10,
        topicName: 'Álgebra',
        mastery: 0.6,
        observations: 3,
        lastUpdatedAt: null,
      });
      expect(result.value.topics[1]).toEqual({
        topicId: 11,
        topicName: 'Funciones',
        mastery: 0,
        observations: 0,
        lastUpdatedAt: '2026-03-07T09:30:00.000Z',
      });
    }
  });

  it('retorna 404 si el curso no está activo o no existe', async () => {
    vi.mocked(repo.findActiveCourseById).mockResolvedValue(null);

    const result = await useCase.execute({ userId: 7, courseId: 404 });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(404);
    }
  });
});
