import { ActivityService } from '../services/activityService.js';
import { createActivitySchema, updateActivitySchema } from '../validators/schemaValidators.js';

export class ActivityController {
  static async create(req, res, next) {
    try {
      const { error, value } = createActivitySchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          statusCode: 400,
          error: 'Bad Request',
          message: error.details[0].message
        });
      }

      const activity = await ActivityService.createActivity(req.user.profileId, value);
      res.status(201).json(activity);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const activity = await ActivityService.getActivityById(req.params.id, req.user?.profileId);
      res.status(200).json(activity);
    } catch (err) {
      next(err);
    }
  }

  static async list(req, res, next) {
    try {
      const activities = await ActivityService.listActivities(req.query, req.user?.profileId);
      res.status(200).json({
        items: activities,
        total: activities.length
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { error, value } = updateActivitySchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          statusCode: 400,
          error: 'Bad Request',
          message: error.details[0].message
        });
      }

      const updated = await ActivityService.updateActivity(req.params.id, req.user.profileId, value);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  static async cancel(req, res, next) {
    try {
      const result = await ActivityService.cancelActivity(req.params.id, req.user.profileId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async join(req, res, next) {
    try {
      const result = await ActivityService.joinActivity(req.params.id, req.user.profileId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async leave(req, res, next) {
    try {
      const result = await ActivityService.leaveActivity(req.params.id, req.user.profileId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async approveRequest(req, res, next) {
    try {
      const result = await ActivityService.handleMembershipRequest(
        req.params.id,
        req.user.profileId,
        req.params.membershipId,
        'approve'
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async rejectRequest(req, res, next) {
    try {
      const result = await ActivityService.handleMembershipRequest(
        req.params.id,
        req.user.profileId,
        req.params.membershipId,
        'reject'
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

