import { PrismaClient } from '@prisma/client';
import type { StudyRulesRepository } from '../domain/StudyRulePorts';
import type { StudyRule, StudyRuleBinding, TopicReference } from '../domain/StudyRule';

export class PrismaStudyRulesRepository implements StudyRulesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findActiveRules(): Promise<StudyRule[]> {
    const rows = await this.prisma.study_rules.findMany({
      where: { is_active: true },
      orderBy: [{ priority: 'asc' }, { id: 'asc' }],
    });

    return rows.map((row) => this.mapRule(row));
  }

  async findRuleById(ruleId: number): Promise<StudyRule | null> {
    const row = await this.prisma.study_rules.findUnique({
      where: { id: ruleId },
    });

    return row ? this.mapRule(row) : null;
  }

  async findBindingsByRuleIds(ruleIds: number[]): Promise<StudyRuleBinding[]> {
    if (ruleIds.length === 0) return [];

    const rows = await this.prisma.study_rule_bindings.findMany({
      where: {
        rule_id: { in: ruleIds },
      },
      orderBy: [{ id: 'asc' }],
    });

    return rows.map((row) => ({
      id: row.id,
      ruleId: row.rule_id,
      courseId: row.course_id,
      topicId: row.topic_id,
      userId: row.user_id,
    }));
  }

  async findTopicReferenceById(topicId: number): Promise<TopicReference | null> {
    const row = await this.prisma.topics.findUnique({
      where: { id: topicId },
      select: {
        id: true,
        course_id: true,
        is_active: true,
      },
    });

    if (!row) return null;

    return {
      id: row.id,
      courseId: row.course_id,
      isActive: row.is_active,
    };
  }

  private mapRule(row: any): StudyRule {
    return {
      id: row.id,
      name: row.name,
      scope: row.scope,
      isActive: row.is_active,
      priority: row.priority,
      definition: row.definition,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
