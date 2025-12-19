import { createApp } from './app';  
import { env } from './config/env';

async function main() {
  try {
    const app = createApp();
    
    const PORT = env.port;
    
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(`Environment: ${env.node_env}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

main();
