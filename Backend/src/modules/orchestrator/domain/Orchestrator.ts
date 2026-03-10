export type OrchestratorDecisionType =
  | 'next'
  | 'reinforce_topic'
  | 'generate_content'
  | 'update_plan'
  | 'feedback';

export interface OrchestratorDecisionPayload {
  [key: string]: unknown;
}

export interface OrchestratorDecision {
  type: OrchestratorDecisionType;
  rationale?: string;
  modelVersion?: string;
  correlationId?: string;
  payload: OrchestratorDecisionPayload;
}

export interface SnapshotInput {
  userId: number;
  courseId: number;
}

export interface InputSnapshot {
  user: {
    id: number;
    email: string;
    status: string;
  };
  course: {
    id: number;
    title: string;
  };
  mastery: Array<{
    topicId: number;
    topicName: string;
    mastery: number;
    observations: number;
  }>;
  recentJournal: Array<{
    topicId: number;
    source: string;
    delta: number;
    at: string;
  }>;
  plan: unknown;
  progress: {
    totalLessons: number;
    completedLessons: number;
    inProgressLessons: number;
    completionPercentage: number;
  };
  eligibility: Array<{
    lessonId: number;
    requiredTopicId: number;
    minMastery: number;
    currentMastery: number;
    eligible: boolean;
  }>;
  lastActions: {
    contentEvents: unknown[];
    examAttempts: unknown[];
  };
}
