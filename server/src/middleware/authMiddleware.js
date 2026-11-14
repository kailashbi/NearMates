import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { getRepository } from '../repositories/repositoryFactory.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Authentication token required.'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (jwtErr) {
      return res.status(401).json({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid or expired authentication token.'
      });
    }

    const repo = getRepository();
    const user = await repo.findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'User belonging to this token no longer exists.'
      });
    }

    if (user.status === 'banned') {
      return res.status(403).json({
        statusCode: 403,
        error: 'Forbidden',
        message: `Account permanently banned. Reason: ${user.banReason || 'Violation of Community Guidelines'}`
      });
    }

    if (user.status === 'suspended') {
      const isStillSuspended = user.suspendedUntil && new Date(user.suspendedUntil) > new Date();
      if (isStillSuspended) {
        return res.status(403).json({
          statusCode: 403,
          error: 'Forbidden',
          message: `Account suspended until ${new Date(user.suspendedUntil).toLocaleDateString()}. Reason: ${user.suspensionReason || 'Community policy violation'}`
        });
      }
    }

    user.lastActiveAt = new Date().toISOString();
    const profile = await repo.getProfileByUserId(user.userId);

    req.user = {
      userId: user.userId,
      profileId: profile ? profile.profileId : user.profileId,
      email: user.email,
      role: user.role,
      displayName: profile ? profile.displayName : user.displayName
    };

    next();
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Failed to authenticate request.'
    });
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  requireAuth(req, res, next);
}

