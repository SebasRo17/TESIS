import type { Lesson, LessonPrerequisite } from './Lesson';

/**
 * Puerto de acceso a datos para Lessons
 * Define operaciones de lectura sin depender del estado del usuario
 */
export interface LessonRepository {
  /**
   * Obtiene todas las lecciones activas de un curso
   */
  findByCourseId(courseId: number): Promise<Lesson[]>;

  /**
   * Obtiene una lección por su ID
   */
  findById(lessonId: number): Promise<Lesson | null>;

  /**
   * Obtiene todas las lecciones cuyo tema principal es el especificado
   */
  findByPrimaryTopicId(topicId: number): Promise<Lesson[]>;

  /**
   * Obtiene los prerequisitos académicos de una lección
   */
  findPrerequisitesByLessonId(lessonId: number): Promise<LessonPrerequisite[]>;

  /**
   * Obtiene una lección con sus detalles (incluyendo información de curso y tema)
   */
  findDetailById(lessonId: number): Promise<(Lesson & { courseTitle?: string; topicName?: string }) | null>;
}
