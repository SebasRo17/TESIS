export type StudyRuleScope = 'global' | 'course' | 'topic' | 'user';

export interface StudyRule {
  id: number;
  name: string;
  scope: StudyRuleScope;
  isActive: boolean;
  priority: number;
  definition: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyRuleBinding {
  id: number;
  ruleId: number;
  courseId: number | null;
  topicId: number | null;
  userId: number | null;
}

export interface ApplicableStudyRule {
  rule: StudyRule;
  appliedScope: StudyRuleScope;
  bindingId: number | null;
}

export interface TopicReference {
  id: number;
  courseId: number;
  isActive: boolean;
}
