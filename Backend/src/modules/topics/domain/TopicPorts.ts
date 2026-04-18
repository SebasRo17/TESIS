import { Topic } from './Topic';

export interface ITopicRepository {
  findByCourseId(courseId: number): Promise<Topic[]>;
  findById(topicId: number): Promise<Topic | null>;
  findChildrenByParentId(parentId: number): Promise<Topic[]>;
  findParentsChain(topicId: number): Promise<Topic[]>;
}
