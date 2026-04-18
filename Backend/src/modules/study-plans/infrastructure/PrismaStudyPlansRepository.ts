import { PrismaClient } from '@prisma/client';
import type {
  CreateStudyPlanInput,
  StudyPlan,
  StudyPlanItem,
  StudyPlanItemRefType,
  StudyPlanItemStatus,
} from '../domain/StudyPlan';
import type { StudyPlansRepository } from '../domain/StudyPlansPorts';

function parseStatus(metadata: unknown): StudyPlanItemStatus {
  if (metadata && typeof metadata === 'object' && 'status' in (metadata as Record<string, unknown>)) {
    const value = (metadata as Record<string, unknown>).status;
    if (value === 'pending' || value === 'done' || value === 'blocked') {
      return value;
    }
  }

  return 'pending';
}

export class PrismaStudyPlansRepository implements StudyPlansRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findActivePlanByUserAndCourse(userId: number, courseId: number): Promise<StudyPlan | null> {
    const plans = await this.prisma.plans.findMany({
      where: { user_id: userId, state: 'active' },
      include: { plan_items: true },
      orderBy: [{ version: 'desc' }],
    });

    for (const plan of plans) {
      const belongs = await this.planBelongsToCourse(this.prisma, plan, courseId);
      if (belongs) {
        return this.mapPlan(plan);
      }
    }

