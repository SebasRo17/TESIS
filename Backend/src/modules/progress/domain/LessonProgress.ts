/**
 * Entidad de dominio: LessonProgress
 * Representa el progreso objetivo del usuario en una lección
 */
export interface LessonProgress {
  id: number;
  userId: number;
  lessonId: number;
  status: ProgressStatus;
  lastPosition: string | null;
  completedAt: Date | null;
  timeSpentSec: number | null;
}

/**
 * Estados posibles del progreso de una lección
 */
export enum ProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

/**
 * Progreso de lección con información extendida
 */
export interface LessonProgressDetail extends LessonProgress {
  lessonTitle?: string;
  courseTitle?: string;
}

/**
 * Datos para crear un nuevo progreso
 */
export interface CreateLessonProgressData {
  userId: number;
  lessonId: number;
  status?: ProgressStatus;
  lastPosition?: string | null;
}

/**
 * Datos para actualizar progreso existente
 */
export interface UpdateLessonProgressData {
  status?: ProgressStatus;
  lastPosition?: string | null;
  completedAt?: Date | null;
  timeSpentSec?: number | null;
}
