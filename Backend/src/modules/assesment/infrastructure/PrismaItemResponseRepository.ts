import type { PrismaClient } from '@prisma/client';
import type {
  IItemResponseRepository,
  CreateItemResponseData,
  UpdateItemResponseData,
} from '../domain/AssessmentPorts';
import type { ItemResponse } from '../domain/ExamAttempt';

export class PrismaItemResponseRepository implements IItemResponseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<ItemResponse | null> {
    const response = await this.prisma.item_responses.findUnique({
      where: { id },
    });

    return response ? this.toDomain(response) : null;
  }

  async findByAttemptId(attemptId: number): Promise<ItemResponse[]> {
    const responses = await this.prisma.item_responses.findMany({
      where: { attempt_id: attemptId },
      orderBy: { created_at: 'asc' },
    });

    return responses.map(this.toDomain);
  }

  async findByAttemptAndItem(
    attemptId: number,
    itemId: number
  ): Promise<ItemResponse | null> {
    const response = await this.prisma.item_responses.findFirst({
      where: {
        attempt_id: attemptId,
        item_id: itemId,
      },
    });

    return response ? this.toDomain(response) : null;
  }

  async create(data: CreateItemResponseData): Promise<ItemResponse> {
    const response = await this.prisma.item_responses.create({
      data: {
        attempt_id: data.attemptId,
        item_id: data.itemId,
        answer: data.answer,
        is_correct: data.isCorrect ?? null,
        time_spent_sec: data.timeSpentSec ?? null,
        hints_used: data.hintsUsed ?? 0,
        awarded_score: data.awardedScore ?? null,
      },
    });

    return this.toDomain(response);
  }

  async update(id: number, data: UpdateItemResponseData): Promise<ItemResponse> {
    const response = await this.prisma.item_responses.update({
      where: { id },
      data: {
        ...(data.answer !== undefined && { answer: data.answer }),
        ...(data.isCorrect !== undefined && { is_correct: data.isCorrect }),
        ...(data.timeSpentSec !== undefined && { time_spent_sec: data.timeSpentSec }),
        ...(data.awardedScore !== undefined && { awarded_score: data.awardedScore }),
      },
    });

    return this.toDomain(response);
  }

  async countByAttemptId(attemptId: number): Promise<number> {
    return await this.prisma.item_responses.count({
      where: { attempt_id: attemptId },
    });
  }

  async countCorrectByAttemptId(attemptId: number): Promise<number> {
    return await this.prisma.item_responses.count({
      where: {
        attempt_id: attemptId,
        is_correct: true,
      },
    });
  }

  private toDomain(raw: any): ItemResponse {
    return {
      id: raw.id,
      attemptId: raw.attempt_id,
      itemId: raw.item_id,
      answer: raw.answer ?? null,
      isCorrect: raw.is_correct !== null ? Boolean(raw.is_correct) : null,
      timeSpentSec: raw.time_spent_sec,
      hintsUsed: raw.hints_used,
      awardedScore: raw.awarded_score ? Number(raw.awarded_score) : null,
      createdAt: raw.created_at,
    };
  }
}
