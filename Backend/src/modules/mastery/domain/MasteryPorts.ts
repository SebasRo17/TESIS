import type {
  ActiveCourse,
  ActiveTopic,
  MasteryJournalEntry,
  MasterySource,
  UserTopicMasterySnapshot,
} from './Mastery';

export interface MasteryUpdateInput {
  userId: number;
  topicId: number;
  source: MasterySource;
  delta: number;
  evidence?: unknown;
  observationsDelta: number;
}

export interface MasteryRepository {
  findActiveTopicById(topicId: number): Promise<ActiveTopic | null>;
  findActiveCourseById(courseId: number): Promise<ActiveCourse | null>;
  findActiveTopicsByCourseId(courseId: number): Promise<ActiveTopic[]>;
  findSnapshotByUserAndTopic(userId: number, topicId: number): Promise<UserTopicMasterySnapshot | null>;
  findSnapshotsByUserAndTopicIds(userId: number, topicIds: number[]): Promise<UserTopicMasterySnapshot[]>;
  findLatestJournalAtByUserAndTopicIds(userId: number, topicIds: number[]): Promise<Map<number, Date>>;
  findJournalByUserAndTopic(userId: number, topicId: number, limit: number, offset: number): Promise<MasteryJournalEntry[]>;
  applyMasteryUpdate(input: MasteryUpdateInput): Promise<{ snapshot: UserTopicMasterySnapshot; journal: MasteryJournalEntry }>;
}
