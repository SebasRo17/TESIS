export type StudyPlanState = 'draft' | 'active' | 'superseded';
export type StudyPlanItemStatus = 'pending' | 'done' | 'blocked';
export type StudyPlanItemRefType = 'lesson' | 'variant' | 'item' | 'topic' | 'exam';

export interface StudyPlanItem {
  id: number;
  planId: number;
  contentRefType: StudyPlanItemRefType;
  contentRefId: number;
  type: string;
  priority: number;
  orderN: number;
  dueAt: Date | null;
  metadata: unknown;
  status: StudyPlanItemStatus;
}

export interface StudyPlan {
  id: number;
  userId: number;
  version: number;
  state: StudyPlanState;
  source: string;
  createdAt: Date;
  activatedAt: Date | null;
  supersededAt: Date | null;
  items: StudyPlanItem[];
}

export interface CreateStudyPlanItemInput {
  contentRefType: StudyPlanItemRefType;
  contentRefId: number;
  type: string;
  priority: number;
  orderN: number;
  dueAt?: Date | null;
  metadata?: unknown;
}

export interface CreateStudyPlanInput {
  userId: number;
  courseId: number;
  source?: string;
  state?: StudyPlanState;
  items: CreateStudyPlanItemInput[];
}
