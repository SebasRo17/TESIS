/**
 * Actividad reciente del usuario
 * Representa las interacciones más recientes registradas
 */
export interface RecentActivity {
  userId: number;
  lastLessonActivity: LessonActivity | null;
  lastExamActivity: ExamActivity | null;
  lastActivityDate: Date | null;
}

/**
 * Actividad de lección
 */
export interface LessonActivity {
  lessonId: number;
  lessonTitle: string;
  courseTitle: string;
  status: string;
  lastInteraction: Date;
}

/**
 * Actividad de examen
 */
export interface ExamActivity {
  examId: number;
  examTitle: string;
  attemptId: number;
  completedAt: Date | null;
  lastInteraction: Date;
}
