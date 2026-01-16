import type {
  LessonProgress,
  LessonProgressDetail,
  CreateLessonProgressData,
  UpdateLessonProgressData,
} from './LessonProgress';
import type { CourseProgress } from './CourseProgress';
import type { RecentActivity } from './RecentActivity';

/**
 * Puerto de repositorio para LessonProgress
 */
export interface ILessonProgressRepository {
  /**
   * Busca un progreso por ID
   */
  findById(id: number): Promise<LessonProgress | null>;

  /**
   * Busca progreso por usuario y lección
   */
  findByUserAndLesson(userId: number, lessonId: number): Promise<LessonProgress | null>;

  /**
   * Busca progreso por usuario y lección con detalles
   */
  findByUserAndLessonWithDetails(
    userId: number,
    lessonId: number
  ): Promise<LessonProgressDetail | null>;

  /**
   * Busca todos los progresos de un usuario
   */
  findByUserId(userId: number, limit?: number): Promise<LessonProgress[]>;

  /**
   * Busca progresos de un usuario en un curso específico
   */
  findByUserAndCourse(userId: number, courseId: number): Promise<LessonProgress[]>;

  /**
   * Crea un nuevo registro de progreso
   */
  create(data: CreateLessonProgressData): Promise<LessonProgress>;

  /**
   * Actualiza un progreso existente
   */
  update(id: number, data: UpdateLessonProgressData): Promise<LessonProgress>;

  /**
   * Cuenta lecciones completadas por usuario en un curso
   */
  countCompletedByUserAndCourse(userId: number, courseId: number): Promise<number>;

  /**
   * Cuenta lecciones en progreso por usuario en un curso
   */
  countInProgressByUserAndCourse(userId: number, courseId: number): Promise<number>;

  /**
   * Suma tiempo total invertido por usuario en un curso
   */
  sumTimeSpentByUserAndCourse(userId: number, courseId: number): Promise<number>;

  /**
   * Obtiene la última actividad de lección del usuario
   */
  getLastActivityByUser(userId: number): Promise<LessonProgress | null>;
}

/**
 * Puerto de servicio para métricas agregadas
 */
export interface IProgressMetricsService {
  /**
   * Calcula el progreso agregado de un usuario en un curso
   */
  getCourseProgress(userId: number, courseId: number): Promise<CourseProgress>;

  /**
   * Obtiene la actividad reciente del usuario
   */
  getRecentActivity(userId: number): Promise<RecentActivity>;
}
