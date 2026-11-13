import { InMemoryRepository } from './inMemoryRepository.js';
import { SupabaseRepository } from './supabaseRepository.js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

let activeRepository = null;
let storageMode = 'memory'; // 'supabase' | 'memory'
let dbConnectionStatus = 'disconnected'; // 'connected' | 'disconnected' | 'connecting'

export async function initializeRepository() {
  if (activeRepository) {
    return { repository: activeRepository, storageMode, dbConnectionStatus };
  }

  if (config.databaseUrl && config.databaseUrl.trim().length > 0) {
    logger.info('Attempting connection to Supabase PostgreSQL...');
    try {
      const supabaseRepo = new SupabaseRepository(config.databaseUrl);
      // Timeout test after 4 seconds so startup is fast
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database connection timed out')), 4000)
      );

      await Promise.race([supabaseRepo.testConnection(), timeoutPromise]);
      activeRepository = supabaseRepo;
      storageMode = 'supabase';
      dbConnectionStatus = 'connected';
      logger.info('Successfully connected to Supabase PostgreSQL with PostGIS!');
      return { repository: activeRepository, storageMode, dbConnectionStatus };
    } catch (err) {
      logger.warn(`Could not connect to Supabase: ${err.message}. Activating In-Memory Fallback Adapter.`);
    }
  } else {
    logger.info('No DATABASE_URL provided. Activating In-Memory Fallback Adapter (Demo Mode).');
  }

  activeRepository = new InMemoryRepository();
  storageMode = 'memory';
  dbConnectionStatus = 'disconnected';
  logger.info('NearMates is running in DEMO MODE with In-Memory Repository.');
  return { repository: activeRepository, storageMode, dbConnectionStatus };
}

export function getRepository() {
  if (!activeRepository) {
    // Synchronous fallback before async init completes
    activeRepository = new InMemoryRepository();
    storageMode = 'memory';
    dbConnectionStatus = 'disconnected';
  }
  return activeRepository;
}

export function getStorageStatus() {
  return {
    storageMode,
    dbConnectionStatus
  };
}

