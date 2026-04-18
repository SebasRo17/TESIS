import { PrismaClient } from '@prisma/client';
import type { InputSnapshot, SnapshotInput } from '../domain/Orchestrator';
import type {
  DecisionHistoryItem,
  OrchestratorRepository,
  SaveDecisionInput,
} from '../domain/OrchestratorPorts';
import { PrismaStudyPlansRepository } from '../../study-plans/infrastructure/PrismaStudyPlansRepository';
import { PrismaStudyRulesRepository } from '../../study-rules/infrastructure/PrismaStudyRulesRepository';
import { DeterministicStudyRulesResolver } from '../../study-rules/application/DeterministicStudyRulesResolver';
import { GetApplicableStudyRulesUseCase } from '../../study-rules/application/GetApplicableStudyRulesUseCase';

export class PrismaOrchestratorRepository implements OrchestratorRepository {
  private readonly studyPlansRepo: PrismaStudyPlansRepository;
  private readonly getApplicableStudyRulesUseCase: GetApplicableStudyRulesUseCase;

  constructor(private readonly prisma: PrismaClient) {
    this.studyPlansRepo = new PrismaStudyPlansRepository(prisma);
    const studyRulesRepo = new PrismaStudyRulesRepository(prisma);
    this.getApplicableStudyRulesUseCase = new GetApplicableStudyRulesUseCase(
      studyRulesRepo,
      new DeterministicStudyRulesResolver()
    );
  }

