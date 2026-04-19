import type { Request, Response } from 'express';
import type { GetActiveStudyRulesUseCase } from '../../application/GetActiveStudyRulesUseCase';
import type { GetApplicableStudyRulesUseCase } from '../../application/GetApplicableStudyRulesUseCase';
import type { GetStudyRulesByTopicUseCase } from '../../application/GetStudyRulesByTopicUseCase';
import type { GetStudyRuleDetailUseCase } from '../../application/GetStudyRuleDetailUseCase';
import { AppError } from '../../../../core/errors/AppError';
import type { ApplicableRulesQuery, RuleIdParams, TopicIdParams } from './dto/StudyRulesDTO';

export class StudyRulesController {
  constructor(
    private readonly getActiveRulesUseCase: GetActiveStudyRulesUseCase,
    private readonly getApplicableRulesUseCase: GetApplicableStudyRulesUseCase,
    private readonly getRulesByTopicUseCase: GetStudyRulesByTopicUseCase,
    private readonly getRuleDetailUseCase: GetStudyRuleDetailUseCase
  ) {}

  async getActiveRules(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.getActiveRulesUseCase.execute();
      if (!result.ok) {
        const error = result.error as AppError;
        res.status(error.status).json({ error: error.message });
        return;
      }

      res.status(200).json({ success: true, data: result.value });
    } catch {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async getApplicableRules(req: Request, res: Response): Promise<void> {
    try {
      const query = (
        (req as Request & { validatedQuery?: ApplicableRulesQuery }).validatedQuery ?? req.query
      ) as unknown as ApplicableRulesQuery;
      const input = {
        ...(query.courseId !== undefined ? { courseId: query.courseId } : {}),
        ...(query.topicId !== undefined ? { topicId: query.topicId } : {}),
        ...(query.userId !== undefined ? { userId: query.userId } : {}),
      };

      const result = await this.getApplicableRulesUseCase.execute(input);

      if (!result.ok) {
        const error = result.error as AppError;
        res.status(error.status).json({ error: error.message });
        return;
      }

      res.status(200).json({ success: true, data: result.value });
    } catch {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async getRulesByTopic(req: Request, res: Response): Promise<void> {
    try {
      const { topicId } = req.params as unknown as TopicIdParams;
      const result = await this.getRulesByTopicUseCase.execute(topicId);

      if (!result.ok) {
        const error = result.error as AppError;
        res.status(error.status).json({ error: error.message });
        return;
      }

      res.status(200).json({ success: true, data: result.value });
    } catch {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async getRuleDetail(req: Request, res: Response): Promise<void> {
    try {
      const { ruleId } = req.params as unknown as RuleIdParams;
      const result = await this.getRuleDetailUseCase.execute(ruleId);

      if (!result.ok) {
        const error = result.error as AppError;
        res.status(error.status).json({ error: error.message });
        return;
      }

      res.status(200).json({ success: true, data: result.value });
    } catch {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}
