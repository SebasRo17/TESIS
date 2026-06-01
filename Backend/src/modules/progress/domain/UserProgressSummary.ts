import type { CourseProgress } from './CourseProgress';
import type { RecentActivity } from './RecentActivity';

export interface UserProgressSummary {
  userId: number;
  totalCourses: number;
  totalCompletedLessons: number;
  totalInProgressLessons: number;
  totalTimeSpentSec: number;
  overallCompletionPercentage: number;
  courses: CourseProgressSummaryItem[];
  recentActivity: RecentActivity;
}

export interface CourseProgressSummaryItem {
  courseId: number;
  courseTitle: string;
  courseCode: string;
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  totalTimeSpentSec: number;
  completionPercentage: number;
  lastActivityAt: Date | null;
}
