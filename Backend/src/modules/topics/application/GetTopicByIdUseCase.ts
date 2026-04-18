import { ITopicRepository } from '../domain/TopicPorts';
import { TopicWithBreadcrumb } from '../domain/Topic';
import { AppError } from '../../../core/errors/AppError';

export class GetTopicByIdUseCase {
  constructor(private readonly topicRepository: ITopicRepository) {}

  async execute(topicId: number): Promise<TopicWithBreadcrumb> {
    const topic = await this.topicRepository.findById(topicId);

    if (!topic) {
      throw new AppError('Topic no encontrado', 404);
    }

    // Obtener breadcrumb
    const parentsChain = await this.topicRepository.findParentsChain(topicId);
    const breadcrumb = parentsChain.map((t) => ({
      id: t.id,
      name: t.name,
      level: t.level,
    }));

    // Obtener hijos directos
    const children = await this.topicRepository.findChildrenByParentId(topicId);

    return {
      ...topic,
      breadcrumb,
      children,
    };
  }
}
