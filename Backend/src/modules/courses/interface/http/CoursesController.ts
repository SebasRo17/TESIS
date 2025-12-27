import type { Request, Response } from "express";
import { GetCoursesUseCase } from "../../application/GetCoursesUseCase";
import { GetCourseByIdUseCase } from "../../application/GetCourseByIdUseCase";
import { GetCourseBySlugUseCase } from "../../application/GetCourseBySlugUseCase";
import { CourseNotFoundError } from "../../domain/errors/CourseNotFoundError";
import type { CourseResponse } from "./dto/CourseResponse";

export class CoursesController {
  constructor(
    private getCourses: GetCoursesUseCase,
    private getCourseById: GetCourseByIdUseCase,
    private getCourseBySlug: GetCourseBySlugUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    const result = await this.getCourses.execute();
    if (!result.ok) {
      res.status(500).json({ error: result.error.message });
      return;
    }
    res.json(result.value.map(this.toResponse));
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const result = await this.getCourseById.execute(id);
    if (!result.ok) {
      if (result.error instanceof CourseNotFoundError) {
        res.status(404).json({ error: result.error.message });
        return;
      }
      res.status(500).json({ error: "Error interno" });
      return;
    }
    res.json(this.toResponse(result.value));
  }

  async getBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    if (!slug) {
      res.status(400).json({ error: "Slug es requerido" });
      return;
    }
    const result = await this.getCourseBySlug.execute(slug);
    if (!result.ok) {
      if (result.error instanceof CourseNotFoundError) {
        res.status(404).json({ error: result.error.message });
        return;
      }
      res.status(500).json({ error: "Error interno" });
      return;
    }
    res.json(this.toResponse(result.value));
  }

  private toResponse = (course: any): CourseResponse => ({
    id: course.id,
    code: course.code,
    title: course.title,
    description: course.description,
    status: course.status,
  });
}