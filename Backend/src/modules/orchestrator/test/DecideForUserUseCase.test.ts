import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DecideForUserUseCase } from '../application/DecideForUserUseCase';
import type { OrchestratorRepository, OrchestratorModelClient } from '../domain/OrchestratorPorts';

describe('DecideForUserUseCase', () => {
  let repo: OrchestratorRepository;
  let modelClient: OrchestratorModelClient;
  let createStudyPlanUseCase: { execute: ReturnType<typeof vi.fn> };
  let getContentVariantsByLessonUseCase: { execute: ReturnType<typeof vi.fn> };
  let registerContentEventUseCase: { execute: ReturnType<typeof vi.fn> };
  let generateContentUseCase: { execute: ReturnType<typeof vi.fn> };
  let useCase: DecideForUserUseCase;

  beforeEach(() => {
    repo = {
      buildSnapshot: vi.fn(),
      saveDecision: vi.fn(),
      getDecisionHistory: vi.fn(),
      topicBelongsToCourse: vi.fn(),
      lessonBelongsToCourse: vi.fn(),
      findActiveLessonByTopic: vi.fn(),
    };

    modelClient = {
      decide: vi.fn(),
    };

    createStudyPlanUseCase = {
      execute: vi.fn(),
    };

    getContentVariantsByLessonUseCase = {
      execute: vi.fn(),
    };

    registerContentEventUseCase = {
      execute: vi.fn(),
    };

    generateContentUseCase = {
      execute: vi.fn(),
    };

    useCase = new DecideForUserUseCase(
      repo,
      modelClient,
      createStudyPlanUseCase as any,
      getContentVariantsByLessonUseCase as any,
      registerContentEventUseCase as any,
      generateContentUseCase as any
    );

    vi.mocked(repo.buildSnapshot).mockResolvedValue({
      user: { id: 5, email: 'user@test.com', status: 'active' },
      course: { id: 2, title: 'Curso' },
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

    vi.mocked(repo.saveDecision).mockResolvedValue({
      id: 50,
      userId: 5,
      decisionType: 'feedback',
      inputSnapshot: {},
      output: {},
      rationale: null,
      modelVersion: null,
      correlationId: null,
      createdAt: new Date('2026-03-09T00:00:00Z'),
    });
  });

  it('rechaza reinforce_topic con topic fuera del curso', async () => {
    vi.mocked(modelClient.decide).mockResolvedValue({
      type: 'reinforce_topic',
      payload: { topicId: 999 },
    });
    vi.mocked(repo.topicBelongsToCourse).mockResolvedValue(false);

    const result = await useCase.execute({ userId: 5, courseId: 2 });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(400);
    }
  });

  it('aplica update_plan y persiste decision tipo plan', async () => {
    vi.mocked(modelClient.decide).mockResolvedValue({
      type: 'update_plan',
      rationale: 'Replanificar',
      payload: {
        items: [
          {
            contentRefType: 'lesson',
            contentRefId: 11,
            type: 'lesson',
            priority: 0.9,
            orderN: 1,
          },
        ],
      },
    });

    vi.mocked(createStudyPlanUseCase.execute).mockResolvedValue({
      ok: true,
      value: {
        id: 100,
        userId: 5,
        version: 2,
        state: 'active',
        source: 'orchestrator',
        createdAt: '2026-03-09T00:00:00.000Z',
        activatedAt: '2026-03-09T00:00:00.000Z',
        items: [],
      },
    });

    vi.mocked(repo.saveDecision).mockResolvedValue({
      id: 51,
      userId: 5,
      decisionType: 'plan',
      inputSnapshot: {},
      output: {},
      rationale: null,
      modelVersion: null,
      correlationId: null,
      createdAt: new Date('2026-03-09T00:00:00Z'),
    });

    const result = await useCase.execute({ userId: 5, courseId: 2 });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.applied.updatePlan).toBeTruthy();
      expect(result.value.decisionRecordId).toBe(51);
    }

    expect(createStudyPlanUseCase.execute).toHaveBeenCalledTimes(1);
    expect(repo.saveDecision).toHaveBeenCalledWith(
      expect.objectContaining({ decisionType: 'plan' })
    );
  });

  it('aplica plan en formato Steven y no cae en fallback reinforce_topic', async () => {
    vi.mocked(modelClient.decide).mockResolvedValue({
      decision_type: 'plan',
      plan: {
        items: [
          {
            type: 'lesson',
            id: 21,
            priority: 0.9,
          },
        ],
      },
      confidence: 0.85,
      model_version: 'qwen2.5:14b',
      payload: {},
    } as any);

    vi.mocked(createStudyPlanUseCase.execute).mockResolvedValue({
      ok: true,
      value: {
        id: 101,
        userId: 5,
        version: 2,
        state: 'active',
        source: 'orchestrator',
        createdAt: '2026-03-09T00:00:00.000Z',
        activatedAt: '2026-03-09T00:00:00.000Z',
        items: [],
      },
    });

    vi.mocked(repo.saveDecision).mockResolvedValue({
      id: 52,
      userId: 5,
      decisionType: 'plan',
      inputSnapshot: {},
      output: {},
      rationale: null,
      modelVersion: 'qwen2.5:14b',
      correlationId: null,
      createdAt: new Date('2026-03-09T00:00:00Z'),
    });

    const result = await useCase.execute({ userId: 5, courseId: 2 });

    expect(result.ok).toBe(true);
    expect(createStudyPlanUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 5,
        courseId: 2,
        items: [
          expect.objectContaining({
            contentRefType: 'lesson',
            contentRefId: 21,
            type: 'lesson',
            priority: 0.9,
            orderN: 1,
          }),
        ],
      })
    );
    expect(repo.findActiveLessonByTopic).not.toHaveBeenCalled();
    expect(repo.saveDecision).toHaveBeenCalledWith(
      expect.objectContaining({
        decisionType: 'plan',
        modelVersion: 'qwen2.5:14b',
      })
    );
  });

  it('aplica plan en formato completo con content_ref_type y metadata', async () => {
    vi.mocked(modelClient.decide).mockResolvedValue({
      decision_type: 'plan',
      plan: {
        items: [
          {
            content_ref_type: 'lesson',
            content_ref_id: 44,
            type: 'lesson',
            priority: 0.8,
            order_n: 2,
            due_at: '2026-06-08T00:00:00.000Z',
            metadata: { status: 'pending', rationale: 'Refuerzo' },
          },
        ],
      },
      model_version: 'qwen2.5:14b',
      payload: {},
    } as any);

    vi.mocked(createStudyPlanUseCase.execute).mockResolvedValue({
      ok: true,
      value: { id: 102, userId: 5, version: 2, state: 'active', source: 'orchestrator', items: [] },
    });

    const result = await useCase.execute({ userId: 5, courseId: 2 });

    expect(result.ok).toBe(true);
    expect(createStudyPlanUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            contentRefType: 'lesson',
            contentRefId: 44,
            orderN: 2,
            metadata: { status: 'pending', rationale: 'Refuerzo' },
          }),
        ],
      })
    );
  });

  it('ejecuta generate_content creando variante y asignacion', async () => {
    vi.mocked(modelClient.decide).mockResolvedValue({
      decision_type: 'generate_content',
      payload: { lessonId: 33, modo: 'explicar', query: 'Algebra basica' },
      rationale: 'Necesita explicacion personalizada',
    } as any);

    vi.mocked(repo.lessonBelongsToCourse).mockResolvedValue(true);
    vi.mocked(generateContentUseCase.execute).mockResolvedValue({
      ok: true,
      value: {
        variant: {
          id: 901,
          lessonId: 33,
          modality: 'ai_explicar',
          difficultyProfile: 'adaptive',
          readingLevel: 'B1',
          contentUrl: null,
          bodyHtml: '<p>Contenido</p>',
          estimatedMinutes: 5,
          isActive: true,
          version: 1,
        },
        assignment: {
          id: 301,
          userId: 5,
          lessonId: 33,
          contentVariantId: 901,
          assignedBy: 'orchestrator',
          rationale: 'Necesita explicacion personalizada',
          status: 'active',
        },
        orchestratorResponse: {
          route: 'numerico',
          latencyCls: 1,
          latencySp: 2,
          modelVersion: 'qwen2.5:1.5b',
        },
      },
    });

    const result = await useCase.execute({ userId: 5, courseId: 2 });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.realDecisionType).toBe('generate_content');
      expect(result.value.applied.generateContent).toEqual({
        lessonId: 33,
        variantId: 901,
        assignmentId: 301,
      });
    }
    expect(generateContentUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 5,
        lessonId: 33,
        modo: 'explicar',
        query: 'Algebra basica',
        assignedBy: 'orchestrator',
      })
    );
  });

  it('ejecuta reinforce_topic delegando a content', async () => {
    vi.mocked(modelClient.decide).mockResolvedValue({
      type: 'reinforce_topic',
      payload: { topicId: 12, strategy: 'practice_first' },
    });

    vi.mocked(repo.topicBelongsToCourse).mockResolvedValue(true);
    vi.mocked(repo.findActiveLessonByTopic).mockResolvedValue(33);
    vi.mocked(getContentVariantsByLessonUseCase.execute).mockResolvedValue({
      ok: true,
      value: [
        {
          id: 900,
          lessonId: 33,
          modality: 'reading',
          difficultyProfile: null,
          readingLevel: null,
          estimatedMinutes: 10,
          version: 1,
        },
      ],
    });
    vi.mocked(registerContentEventUseCase.execute).mockResolvedValue({
      ok: true,
      value: {
        id: 700,
        userId: 5,
        lessonId: 33,
        variantId: 900,
        eventType: 'interaction',
      },
    });

    const result = await useCase.execute({ userId: 5, courseId: 2 });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.applied.reinforceTopic?.topicId).toBe(12);
      expect(result.value.applied.reinforceTopic?.variantId).toBe(900);
    }

    expect(getContentVariantsByLessonUseCase.execute).toHaveBeenCalledWith(33);
    expect(registerContentEventUseCase.execute).toHaveBeenCalledTimes(1);
  });
});
