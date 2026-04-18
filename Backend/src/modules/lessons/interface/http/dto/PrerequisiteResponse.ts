import type { LessonPrerequisite } from "../../../domain/Lesson";

export interface PrerequisiteResponse {
  id: number;
  lessonId: number;
  requiredTopicId: number;
  minMastery: number;
  topicName?: string;
}

export class PrerequisiteResponseMapper {
  static toResponse(prereq: LessonPrerequisite): PrerequisiteResponse {
    const response: PrerequisiteResponse = {
      id: prereq.id,
      lessonId: prereq.lessonId,
      requiredTopicId: prereq.requiredTopicId,
      minMastery: prereq.minMastery,
    };

    if (prereq.topicName !== undefined) {
      response.topicName = prereq.topicName;
    }

    return response;
  }
}
