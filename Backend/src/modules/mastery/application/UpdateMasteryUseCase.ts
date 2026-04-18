import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import type { MasterySource } from '../domain/Mastery';
import type { MasteryRepository } from '../domain/MasteryPorts';

export interface UpdateMasteryInput {
  userId: number;
  topicId: number;
  source: MasterySource;
  delta: number;
  evidence?: unknown;
  observationsDelta?: number;
}

export interface UpdateMasteryOutput {
  userId: number;
  topicId: number;
  mastery: number;
  observations: number;
  lastUpdatedAt: string;
  journalEntryId: number;
}

export class UpdateMasteryUseCase {
  constructor(private readonly repo: MasteryRepository) {}

  async execute(input: UpdateMasteryInput): Promise<Result<UpdateMasteryOutput, AppError>> {
    try {
      if (!input.userId || input.userId <= 0) {
        return err(new AppError('Usuario inválido', 400));
      }

      if (!input.topicId || input.topicId <= 0) {
        return err(new AppError('Topic inválido', 400));
      }

      if (!Number.isFinite(input.delta) || input.delta < -1 || input.delta > 1) {
        return err(new AppError('Delta inválido, debe estar entre -1 y 1', 400));
      }

      if (!input.source) {
        return err(new AppError('Source es requerido', 400));
      }

      const observationsDelta = input.observationsDelta ?? 1;
      if (!Number.isInteger(observationsDelta) || observationsDelta < 0) {
        return err(new AppError('observationsDelta inválido, debe ser entero >= 0', 400));
      }

      const topic = await this.repo.findActiveTopicById(input.topicId);
      if (!topic) {
        return err(new AppError('Topic no encontrado', 404));
      }

      const { snapshot, journal } = await this.repo.applyMasteryUpdate({
        userId: input.userId,
        topicId: input.topicId,
        source: input.source,
        delta: input.delta,
        evidence: input.evidence,
        observationsDelta,
      });

      if (!snapshot.lastUpdatedAt) {
        return err(new AppError('No fue posible determinar la fecha de actualización', 500));
      }

      return ok({
        userId: snapshot.userId,
        topicId: snapshot.topicId,
        mastery: snapshot.mastery,
        observations: snapshot.observations,
        lastUpdatedAt: snapshot.lastUpdatedAt.toISOString(),
        journalEntryId: journal.id,
      });
    } catch {
      return err(new AppError('Error al actualizar mastery', 500));
    }
  }
}
