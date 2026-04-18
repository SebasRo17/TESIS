import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FinishExamAttemptUseCase } from '../application/FinishExamAttemptUseCase';
import {
  ExamAttemptNotFoundError,
  ExamAttemptNotOwnedError,
  ExamAttemptAlreadyCompletedError,
} from '../domain/errors/AssessmentErrors';
import type {
  IExamAttemptRepository,
  IItemResponseRepository,
  IExamRepository,
} from '../domain/AssessmentPorts';
import type { ExamAttempt } from '../domain/ExamAttempt';
import type { ExamWithItems } from '../domain/Exam';

describe('FinishExamAttemptUseCase', () => {
  let useCase: FinishExamAttemptUseCase;
  let mockExamAttemptRepository: IExamAttemptRepository;
  let mockItemResponseRepository: IItemResponseRepository;
  let mockExamRepository: IExamRepository;

  beforeEach(() => {
    mockExamAttemptRepository = {
      findById: vi.fn(),
      findByIdWithDetails: vi.fn(),
      findByUserId: vi.fn(),
      findByUserAndExam: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };

    mockItemResponseRepository = {
      findById: vi.fn(),
      findByAttemptId: vi.fn(),
      findByAttemptAndItem: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      countByAttemptId: vi.fn(),
      countCorrectByAttemptId: vi.fn(),
    };

    mockExamRepository = {
      findById: vi.fn(),
      findByCourseId: vi.fn(),
      findByIdWithItems: vi.fn(),
    };

    useCase = new FinishExamAttemptUseCase(
      mockExamAttemptRepository,
      mockItemResponseRepository,
      mockExamRepository
    );
  });

  it('debe finalizar un intento exitosamente y calcular métricas', async () => {
    const mockAttempt: ExamAttempt = {
      id: 1,
      userId: 10,
      examId: 1,
      startedAt: new Date(Date.now() - 3600000), // 1 hora atrás
      completedAt: null,
      durationSec: null,
      scoreRaw: null,
      scoreNorm: null,
      metadata: null,
    };

    const mockExam: ExamWithItems = {
      id: 1,
      title: 'Examen',
      mode: 'diagnostic' as any,
      timeLimitSec: 3600,
      version: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        { itemId: 1, orderN: 1, weight: 1.0 },
        { itemId: 2, orderN: 2, weight: 1.0 },
        { itemId: 3, orderN: 3, weight: 1.0 },
      ],
    };

    const mockResponses = [
      {
        id: 1,
        attemptId: 1,
        itemId: 1,
        answer: 'A',
        isCorrect: true,
        timeSpentSec: 120,
        hintsUsed: 0,
        awardedScore: 1.0,
        createdAt: new Date(),
      },
      {
        id: 2,
        attemptId: 1,
        itemId: 2,
        answer: 'B',
        isCorrect: false,
        timeSpentSec: 90,
        hintsUsed: 1,
        awardedScore: 0,
        createdAt: new Date(),
      },
      {
        id: 3,
        attemptId: 1,
        itemId: 3,
        answer: 'C',
        isCorrect: true,
        timeSpentSec: 150,
        hintsUsed: 0,
        awardedScore: 1.0,
        createdAt: new Date(),
      },
    ];

    const mockUpdatedAttempt: ExamAttempt = {
      ...mockAttempt,
      completedAt: new Date(),
      durationSec: 3600,
      scoreRaw: 2.0,
      scoreNorm: 66.67,
      metadata: {
        totalItems: 3,
        answeredItems: 3,
        correctAnswers: 2,
        accuracy: 0.667,
      },
    };

    vi.mocked(mockExamAttemptRepository.findById).mockResolvedValue(mockAttempt);
    vi.mocked(mockExamRepository.findByIdWithItems).mockResolvedValue(mockExam);
    vi.mocked(mockItemResponseRepository.findByAttemptId).mockResolvedValue(mockResponses);
    vi.mocked(mockExamAttemptRepository.update).mockResolvedValue(mockUpdatedAttempt);

    const result = await useCase.execute(1, 10);

    expect(result.completedAt).not.toBeNull();
    expect(result.scoreRaw).toBe(2.0);
    expect(mockExamAttemptRepository.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        completedAt: expect.any(Date),
        scoreRaw: expect.any(Number),
        scoreNorm: expect.any(Number),
      })
    );
  });

  it('debe lanzar ExamAttemptNotFoundError si el intento no existe', async () => {
    vi.mocked(mockExamAttemptRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute(999, 10)).rejects.toThrow(ExamAttemptNotFoundError);
  });

  it('debe lanzar ExamAttemptNotOwnedError si el intento no pertenece al usuario', async () => {
    const mockAttempt: ExamAttempt = {
      id: 1,
      userId: 999,
      examId: 1,
      startedAt: new Date(),
      completedAt: null,
      durationSec: null,
      scoreRaw: null,
      scoreNorm: null,
      metadata: null,
    };

    vi.mocked(mockExamAttemptRepository.findById).mockResolvedValue(mockAttempt);

    await expect(useCase.execute(1, 10)).rejects.toThrow(ExamAttemptNotOwnedError);
  });

  it('debe lanzar ExamAttemptAlreadyCompletedError si el intento ya está completado', async () => {
    const mockAttempt: ExamAttempt = {
      id: 1,
      userId: 10,
      examId: 1,
      startedAt: new Date(),
      completedAt: new Date(),
      durationSec: 3600,
      scoreRaw: 80,
      scoreNorm: 80,
      metadata: null,
    };

    vi.mocked(mockExamAttemptRepository.findById).mockResolvedValue(mockAttempt);

    await expect(useCase.execute(1, 10)).rejects.toThrow(ExamAttemptAlreadyCompletedError);
  });
});
