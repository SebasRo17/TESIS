import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetLessonsByCourseUseCase } from '../application/GetLessonsByCourseUseCase';
import { GetLessonsByTopicUseCase } from '../application/GetLessonsByTopicUseCase';
import { GetLessonDetailUseCase } from '../application/GetLessonDetailUseCase';
import { GetLessonPrerequisitesUseCase } from '../application/GetLessonPrerequisitesUseCase';
import type { LessonRepository } from '../domain/LessonPorts';
import type { Lesson, LessonPrerequisite } from '../domain/Lesson';
import { LessonNotFoundError } from '../domain/errors/LessonNotFoundError';

describe('Lessons Module', () => {
  let mockRepository: LessonRepository;

  const mockLesson: Lesson = {
    id: 1,
    courseId: 1,
    primaryTopicId: 2,
    title: 'Introducción a Funciones',
    canonicalSlug: 'intro-funciones',
    isActive: true,
    version: 1,
  };

  const mockPrerequisite: LessonPrerequisite = {
    id: 1,
    lessonId: 1,
    requiredTopicId: 1,
    minMastery: 0.75,
    topicName: 'Números Reales',
  };

  beforeEach(() => {
    mockRepository = {
      findByCourseId: vi.fn(),
      findById: vi.fn(),
      findByPrimaryTopicId: vi.fn(),
      findPrerequisitesByLessonId: vi.fn(),
      findDetailById: vi.fn(),
    };
  });

  describe('GetLessonsByCourseUseCase', () => {
    it('debería retornar las lecciones de un curso', async () => {
      const lessons = [mockLesson];
      vi.mocked(mockRepository.findByCourseId).mockResolvedValue(lessons);

      const useCase = new GetLessonsByCourseUseCase(mockRepository);
      const result = await useCase.execute(1);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(lessons);
      }
    });

    it('debería retornar error con courseId inválido', async () => {
      const useCase = new GetLessonsByCourseUseCase(mockRepository);
      const result = await useCase.execute(-1);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe('Course ID inválido');
      }
    });

    it('debería retornar error al consultar el repositorio', async () => {
      vi.mocked(mockRepository.findByCourseId).mockRejectedValue(new Error('DB error'));

      const useCase = new GetLessonsByCourseUseCase(mockRepository);
      const result = await useCase.execute(1);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('Error al obtener lecciones');
      }
    });
  });

  describe('GetLessonsByTopicUseCase', () => {
    it('debería retornar las lecciones de un tema', async () => {
      const lessons = [mockLesson];
      vi.mocked(mockRepository.findByPrimaryTopicId).mockResolvedValue(lessons);

      const useCase = new GetLessonsByTopicUseCase(mockRepository);
      const result = await useCase.execute(2);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(lessons);
      }
    });

    it('debería retornar error con topicId inválido', async () => {
      const useCase = new GetLessonsByTopicUseCase(mockRepository);
      const result = await useCase.execute(0);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe('Topic ID inválido');
      }
    });
  });

  describe('GetLessonDetailUseCase', () => {
    it('debería retornar el detalle de una lección', async () => {
      const detail = { ...mockLesson, courseTitle: 'Matemática', topicName: 'Funciones' };
      vi.mocked(mockRepository.findDetailById).mockResolvedValue(detail);

      const useCase = new GetLessonDetailUseCase(mockRepository);
      const result = await useCase.execute(1);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(detail);
      }
    });

    it('debería retornar error LessonNotFoundError si la lección no existe', async () => {
      vi.mocked(mockRepository.findDetailById).mockResolvedValue(null);

      const useCase = new GetLessonDetailUseCase(mockRepository);
      const result = await useCase.execute(999);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(LessonNotFoundError);
      }
    });

    it('debería retornar error con lessonId inválido', async () => {
      const useCase = new GetLessonDetailUseCase(mockRepository);
      const result = await useCase.execute(-1);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe('Lesson ID inválido');
      }
    });
  });

  describe('GetLessonPrerequisitesUseCase', () => {
    it('debería retornar los prerequisitos de una lección', async () => {
      const prerequisites = [mockPrerequisite];
      vi.mocked(mockRepository.findById).mockResolvedValue(mockLesson);
      vi.mocked(mockRepository.findPrerequisitesByLessonId).mockResolvedValue(prerequisites);

      const useCase = new GetLessonPrerequisitesUseCase(mockRepository);
      const result = await useCase.execute(1);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(prerequisites);
      }
    });

    it('debería retornar error si la lección no existe', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      const useCase = new GetLessonPrerequisitesUseCase(mockRepository);
      const result = await useCase.execute(999);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(LessonNotFoundError);
      }
    });

    it('debería retornar lista vacía si no hay prerequisitos', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(mockLesson);
      vi.mocked(mockRepository.findPrerequisitesByLessonId).mockResolvedValue([]);

      const useCase = new GetLessonPrerequisitesUseCase(mockRepository);
      const result = await useCase.execute(1);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });
  });
});
