import type { NextFunction, Request, Response } from 'express';
import { env } from '../../../../../config/env';

export function createInternalStudyPlansAuthMiddleware() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const expected = env.studyPlans.internalApiKey;

    if (!expected) {
      res.status(503).json({ error: 'STUDY_PLANS_INTERNAL_API_KEY no configurada' });
      return;
    }

    const provided = req.header('x-internal-api-key');
    if (!provided || provided !== expected) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    next();
  };
}
