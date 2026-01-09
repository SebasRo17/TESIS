import { prisma } from "../../../infra/db/prisma";
import type { Lesson, LessonPrerequisite } from "../domain/Lesson";
import type { LessonRepository } from "../domain/LessonPorts";

export class PrismaLessonRepository implements LessonRepository {
  /**
   * Obtiene todas las lecciones activas de un curso
   */
  async findByCourseId(courseId: number): Promise<Lesson[]> {
    const rows = await prisma.lessons.findMany({
      where: {
        course_id: courseId,
        is_active: true,
      },
      orderBy: { id: "asc" },
    });

    return rows.map(this.mapToLesson);
  }

  /**
   * Obtiene una lección por su ID
   */
  async findById(lessonId: number): Promise<Lesson | null> {
    const row = await prisma.lessons.findUnique({
      where: { id: lessonId },
    });

    return row ? this.mapToLesson(row) : null;
  }

  /**
   * Obtiene todas las lecciones cuyo tema principal es el especificado
   */
  async findByPrimaryTopicId(topicId: number): Promise<Lesson[]> {
    const rows = await prisma.lessons.findMany({
      where: {
        primary_topic_id: topicId,
        is_active: true,
      },
      orderBy: { id: "asc" },
    });

    return rows.map(this.mapToLesson);
  }

  /**
   * Obtiene los prerequisitos académicos de una lección
   */
  async findPrerequisitesByLessonId(lessonId: number): Promise<LessonPrerequisite[]> {
    const rows = await prisma.content_prereqs.findMany({
      where: { lesson_id: lessonId },
      include: {
        topics: {
          select: { name: true },
        },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      lessonId: r.lesson_id,
      requiredTopicId: r.required_topic_id,
      minMastery: Number(r.min_mastery),
      topicName: r.topics?.name,
    }));
  }

  /**
   * Obtiene una lección con sus detalles (incluyendo información de curso y tema)
   */
  async findDetailById(
    lessonId: number
  ): Promise<(Lesson & { courseTitle?: string; topicName?: string }) | null> {
    const row = await prisma.lessons.findUnique({
      where: { id: lessonId },
      include: {
        courses: {
          select: { title: true },
        },
        topics: {
          select: { name: true },
        },
      },
    });

    if (!row) {
      return null;
    }

    const result: Lesson & { courseTitle?: string; topicName?: string } = {
      ...this.mapToLesson(row),
    };

    if (row.courses?.title) {
      result.courseTitle = row.courses.title;
    }

    if (row.topics?.name) {
      result.topicName = row.topics.name;
    }

    return result;
  }

  /**
   * Mapea una fila de Prisma a la entidad Lesson
   */
  private mapToLesson(row: any): Lesson {
    return {
      id: row.id,
      courseId: row.course_id,
      primaryTopicId: row.primary_topic_id,
      title: row.title,
      canonicalSlug: row.canonical_slug,
      isActive: row.is_active,
      version: row.version,
    };
  }
}
