import type { DecideForUserUseCase } from '../../orchestrator/application/DecideForUserUseCase';
import type { IExamRepository } from '../domain/AssessmentPorts';

export interface ReplanAfterAssessmentOutput {
  status: 'applied' | 'skipped' | 'failed';
  courseId: number | null;
  decisionRecordId?: number;
  realDecisionType?: string;
  applied?: unknown;
  error?: string;
}

export class ReplanAfterAssessmentUseCase {
  constructor(
    private readonly examRepository: IExamRepository,
    private readonly decideForUserUseCase: DecideForUserUseCase
  ) {}

  async execute(input: { userId: number; examId: number }): Promise<ReplanAfterAssessmentOutput> {
    try {
      const courseId = await this.examRepository.resolveCourseIdByExamId(input.examId);
      if (!courseId) {
        return {
          status: 'skipped',
          courseId: null,
          error: 'No se pudo resolver el curso del examen',
        };
      }

      const result = await this.decideForUserUseCase.execute({
        userId: input.userId,
        courseId,
      });

      if (!result.ok) {
        return {
          status: 'failed',
          courseId,
          error: result.error.message,
        };
      }

      return {
        status: 'applied',
        courseId,
        decisionRecordId: result.value.decisionRecordId,
        realDecisionType: result.value.realDecisionType,
        applied: result.value.applied,
      };
    } catch (error) {
      return {
        status: 'failed',
        courseId: null,
        error: error instanceof Error ? error.message : 'Error al recalcular la ruta',
      };
    }
  }
}
