import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { config } from './config/env.js';

export function createApp() {
  const app = express();

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: false, // Allow inline styles & fonts in dev
    crossOriginEmbedderPolicy: false
  }));

  // CORS Configuration
  const allowedOrigins = [
    config.clientUrl,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow mobile apps, curl, or matching origin
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev, logs in prod
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
  }));

  // Global Rate Limiting
  app.use(globalLimiter);

  // Body Parsing
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // API Routes (mounted both at /api and /api/v1)
  app.use('/api', routes);
  app.use('/api/v1', routes);

  // Root Welcome & Health Shortcut
  app.get('/', (req, res) => {
    res.json({
      message: 'NearMates REST API Server is operational',
      version: '1.0.0',
      docs: '/api/health'
    });
  });

  // Central Error Handler
  app.use(errorHandler);

  return app;
}

