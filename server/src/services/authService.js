import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getRepository } from '../repositories/repositoryFactory.js';
import { config } from '../config/env.js';

export class AuthService {
  static generateToken(user, profile) {
    return jwt.sign(
      {
        userId: user.userId,
        profileId: profile.profileId,
        email: user.email,
        role: user.role
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }

  static async register(data) {
    const repo = getRepository();
    const existing = await repo.findUserByEmail(data.email);
    if (existing) {
      const err = new Error('An account with this email address already exists.');
      err.statusCode = 409;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await repo.createUser({
      email: data.email,
      passwordHash,
      displayName: data.displayName,
      avatarUrl: data.avatarUrl,
      bio: data.bio,
      age: data.age,
      locationName: data.locationName,
      latitude: data.latitude,
      longitude: data.longitude,
      interests: data.interests || []
    });

    const profile = await repo.getProfileByUserId(user.userId);
    const token = this.generateToken(user, profile);

    return {
      token,
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role
      },
      profile
    };
  }

  static async login(email, password) {
    const repo = getRepository();
    const user = await repo.findUserByEmail(email);
    if (!user) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const profile = await repo.getProfileByUserId(user.userId);
    const token = this.generateToken(user, profile);

    return {
      token,
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role
      },
      profile
    };
  }

  static async getCurrentUser(userId) {
    const repo = getRepository();
    const user = await repo.findUserById(userId);
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }
    const profile = await repo.getProfileByUserId(userId);
    const interests = profile ? await repo.getUserInterests(profile.profileId) : [];

    return {
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role
      },
      profile,
      interests
    };
  }
}

