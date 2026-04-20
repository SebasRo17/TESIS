import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetExamItemsUseCase } from '../application/GetExamItemsUseCase';
import {
  ExamNotActiveError,
  ExamNotFoundError,
  ItemNotFoundError,
} from '../domain/errors/AssessmentErrors';
import type { IExamRepository, IItemRepository } from '../domain/AssessmentPorts';
import { ExamMode, type ExamWithItems } from '../domain/Exam';
import { ItemType, type Item } from '../domain/Item';

describe('GetExamItemsUseCase', () => {
  let useCase: GetExamItemsUseCase;
  let mockExamRepository: IExamRepository;
  let mockItemRepository: IItemRepository;

  beforeEach(() => {
    mockExamRepository = {
      findById: vi.fn(),
      findByCourseId: vi.fn(),
      findByIdWithItems: vi.fn(),
    };

    mockItemRepository = {
      findById: vi.fn(),
      findByIds: vi.fn(),
      findByTopicId: vi.fn(),
      findByExamId: vi.fn(),
    };

    useCase = new GetExamItemsUseCase(mockExamRepository, mockItemRepository);
  });

  it('devuelve los ítems públicos del examen en el orden definido', async () => {
    const now = new Date();
    const mockExam: ExamWithItems = {
      id: 1,
      title: 'Simulador Álgebra',
      mode: ExamMode.MOCK,
      timeLimitSec: 1800,
      version: 2,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      items: [
        { itemId: 11, orderN: 1, weight: 1.5 },
        { itemId: 22, orderN: 2, weight: 2 },
      ],
    };

    const mockItems: Item[] = [
      {
        id: 22,
        topicId: 5,
        type: ItemType.MULTI_CHOICE,
        stem: 'Selecciona los polinomios',
        options: [
          { id: 'a', text: 'x^2 + 1', isCorrect: true },
          { id: 'b', text: '1/x', isCorrect: false },
        ],
        answerKey: { correctAnswer: ['a'] },
        explanation: 'Porque ...',
        difficulty: 0.6,
        source: 'seed',
        version: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 11,
        topicId: 3,
        type: ItemType.SINGLE_CHOICE,
        stem: '¿Cuánto es 2 + 2?',
        options: [
          { id: 'a', text: '3', isCorrect: false },
          { id: 'b', text: '4', isCorrect: true },
        ],
        answerKey: { correctAnswer: 'b' },
        explanation: 'Suma básica',
        difficulty: 0.2,
        source: 'seed',
        version: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ];

    vi.mocked(mockExamRepository.findByIdWithItems).mockResolvedValue(mockExam);
    vi.mocked(mockItemRepository.findByIds).mockResolvedValue(mockItems);

    const result = await useCase.execute(1);

    expect(result).toEqual({
      id: 1,
      title: 'Simulador Álgebra',
      mode: 'mock',
      timeLimitSec: 1800,
      version: 2,
      items: [
        {
          id: 11,
          topicId: 3,
          type: 'single_choice',
          stem: '¿Cuánto es 2 + 2?',
          options: [
            { id: 'a', text: '3' },
            { id: 'b', text: '4' },
          ],
          difficulty: 0.2,
          orderN: 1,
          weight: 1.5,
        },
        {
          id: 22,
          topicId: 5,
          type: 'multi_choice',
          stem: 'Selecciona los polinomios',
          options: [
            { id: 'a', text: 'x^2 + 1' },
            { id: 'b', text: '1/x' },
          ],
          difficulty: 0.6,
          orderN: 2,
          weight: 2,
        },
      ],
    });
    expect(mockItemRepository.findByIds).toHaveBeenCalledWith([11, 22]);
  });

  it('lanza ExamNotFoundError cuando el examen no existe', async () => {
    vi.mocked(mockExamRepository.findByIdWithItems).mockResolvedValue(null);

    await expect(useCase.execute(99)).rejects.toThrow(ExamNotFoundError);
    expect(mockItemRepository.findByIds).not.toHaveBeenCalled();
  });

  it('lanza ExamNotActiveError cuando el examen no está activo', async () => {
    const now = new Date();
    const mockExam: ExamWithItems = {
      id: 1,
      title: 'Examen inactivo',
      mode: ExamMode.MOCK,
      timeLimitSec: 1800,
      version: 1,
      isActive: false,
      createdAt: now,
      updatedAt: now,
      items: [],
    };

    vi.mocked(mockExamRepository.findByIdWithItems).mockResolvedValue(mockExam);

    await expect(useCase.execute(1)).rejects.toThrow(ExamNotActiveError);
    expect(mockItemRepository.findByIds).not.toHaveBeenCalled();
  });

  it('lanza ItemNotFoundError si el examen referencia un ítem inexistente', async () => {
    const now = new Date();
    const mockExam: ExamWithItems = {
      id: 1,
      title: 'Simulador inconsistente',
      mode: ExamMode.MOCK,
      timeLimitSec: 1800,
      version: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      items: [{ itemId: 77, orderN: 1, weight: 1 }],
    };

    vi.mocked(mockExamRepository.findByIdWithItems).mockResolvedValue(mockExam);
    vi.mocked(mockItemRepository.findByIds).mockResolvedValue([]);

    await expect(useCase.execute(1)).rejects.toThrow(ItemNotFoundError);
  });
});
