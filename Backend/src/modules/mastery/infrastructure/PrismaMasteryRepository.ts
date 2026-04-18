import { PrismaClient } from '@prisma/client';
import type {
  ActiveCourse,
  ActiveTopic,
  MasteryJournalEntry,
  UserTopicMasterySnapshot,
} from '../domain/Mastery';
import type { MasteryRepository, MasteryUpdateInput } from '../domain/MasteryPorts';

const MIN_MASTERY = 0;
const MAX_MASTERY = 1;

function clampMastery(value: number): number {
  if (value < MIN_MASTERY) return MIN_MASTERY;
  if (value > MAX_MASTERY) return MAX_MASTERY;
  return value;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export class PrismaMasteryRepository implements MasteryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findActiveTopicById(topicId: number): Promise<ActiveTopic | null> {
    const topic = await this.prisma.topics.findFirst({
      where: {
        id: topicId,
        is_active: true,
      },
      select: {
        id: true,
        course_id: true,
        name: true,
      },
    });

    if (!topic) return null;

    return {
      id: topic.id,
      courseId: topic.course_id,
      name: topic.name,
    };
  }

  async findActiveCourseById(courseId: number): Promise<ActiveCourse | null> {
    const course = await this.prisma.courses.findFirst({
      where: {
        id: courseId,
        status: 'active',
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (!course) return null;

    return {
      id: course.id,
      title: course.title,
    };
  }

  async findActiveTopicsByCourseId(courseId: number): Promise<ActiveTopic[]> {
    const topics = await this.prisma.topics.findMany({
      where: {
        course_id: courseId,
        is_active: true,
      },
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        course_id: true,
        name: true,
      },
    });

    return topics.map((topic: any) => ({
      id: topic.id,
      courseId: topic.course_id,
      name: topic.name,
    }));
  }

  async findSnapshotByUserAndTopic(userId: number, topicId: number): Promise<UserTopicMasterySnapshot | null> {
    const row = await this.prisma.user_skill_mastery.findFirst({
      where: {
        user_id: userId,
        topic_id: topicId,
      },
      orderBy: { id: 'desc' },
      select: {
        user_id: true,
        topic_id: true,
        mastery: true,
        observations: true,
      },
    });

    const latestAt = await this.findLatestJournalAtByUserAndTopicIds(userId, [topicId]);

    if (!row) {
      return {
        userId,
        topicId,
        mastery: 0,
        observations: 0,
        lastUpdatedAt: latestAt.get(topicId) ?? null,
      };
    }

    return {
      userId: row.user_id,
      topicId: row.topic_id,
      mastery: Number(row.mastery),
      observations: row.observations,
      lastUpdatedAt: latestAt.get(topicId) ?? null,
    };
  }

  async findSnapshotsByUserAndTopicIds(userId: number, topicIds: number[]): Promise<UserTopicMasterySnapshot[]> {
    if (topicIds.length === 0) return [];

    const rows = await this.prisma.user_skill_mastery.findMany({
      where: {
        user_id: userId,
        topic_id: { in: topicIds },
      },
      orderBy: [{ topic_id: 'asc' }, { id: 'desc' }],
      select: {
        id: true,
        user_id: true,
        topic_id: true,
        mastery: true,
        observations: true,
      },
    });

    const latestByTopic = new Map<number, UserTopicMasterySnapshot>();

    for (const row of rows) {
      if (!latestByTopic.has(row.topic_id)) {
        latestByTopic.set(row.topic_id, {
          userId: row.user_id,
          topicId: row.topic_id,
          mastery: Number(row.mastery),
          observations: row.observations,
          lastUpdatedAt: null,
        });
      }
    }

    return [...latestByTopic.values()];
  }

  async findLatestJournalAtByUserAndTopicIds(userId: number, topicIds: number[]): Promise<Map<number, Date>> {
    const byTopic = new Map<number, Date>();
    if (topicIds.length === 0) return byTopic;

    const grouped = await this.prisma.mastery_journal.groupBy({
      by: ['topic_id'],
      where: {
        user_id: userId,
        topic_id: { in: topicIds },
      },
      _max: {
        at: true,
      },
    });

    for (const row of grouped) {
      if (row._max.at) {
        byTopic.set(row.topic_id, row._max.at);
      }
    }

    return byTopic;
  }

  async findJournalByUserAndTopic(
    userId: number,
    topicId: number,
    limit: number,
    offset: number
  ): Promise<MasteryJournalEntry[]> {
    const rows = await this.prisma.mastery_journal.findMany({
      where: {
        user_id: userId,
        topic_id: topicId,
      },
      orderBy: [{ at: 'desc' }, { id: 'desc' }],
      skip: offset,
      take: limit,
      select: {
        id: true,
        user_id: true,
        topic_id: true,
        source: true,
        delta: true,
        mastery_before: true,
        mastery_after: true,
        evidence: true,
        at: true,
      },
    });

    return rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      topicId: row.topic_id,
      source: row.source,
      delta: Number(row.delta),
      masteryBefore: toNumber(row.mastery_before),
      masteryAfter: toNumber(row.mastery_after),
      evidence: row.evidence,
      at: row.at,
    }));
  }

  async applyMasteryUpdate(input: MasteryUpdateInput): Promise<{ snapshot: UserTopicMasterySnapshot; journal: MasteryJournalEntry }> {
    return this.prisma.$transaction(async (tx: any) => {
      const current = await tx.user_skill_mastery.findFirst({
        where: {
          user_id: input.userId,
          topic_id: input.topicId,
        },
        orderBy: { id: 'desc' },
        select: {
          id: true,
          mastery: true,
          observations: true,
        },
      });

      const masteryBefore = current ? Number(current.mastery) : 0;
      const masteryAfter = clampMastery(masteryBefore + input.delta);
      const observations = (current?.observations ?? 0) + input.observationsDelta;
      const eventAt = new Date();

      let snapshotRow;
      if (current) {
        snapshotRow = await tx.user_skill_mastery.update({
          where: { id: current.id },
          data: {
            mastery: masteryAfter,
            observations,
          },
          select: {
            user_id: true,
            topic_id: true,
            mastery: true,
            observations: true,
          },
        });
      } else {
        snapshotRow = await tx.user_skill_mastery.create({
          data: {
            user_id: input.userId,
            topic_id: input.topicId,
            mastery: masteryAfter,
            observations,
          },
          select: {
            user_id: true,
            topic_id: true,
            mastery: true,
            observations: true,
          },
        });
      }

      const journalRow = await tx.mastery_journal.create({
        data: {
          user_id: input.userId,
          topic_id: input.topicId,
          source: input.source,
          delta: input.delta,
          mastery_before: masteryBefore,
          mastery_after: masteryAfter,
          evidence: (input.evidence ?? null) as any,
          at: eventAt,
        },
        select: {
          id: true,
          user_id: true,
          topic_id: true,
          source: true,
          delta: true,
          mastery_before: true,
          mastery_after: true,
          evidence: true,
          at: true,
        },
      });

      return {
        snapshot: {
          userId: snapshotRow.user_id,
          topicId: snapshotRow.topic_id,
          mastery: Number(snapshotRow.mastery),
          observations: snapshotRow.observations,
          lastUpdatedAt: journalRow.at,
        },
        journal: {
          id: journalRow.id,
          userId: journalRow.user_id,
          topicId: journalRow.topic_id,
          source: journalRow.source,
          delta: Number(journalRow.delta),
          masteryBefore: toNumber(journalRow.mastery_before),
          masteryAfter: toNumber(journalRow.mastery_after),
          evidence: journalRow.evidence,
          at: journalRow.at,
        },
      };
    });
  }
}
