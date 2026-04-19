import { createApp } from './app';  
import { env } from './config/env';

async function main() {
  const app = createApp();
  const PORT = env.port;

  await new Promise<void>((resolve, reject) => {
    const server = app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(`Environment: ${env.node_env}`);
    });

    server.on('error', reject);

    const shutdown = (signal: string) => {
      console.log(`Senal ${signal} recibida. Cerrando servidor HTTP...`);
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    };

    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
  });
}

main().catch((error) => {
  console.error('Error al iniciar el servidor:', error);
  process.exit(1);
});
