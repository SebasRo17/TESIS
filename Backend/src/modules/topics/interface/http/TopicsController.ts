import { Request, Response, NextFunction } from 'express';
import { GetTopicsTreeUseCase } from '../../application/GetTopicsTreeUseCase';
import { GetTopicsFlatUseCase } from '../../application/GetTopicsFlatUseCase';
import { GetTopicByIdUseCase } from '../../application/GetTopicByIdUseCase';
import { TopicTreeResponseDtoMapper } from './dto/TopicTreeResponseDto';
import { TopicResponseDtoMapper } from './dto/TopicResponseDto';
import { TopicDetailResponseDtoMapper } from './dto/TopicDetailResponseDto';
import { AppError } from '../../../../core/errors/AppError';

export class TopicsController {
  constructor(
    private readonly getTopicsTreeUseCase: GetTopicsTreeUseCase,
    private readonly getTopicsFlatUseCase: GetTopicsFlatUseCase,
    private readonly getTopicByIdUseCase: GetTopicByIdUseCase
  ) {}

  /**
   * GET /courses/:courseId/topics/tree
   * Devuelve el árbol jerárquico de topics del curso
   */
  async getTree(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseIdParam = req.params.courseId;
      if (!courseIdParam) {
        throw new AppError('El courseId es requerido', 400);
      }
      const courseId = parseInt(courseIdParam, 10);

      const tree = await this.getTopicsTreeUseCase.execute(courseId);
      const response = TopicTreeResponseDtoMapper.fromDomainList(tree);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /courses/:courseId/topics
   * Devuelve la lista plana de topics del curso
   */
  async getAllFlat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseIdParam = req.params.courseId;
      if (!courseIdParam) {
        throw new AppError('El courseId es requerido', 400);
      }
      const courseId = parseInt(courseIdParam, 10);

      const topics = await this.getTopicsFlatUseCase.execute(courseId);
      const response = TopicResponseDtoMapper.fromDomainList(topics);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /topics/:topicId
   * Devuelve el detalle de un topic con breadcrumb e hijos
   */
  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const topicIdParam = req.params.topicId;
      if (!topicIdParam) {
        throw new AppError('El topicId es requerido', 400);
      }
      const topicId = parseInt(topicIdParam, 10);

      if (isNaN(topicId)) {
        throw new AppError('El topicId debe ser un número válido', 400);
      }

      const topicDetail = await this.getTopicByIdUseCase.execute(topicId);
      const response = TopicDetailResponseDtoMapper.fromDomain(topicDetail);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }
}