  async buildSnapshot(input: SnapshotInput): Promise<InputSnapshot | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true, email: true, status: true },
    });

    const course = await this.prisma.courses.findUnique({
      where: { id: input.courseId },
      select: { id: true, title: true },
    });

    if (!user || !course) return null;

    const topics = await this.prisma.topics.findMany({
      where: { course_id: input.courseId, is_active: true },
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });

    const topicIds = topics.map((t) => t.id);

    const masteryRows = await this.prisma.user_skill_mastery.findMany({
      where: {
        user_id: input.userId,
        topic_id: { in: topicIds },
      },
      select: {
        topic_id: true,
        mastery: true,
        observations: true,
      },
    });

    const masteryMap = new Map<number, { mastery: number; observations: number }>();
    for (const row of masteryRows) {
      masteryMap.set(row.topic_id, {
        mastery: Number(row.mastery),
        observations: row.observations,
      });
    }

    const mastery = topics.map((topic) => ({
      topicId: topic.id,
      topicName: topic.name,
      mastery: masteryMap.get(topic.id)?.mastery ?? 0,
      observations: masteryMap.get(topic.id)?.observations ?? 0,
    }));

    const recentJournalRows = await this.prisma.mastery_journal.findMany({
      where: {
        user_id: input.userId,
        topic_id: { in: topicIds },
      },
      orderBy: [{ at: 'desc' }],
      take: 20,
      select: {
        topic_id: true,
        source: true,
        delta: true,
        at: true,
      },
    });

    const recentJournal = recentJournalRows.map((row) => ({
      topicId: row.topic_id,
      source: row.source,
      delta: Number(row.delta),
      at: row.at.toISOString(),
    }));

    const plan = await this.studyPlansRepo.findActivePlanByUserAndCourse(input.userId, input.courseId);

    const studyRulesResult = await this.getApplicableStudyRulesUseCase.execute({
      userId: input.userId,
      courseId: input.courseId,
    });

    const studyRules = studyRulesResult.ok ? studyRulesResult.value : [];

    const courseLessons = await this.prisma.lessons.findMany({
      where: { course_id: input.courseId, is_active: true },
      select: { id: true },
    });
    const lessonIds = courseLessons.map((lesson) => lesson.id);

    const progressRows = lessonIds.length
      ? await this.prisma.lesson_progress.findMany({
          where: {
            user_id: input.userId,
            lesson_id: { in: lessonIds },
          },
          select: {
            status: true,
          },
        })
      : [];

    const completedLessons = progressRows.filter((row) => row.status === 'completed').length;
    const inProgressLessons = progressRows.filter((row) => row.status === 'in_progress').length;
    const totalLessons = lessonIds.length;
    const completionPercentage = totalLessons === 0 ? 0 : Number(((completedLessons / totalLessons) * 100).toFixed(2));

    const prereqs = await this.prisma.content_prereqs.findMany({
      where: { lessons: { course_id: input.courseId } },
      select: {
        lesson_id: true,
        required_topic_id: true,
        min_mastery: true,
      },
    });

    const eligibility = prereqs.map((row) => {
      const currentMastery = masteryMap.get(row.required_topic_id)?.mastery ?? 0;
      const minMastery = Number(row.min_mastery);
      return {
        lessonId: row.lesson_id,
        requiredTopicId: row.required_topic_id,
        minMastery,
        currentMastery,
        eligible: currentMastery >= minMastery,
      };
    });

    const contentEvents = await this.prisma.content_events.findMany({
      where: { user_id: input.userId },
      orderBy: [{ id: 'desc' }],
      take: 20,
      select: {
        id: true,
        lesson_id: true,
        content_variant_id: true,
        event_type: true,
        event_value: true,
      },
    });

    const examAttempts = await this.prisma.exam_attempts.findMany({
      where: { user_id: input.userId },
      orderBy: [{ started_at: 'desc' }],
      take: 10,
      select: {
        id: true,
        exam_id: true,
        started_at: true,
        completed_at: true,
        score_norm: true,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
      },
      course: {
        id: course.id,
        title: course.title,
      },
      mastery,
      recentJournal,
      plan: plan
        ? {
            id: plan.id,
            version: plan.version,
            state: plan.state,
            items: plan.items.map((item) => ({
              id: item.id,
              orderN: item.orderN,
              contentRefType: item.contentRefType,
              contentRefId: item.contentRefId,
              type: item.type,
              status: item.status,
            })),
          }
        : null,
      progress: {
        totalLessons,
        completedLessons,
        inProgressLessons,
        completionPercentage,
      },
      studyRules,
      eligibility,
      lastActions: {
        contentEvents,
        examAttempts: examAttempts.map((attempt) => ({
          ...attempt,
          started_at: attempt.started_at.toISOString(),
          completed_at: attempt.completed_at ? attempt.completed_at.toISOString() : null,
          score_norm: attempt.score_norm !== null ? Number(attempt.score_norm) : null,
        })),
      },
    };
  }

  async saveDecision(input: SaveDecisionInput): Promise<DecisionHistoryItem> {
    const row = await this.prisma.orchestrator_decisions.create({
      data: {
        user_id: input.userId,
        decision_type: input.decisionType,
        input_snapshot: input.inputSnapshot as any,
        output: input.output as any,
        rationale: input.rationale ?? null,
        model_version: input.modelVersion ?? null,
        correlation_id: input.correlationId ?? null,
      },
    });

    return {
      id: row.id,
      userId: row.user_id,
      decisionType: row.decision_type,
      inputSnapshot: row.input_snapshot,
      output: row.output,
      rationale: row.rationale,
      modelVersion: row.model_version,
      correlationId: row.correlation_id,
      createdAt: row.created_at,
    };
  }

  async getDecisionHistory(userId: number, limit: number): Promise<DecisionHistoryItem[]> {
    const rows = await this.prisma.orchestrator_decisions.findMany({
      where: { user_id: userId },
      orderBy: [{ created_at: 'desc' }],
      take: limit,
    });

    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      decisionType: row.decision_type,
      inputSnapshot: row.input_snapshot,
      output: row.output,
      rationale: row.rationale,
      modelVersion: row.model_version,
      correlationId: row.correlation_id,
      createdAt: row.created_at,
    }));
  }

  async topicBelongsToCourse(topicId: number, courseId: number): Promise<boolean> {
    const row = await this.prisma.topics.findFirst({
      where: { id: topicId, course_id: courseId },
      select: { id: true },
    });

    return !!row;
  }

  async lessonBelongsToCourse(lessonId: number, courseId: number): Promise<boolean> {
    const row = await this.prisma.lessons.findFirst({
      where: { id: lessonId, course_id: courseId },
      select: { id: true },
    });

    return !!row;
  }

  async findActiveLessonByTopic(topicId: number): Promise<number | null> {
    const row = await this.prisma.lessons.findFirst({
      where: {
        primary_topic_id: topicId,
        is_active: true,
      },
      orderBy: [{ id: 'asc' }],
      select: { id: true },
    });

    return row?.id ?? null;
  }
}

