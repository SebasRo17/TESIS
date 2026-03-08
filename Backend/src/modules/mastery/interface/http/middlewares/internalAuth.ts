import type { NextFunction, Request, Response } from 'express';
import { env } from '../../../../../config/env';

export function createInternalMasteryAuthMiddleware() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const expected = env.mastery.internalApiKey;

    if (!expected) {
      res.status(503).json({
        error: 'MASTERY_INTERNAL_API_KEY no configurada',
      });
      return;
    }

    const provided = req.header('x-internal-api-key');
    if (!provided || provided !== expected) {
      res.status(401).json({
        error: 'No autorizado',
      });
      return;
    }

    next();
  };
}
