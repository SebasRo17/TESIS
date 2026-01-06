import { TopicWithBreadcrumb } from '../../../domain/Topic';
import { TopicResponseDto, TopicResponseDtoMapper } from './TopicResponseDto';

/**
 * Item del breadcrumb
 */
export interface BreadcrumbItemDto {
  id: number;
  name: string;
  level: number;
}

/**
 * DTO para respuesta de detalle de un topic con breadcrumb e hijos
 */
export interface TopicDetailResponseDto {
  id: number;
  courseId: number;
  name: string;
  description: string | null;
  parentTopicId: number | null;
  level: number;
  breadcrumb: BreadcrumbItemDto[];
  children: TopicResponseDto[];
}

export class TopicDetailResponseDtoMapper {
  static fromDomain(topicDetail: TopicWithBreadcrumb): TopicDetailResponseDto {
    return {
      id: topicDetail.id,
      courseId: topicDetail.courseId,
      name: topicDetail.name,
      description: topicDetail.description,
      parentTopicId: topicDetail.parentTopicId,
      level: topicDetail.level,
      breadcrumb: topicDetail.breadcrumb.map((item) => ({
        id: item.id,
        name: item.name,
        level: item.level,
      })),
      children: TopicResponseDtoMapper.fromDomainList(topicDetail.children),
    };
  }
}
