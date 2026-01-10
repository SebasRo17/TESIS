import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StartExamAttemptUseCase } from '../application/StartExamAttemptUseCase';
import { ExamNotFoundError, ExamNotActiveError } from '../domain/errors/AssessmentErrors';
import type { IExamRepository, IExamAttemptRepository } from '../domain/AssessmentPorts';
import type { Exam } from '../domain/Exam';
import type { ExamAttempt } from '../domain/ExamAttempt';

describe('StartExamAttemptUseCase', () => {
  let useCase: StartExamAttemptUseCase;
  let mockExamRepository: IExamRepository;
  let mockExamAttemptRepository: IExamAttemptRepository;

  beforeEach(() => {
    mockExamRepository = {
      findById: vi.fn(),
      findByCourseId: vi.fn(),
      findByIdWithItems: vi.fn(),
    };

    mockExamAttemptRepository = {
      findById: vi.fn(),
      findByIdWithDetails: vi.fn(),
      findByUserId: vi.fn(),
      findByUserAndExam: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };

    useCase = new StartExamAttemptUseCase(mockExamRepository, mockExamAttemptRepository);
  });

  it('debe crear un intento de examen exitosamente', async () => {
    const mockExam: Exam = {
      id: 1,
      title: 'Examen de Matemáticas',
      mode: 'diagnostic' as any,
      timeLimitSec: 3600,
      version: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockAttempt: ExamAttempt = {
      id: 1,
      userId: 10,
      examId: 1,
      startedAt: new Date(),
      completedAt: null,
      durationSec: null,
      scoreRaw: null,
      scoreNorm: null,
      metadata: null,
    };

    vi.mocked(mockExamRepository.findById).mockResolvedValue(mockExam);
    vi.mocked(mockExamAttemptRepository.create).mockResolvedValue(mockAttempt);

    const result = await useCase.execute(1, 10);

    expect(result).toEqual(mockAttempt);
    expect(mockExamRepository.findById).toHaveBeenCalledWith(1);
    expect(mockExamAttemptRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 10,
        examId: 1,
      })
    );
  });

  it('debe lanzar ExamNotFoundError si el examen no existe', async () => {
    vi.mocked(mockExamRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute(999, 10)).rejects.toThrow(ExamNotFoundError);
    expect(mockExamRepository.findById).toHaveBeenCalledWith(999);
    expect(mockExamAttemptRepository.create).not.toHaveBeenCalled();
  });

  it('debe lanzar ExamNotActiveError si el examen no está activo', async () => {
    const mockExam: Exam = {
      id: 1,
      title: 'Examen Inactivo',
      mode: 'diagnostic' as any,
      timeLimitSec: 3600,
      version: 1,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockExamRepository.findById).mockResolvedValue(mockExam);

    await expect(useCase.execute(1, 10)).rejects.toThrow(ExamNotActiveError);
    expect(mockExamRepository.findById).toHaveBeenCalledWith(1);
    expect(mockExamAttemptRepository.create).not.toHaveBeenCalled();
  });
});
