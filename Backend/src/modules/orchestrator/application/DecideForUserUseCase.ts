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
import type { GetContentVariantsByLessonUseCase } from '../../content/application/GetContentVariantsByLessonUseCase';
import type { RegisterContentEventUseCase } from '../../content/application/RegisterContentEventUseCase';

export interface DecideForUserInput extends SnapshotInput {}

export interface DecideForUserOutput {
  snapshot: unknown;
  decision: OrchestratorDecision;
  applied: {
    updatePlan?: unknown;
    reinforceTopic?: { topicId: number; lessonId: number; variantId: number; eventId: number };
    generateContent?: { lessonId: number; variantId: number; eventId: number };
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
  if (type === 'update_plan' || type === 'plan') return 'plan';
  if (type === 'next') return 'next';
  return 'feedback';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isStudyPlanItemRefType(value: unknown): value is StudyPlanItemRefType {
  return value === 'lesson'
    || value === 'variant'
    || value === 'item'
    || value === 'topic'
    || value === 'exam';
}

function getDecisionType(decision: OrchestratorDecision): OrchestratorDecisionType | null {
  const decisionRecord = decision as unknown as Record<string, unknown>;
  const rawType = typeof decisionRecord.type === 'string'
    ? decisionRecord.type
    : typeof decisionRecord.decision_type === 'string'
      ? decisionRecord.decision_type
      : null;

  if (
    rawType === 'plan'
    || rawType === 'next'
    || rawType === 'reinforce_topic'
    || rawType === 'generate_content'
    || rawType === 'update_plan'
    || rawType === 'feedback'
  ) {
    return rawType;
  }

  return null;
}

function getDecisionStringField(
  decision: OrchestratorDecision,
  camelCaseField: string,
  snakeCaseField: string
): string | null {
  const decisionRecord = decision as unknown as Record<string, unknown>;
  const camelCaseValue = decisionRecord[camelCaseField];
  if (typeof camelCaseValue === 'string' && camelCaseValue.trim() !== '') {
    return camelCaseValue;
  }

  const snakeCaseValue = decisionRecord[snakeCaseField];
  if (typeof snakeCaseValue === 'string' && snakeCaseValue.trim() !== '') {
    return snakeCaseValue;
  }

  return null;
}

function extractPlanItems(decision: OrchestratorDecision): Result<UpdatePlanPayloadItem[], AppError> {
  const decisionRecord = decision as unknown as Record<string, unknown>;
  const payload = isRecord(decisionRecord.payload) ? decisionRecord.payload : null;
  const plan = isRecord(decisionRecord.plan)
    ? decisionRecord.plan
    : payload && isRecord(payload.plan)
      ? payload.plan
      : null;

  const rawItems = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(plan?.items)
      ? plan.items
      : null;

  if (!rawItems || rawItems.length === 0) {
    return err(new AppError('Invalid decision: plan.items are required for plan decisions', 400));
  }

  try {
    const items: UpdatePlanPayloadItem[] = rawItems.map((item, index) => {
      if (!isRecord(item)) {
        throw new AppError('Invalid decision: malformed plan item', 400);
      }

      const contentRefType = item.contentRefType ?? item.content_ref_type ?? item.type;
      if (!isStudyPlanItemRefType(contentRefType)) {
        throw new AppError('Invalid decision: unsupported contentRefType in plan item', 400);
      }

      const contentRefId = Number(item.contentRefId ?? item.content_ref_id ?? item.id);
      if (!Number.isInteger(contentRefId) || contentRefId <= 0) {
        throw new AppError('Invalid decision: contentRefId is required for plan items', 400);
      }

      const priority = Number(item.priority ?? 0.5);
      if (!Number.isFinite(priority) || priority <= 0) {
        throw new AppError('Invalid decision: priority must be a positive number', 400);
      }

      const orderN = Number(item.orderN ?? item.order_n ?? (index + 1));
      if (!Number.isInteger(orderN) || orderN <= 0) {
        throw new AppError('Invalid decision: orderN must be a positive integer', 400);
      }

      return {
        contentRefType,
        contentRefId,
        type: String(item.type ?? contentRefType),
        priority,
        orderN,
        ...(item.dueAt !== undefined ? { dueAt: String(item.dueAt) } : {}),
        ...(item.due_at !== undefined ? { dueAt: String(item.due_at) } : {}),
        ...(item.metadata !== undefined ? { metadata: item.metadata } : {}),
      };
    });

    return ok(items);
  } catch (error) {
    if (error instanceof AppError) {
      return err(error);
    }

    return err(new AppError('Invalid decision: malformed plan payload', 400));
  }
}

export class DecideForUserUseCase {
  constructor(
    private readonly repo: OrchestratorRepository,
    private readonly modelClient: OrchestratorModelClient,
    private readonly createStudyPlanUseCase: CreateStudyPlanUseCase,
    private readonly getContentVariantsByLessonUseCase: GetContentVariantsByLessonUseCase,
    private readonly registerContentEventUseCase: RegisterContentEventUseCase
  ) {}

  private async registerContentInteraction(
    userId: number,
    lessonId: number,
    metadata: Record<string, unknown>
  ): Promise<Result<{ lessonId: number; variantId: number; eventId: number }, AppError>> {
    const variantsResult = await this.getContentVariantsByLessonUseCase.execute(lessonId);
    if (!variantsResult.ok) {
      return err(variantsResult.error);
    }

    if (variantsResult.value.length === 0) {
      return err(new AppError('No active content variants found for the selected lesson', 409));
    }

    const variant = variantsResult.value[0]!;
    const eventResult = await this.registerContentEventUseCase.execute({
      userId,
      variantId: variant.id,
      eventType: 'interaction',
      metadata: {
        source: 'orchestrator',
        ...metadata,
      },
    });

    if (!eventResult.ok) {
      return err(eventResult.error);
    }

    return ok({
      lessonId,
      variantId: variant.id,
      eventId: eventResult.value.id,
    });
  }

  async execute(input: DecideForUserInput): Promise<Result<DecideForUserOutput, AppError>> {
    try {
      if (!Number.isInteger(input.userId) || input.userId <= 0) {
        return err(new AppError('userId invalido', 400));
      }

      if (!Number.isInteger(input.courseId) || input.courseId <= 0) {
        return err(new AppError('courseId invalido', 400));
      }

      const snapshot = await this.repo.buildSnapshot(input);
      if (!snapshot) {
        return err(new AppError('Usuario o curso no encontrado', 404));
      }

      const decision = await this.modelClient.decide(snapshot);
      const normalizedDecisionType = getDecisionType(decision);
      if (!normalizedDecisionType) {
        return err(new AppError('Invalid decision: unsupported decision type', 400));
      }

      const applied: DecideForUserOutput['applied'] = {};

      if (normalizedDecisionType === 'reinforce_topic') {
        const topicId = Number((decision.payload as Record<string, unknown>).topicId);
        if (!Number.isInteger(topicId) || topicId <= 0) {
          return err(new AppError('Invalid decision: topicId is required for reinforce_topic', 400));
        }

        const topicBelongs = await this.repo.topicBelongsToCourse(topicId, input.courseId);
        if (!topicBelongs) {
          return err(new AppError('Invalid decision: topicId does not belong to the course', 400));
        }

        const payloadLessonId = Number((decision.payload as Record<string, unknown>).lessonId);
        const lessonId = Number.isInteger(payloadLessonId) && payloadLessonId > 0
          ? payloadLessonId
          : await this.repo.findActiveLessonByTopic(topicId);

        if (!lessonId) {
          return err(new AppError('No active lesson found for reinforce_topic', 409));
        }

        const contentAction = await this.registerContentInteraction(input.userId, lessonId, {
          decisionType: 'reinforce_topic',
          topicId,
          strategy: (decision.payload as Record<string, unknown>).strategy ?? null,
        });

        if (!contentAction.ok) {
          return err(contentAction.error);
        }

        applied.reinforceTopic = {
          topicId,
          lessonId: contentAction.value.lessonId,
          variantId: contentAction.value.variantId,
          eventId: contentAction.value.eventId,
        };
      }

      if (normalizedDecisionType === 'generate_content') {
        const lessonId = Number((decision.payload as Record<string, unknown>).lessonId);
        if (!Number.isInteger(lessonId) || lessonId <= 0) {
          return err(new AppError('Invalid decision: lessonId is required for generate_content', 400));
        }

        const lessonBelongs = await this.repo.lessonBelongsToCourse(lessonId, input.courseId);
        if (!lessonBelongs) {
          return err(new AppError('Invalid decision: lessonId does not belong to the course', 400));
        }

        const contentAction = await this.registerContentInteraction(input.userId, lessonId, {
          decisionType: 'generate_content',
          payload: decision.payload,
        });

        if (!contentAction.ok) {
          return err(contentAction.error);
        }

        applied.generateContent = {
          lessonId: contentAction.value.lessonId,
          variantId: contentAction.value.variantId,
          eventId: contentAction.value.eventId,
        };
      }

      if (normalizedDecisionType === 'plan' || normalizedDecisionType === 'update_plan') {
        const planItemsResult = extractPlanItems(decision);
        if (!planItemsResult.ok) {
          return err(planItemsResult.error);
        }

        const createPlanResult = await this.createStudyPlanUseCase.execute({
          userId: input.userId,
          courseId: input.courseId,
          source: 'orchestrator',
          state: 'active',
          items: planItemsResult.value.map((item) => ({
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
        decisionType: mapDecisionType(normalizedDecisionType),
        inputSnapshot: snapshot,
        output: decision,
        rationale: getDecisionStringField(decision, 'rationale', 'rationale'),
        modelVersion: getDecisionStringField(decision, 'modelVersion', 'model_version'),
        correlationId: getDecisionStringField(decision, 'correlationId', 'correlation_id'),
      });

      return ok({
        snapshot,
        decision,
        applied,
        decisionRecordId: persisted.id,
      });
    } catch {
      return err(new AppError('Error al ejecutar orquestacion', 500));
    }
  }
}
