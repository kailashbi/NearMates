import { getStorageStatus } from '../repositories/repositoryFactory.js';
import { config } from '../config/env.js';

const startTime = Date.now();

export class HealthController {
  static getHealth(req, res) {
    const { storageMode, dbConnectionStatus } = getStorageStatus();
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

    const isDemo = storageMode === 'memory';

    res.status(200).json({
      status: 'ok',
      service: 'nearmates-api',
      version: '1.0.0',
      database: dbConnectionStatus,
      storageMode,
      socketIO: 'operational',
      environment: config.nodeEnv,
      uptimeSeconds,
      timestamp: new Date().toISOString(),
      message: isDemo
        ? 'Running in demo mode (In-Memory Fallback Adapter active)'
        : 'Running in production mode (Connected to Supabase PostgreSQL with PostGIS)'
    });
  }
}

