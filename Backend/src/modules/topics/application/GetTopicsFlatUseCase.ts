import { ITopicRepository } from '../domain/TopicPorts';
import { Topic } from '../domain/Topic';

export class GetTopicsFlatUseCase {
  constructor(private readonly topicRepository: ITopicRepository) {}

  async execute(courseId: number): Promise<Topic[]> {
    return await this.topicRepository.findByCourseId(courseId);
  }
}
