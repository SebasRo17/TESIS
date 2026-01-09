import type { Lesson } from "../../../domain/Lesson";

export interface LessonDetailResponse {
  id: number;
  courseId: number;
  courseTitle?: string;
  primaryTopicId: number | null;
  topicName?: string;
  title: string;
  canonicalSlug: string;
  isActive: boolean;
  version: number;
}

export class LessonDetailResponseMapper {
  static toResponse(
    lesson: Lesson & { courseTitle?: string; topicName?: string }
  ): LessonDetailResponse {
    const response: LessonDetailResponse = {
      id: lesson.id,
      courseId: lesson.courseId,
      primaryTopicId: lesson.primaryTopicId,
      title: lesson.title,
      canonicalSlug: lesson.canonicalSlug,
      isActive: lesson.isActive,
      version: lesson.version,
    };

    if (lesson.courseTitle !== undefined) {
      response.courseTitle = lesson.courseTitle;
    }

    if (lesson.topicName !== undefined) {
      response.topicName = lesson.topicName;
    }

    return response;
  }
}
