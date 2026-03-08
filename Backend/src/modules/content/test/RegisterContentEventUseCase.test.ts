import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegisterContentEventUseCase } from '../application/RegisterContentEventUseCase';
import type { ContentRepository } from '../domain/ContentPorts';

describe('RegisterContentEventUseCase', () => {
  let repo: ContentRepository;
  let useCase: RegisterContentEventUseCase;

  beforeEach(() => {
    repo = {
      findLessonReferenceById: vi.fn(),
      findActiveVariantsByLessonId: vi.fn(),
      findVariantById: vi.fn(),
      createContentEvent: vi.fn(),
      findPrerequisitesByLessonId: vi.fn(),
    };

    useCase = new RegisterContentEventUseCase(repo);
  });

  it('registra evento para variante activa', async () => {
    vi.mocked(repo.findVariantById).mockResolvedValue({
      id: 4,
      lessonId: 2,
      modality: 'reading',
      difficultyProfile: 'basic',
      readingLevel: 'A2',
      contentUrl: null,
      bodyHtml: '<p>Test</p>',
      estimatedMinutes: 10,
      isActive: true,
      version: 1,
    });

    vi.mocked(repo.createContentEvent).mockResolvedValue({
      id: 100,
      userId: 7,
      lessonId: 2,
      contentVariantId: 4,
      eventType: 'open',
      eventValue: {},
    });

    const result = await useCase.execute({
      userId: 7,
      variantId: 4,
      eventType: 'open',
      metadata: { source: 'frontend' },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe(100);
      expect(result.value.variantId).toBe(4);
    }
  });

  it('retorna 404 si la variante no existe', async () => {
    vi.mocked(repo.findVariantById).mockResolvedValue(null);

    const result = await useCase.execute({
      userId: 7,
      variantId: 999,
      eventType: 'progress',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(404);
    }
  });
});
