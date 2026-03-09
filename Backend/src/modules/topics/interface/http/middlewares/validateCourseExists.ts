import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../../../../core/errors/AppError';

const prisma = new PrismaClient();

function getSingleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Middleware para validar que el curso existe
 */
export const validateCourseExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseIdParam = getSingleParam(req.params.courseId);
    
    if (!courseIdParam) {
      throw new AppError('El courseId es requerido', 400);
    }

    const courseId = parseInt(courseIdParam, 10);

    if (isNaN(courseId)) {
      throw new AppError('El courseId debe ser un número válido', 400);
    }

    const course = await prisma.courses.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new AppError('Curso no encontrado', 404);
    }

    next();
  } catch (error) {
    next(error);
  }
};
