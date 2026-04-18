import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import type { MasteryRepository } from '../domain/MasteryPorts';
import type { MasterySource } from '../domain/Mastery';

export interface GetTopicMasteryJournalInput {
  userId: number;
  topicId: number;
  limit: number;
  offset: number;
}

export interface TopicMasteryJournalItem {
  id: number;
  source: MasterySource;
  delta: number;
  masteryBefore: number | null;
  masteryAfter: number | null;
  evidence: unknown | null;
  at: string;
}

export interface GetTopicMasteryJournalOutput {
  topicId: number;
  topicName: string;
  items: TopicMasteryJournalItem[];
}

export class GetTopicMasteryJournalUseCase {
  constructor(private readonly repo: MasteryRepository) {}

  async execute(input: GetTopicMasteryJournalInput): Promise<Result<GetTopicMasteryJournalOutput, AppError>> {
    try {
      if (!input.userId || input.userId <= 0) {
        return err(new AppError('Usuario inválido', 400));
      }

      if (!input.topicId || input.topicId <= 0) {
        return err(new AppError('Topic inválido', 400));
      }

      if (input.limit <= 0 || input.limit > 200) {
        return err(new AppError('Limit inválido, debe estar entre 1 y 200', 400));
      }

      if (input.offset < 0) {
        return err(new AppError('Offset inválido', 400));
      }

      const topic = await this.repo.findActiveTopicById(input.topicId);
      if (!topic) {
        return err(new AppError('Topic no encontrado', 404));
      }

      const entries = await this.repo.findJournalByUserAndTopic(
        input.userId,
        input.topicId,
        input.limit,
        input.offset
      );

      return ok({
        topicId: topic.id,
        topicName: topic.name,
        items: entries.map((entry) => ({
          id: entry.id,
          source: entry.source,
          delta: entry.delta,
          masteryBefore: entry.masteryBefore,
          masteryAfter: entry.masteryAfter,
          evidence: entry.evidence,
          at: entry.at.toISOString(),
        })),
      });
    } catch {
      return err(new AppError('Error al obtener journal de mastery', 500));
    }
  }
}
