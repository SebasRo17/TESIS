import type { PrismaClient } from '@prisma/client';
import type { ILessonTopicLookup } from '../application/CompleteLessonProgressUseCase';

export class PrismaLessonTopicLookup implements ILessonTopicLookup {
  constructor(private readonly prisma: PrismaClient) {}

  async findPrimaryTopicId(lessonId: number): Promise<number | null> {
    const lesson = await this.prisma.lessons.findUnique({
      where: { id: lessonId },
      select: { primary_topic_id: true },
    });
    return lesson?.primary_topic_id ?? null;
  }
}
