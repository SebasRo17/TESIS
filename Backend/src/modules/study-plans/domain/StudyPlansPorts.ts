import type {
  CreateStudyPlanInput,
  StudyPlan,
  StudyPlanItem,
  StudyPlanItemRefType,
  StudyPlanItemStatus,
} from './StudyPlan';

export interface StudyPlansRepository {
  findActivePlanByUserAndCourse(userId: number, courseId: number): Promise<StudyPlan | null>;
  findPlansByUserAndCourse(userId: number, courseId: number): Promise<StudyPlan[]>;
  findPlanItemById(itemId: number): Promise<StudyPlanItem | null>;
  findPlanById(planId: number): Promise<StudyPlan | null>;
  updatePlanItemStatus(itemId: number, status: StudyPlanItemStatus): Promise<StudyPlanItem>;
  createStudyPlan(input: CreateStudyPlanInput): Promise<StudyPlan>;
  resolveCourseIdForReference(refType: StudyPlanItemRefType, refId: number): Promise<number | null>;
}
