/**
 * Métricas agregadas de progreso por curso
 * Representa el avance observable del usuario en un curso
 */
export interface CourseProgress {
  courseId: number;
  userId: number;
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  totalTimeSpentSec: number;
  completionPercentage: number;
  lastActivityAt: Date | null;
}

/**
 * Progreso de curso con información del curso
 */
export interface CourseProgressDetail extends CourseProgress {
  courseTitle?: string;
  courseCode?: string;
}
