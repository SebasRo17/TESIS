import type { PrismaClient } from '@prisma/client';
import type { IItemRepository } from '../domain/AssessmentPorts';
import type { AnswerKey, Item, ItemOption, ItemType } from '../domain/Item';

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

    return items.map((item) => this.toDomain(item));
  }

  async findByTopicId(topicId: number, activeOnly = true): Promise<Item[]> {
    const items = await this.prisma.items.findMany({
      where: {
        topic_id: topicId,
        ...(activeOnly && { is_active: true }),
      },
      orderBy: { created_at: 'desc' },
    });

    return items.map((item) => this.toDomain(item));
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
    const type = raw.type as ItemType;

    return {
      id: raw.id,
      topicId: raw.topic_id,
      type,
      stem: raw.stem,
      options: this.normalizeOptions(raw.options),
      answerKey: this.normalizeAnswerKey(raw.answer_key, type),
      explanation: raw.explanation,
      difficulty: raw.difficulty,
      source: raw.source,
      version: raw.version,
      isActive: Boolean(raw.is_active),
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
  }

  private normalizeOptions(options: unknown): ItemOption[] | null {
    if (!options) {
      return null;
    }

    if (Array.isArray(options)) {
      return options.map((option, index) => {
        if (typeof option === 'string') {
          return {
            id: this.optionIdFromIndex(index),
            text: option,
          };
        }

        if (option && typeof option === 'object') {
          const record = option as Record<string, unknown>;
          return {
            id: String(record.id ?? this.optionIdFromIndex(index)),
            text: String(record.text ?? record.label ?? record.value ?? ''),
            ...(typeof record.isCorrect === 'boolean' && { isCorrect: record.isCorrect }),
          };
        }

        return {
          id: this.optionIdFromIndex(index),
          text: String(option),
        };
      });
    }

    if (typeof options === 'object') {
      return Object.entries(options as Record<string, unknown>).map(([id, text]) => ({
        id,
        text: String(text),
      }));
    }

    return null;
  }

  private normalizeAnswerKey(answerKey: unknown, type: ItemType): AnswerKey {
    if (!answerKey || typeof answerKey !== 'object') {
      return {} as AnswerKey;
    }

    const record = answerKey as Record<string, unknown>;
    const rawCorrect = record.correctAnswer ?? record.correct;
    const correctValues = Array.isArray(rawCorrect)
      ? rawCorrect.map((value) => String(value))
      : rawCorrect != null
        ? [String(rawCorrect)]
        : [];

    const normalized: Partial<AnswerKey> = {};
    if (type === 'multi_choice') {
      normalized.correctAnswer = correctValues;
    } else {
      const firstCorrectValue = correctValues[0];
      if (firstCorrectValue !== undefined) {
        normalized.correctAnswer = firstCorrectValue;
      }
    }

    const acceptedAnswers = record.acceptedAnswers ?? record.accepted;
    if (Array.isArray(acceptedAnswers)) {
      normalized.acceptedAnswers = acceptedAnswers.map((value) => String(value));
    }

    if (typeof record.caseSensitive === 'boolean') {
      normalized.caseSensitive = record.caseSensitive;
    }

    return normalized as AnswerKey;
  }

  private optionIdFromIndex(index: number): string {
    return String.fromCharCode(65 + index);
  }
}
