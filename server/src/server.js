import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { config } from './config/env.js';
import { initializeRepository } from './repositories/repositoryFactory.js';
import { initializeSocket } from './socket/socketHandler.js';
import { logger } from './utils/logger.js';

async function startServer() {
  try {
    // 1. Initialize Storage Adapter (Supabase or In-Memory fallback)
    const { storageMode, dbConnectionStatus } = await initializeRepository();
    logger.info(`Storage Engine: [${storageMode.toUpperCase()}] | DB Status: [${dbConnectionStatus.toUpperCase()}]`);

    // 2. Create Express application
    const app = createApp();
    const server = http.createServer(app);

    // 3. Initialize Socket.IO
    const io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });
    initializeSocket(io);

    // 4. Start HTTP Server
    const port = config.port;
    server.listen(port, () => {
      logger.info(`🚀 NearMates API Server running on port ${port}`);
      logger.info(`👉 Health endpoint: http://localhost:${port}/api/health`);
      logger.info(`👉 Storage Mode: ${storageMode === 'supabase' ? 'Supabase PostgreSQL (PostGIS)' : 'In-Memory Fallback (Demo Mode)'}`);
    });

    // Graceful Shutdown
    const shutdown = () => {
      logger.info('Shutting down server gracefully...');
      server.close(() => {
        logger.info('Server closed. Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    return { server, app, io };
  } catch (error) {
    logger.error('Fatal error during server startup:', error.stack || error.message);
    process.exit(1);
  }
}

// Start when executed directly
startServer();

export { startServer };

