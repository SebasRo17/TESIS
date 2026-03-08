import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import type { MasteryRepository } from '../domain/MasteryPorts';

export interface GetTopicMasteryInput {
  userId: number;
  topicId: number;
}

export interface GetTopicMasteryOutput {
  topicId: number;
  topicName: string;
  mastery: number;
  observations: number;
  lastUpdatedAt: string | null;
}

export class GetTopicMasteryUseCase {
  constructor(private readonly repo: MasteryRepository) {}

  async execute(input: GetTopicMasteryInput): Promise<Result<GetTopicMasteryOutput, AppError>> {
    try {
      if (!input.userId || input.userId <= 0) {
        return err(new AppError('Usuario inválido', 400));
      }

      if (!input.topicId || input.topicId <= 0) {
        return err(new AppError('Topic inválido', 400));
      }

      const topic = await this.repo.findActiveTopicById(input.topicId);
      if (!topic) {
        return err(new AppError('Topic no encontrado', 404));
      }

      const snapshot = await this.repo.findSnapshotByUserAndTopic(input.userId, input.topicId);

      return ok({
        topicId: topic.id,
        topicName: topic.name,
        mastery: snapshot?.mastery ?? 0,
        observations: snapshot?.observations ?? 0,
        lastUpdatedAt: snapshot?.lastUpdatedAt ? snapshot.lastUpdatedAt.toISOString() : null,
      });
    } catch {
      return err(new AppError('Error al obtener mastery por topic', 500));
    }
  }
}
