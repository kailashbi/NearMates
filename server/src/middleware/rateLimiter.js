import rateLimit from 'express-rate-limit';

// Global API rate limiter
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// Strict rate limiter for authentication routes (login / register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    error: 'Too Many Requests',
    message: 'Too many login attempts. Please wait 15 minutes before trying again.'
  }
});

// Rate limiter for activity broadcast creation
export const createActivityLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    error: 'Too Many Requests',
    message: 'Activity broadcast rate limit reached. Please wait before posting another.'
  }
});

