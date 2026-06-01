/**
 * Progreso de un topic dentro de un curso
 */
export interface TopicProgress {
  topicId: number;
  topicName: string;
  mastery: number;
  observations: number;
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  completionPercentage: number;
  lessons: TopicLessonProgress[];
}

export interface TopicLessonProgress {
  lessonId: number;
  lessonTitle: string;
  status: string;
  completedAt: Date | null;
  timeSpentSec: number | null;
}

/**
 * Progreso de todos los topics de un curso
 */
export interface CourseTopicsProgress {
  courseId: number;
  courseTitle: string;
  userId: number;
  topics: TopicProgress[];
}
