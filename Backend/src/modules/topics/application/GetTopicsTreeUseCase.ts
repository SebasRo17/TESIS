import { ITopicRepository } from '../domain/TopicPorts';
import { TopicWithChildren } from '../domain/Topic';

export class GetTopicsTreeUseCase {
  constructor(private readonly topicRepository: ITopicRepository) {}

  async execute(courseId: number): Promise<TopicWithChildren[]> {
    const allTopics = await this.topicRepository.findByCourseId(courseId);

    // Crear un mapa para acceso rápido
    const topicMap = new Map<number, TopicWithChildren>();
    allTopics.forEach((topic) => {
      topicMap.set(topic.id, { ...topic, children: [] });
    });

    // Construir árbol
    const roots: TopicWithChildren[] = [];
    topicMap.forEach((topic) => {
      if (topic.parentTopicId === null) {
        roots.push(topic);
      } else {
        const parent = topicMap.get(topic.parentTopicId);
        if (parent) {
          parent.children.push(topic);
        }
      }
    });

    return roots;
  }
}
