import type { Request, Response } from "express";
import { GetLessonsByCourseUseCase } from "../../application/GetLessonsByCourseUseCase";
import { GetLessonsByTopicUseCase } from "../../application/GetLessonsByTopicUseCase";
import { GetLessonDetailUseCase } from "../../application/GetLessonDetailUseCase";
import { GetLessonPrerequisitesUseCase } from "../../application/GetLessonPrerequisitesUseCase";
import { LessonNotFoundError } from "../../domain/errors/LessonNotFoundError";
import { LessonResponseMapper } from "./dto/LessonResponse";
import { LessonDetailResponseMapper } from "./dto/LessonDetailResponse";
import { PrerequisiteResponseMapper } from "./dto/PrerequisiteResponse";

export class LessonsController {
  constructor(
    private getLessonsByCourse: GetLessonsByCourseUseCase,
    private getLessonsByTopic: GetLessonsByTopicUseCase,
    private getLessonDetail: GetLessonDetailUseCase,
    private getLessonPrerequisites: GetLessonPrerequisitesUseCase
  ) {}

  /**
   * GET /courses/:courseId/lessons
   * Obtiene todas las lecciones activas de un curso
   */
  async getByCourse(req: Request, res: Response): Promise<void> {
    const courseId = Number(req.params.courseId);

    if (isNaN(courseId) || courseId <= 0) {
      res.status(400).json({ error: "Course ID inválido" });
      return;
    }

    const result = await this.getLessonsByCourse.execute(courseId);

    if (!result.ok) {
      res.status(result.error.status || 500).json({
        error: result.error.message,
      });
      return;
    }

    res.json(result.value.map((lesson) => LessonResponseMapper.toResponse(lesson)));
  }

  /**
   * GET /topics/:topicId/lessons
   * Obtiene todas las lecciones asociadas a un tema (por tema principal)
   */
  async getByTopic(req: Request, res: Response): Promise<void> {
    const topicId = Number(req.params.topicId);

    if (isNaN(topicId) || topicId <= 0) {
      res.status(400).json({ error: "Topic ID inválido" });
      return;
    }

    const result = await this.getLessonsByTopic.execute(topicId);

    if (!result.ok) {
      res.status(result.error.status || 500).json({
        error: result.error.message,
      });
      return;
    }

    res.json(result.value.map((lesson) => LessonResponseMapper.toResponse(lesson)));
  }

  /**
   * GET /lessons/:lessonId
   * Obtiene el detalle completo de una lección
   */
  async getDetail(req: Request, res: Response): Promise<void> {
    const lessonId = Number(req.params.lessonId);

    if (isNaN(lessonId) || lessonId <= 0) {
      res.status(400).json({ error: "Lesson ID inválido" });
      return;
    }

    const result = await this.getLessonDetail.execute(lessonId);

    if (!result.ok) {
      if (result.error instanceof LessonNotFoundError) {
        res.status(404).json({ error: result.error.message });
        return;
      }
      res.status(result.error.status || 500).json({
        error: result.error.message,
      });
      return;
    }

    res.json(LessonDetailResponseMapper.toResponse(result.value));
  }

  /**
   * GET /lessons/:lessonId/prereqs
   * Obtiene los prerequisitos informativos de una lección
   */
  async getPrerequisites(req: Request, res: Response): Promise<void> {
    const lessonId = Number(req.params.lessonId);

    if (isNaN(lessonId) || lessonId <= 0) {
      res.status(400).json({ error: "Lesson ID inválido" });
      return;
    }

    const result = await this.getLessonPrerequisites.execute(lessonId);

    if (!result.ok) {
      if (result.error instanceof LessonNotFoundError) {
        res.status(404).json({ error: result.error.message });
        return;
      }
      res.status(result.error.status || 500).json({
        error: result.error.message,
      });
      return;
    }

    res.json(result.value.map((prereq) => PrerequisiteResponseMapper.toResponse(prereq)));
  }
}
