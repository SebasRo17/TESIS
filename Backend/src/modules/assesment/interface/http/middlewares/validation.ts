import type { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../../../../../core/errors/AppError';

/**
 * Middleware de validación genérico
 */
export const validateRequest = (schema: {
  params?: ZodSchema;
  body?: ZodSchema;
  query?: ZodSchema;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }

      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }

      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }

      next();
    } catch (error: any) {
      next(new AppError('Validation error: ' + error.message, 400));
    }
  };
};
