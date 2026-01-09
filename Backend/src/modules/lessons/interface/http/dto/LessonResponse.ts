import type { Lesson } from "../../../domain/Lesson";

export interface LessonResponse {
  id: number;
  courseId: number;
  primaryTopicId: number | null;
  title: string;
  canonicalSlug: string;
  isActive: boolean;
  version: number;
}

export class LessonResponseMapper {
  static toResponse(lesson: Lesson): LessonResponse {
    return {
      id: lesson.id,
      courseId: lesson.courseId,
      primaryTopicId: lesson.primaryTopicId,
      title: lesson.title,
      canonicalSlug: lesson.canonicalSlug,
      isActive: lesson.isActive,
      version: lesson.version,
    };
  }
}
