import { TopicWithChildren } from '../../../domain/Topic';

/**
 * DTO para respuesta de árbol de topics
 */
export interface TopicTreeResponseDto {
  id: number;
  courseId: number;
  name: string;
  description: string | null;
  parentTopicId: number | null;
  level: number;
  children: TopicTreeResponseDto[];
}

export class TopicTreeResponseDtoMapper {
  static fromDomain(topic: TopicWithChildren): TopicTreeResponseDto {
    return {
      id: topic.id,
      courseId: topic.courseId,
      name: topic.name,
      description: topic.description,
      parentTopicId: topic.parentTopicId,
      level: topic.level,
      children: topic.children.map((child) => this.fromDomain(child)),
    };
  }

  static fromDomainList(topics: TopicWithChildren[]): TopicTreeResponseDto[] {
    return topics.map((topic) => this.fromDomain(topic));
  }
}
