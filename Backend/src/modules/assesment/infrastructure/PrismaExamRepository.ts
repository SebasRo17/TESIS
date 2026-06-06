import type { PrismaClient } from '@prisma/client';
import type { CreateExamWithItemsData, IExamRepository } from '../domain/AssessmentPorts';
import type { Exam, ExamWithItems, ExamMode } from '../domain/Exam';

export class PrismaExamRepository implements IExamRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<Exam | null> {
    const exam = await this.prisma.exams.findUnique({
      where: { id },
    });

    return exam ? this.toDomain(exam) : null;
  }

  async findByCourseId(courseId: number, activeOnly = true): Promise<Exam[]> {
    const exams = await this.prisma.exams.findMany({
      where: {
        ...(activeOnly && { is_active: true }),
        exam_items: {
          some: {
            items: {
              topics: {
                course_id: courseId,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return exams.map((e: any) => this.toDomain(e));
  }

  async findByIdWithItems(id: number): Promise<ExamWithItems | null> {
    const exam = await this.prisma.exams.findUnique({
      where: { id },
      include: {
        exam_items: {
          orderBy: { order_n: 'asc' },
          select: {
            item_id: true,
            order_n: true,
            weight: true,
          },
        },
      },
    });

    if (!exam) {
      return null;
    }

    return {
      ...this.toDomain(exam),
      items: exam.exam_items.map((ei) => ({
        itemId: ei.item_id,
        orderN: ei.order_n,
        weight: Number(ei.weight),
      })),
    };
  }

  async resolveCourseIdByExamId(examId: number): Promise<number | null> {
    const examItem = await this.prisma.exam_items.findFirst({
      where: { exam_id: examId },
      select: {
        items: {
          select: {
            topics: {
              select: { course_id: true },
            },
          },
        },
      },
    });

    return examItem?.items?.topics?.course_id ?? null;
  }

  async createWithItems(data: CreateExamWithItemsData): Promise<ExamWithItems> {
    return this.prisma.$transaction(async (tx) => {
      const exam = await tx.exams.create({
        data: {
          title: data.title,
          mode: data.mode as any,
          time_limit_sec: data.timeLimitSec,
          version: 1,
          is_active: true,
        },
      });

      await tx.exam_items.createMany({
        data: data.itemIds.map((itemId, index) => ({
          exam_id: exam.id,
          item_id: itemId,
          order_n: index + 1,
          weight: 1,
        })),
      });

      return {
        ...this.toDomain(exam),
        items: data.itemIds.map((itemId, index) => ({
          itemId,
          orderN: index + 1,
          weight: 1,
        })),
      };
    });
  }

  private toDomain(raw: any): Exam {
    return {
      id: raw.id,
      title: raw.title,
      mode: raw.mode as ExamMode,
      timeLimitSec: raw.time_limit_sec,
      version: raw.version,
      isActive: Boolean(raw.is_active),
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
  }
}
