import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetContentVariantsByLessonUseCase } from '../application/GetContentVariantsByLessonUseCase';
import type { ContentRepository } from '../domain/ContentPorts';

describe('GetContentVariantsByLessonUseCase', () => {
  let repo: ContentRepository;
  let useCase: GetContentVariantsByLessonUseCase;

  beforeEach(() => {
    repo = {
      findLessonReferenceById: vi.fn(),
      findActiveVariantsByLessonId: vi.fn(),
      findVariantById: vi.fn(),
      createContentEvent: vi.fn(),
      findPrerequisitesByLessonId: vi.fn(),
    };

    useCase = new GetContentVariantsByLessonUseCase(repo);
  });

  it('retorna variantes activas de una lección', async () => {
    vi.mocked(repo.findLessonReferenceById).mockResolvedValue({
      id: 2,
      isActive: true,
    });

    vi.mocked(repo.findActiveVariantsByLessonId).mockResolvedValue([
      {
        id: 1,
        lessonId: 2,
        modality: 'video',
        difficultyProfile: 'easy',
        readingLevel: null,
        contentUrl: 'https://cdn/test.mp4',
        bodyHtml: null,
        estimatedMinutes: 8,
        isActive: true,
        version: 2,
      },
    ]);

    const result = await useCase.execute(2);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0]?.id).toBe(1);
      expect(result.value[0]?.modality).toBe('video');
    }
  });

  it('retorna 404 cuando la lección no existe o está inactiva', async () => {
    vi.mocked(repo.findLessonReferenceById).mockResolvedValue(null);

    const result = await useCase.execute(999);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(404);
    }
  });
});
