import { PrismaClient } from '@prisma/client';
import { ITopicRepository } from '../domain/TopicPorts';
import { Topic } from '../domain/Topic';

export class PrismaTopicRepository implements ITopicRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCourseId(courseId: number): Promise<Topic[]> {
    const topics = await this.prisma.topics.findMany({
      where: {
        course_id: courseId,
        is_active: true,
      },
      orderBy: [
        { level: 'asc' },
        { parent_topic_id: 'asc' },
        { name: 'asc' },
      ],
    });

    return topics.map(this.mapToTopic);
  }

  async findById(topicId: number): Promise<Topic | null> {
    const topic = await this.prisma.topics.findUnique({
      where: { id: topicId },
    });

    return topic ? this.mapToTopic(topic) : null;
  }

  async findChildrenByParentId(parentId: number): Promise<Topic[]> {
    const children = await this.prisma.topics.findMany({
      where: {
        parent_topic_id: parentId,
        is_active: true,
      },
      orderBy: [{ name: 'asc' }],
    });

    return children.map(this.mapToTopic);
  }

  async findParentsChain(topicId: number): Promise<Topic[]> {
    const chain: Topic[] = [];
    let currentId: number | null = topicId;

    // Buscar recursivamente los padres
    while (currentId !== null) {
      const foundTopic = await this.findById(currentId);

      if (!foundTopic) {
        break;
      }

      chain.unshift(foundTopic);
      currentId = foundTopic.parentTopicId;
    }

    return chain;
  }

  private mapToTopic(prismaData: any): Topic {
    return {
      id: prismaData.id,
      courseId: prismaData.course_id,
      name: prismaData.name,
      description: prismaData.description,
      parentTopicId: prismaData.parent_topic_id,
      level: prismaData.level,
      isActive: prismaData.is_active,
    };
  }
}
