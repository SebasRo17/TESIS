import type { IExamAttemptRepository, IItemRepository } from '../domain/AssessmentPorts';
import {
  ExamAttemptNotFoundError,
  ExamAttemptNotOwnedError,
} from '../domain/errors/AssessmentErrors';

export interface ReviewOption {
  id: string;
  text: string;
}

export interface ReviewResponse {
  itemId: number;
  topicId: number;
  type: string;
  stem: string;
  options: ReviewOption[] | null;
  explanation: string | null;
  difficulty: number;
  studentAnswer: any;
  correctAnswer: any;
  isCorrect: boolean | null;
  awardedScore: number | null;
  timeSpentSec: number | null;
}

export interface ExamAttemptReview {
  attemptId: number;
  userId: number;
  exam: {
    id: number;
    title: string;
    mode: string;
  };
  startedAt: string;
  completedAt: string | null;
  durationSec: number | null;
  scoreRaw: number | null;
  scoreNorm: number | null;
  totalItems: number;
  answeredItems: number;
  correctAnswers: number;
  accuracy: number;
  responses: ReviewResponse[];
}

/**
 * Caso de uso: Obtener revision completa de un intento de examen
 * Devuelve cada pregunta con su enunciado, opciones con texto,
 * respuesta del estudiante, respuesta correcta y explicacion
 */
export class GetExamAttemptReviewUseCase {
  constructor(
    private readonly examAttemptRepository: IExamAttemptRepository,
    private readonly itemRepository: IItemRepository
  ) {}

  async execute(attemptId: number, userId: number): Promise<ExamAttemptReview> {
    const attempt = await this.examAttemptRepository.findByIdWithDetails(attemptId);
    if (!attempt) {
      throw new ExamAttemptNotFoundError(attemptId);
    }

    if (attempt.userId !== userId) {
      throw new ExamAttemptNotOwnedError(attemptId, userId);
    }

    // Obtener los items completos con opciones y answer_key
    const itemIds = attempt.responses.map((r) => r.itemId);
    const items = await this.itemRepository.findByIds(itemIds);
    const itemMap = new Map(items.map((item) => [item.id, item]));

    const responses: ReviewResponse[] = attempt.responses.map((response) => {
      const item = itemMap.get(response.itemId);

      return {
        itemId: response.itemId,
        topicId: item?.topicId ?? 0,
        type: item?.type ?? 'unknown',
        stem: item?.stem ?? '',
        options: item?.options?.map((o) => ({ id: o.id, text: o.text })) ?? null,
        explanation: item?.explanation ?? null,
        difficulty: item?.difficulty ?? 0,
        studentAnswer: response.answer,
        correctAnswer: item?.answerKey?.correctAnswer ?? null,
        isCorrect: response.isCorrect,
        awardedScore: response.awardedScore,
        timeSpentSec: response.timeSpentSec,
      };
    });

    const correctAnswers = responses.filter((r) => r.isCorrect === true).length;
    const answeredItems = responses.length;

    return {
      attemptId: attempt.id,
      userId: attempt.userId,
      exam: attempt.exam,
      startedAt: attempt.startedAt.toISOString(),
      completedAt: attempt.completedAt?.toISOString() ?? null,
      durationSec: attempt.durationSec,
      scoreRaw: attempt.scoreRaw,
      scoreNorm: attempt.scoreNorm,
      totalItems: answeredItems,
      answeredItems,
      correctAnswers,
      accuracy: answeredItems > 0 ? Math.round((correctAnswers / answeredItems) * 1000) / 1000 : 0,
      responses,
    };
  }
}
