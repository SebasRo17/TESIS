import type { ItemResponse } from '../domain/ExamAttempt';
import type { Item, ItemType } from '../domain/Item';
import type {
  IExamAttemptRepository,
  IItemRepository,
  IItemResponseRepository,
  IExamRepository,
} from '../domain/AssessmentPorts';
import {
  ExamAttemptNotFoundError,
  ExamAttemptAlreadyCompletedError,
  ExamAttemptNotOwnedError,
  ItemNotFoundError,
  ItemNotInExamError,
  ItemResponseAlreadyExistsError,
} from '../domain/errors/AssessmentErrors';

/**
 * Caso de uso: Registrar respuesta a un ítem
 * Registra la respuesta del usuario a un ítem dentro de un intento
 */
export class SubmitItemResponseUseCase {
  constructor(
    private readonly examAttemptRepository: IExamAttemptRepository,
    private readonly itemRepository: IItemRepository,
    private readonly itemResponseRepository: IItemResponseRepository,
    private readonly examRepository: IExamRepository
  ) {}

  async execute(
    attemptId: number,
    itemId: number,
    answer: any,
    userId: number,
    timeSpentSec?: number,
    hintsUsed?: number
  ): Promise<ItemResponse> {
    // Validar que el intento existe
    const attempt = await this.examAttemptRepository.findById(attemptId);
    if (!attempt) {
      throw new ExamAttemptNotFoundError(attemptId);
    }

    // Validar que el intento pertenece al usuario
    if (attempt.userId !== userId) {
      throw new ExamAttemptNotOwnedError(attemptId, userId);
    }

    // Validar que el intento no está completado
    if (attempt.completedAt) {
      throw new ExamAttemptAlreadyCompletedError(attemptId);
    }

    // Validar que el ítem existe
    const item = await this.itemRepository.findById(itemId);
    if (!item) {
      throw new ItemNotFoundError(itemId);
    }

    // Validar que el ítem pertenece al examen
    const examWithItems = await this.examRepository.findByIdWithItems(attempt.examId);
    if (!examWithItems) {
      throw new ExamAttemptNotFoundError(attemptId);
    }

    const itemBelongsToExam = examWithItems.items.some((ei) => ei.itemId === itemId);
    if (!itemBelongsToExam) {
      throw new ItemNotInExamError(itemId, attempt.examId);
    }

    // Verificar que no exista ya una respuesta para este ítem
    const existingResponse = await this.itemResponseRepository.findByAttemptAndItem(
      attemptId,
      itemId
    );
    if (existingResponse) {
      throw new ItemResponseAlreadyExistsError(attemptId, itemId);
    }

    // Evaluar si la respuesta es correcta
    const isCorrect = this.evaluateAnswer(item, answer);

    // Calcular puntaje otorgado
    const examItem = examWithItems.items.find((ei) => ei.itemId === itemId);
    const awardedScore = isCorrect ? (examItem?.weight ?? 1.0) : 0;

    // Crear la respuesta
    const response = await this.itemResponseRepository.create({
      attemptId,
      itemId,
      answer,
      isCorrect,
      timeSpentSec: timeSpentSec ?? null,
      hintsUsed: hintsUsed ?? 0,
      awardedScore,
    });

    return response;
  }

  /**
   * Evalúa si la respuesta del usuario es correcta
   */
  private evaluateAnswer(item: Item, answer: any): boolean {
    const { type, answerKey } = item;

    if (!answerKey || !answerKey.correctAnswer) {
      return false;
    }

    try {
      switch (type) {
        case 'single_choice':
          return this.evaluateSingleChoice(answerKey.correctAnswer as string, answer);

        case 'multi_choice':
          return this.evaluateMultiChoice(answerKey.correctAnswer as string[], answer);

        case 'open':
          return this.evaluateOpenAnswer(answerKey, answer);

        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  private evaluateSingleChoice(correctAnswer: string, userAnswer: any): boolean {
    if (typeof userAnswer !== 'string') {
      return false;
    }
    return userAnswer === correctAnswer;
  }

  private evaluateMultiChoice(correctAnswers: string[], userAnswers: any): boolean {
    if (!Array.isArray(userAnswers)) {
      return false;
    }

    if (userAnswers.length !== correctAnswers.length) {
      return false;
    }

    const sortedCorrect = [...correctAnswers].sort();
    const sortedUser = [...userAnswers].sort();

    return sortedCorrect.every((ans, idx) => ans === sortedUser[idx]);
  }

  private evaluateOpenAnswer(answerKey: any, userAnswer: any): boolean {
    if (typeof userAnswer !== 'string') {
      return false;
    }

    const correctAnswer = answerKey.correctAnswer as string;
    const acceptedAnswers = answerKey.acceptedAnswers || [];
    const caseSensitive = answerKey.caseSensitive ?? false;

    const normalizedUserAnswer = caseSensitive
      ? userAnswer.trim()
      : userAnswer.trim().toLowerCase();

    const normalizedCorrect = caseSensitive
      ? correctAnswer.trim()
      : correctAnswer.trim().toLowerCase();

    if (normalizedUserAnswer === normalizedCorrect) {
      return true;
    }

    // Verificar respuestas aceptadas
    for (const accepted of acceptedAnswers) {
      const normalizedAccepted = caseSensitive
        ? accepted.trim()
        : accepted.trim().toLowerCase();

      if (normalizedUserAnswer === normalizedAccepted) {
        return true;
      }
    }

    return false;
  }
}
