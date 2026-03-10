import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import type {
  OrchestratorDecision,
  OrchestratorDecisionType,
  SnapshotInput,
} from '../domain/Orchestrator';
import type { OrchestratorModelClient, OrchestratorRepository } from '../domain/OrchestratorPorts';
import type { CreateStudyPlanUseCase } from '../../study-plans/application/CreateStudyPlanUseCase';
import type { StudyPlanItemRefType } from '../../study-plans/domain/StudyPlan';

export interface DecideForUserInput extends SnapshotInput {}

export interface DecideForUserOutput {
  snapshot: unknown;
  decision: OrchestratorDecision;
  applied: {
    updatePlan?: unknown;
    reinforceTopic?: { topicId: number };
    generateContent?: { lessonId: number };
  };
  decisionRecordId: number;
}

interface UpdatePlanPayloadItem {
  contentRefType: StudyPlanItemRefType;
  contentRefId: number;
  type: string;
  priority: number;
  orderN: number;
  dueAt?: string;
  metadata?: unknown;
}

function mapDecisionType(type: OrchestratorDecisionType): 'plan' | 'next' | 'feedback' {
  if (type === 'update_plan') return 'plan';
  if (type === 'next') return 'next';
  return 'feedback';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export class DecideForUserUseCase {
  constructor(
    private readonly repo: OrchestratorRepository,
    private readonly modelClient: OrchestratorModelClient,
    private readonly createStudyPlanUseCase: CreateStudyPlanUseCase
  ) {}

  async execute(input: DecideForUserInput): Promise<Result<DecideForUserOutput, AppError>> {
    try {
      if (!Number.isInteger(input.userId) || input.userId <= 0) {
        return err(new AppError('userId inválido', 400));
      }

      if (!Number.isInteger(input.courseId) || input.courseId <= 0) {
        return err(new AppError('courseId inválido', 400));
      }

      const snapshot = await this.repo.buildSnapshot(input);
      if (!snapshot) {
        return err(new AppError('Usuario o curso no encontrado', 404));
      }

      const decision = await this.modelClient.decide(snapshot);
      const applied: DecideForUserOutput['applied'] = {};

      if (decision.type === 'reinforce_topic') {
        const topicId = Number((decision.payload as Record<string, unknown>).topicId);
        if (!Number.isInteger(topicId) || topicId <= 0) {
          return err(new AppError('Decisión inválida: topicId requerido para reinforce_topic', 400));
        }

        const topicBelongs = await this.repo.topicBelongsToCourse(topicId, input.courseId);
        if (!topicBelongs) {
          return err(new AppError('Decisión inválida: topicId no pertenece al curso', 400));
        }

        applied.reinforceTopic = { topicId };
      }

      if (decision.type === 'generate_content') {
        const lessonId = Number((decision.payload as Record<string, unknown>).lessonId);
        if (!Number.isInteger(lessonId) || lessonId <= 0) {
          return err(new AppError('Decisión inválida: lessonId requerido para generate_content', 400));
        }

        const lessonBelongs = await this.repo.lessonBelongsToCourse(lessonId, input.courseId);
        if (!lessonBelongs) {
          return err(new AppError('Decisión inválida: lessonId no pertenece al curso', 400));
        }

        applied.generateContent = { lessonId };
      }

      if (decision.type === 'update_plan') {
        if (!isRecord(decision.payload) || !Array.isArray(decision.payload.items) || decision.payload.items.length === 0) {
          return err(new AppError('Decisión inválida: items requeridos para update_plan', 400));
        }

        const items = [] as UpdatePlanPayloadItem[];
        for (const item of decision.payload.items) {
          if (!isRecord(item)) {
            return err(new AppError('Decisión inválida: item de plan inválido', 400));
          }

          const parsedItem: UpdatePlanPayloadItem = {
            contentRefType: item.contentRefType as StudyPlanItemRefType,
            contentRefId: Number(item.contentRefId),
            type: String(item.type ?? ''),
            priority: Number(item.priority),
            orderN: Number(item.orderN),
            ...(item.dueAt !== undefined ? { dueAt: String(item.dueAt) } : {}),
            ...(item.metadata !== undefined ? { metadata: item.metadata } : {}),
          };

          items.push(parsedItem);
        }

        const createPlanResult = await this.createStudyPlanUseCase.execute({
          userId: input.userId,
          courseId: input.courseId,
          source: 'orchestrator',
          state: 'active',
          items: items.map((item) => ({
            contentRefType: item.contentRefType,
            contentRefId: item.contentRefId,
            type: item.type,
            priority: item.priority,
            orderN: item.orderN,
            ...(item.dueAt ? { dueAt: new Date(item.dueAt) } : {}),
            ...(item.metadata !== undefined ? { metadata: item.metadata } : {}),
          })),
        });

        if (!createPlanResult.ok) {
          return err(createPlanResult.error);
        }

        applied.updatePlan = createPlanResult.value;
      }

      const persisted = await this.repo.saveDecision({
        userId: input.userId,
        decisionType: mapDecisionType(decision.type),
        inputSnapshot: snapshot,
        output: decision,
        rationale: decision.rationale ?? null,
        modelVersion: decision.modelVersion ?? null,
        correlationId: decision.correlationId ?? null,
      });

      return ok({
        snapshot,
        decision,
        applied,
        decisionRecordId: persisted.id,
      });
    } catch {
      return err(new AppError('Error al ejecutar orquestación', 500));
    }
  }
}
