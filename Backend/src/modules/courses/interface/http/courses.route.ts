import { Router } from "express";
import { PrismaCourseRepository } from "../../infrastructure/PrismaCourseRepository";
import { GetCoursesUseCase } from "../../application/GetCoursesUseCase";
import { GetCourseByIdUseCase } from "../../application/GetCourseByIdUseCase";
import { GetCourseBySlugUseCase } from "../../application/GetCourseBySlugUseCase";
import { CoursesController } from "./CoursesController";

export function createCoursesRoutes(): Router {
  const router = Router();

  const repo = new PrismaCourseRepository();
  const getCourses = new GetCoursesUseCase(repo);
  const getById = new GetCourseByIdUseCase(repo);
  const getBySlug = new GetCourseBySlugUseCase(repo);
  const controller = new CoursesController(getCourses, getById, getBySlug);

  router.get("/slug/:slug", (req, res) => controller.getBySlug(req, res));
  router.get("/:id", (req, res) => controller.getById(req, res));
  router.get("/", (req, res) => controller.list(req, res));

  return router;
}