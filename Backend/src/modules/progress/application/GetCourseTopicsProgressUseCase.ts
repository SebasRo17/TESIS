import type { PrismaClient } from '@prisma/client';
import type { CourseTopicsProgress, TopicProgress, TopicLessonProgress } from '../domain/TopicProgress';

/**
 * Caso de Uso: Obtener progreso del usuario agrupado por topics de un curso
 * Devuelve cada topic con su mastery, lecciones y estado de progreso
 */
export class GetCourseTopicsProgressUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(userId: number, courseId: number): Promise<CourseTopicsProgress | null> {
    // Verificar que el curso existe
    const course = await this.prisma.courses.findUnique({
      where: { id: courseId },
      select: { id: true, title: true },
    });

    if (!course) return null;

    // Obtener topics activos del curso
    const topics = await this.prisma.topics.findMany({
      where: { course_id: courseId, is_active: true },
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });

    // Obtener lecciones activas del curso con su topic y progreso del usuario
    const lessons = await this.prisma.lessons.findMany({
      where: { course_id: courseId, is_active: true },
      select: {
        id: true,
        title: true,
        primary_topic_id: true,
        lesson_progress: {
          where: { user_id: userId },
          select: {
            status: true,
            completed_at: true,
            time_spent_sec: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    // Obtener mastery del usuario por topic
    const masteryRecords = await this.prisma.user_skill_mastery.findMany({
      where: {
        user_id: userId,
        topic_id: { in: topics.map((t) => t.id) },
      },
      select: { topic_id: true, mastery: true, observations: true },
    });

    const masteryMap = new Map(
      masteryRecords.map((m) => [m.topic_id, { mastery: Number(m.mastery), observations: m.observations }])
    );

    // Agrupar lecciones por topic
    const topicProgressList: TopicProgress[] = topics.map((topic) => {
      const topicLessons = lessons.filter((l) => l.primary_topic_id === topic.id);
      const masteryData = masteryMap.get(topic.id) || { mastery: 0, observations: 0 };

      const lessonItems: TopicLessonProgress[] = topicLessons.map((lesson) => {
        const progress = lesson.lesson_progress[0];
        return {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          status: progress?.status ?? 'not_started',
          completedAt: progress?.completed_at ?? null,
          timeSpentSec: progress?.time_spent_sec ?? null,
        };
      });

      const completedLessons = lessonItems.filter((l) => l.status === 'completed').length;
      const inProgressLessons = lessonItems.filter((l) => l.status === 'in_progress').length;
      const totalLessons = lessonItems.length;
      const completionPercentage =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100 * 100) / 100
          : 0;

      return {
        topicId: topic.id,
        topicName: topic.name,
        mastery: masteryData.mastery,
        observations: masteryData.observations,
        totalLessons,
        completedLessons,
        inProgressLessons,
        completionPercentage,
        lessons: lessonItems,
      };
    });

    return {
      courseId: course.id,
      courseTitle: course.title,
      userId,
      topics: topicProgressList,
    };
  }
}
