import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { TopicsController } from './TopicsController';
import { PrismaTopicRepository } from '../../infrastructure/PrismaTopicRepository';
import { GetTopicsTreeUseCase } from '../../application/GetTopicsTreeUseCase';
import { GetTopicsFlatUseCase } from '../../application/GetTopicsFlatUseCase';
import { GetTopicByIdUseCase } from '../../application/GetTopicByIdUseCase';
import { validateCourseExists } from './middlewares/validateCourseExists';
import { createAuthMiddleware } from '../../../auth/interface/http/middlewares/AuthMiddleware';
import { JwtTokenService } from '../../../auth/infrastructure/JwtTokenService';

const tokenService = new JwtTokenService();
const authMiddleware = createAuthMiddleware(tokenService);

export function createTopicsRoutes() {
  const router = Router();
  const prisma = new PrismaClient();

  // Inicializar dependencias
  const topicRepository = new PrismaTopicRepository(prisma);
  const getTopicsTreeUseCase = new GetTopicsTreeUseCase(topicRepository);
  const getTopicsFlatUseCase = new GetTopicsFlatUseCase(topicRepository);
  const getTopicByIdUseCase = new GetTopicByIdUseCase(topicRepository);

  const topicsController = new TopicsController(
    getTopicsTreeUseCase,
    getTopicsFlatUseCase,
    getTopicByIdUseCase
  );

  /**
   * @route   GET /courses/:courseId/topics/tree
   * @desc    Obtener árbol jerárquico de topics de un curso
   * @access  Private
   */
  router.get(
    '/courses/:courseId/topics/tree',
    authMiddleware,
    validateCourseExists,
    (req, res, next) => topicsController.getTree(req, res, next)
  );

  /**
   * @route   GET /courses/:courseId/topics
   * @desc    Obtener lista plana de topics de un curso
   * @access  Private
   */
  router.get(
    '/courses/:courseId/topics',
    authMiddleware,
    validateCourseExists,
    (req, res, next) => topicsController.getAllFlat(req, res, next)
  );

  /**
   * @route   GET /topics/:topicId
   * @desc    Obtener detalle de un topic con breadcrumb e hijos
   * @access  Private
   */
  router.get(
    '/topics/:topicId',
    authMiddleware,
    (req, res, next) => topicsController.getOne(req, res, next)
  );

  return router;
}
