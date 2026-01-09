import { Router } from "express";
import { PrismaLessonRepository } from "../../infrastructure/PrismaLessonRepository";
import { GetLessonsByCourseUseCase } from "../../application/GetLessonsByCourseUseCase";
import { GetLessonsByTopicUseCase } from "../../application/GetLessonsByTopicUseCase";
import { GetLessonDetailUseCase } from "../../application/GetLessonDetailUseCase";
import { GetLessonPrerequisitesUseCase } from "../../application/GetLessonPrerequisitesUseCase";
import { LessonsController } from "./LessonsController";
import { createAuthMiddleware } from "../../../auth/interface/http/middlewares/AuthMiddleware";
import { JwtTokenService } from "../../../auth/infrastructure/JwtTokenService";

export function createLessonsRoutes(): Router {
  const router = Router();
  const tokenService = new JwtTokenService();
  const authMiddleware = createAuthMiddleware(tokenService);

  // Inicializar repositorio y casos de uso
  const repo = new PrismaLessonRepository();
  const getLessonsByCourse = new GetLessonsByCourseUseCase(repo);
  const getLessonsByTopic = new GetLessonsByTopicUseCase(repo);
  const getLessonDetail = new GetLessonDetailUseCase(repo);
  const getLessonPrerequisites = new GetLessonPrerequisitesUseCase(repo);

  // Crear controlador
  const controller = new LessonsController(
    getLessonsByCourse,
    getLessonsByTopic,
    getLessonDetail,
    getLessonPrerequisites
  );
  // Proteger todas las rutas de lecciones (solo usuarios autenticados)
  router.use(authMiddleware);
  // Rutas
  // GET /lessons/:lessonId/prereqs
  router.get("/:lessonId/prereqs", (req, res) => controller.getPrerequisites(req, res));

  // GET /lessons/:lessonId
  router.get("/:lessonId", (req, res) => controller.getDetail(req, res));

  return router;
}

/**
 * Crea subrutas para acceso a lecciones desde otros contextos
 * Esto permite acceder a lecciones también desde /courses/:courseId/lessons y /topics/:topicId/lessons
 */
export function createLessonsSubroutes() {
  const tokenService = new JwtTokenService();
  const authMiddleware = createAuthMiddleware(tokenService);

  return {
    router: Router(),
    authMiddleware,
    controller: (() => {
      const repo = new PrismaLessonRepository();
      const getLessonsByCourse = new GetLessonsByCourseUseCase(repo);
      const getLessonsByTopic = new GetLessonsByTopicUseCase(repo);
      const getLessonDetail = new GetLessonDetailUseCase(repo);
      const getLessonPrerequisites = new GetLessonPrerequisitesUseCase(repo);

      return new LessonsController(
        getLessonsByCourse,
        getLessonsByTopic,
        getLessonDetail,
        getLessonPrerequisites
      );
    })(),
  };
}
