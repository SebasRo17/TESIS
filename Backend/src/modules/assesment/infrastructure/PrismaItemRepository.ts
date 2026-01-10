import type { PrismaClient } from '@prisma/client';
import type { IItemRepository } from '../domain/AssessmentPorts';
import type { Item, ItemType } from '../domain/Item';

export class PrismaItemRepository implements IItemRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<Item | null> {
    const item = await this.prisma.items.findUnique({
      where: { id },
    });

    return item ? this.toDomain(item) : null;
  }

  async findByIds(ids: number[]): Promise<Item[]> {
    const items = await this.prisma.items.findMany({
      where: { id: { in: ids } },
    });

    return items.map(this.toDomain);
  }

  async findByTopicId(topicId: number, activeOnly = true): Promise<Item[]> {
    const items = await this.prisma.items.findMany({
      where: {
        topic_id: topicId,
        ...(activeOnly && { is_active: true }),
      },
      orderBy: { created_at: 'desc' },
    });

    return items.map(this.toDomain);
  }

  async findByExamId(examId: number): Promise<Item[]> {
    const examItems = await this.prisma.exam_items.findMany({
      where: { exam_id: examId },
      include: { items: true },
      orderBy: { order_n: 'asc' },
    });

    return examItems.map((ei) => this.toDomain(ei.items));
  }

  private toDomain(raw: any): Item {
    return {
      id: raw.id,
      topicId: raw.topic_id,
      type: raw.type as ItemType,
      stem: raw.stem,
      options: (raw.options as any) ?? null,
      answerKey: (raw.answer_key as any) ?? {},
      explanation: raw.explanation,
      difficulty: raw.difficulty,
      source: raw.source,
      version: raw.version,
      isActive: Boolean(raw.is_active),
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
  }
}