    return null;
  }

  async findPlansByUserAndCourse(userId: number, courseId: number): Promise<StudyPlan[]> {
    const plans = await this.prisma.plans.findMany({
      where: { user_id: userId },
      include: { plan_items: true },
      orderBy: [{ version: 'desc' }],
    });

    const filtered: StudyPlan[] = [];
    for (const plan of plans) {
      const belongs = await this.planBelongsToCourse(this.prisma, plan, courseId);
      if (belongs) {
        filtered.push(this.mapPlan(plan));
      }
    }

    return filtered;
  }

  async findPlanItemById(itemId: number): Promise<StudyPlanItem | null> {
    const row = await this.prisma.plan_items.findUnique({ where: { id: itemId } });
    return row ? this.mapItem(row) : null;
  }

  async findPlanById(planId: number): Promise<StudyPlan | null> {
    const row = await this.prisma.plans.findUnique({
      where: { id: planId },
      include: { plan_items: true },
    });

    return row ? this.mapPlan(row) : null;
  }

  async updatePlanItemStatus(itemId: number, status: StudyPlanItemStatus): Promise<StudyPlanItem> {
    const current = await this.prisma.plan_items.findUnique({ where: { id: itemId } });
    const metadataObj = (current?.metadata && typeof current.metadata === 'object') ? { ...(current.metadata as Record<string, unknown>) } : {};
    metadataObj.status = status;
    metadataObj.updatedAt = new Date().toISOString();

    const row = await this.prisma.plan_items.update({
      where: { id: itemId },
      data: {
        metadata: metadataObj as any,
      },
    });

    return this.mapItem(row);
  }

  async createStudyPlan(input: CreateStudyPlanInput): Promise<StudyPlan> {
    return this.prisma.$transaction(async (tx: any) => {
      const existingPlans = await tx.plans.findMany({
        where: { user_id: input.userId },
        include: { plan_items: true },
      });

      let nextVersion = 1;
      for (const plan of existingPlans) {
        if (plan.version >= nextVersion) nextVersion = plan.version + 1;
      }

      const now = new Date();

      const activePlansInCourse = [] as number[];
      for (const plan of existingPlans) {
        if (plan.state !== 'active') continue;
        const belongs = await this.planBelongsToCourse(tx, plan, input.courseId);
        if (belongs) {
          activePlansInCourse.push(plan.id);
        }
      }

      if (activePlansInCourse.length > 0) {
        await tx.plans.updateMany({
          where: { id: { in: activePlansInCourse } },
          data: {
            state: 'superseded',
            superseded_at: now,
          },
        });
      }

      const state = input.state ?? 'active';
      const createdPlan = await tx.plans.create({
        data: {
          user_id: input.userId,
          version: nextVersion,
          state,
          source: input.source ?? 'orchestrator',
          activated_at: state === 'active' ? now : null,
        },
      });

      await tx.plan_items.createMany({
        data: input.items.map((item) => {
          const metadataObj = (item.metadata && typeof item.metadata === 'object')
            ? { ...(item.metadata as Record<string, unknown>) }
            : {};

          if (!('status' in metadataObj)) {
            metadataObj.status = 'pending';
          }

          return {
            plan_id: createdPlan.id,
            content_ref_type: item.contentRefType,
            content_ref_id: item.contentRefId,
            type: item.type,
            priority: item.priority,
            order_n: item.orderN,
            due_at: item.dueAt ?? null,
            metadata: metadataObj as any,
          };
        }),
      });

      const planWithItems = await tx.plans.findUnique({
        where: { id: createdPlan.id },
        include: { plan_items: true },
      });

      return this.mapPlan(planWithItems);
    });
  }

  async resolveCourseIdForReference(refType: StudyPlanItemRefType, refId: number): Promise<number | null> {
    return this.resolveCourseIdForReferenceInternal(this.prisma, refType, refId);
  }

  private async planBelongsToCourse(prismaClient: any, plan: any, courseId: number): Promise<boolean> {
    const courseIds = await this.collectCourseIdsFromItems(prismaClient, plan.plan_items ?? []);
    return courseIds.has(courseId);
  }

  private async collectCourseIdsFromItems(prismaClient: any, items: any[]): Promise<Set<number>> {
    const courseIds = new Set<number>();
    const cache = new Map<string, number | null>();

    for (const item of items) {
      const refType = item.content_ref_type as StudyPlanItemRefType;
      const refId = item.content_ref_id as number;
      const key = `${refType}:${refId}`;

      let resolved: number | null;
      if (cache.has(key)) {
        resolved = cache.get(key) ?? null;
      } else {
        resolved = await this.resolveCourseIdForReferenceInternal(prismaClient, refType, refId);
        cache.set(key, resolved);
      }

      if (resolved !== null) {
        courseIds.add(resolved);
      }
    }

    return courseIds;
  }

  private async resolveCourseIdForReferenceInternal(
    prismaClient: any,
    refType: StudyPlanItemRefType,
    refId: number
  ): Promise<number | null> {
    if (refType === 'lesson') {
      const lesson = await prismaClient.lessons.findUnique({ where: { id: refId }, select: { course_id: true } });
      return lesson?.course_id ?? null;
    }

    if (refType === 'topic') {
      const topic = await prismaClient.topics.findUnique({ where: { id: refId }, select: { course_id: true } });
      return topic?.course_id ?? null;
    }

    if (refType === 'item') {
      const item = await prismaClient.items.findUnique({
        where: { id: refId },
        select: { topics: { select: { course_id: true } } },
      });
      return item?.topics?.course_id ?? null;
    }

    if (refType === 'variant') {
      const variant = await prismaClient.content_variants.findUnique({
        where: { id: refId },
        select: { lessons: { select: { course_id: true } } },
      });
      return variant?.lessons?.course_id ?? null;
    }

    if (refType === 'exam') {
      const examItem = await prismaClient.exam_items.findFirst({
        where: { exam_id: refId },
        select: { items: { select: { topics: { select: { course_id: true } } } } },
      });
      return examItem?.items?.topics?.course_id ?? null;
    }

    return null;
  }

  private mapPlan(row: any): StudyPlan {
    return {
      id: row.id,
      userId: row.user_id,
      version: row.version,
      state: row.state,
      source: row.source,
      createdAt: row.created_at,
      activatedAt: row.activated_at,
      supersededAt: row.superseded_at,
      items: (row.plan_items ?? [])
        .slice()
        .sort((a: any, b: any) => a.order_n - b.order_n)
        .map((item: any) => this.mapItem(item)),
    };
  }

  private mapItem(row: any): StudyPlanItem {
    return {
      id: row.id,
      planId: row.plan_id,
      contentRefType: row.content_ref_type,
      contentRefId: row.content_ref_id,
      type: row.type,
      priority: Number(row.priority),
      orderN: row.order_n,
      dueAt: row.due_at,
      metadata: row.metadata,
      status: parseStatus(row.metadata),
    };
  }
}
