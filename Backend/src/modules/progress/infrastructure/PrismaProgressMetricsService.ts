import type { PrismaClient } from '@prisma/client';
import type { IProgressMetricsService } from '../domain/ProgressPorts';
import type { CourseProgress } from '../domain/CourseProgress';
import type {
  RecentActivity,
  LessonActivity,
  ExamActivity,
} from '../domain/RecentActivity';

/**
 * Servicio de métricas agregadas de progreso
 * Calcula estadísticas basadas en datos objetivos de múltiples tablas
 */
export class PrismaProgressMetricsService implements IProgressMetricsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getCourseProgress(userId: number, courseId: number): Promise<CourseProgress> {
    // Contar todas las lecciones activas del curso
    const totalLessons = await this.prisma.lessons.count({
      where: {
        course_id: courseId,
        is_active: true,
      },
    });

    // Contar lecciones completadas
    const completedLessons = await this.prisma.lesson_progress.count({
      where: {
        user_id: userId,
        status: 'completed',
        lessons: {
          course_id: courseId,
          is_active: true,
        },
      },
    });

    // Contar lecciones en progreso
    const inProgressLessons = await this.prisma.lesson_progress.count({
      where: {
        user_id: userId,
        status: 'in_progress',
        lessons: {
          course_id: courseId,
          is_active: true,
        },
      },
    });

    // Sumar tiempo total invertido
    const timeResult = await this.prisma.lesson_progress.aggregate({
      where: {
        user_id: userId,
        lessons: {
          course_id: courseId,
        },
      },
      _sum: {
        time_spent_sec: true,
      },
    });

    const totalTimeSpentSec = timeResult._sum.time_spent_sec || 0;

    // Obtener última actividad
    const lastActivity = await this.prisma.lesson_progress.findFirst({
      where: {
        user_id: userId,
        lessons: {
          course_id: courseId,
        },
      },
      orderBy: [{ completed_at: 'desc' }, { id: 'desc' }],
      select: {
        completed_at: true,
      },
    });

    // Calcular porcentaje de completitud
    const completionPercentage =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100 * 100) / 100 : 0;

    return {
      courseId,
      userId,
      totalLessons,
      completedLessons,
      inProgressLessons,
      totalTimeSpentSec,
      completionPercentage,
      lastActivityAt: lastActivity?.completed_at || null,
    };
  }

  async getRecentActivity(userId: number): Promise<RecentActivity> {
    // Obtener última actividad de lección
    const lastLesson = await this.prisma.lesson_progress.findFirst({
      where: { user_id: userId },
      orderBy: [{ completed_at: 'desc' }, { id: 'desc' }],
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            courses: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    let lastLessonActivity: LessonActivity | null = null;
    if (lastLesson) {
      lastLessonActivity = {
        lessonId: lastLesson.lesson_id,
        lessonTitle: lastLesson.lessons.title,
        courseTitle: lastLesson.lessons.courses.title,
        status: lastLesson.status,
        lastInteraction: lastLesson.completed_at || new Date(lastLesson.id), // Fallback temporal
      };
    }

    // Obtener última actividad de examen
    const lastExam = await this.prisma.exam_attempts.findFirst({
      where: { user_id: userId },
      orderBy: [{ completed_at: 'desc' }, { started_at: 'desc' }],
      include: {
        exams: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    let lastExamActivity: ExamActivity | null = null;
    if (lastExam) {
      lastExamActivity = {
        examId: lastExam.exam_id,
        examTitle: lastExam.exams.title,
        attemptId: lastExam.id,
        completedAt: lastExam.completed_at,
        lastInteraction: lastExam.completed_at || lastExam.started_at,
      };
    }

    // Determinar la actividad más reciente
    let lastActivityDate: Date | null = null;

    if (lastLessonActivity && lastExamActivity) {
      lastActivityDate =
        lastLessonActivity.lastInteraction > lastExamActivity.lastInteraction
          ? lastLessonActivity.lastInteraction
          : lastExamActivity.lastInteraction;
    } else if (lastLessonActivity) {
      lastActivityDate = lastLessonActivity.lastInteraction;
    } else if (lastExamActivity) {
      lastActivityDate = lastExamActivity.lastInteraction;
    }

    return {
      userId,
      lastLessonActivity,
      lastExamActivity,
      lastActivityDate,
    };
  }
}
