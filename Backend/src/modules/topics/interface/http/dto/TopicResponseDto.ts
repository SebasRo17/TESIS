import { Topic } from '../../../domain/Topic';

/**
 * DTO para respuesta de un topic individual
 */
export interface TopicResponseDto {
  id: number;
  courseId: number;
  name: string;
  description: string | null;
  parentTopicId: number | null;
  level: number;
}

export class TopicResponseDtoMapper {
  static fromDomain(topic: Topic): TopicResponseDto {
    return {
      id: topic.id,
      courseId: topic.courseId,
      name: topic.name,
      description: topic.description,
      parentTopicId: topic.parentTopicId,
      level: topic.level,
    };
  }

  static fromDomainList(topics: Topic[]): TopicResponseDto[] {
    return topics.map((topic) => this.fromDomain(topic));
  }
}
