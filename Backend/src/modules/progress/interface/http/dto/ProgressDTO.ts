import type {
  LessonProgress,
  LessonProgressDetail,
  ProgressStatus,
} from '../../../domain/LessonProgress';
import type { CourseProgress } from '../../../domain/CourseProgress';
import type { RecentActivity, LessonActivity, ExamActivity } from '../../../domain/RecentActivity';

/**
 * DTOs para Progress
 */

// Request params
export interface LessonIdParams {
  lessonId: string;
}

export interface CourseIdParams {
  courseId: string;
}

// Request body
export interface UpdateProgressBody {
  lastPosition?: string;
  timeSpentSec?: number;
}

// Response DTOs
export interface LessonProgressDTO {
  id: number;
  userId: number;
  lessonId: number;
  status: ProgressStatus;
  lastPosition: string | null;
  completedAt: string | null;
  timeSpentSec: number | null;
}

export interface LessonProgressDetailDTO extends LessonProgressDTO {
  lessonTitle?: string;
  courseTitle?: string;
}

export interface CourseProgressDTO {
  courseId: number;
  userId: number;
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  totalTimeSpentSec: number;
  completionPercentage: number;
  lastActivityAt: string | null;
}

export interface LessonActivityDTO {
  lessonId: number;
  lessonTitle: string;
  courseTitle: string;
  status: string;
  lastInteraction: string;
}

export interface ExamActivityDTO {
  examId: number;
  examTitle: string;
  attemptId: number;
  completedAt: string | null;
  lastInteraction: string;
}

export interface RecentActivityDTO {
  userId: number;
  lastLessonActivity: LessonActivityDTO | null;
  lastExamActivity: ExamActivityDTO | null;
  lastActivityDate: string | null;
}

/**
 * Mappers
 */
export function toLessonProgressDTO(progress: LessonProgress): LessonProgressDTO {
  return {
    id: progress.id,
    userId: progress.userId,
    lessonId: progress.lessonId,
    status: progress.status,
    lastPosition: progress.lastPosition,
    completedAt: progress.completedAt ? progress.completedAt.toISOString() : null,
    timeSpentSec: progress.timeSpentSec,
  };
}

export function toLessonProgressDetailDTO(
  progress: LessonProgressDetail
): LessonProgressDetailDTO {
  const base = toLessonProgressDTO(progress);
  return {
    ...base,
    ...(progress.lessonTitle !== undefined && { lessonTitle: progress.lessonTitle }),
    ...(progress.courseTitle !== undefined && { courseTitle: progress.courseTitle }),
  };
}

export function toCourseProgressDTO(courseProgress: CourseProgress): CourseProgressDTO {
  return {
    courseId: courseProgress.courseId,
    userId: courseProgress.userId,
    totalLessons: courseProgress.totalLessons,
    completedLessons: courseProgress.completedLessons,
    inProgressLessons: courseProgress.inProgressLessons,
    totalTimeSpentSec: courseProgress.totalTimeSpentSec,
    completionPercentage: courseProgress.completionPercentage,
    lastActivityAt: courseProgress.lastActivityAt
      ? courseProgress.lastActivityAt.toISOString()
      : null,
  };
}

export function toRecentActivityDTO(activity: RecentActivity): RecentActivityDTO {
  return {
    userId: activity.userId,
    lastLessonActivity: activity.lastLessonActivity
      ? toLessonActivityDTO(activity.lastLessonActivity)
      : null,
    lastExamActivity: activity.lastExamActivity
      ? toExamActivityDTO(activity.lastExamActivity)
      : null,
    lastActivityDate: activity.lastActivityDate ? activity.lastActivityDate.toISOString() : null,
  };
}

function toLessonActivityDTO(activity: LessonActivity): LessonActivityDTO {
  return {
    lessonId: activity.lessonId,
    lessonTitle: activity.lessonTitle,
    courseTitle: activity.courseTitle,
    status: activity.status,
    lastInteraction: activity.lastInteraction.toISOString(),
  };
}

function toExamActivityDTO(activity: ExamActivity): ExamActivityDTO {
  return {
    examId: activity.examId,
    examTitle: activity.examTitle,
    attemptId: activity.attemptId,
    completedAt: activity.completedAt ? activity.completedAt.toISOString() : null,
    lastInteraction: activity.lastInteraction.toISOString(),
  };
}
