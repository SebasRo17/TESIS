import type { PrismaClient } from '@prisma/client';
import type {
  IExamAttemptRepository,
  CreateExamAttemptData,
  UpdateExamAttemptData,
} from '../domain/AssessmentPorts';
import type { ExamAttempt, ExamAttemptWithDetails } from '../domain/ExamAttempt';

export class PrismaExamAttemptRepository implements IExamAttemptRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<ExamAttempt | null> {
    const attempt = await this.prisma.exam_attempts.findUnique({
      where: { id },
    });

    return attempt ? this.toDomain(attempt) : null;
  }

  async findByIdWithDetails(id: number): Promise<ExamAttemptWithDetails | null> {
    const attempt = await this.prisma.exam_attempts.findUnique({
      where: { id },
      include: {
        exams: {
          select: {
            id: true,
            title: true,
            mode: true,
          },
        },
        item_responses: {
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!attempt) {
      return null;
    }

    return {
      ...this.toDomain(attempt),
      exam: {
        id: attempt.exams.id,
        title: attempt.exams.title,
        mode: attempt.exams.mode,
      },
      responses: attempt.item_responses.map((r) => ({
        id: r.id,
        attemptId: r.attempt_id,
        itemId: r.item_id,
        answer: r.answer ?? null,
        isCorrect: r.is_correct !== null ? Boolean(r.is_correct) : null,
        timeSpentSec: r.time_spent_sec,
        hintsUsed: r.hints_used,
        awardedScore: r.awarded_score ? Number(r.awarded_score) : null,
        createdAt: r.created_at,
      })),
    };
  }

  async findByUserId(userId: number, limit = 10): Promise<ExamAttempt[]> {
    const attempts = await this.prisma.exam_attempts.findMany({
      where: { user_id: userId },
      orderBy: { started_at: 'desc' },
      take: limit,
    });

    return attempts.map(this.toDomain);
  }

  async findByUserAndExam(userId: number, examId: number): Promise<ExamAttempt[]> {
    const attempts = await this.prisma.exam_attempts.findMany({
      where: {
        user_id: userId,
        exam_id: examId,
      },
      orderBy: { started_at: 'desc' },
    });

    return attempts.map(this.toDomain);
  }

  async create(data: CreateExamAttemptData): Promise<ExamAttempt> {
    const attempt = await this.prisma.exam_attempts.create({
      data: {
        user_id: data.userId,
        exam_id: data.examId,
        started_at: data.startedAt,
        metadata: data.metadata ?? undefined,
      },
    });

    return this.toDomain(attempt);
  }

  async update(id: number, data: UpdateExamAttemptData): Promise<ExamAttempt> {
    const attempt = await this.prisma.exam_attempts.update({
      where: { id },
      data: {
        ...(data.completedAt && { completed_at: data.completedAt }),
        ...(data.durationSec !== undefined && { duration_sec: data.durationSec }),
        ...(data.scoreRaw !== undefined && { score_raw: data.scoreRaw }),
        ...(data.scoreNorm !== undefined && { score_norm: data.scoreNorm }),
        ...(data.metadata !== undefined && { metadata: data.metadata }),
      },
    });

    return this.toDomain(attempt);
  }

  private toDomain(raw: any): ExamAttempt {
    return {
      id: raw.id,
      userId: raw.user_id,
      examId: raw.exam_id,
      startedAt: raw.started_at,
      completedAt: raw.completed_at,
      durationSec: raw.duration_sec,
      scoreRaw: raw.score_raw ? Number(raw.score_raw) : null,
      scoreNorm: raw.score_norm ? Number(raw.score_norm) : null,
      metadata: raw.metadata ?? null,
    };
  }
}
