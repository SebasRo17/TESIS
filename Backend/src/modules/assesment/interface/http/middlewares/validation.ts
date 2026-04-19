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
        req.params = await schema.params.parseAsync(req.params) as any;
      }

      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }

      if (schema.query) {
        const parsedQuery = await schema.query.parseAsync(req.query) as Record<string, unknown>;
        (req as Request & { validatedQuery?: Record<string, unknown> }).validatedQuery = parsedQuery;
      }

      next();
    } catch (error: any) {
      next(new AppError('Validation error: ' + error.message, 400));
    }
  };
};
