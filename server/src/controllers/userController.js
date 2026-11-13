import { UserService } from '../services/userService.js';
import { updateProfileSchema } from '../validators/schemaValidators.js';

export class UserController {
  static async getMe(req, res, next) {
    try {
      const profile = await UserService.getProfile(req.user.profileId);
      res.status(200).json(profile);
    } catch (err) {
      next(err);
    }
  }

  static async updateMe(req, res, next) {
    try {
      const { error, value } = updateProfileSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          statusCode: 400,
          error: 'Bad Request',
          message: error.details[0].message
        });
      }

      const updated = await UserService.updateProfile(req.user.profileId, value);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  static async getProfileById(req, res, next) {
    try {
      const profile = await UserService.getProfile(req.params.id, req.user?.profileId);
      res.status(200).json(profile);
    } catch (err) {
      next(err);
    }
  }

  static async getAllInterests(req, res, next) {
    try {
      const interests = await UserService.getInterests();
      res.status(200).json({ interests });
    } catch (err) {
      next(err);
    }
  }

  static async getUserInterests(req, res, next) {
    try {
      const profileId = req.user.profileId;
      const interests = await UserService.getUserInterests(profileId);
      res.status(200).json({ interests });
    } catch (err) {
      next(err);
    }
  }

  static async setUserInterests(req, res, next) {
    try {
      const { interestIds } = req.body;
      if (!Array.isArray(interestIds)) {
        return res.status(400).json({
          statusCode: 400,
          error: 'Bad Request',
          message: 'interestIds must be an array of interest IDs.'
        });
      }
      const interests = await UserService.setUserInterests(req.user.profileId, interestIds);
      res.status(200).json({ interests });
    } catch (err) {
      next(err);
    }
  }
}

