/**
 * Entidad base de Lesson
 * Representa una unidad didáctica estructural del sistema
 */
export interface Lesson {
  id: number;
  courseId: number;
  primaryTopicId: number | null;
  title: string;
  canonicalSlug: string;
  isActive: boolean;
  version: number;
}

/**
 * Lesson con información extendida
 * Incluye metadatos académicos adicionales
 */
export interface LessonDetail extends Lesson {
  courseTitle?: string;
  topicName?: string;
  prerequisites?: LessonPrerequisite[];
}

/**
 * Prerequisito académico de una lección
 * Información de requisitos de dominio previo
 */
export interface LessonPrerequisite {
  id: number;
  lessonId: number;
  requiredTopicId: number;
  minMastery: number;
  topicName?: string;
}
