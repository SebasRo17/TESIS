import type { InputSnapshot, OrchestratorDecision, OrchestratorDecisionType, SnapshotInput } from './Orchestrator';

export interface DecisionHistoryItem {
  id: number;
  userId: number;
  decisionType: 'plan' | 'next' | 'feedback';
  inputSnapshot: unknown;
  output: unknown;
  rationale: string | null;
  modelVersion: string | null;
  correlationId: string | null;
  createdAt: Date;
}

export interface SaveDecisionInput {
  userId: number;
  decisionType: 'plan' | 'next' | 'feedback';
  inputSnapshot: unknown;
  output: unknown;
  rationale?: string | null;
  modelVersion?: string | null;
  correlationId?: string | null;
}

export interface OrchestratorRepository {
  buildSnapshot(input: SnapshotInput): Promise<InputSnapshot | null>;
  saveDecision(input: SaveDecisionInput): Promise<DecisionHistoryItem>;
  getDecisionHistory(userId: number, limit: number): Promise<DecisionHistoryItem[]>;
  topicBelongsToCourse(topicId: number, courseId: number): Promise<boolean>;
  lessonBelongsToCourse(lessonId: number, courseId: number): Promise<boolean>;
  findActiveLessonByTopic(topicId: number): Promise<number | null>;
}

export interface OrchestratorModelClient {
  decide(snapshot: InputSnapshot): Promise<OrchestratorDecision>;
}
