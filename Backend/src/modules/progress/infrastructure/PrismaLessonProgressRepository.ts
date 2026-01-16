import type { PrismaClient } from '@prisma/client';
import type { ILessonProgressRepository } from '../domain/ProgressPorts';
import type {
  LessonProgress,
  LessonProgressDetail,
  CreateLessonProgressData,
  UpdateLessonProgressData,
  ProgressStatus,
} from '../domain/LessonProgress';

/**
 * Implementación de repositorio con Prisma para LessonProgress
 */
export class PrismaLessonProgressRepository implements ILessonProgressRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<LessonProgress | null> {
    const progress = await this.prisma.lesson_progress.findUnique({
      where: { id },
    });

    return progress ? this.toDomain(progress) : null;
  }

  async findByUserAndLesson(userId: number, lessonId: number): Promise<LessonProgress | null> {
    const progress = await this.prisma.lesson_progress.findFirst({
      where: {
        user_id: userId,
        lesson_id: lessonId,
      },
    });

    return progress ? this.toDomain(progress) : null;
  }

  async findByUserAndLessonWithDetails(
    userId: number,
    lessonId: number
  ): Promise<LessonProgressDetail | null> {
    const progress = await this.prisma.lesson_progress.findFirst({
      where: {
        user_id: userId,
        lesson_id: lessonId,
      },
      include: {
        lessons: {
          select: {
            title: true,
            courses: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (!progress) return null;

    return {
      ...this.toDomain(progress),
      lessonTitle: progress.lessons.title,
      courseTitle: progress.lessons.courses.title,
    };
  }

  async findByUserId(userId: number, limit?: number): Promise<LessonProgress[]> {
    const progresses = await this.prisma.lesson_progress.findMany({
      where: { user_id: userId },
      orderBy: { id: 'desc' },
      ...(limit && { take: limit }),
    });

    return progresses.map((p) => this.toDomain(p));
  }

  async findByUserAndCourse(userId: number, courseId: number): Promise<LessonProgress[]> {
    const progresses = await this.prisma.lesson_progress.findMany({
      where: {
        user_id: userId,
        lessons: {
          course_id: courseId,
        },
      },
      orderBy: { id: 'asc' },
    });

    return progresses.map((p) => this.toDomain(p));
  }

  async create(data: CreateLessonProgressData): Promise<LessonProgress> {
    const progress = await this.prisma.lesson_progress.create({
      data: {
        user_id: data.userId,
        lesson_id: data.lessonId,
        status: data.status || 'in_progress',
        last_position: data.lastPosition || null,
        completed_at: null,
        time_spent_sec: null,
      },
    });

    return this.toDomain(progress);
  }

  async update(id: number, data: UpdateLessonProgressData): Promise<LessonProgress> {
    const updateData: any = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.lastPosition !== undefined) updateData.last_position = data.lastPosition;
    if (data.completedAt !== undefined) updateData.completed_at = data.completedAt;
    if (data.timeSpentSec !== undefined) updateData.time_spent_sec = data.timeSpentSec;

    const progress = await this.prisma.lesson_progress.update({
      where: { id },
      data: updateData,
    });

    return this.toDomain(progress);
  }

  async countCompletedByUserAndCourse(userId: number, courseId: number): Promise<number> {
    return await this.prisma.lesson_progress.count({
      where: {
        user_id: userId,
        status: 'completed',
        lessons: {
          course_id: courseId,
        },
      },
    });
  }

  async countInProgressByUserAndCourse(userId: number, courseId: number): Promise<number> {
    return await this.prisma.lesson_progress.count({
      where: {
        user_id: userId,
        status: 'in_progress',
        lessons: {
          course_id: courseId,
        },
      },
    });
  }

  async sumTimeSpentByUserAndCourse(userId: number, courseId: number): Promise<number> {
    const result = await this.prisma.lesson_progress.aggregate({
      where: {
        user_id: userId,
        lessons: {
          course_id: courseId,
        },
      },
      _sum: {
        time_spent_sec: true,
      },
    });

    return result._sum.time_spent_sec || 0;
  }

  async getLastActivityByUser(userId: number): Promise<LessonProgress | null> {
    const progress = await this.prisma.lesson_progress.findFirst({
      where: { user_id: userId },
      orderBy: [{ completed_at: 'desc' }, { id: 'desc' }],
    });

    return progress ? this.toDomain(progress) : null;
  }

  /**
   * Mapea de modelo Prisma a entidad de dominio
   */
  private toDomain(prismaProgress: any): LessonProgress {
    return {
      id: prismaProgress.id,
      userId: prismaProgress.user_id,
      lessonId: prismaProgress.lesson_id,
      status: prismaProgress.status as ProgressStatus,
      lastPosition: prismaProgress.last_position,
      completedAt: prismaProgress.completed_at,
      timeSpentSec: prismaProgress.time_spent_sec,
    };
  }
}
