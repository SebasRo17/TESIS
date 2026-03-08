import { PrismaClient } from '@prisma/client';
import type { ContentRepository, CreateContentEventInput } from '../domain/ContentPorts';
import type { ContentEvent, ContentPrerequisite, ContentVariant, LessonReference } from '../domain/Content';

export class PrismaContentRepository implements ContentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findLessonReferenceById(lessonId: number): Promise<LessonReference | null> {
    const row = await this.prisma.lessons.findUnique({
      where: { id: lessonId },
      select: { id: true, is_active: true },
    });

    if (!row) return null;

    return {
      id: row.id,
      isActive: row.is_active,
    };
  }

  async findActiveVariantsByLessonId(lessonId: number): Promise<ContentVariant[]> {
    const rows = await this.prisma.content_variants.findMany({
      where: {
        lesson_id: lessonId,
        is_active: true,
      },
      orderBy: [{ version: 'desc' }, { id: 'asc' }],
    });

    return rows.map((row) => this.mapVariant(row));
  }

  async findVariantById(variantId: number): Promise<ContentVariant | null> {
    const row = await this.prisma.content_variants.findUnique({
      where: { id: variantId },
    });

    return row ? this.mapVariant(row) : null;
  }

  async createContentEvent(input: CreateContentEventInput): Promise<ContentEvent> {
    const variant = await this.prisma.content_variants.findUnique({
      where: { id: input.contentVariantId },
      select: { lesson_id: true },
    });

    const row = await this.prisma.content_events.create({
      data: {
        user_id: input.userId,
        content_variant_id: input.contentVariantId,
        lesson_id: variant?.lesson_id ?? null,
        event_type: input.eventType,
        event_value: input.eventValue as any,
      },
    });

    return {
      id: row.id,
      userId: row.user_id,
      lessonId: row.lesson_id,
      contentVariantId: row.content_variant_id ?? input.contentVariantId,
      eventType: row.event_type,
      eventValue: row.event_value,
    };
  }

  async findPrerequisitesByLessonId(lessonId: number): Promise<ContentPrerequisite[]> {
    const rows = await this.prisma.content_prereqs.findMany({
      where: { lesson_id: lessonId },
      include: {
        topics: {
          select: { name: true },
        },
      },
      orderBy: [{ id: 'asc' }],
    });

    return rows.map((row) => ({
      id: row.id,
      lessonId: row.lesson_id,
      requiredTopicId: row.required_topic_id,
      minMastery: Number(row.min_mastery),
      topicName: row.topics?.name ?? null,
    }));
  }

  private mapVariant(row: any): ContentVariant {
    return {
      id: row.id,
      lessonId: row.lesson_id,
      modality: row.modality,
      difficultyProfile: row.difficulty_profile,
      readingLevel: row.reading_level,
      contentUrl: row.content_url,
      bodyHtml: row.body_html,
      estimatedMinutes: row.est_minutes,
      isActive: row.is_active,
      version: row.version,
    };
  }
}
