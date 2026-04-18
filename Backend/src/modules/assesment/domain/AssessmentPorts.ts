import type { Exam, ExamWithItems } from './Exam';
import type { Item } from './Item';
import type { ExamAttempt, ItemResponse, ExamAttemptWithDetails } from './ExamAttempt';

/**
 * Puerto de repositorio para Exams
 */
export interface IExamRepository {
  findById(id: number): Promise<Exam | null>;
  findByCourseId(courseId: number, activeOnly?: boolean): Promise<Exam[]>;
  findByIdWithItems(id: number): Promise<ExamWithItems | null>;
}

/**
 * Puerto de repositorio para Items
 */
export interface IItemRepository {
  findById(id: number): Promise<Item | null>;
  findByIds(ids: number[]): Promise<Item[]>;
  findByTopicId(topicId: number, activeOnly?: boolean): Promise<Item[]>;
  findByExamId(examId: number): Promise<Item[]>;
}

/**
 * Puerto de repositorio para ExamAttempts
 */
export interface IExamAttemptRepository {
  findById(id: number): Promise<ExamAttempt | null>;
  findByIdWithDetails(id: number): Promise<ExamAttemptWithDetails | null>;
  findByUserId(userId: number, limit?: number): Promise<ExamAttempt[]>;
  findByUserAndExam(userId: number, examId: number): Promise<ExamAttempt[]>;
  create(data: CreateExamAttemptData): Promise<ExamAttempt>;
  update(id: number, data: UpdateExamAttemptData): Promise<ExamAttempt>;
}

export interface CreateExamAttemptData {
  userId: number;
  examId: number;
  startedAt: Date;
  metadata?: any;
}

export interface UpdateExamAttemptData {
  completedAt?: Date;
  durationSec?: number;
  scoreRaw?: number;
  scoreNorm?: number;
  metadata?: any;
}

/**
 * Puerto de repositorio para ItemResponses
 */
export interface IItemResponseRepository {
  findById(id: number): Promise<ItemResponse | null>;
  findByAttemptId(attemptId: number): Promise<ItemResponse[]>;
  findByAttemptAndItem(attemptId: number, itemId: number): Promise<ItemResponse | null>;
  create(data: CreateItemResponseData): Promise<ItemResponse>;
  update(id: number, data: UpdateItemResponseData): Promise<ItemResponse>;
  countByAttemptId(attemptId: number): Promise<number>;
  countCorrectByAttemptId(attemptId: number): Promise<number>;
}

export interface CreateItemResponseData {
  attemptId: number;
  itemId: number;
  answer: any;
  isCorrect?: boolean | null;
  timeSpentSec?: number | null;
  hintsUsed?: number;
  awardedScore?: number | null;
}

export interface UpdateItemResponseData {
  answer?: any;
  isCorrect?: boolean | null;
  timeSpentSec?: number | null;
  awardedScore?: number | null;
}
