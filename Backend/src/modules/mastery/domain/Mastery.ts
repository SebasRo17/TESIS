export type MasterySource = "exam" | "response" | "manual" | "orchestrator";

export interface ActiveTopic {
  id: number;
  courseId: number;
  name: string;
}

export interface ActiveCourse {
  id: number;
  title: string;
}

export interface UserTopicMasterySnapshot {
  userId: number;
  topicId: number;
  mastery: number;
  observations: number;
  lastUpdatedAt: Date | null;
}

export interface MasteryJournalEntry {
  id: number;
  userId: number;
  topicId: number;
  source: MasterySource;
  delta: number;
  masteryBefore: number | null;
  masteryAfter: number | null;
  evidence: unknown | null;
  at: Date;
}
