import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { createRouter } from './app/router';
import { swaggerSpec } from './docs/swagger';

export function createApp() {
  const app = express();
  app.set('etag', false);

  // Middlewares globales
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  // Documentación Swagger
  app.get('/api-docs-json', (_req, res) => {
    res.json(swaggerSpec);
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: '/api-docs-json',
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  }));

  // Request logging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
    });
    next();
  });

  // Rutas
  app.use('/api', createRouter());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handling 404
  app.use((req, res) => {
    res.status(404).json({
      error: 'Ruta no encontrada',
      path: req.path,
      method: req.method,
    });
  });

  return app;
}
