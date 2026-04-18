import type { ApplicableStudyRule, StudyRule, StudyRuleBinding, TopicReference } from './StudyRule';

export interface StudyRulesContext {
  courseId?: number;
  topicId?: number;
  userId?: number;
}

export interface StudyRulesRepository {
  findActiveRules(): Promise<StudyRule[]>;
  findRuleById(ruleId: number): Promise<StudyRule | null>;
  findBindingsByRuleIds(ruleIds: number[]): Promise<StudyRuleBinding[]>;
  findTopicReferenceById(topicId: number): Promise<TopicReference | null>;
}

export interface RuleResolver {
  resolve(rules: StudyRule[], bindings: StudyRuleBinding[], context: StudyRulesContext): ApplicableStudyRule[];
}
