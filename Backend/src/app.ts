import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { createRouter } from './app/router';
import { swaggerSpec } from './docs/swagger';

export function createApp() {
  const app = express();

  // Middlewares globales
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Documentación Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  }));

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
