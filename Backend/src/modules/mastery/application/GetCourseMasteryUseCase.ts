import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import type { MasteryRepository } from '../domain/MasteryPorts';

export interface GetCourseMasteryInput {
  userId: number;
  courseId: number;
}

export interface CourseTopicMasteryItem {
  topicId: number;
  topicName: string;
  mastery: number;
  observations: number;
  lastUpdatedAt: string | null;
}

export interface GetCourseMasteryOutput {
  courseId: number;
  courseTitle: string;
  topics: CourseTopicMasteryItem[];
}

export class GetCourseMasteryUseCase {
  constructor(private readonly repo: MasteryRepository) {}

  async execute(input: GetCourseMasteryInput): Promise<Result<GetCourseMasteryOutput, AppError>> {
    try {
      if (!input.userId || input.userId <= 0) {
        return err(new AppError('Usuario inválido', 400));
      }

      if (!input.courseId || input.courseId <= 0) {
        return err(new AppError('Course inválido', 400));
      }

      const course = await this.repo.findActiveCourseById(input.courseId);
      if (!course) {
        return err(new AppError('Curso no encontrado', 404));
      }

      const topics = await this.repo.findActiveTopicsByCourseId(input.courseId);
      if (topics.length === 0) {
        return ok({
          courseId: course.id,
          courseTitle: course.title,
          topics: [],
        });
      }

      const topicIds = topics.map((topic) => topic.id);
      const snapshots = await this.repo.findSnapshotsByUserAndTopicIds(input.userId, topicIds);
      const snapshotsByTopic = new Map(snapshots.map((snapshot) => [snapshot.topicId, snapshot]));
      const latestJournalByTopic = await this.repo.findLatestJournalAtByUserAndTopicIds(input.userId, topicIds);

      const masteryByTopic = topics.map((topic) => {
        const snapshot = snapshotsByTopic.get(topic.id);
        const lastUpdatedAt = snapshot?.lastUpdatedAt ?? latestJournalByTopic.get(topic.id) ?? null;

        return {
          topicId: topic.id,
          topicName: topic.name,
          mastery: snapshot?.mastery ?? 0,
          observations: snapshot?.observations ?? 0,
          lastUpdatedAt: lastUpdatedAt ? lastUpdatedAt.toISOString() : null,
        };
      });

      return ok({
        courseId: course.id,
        courseTitle: course.title,
        topics: masteryByTopic,
      });
    } catch {
      return err(new AppError('Error al obtener mastery por curso', 500));
    }
  }
}
