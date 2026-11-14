import { AdminService } from '../services/adminService.js';
import {
  banUserSchema,
  suspendUserSchema,
  warnUserSchema,
  moderateActivitySchema,
  resolveReportSchema
} from '../validators/schemaValidators.js';

export class AdminController {
  static async getDashboard(req, res, next) {
    try {
      const stats = await AdminService.getDashboardStats();
      res.status(200).json(stats);
    } catch (err) {
      next(err);
    }
  }

  // User Management
  static async listUsers(req, res, next) {
    try {
      const users = await AdminService.listUsers(req.query);
      res.status(200).json({ items: users, total: users.length });
    } catch (err) {
      next(err);
    }
  }

  static async banUser(req, res, next) {
    try {
      const { error, value } = banUserSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ statusCode: 400, message: error.details[0].message });
      }
      const user = await AdminService.banUser(req.params.id, value.reason, req.user.userId);
      res.status(200).json({ message: 'User permanently banned successfully.', user });
    } catch (err) {
      next(err);
    }
  }

  static async suspendUser(req, res, next) {
    try {
      const { error, value } = suspendUserSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ statusCode: 400, message: error.details[0].message });
      }
      const user = await AdminService.suspendUser(req.params.id, value.days, value.reason, req.user.userId);
      res.status(200).json({ message: `User suspended for ${value.days || 7} days.`, user });
    } catch (err) {
      next(err);
    }
  }

  static async unsuspendUser(req, res, next) {
    try {
      const user = await AdminService.unsuspendUser(req.params.id);
      res.status(200).json({ message: 'User reinstated to active status.', user });
    } catch (err) {
      next(err);
    }
  }

  static async warnUser(req, res, next) {
    try {
      const { error, value } = warnUserSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ statusCode: 400, message: error.details[0].message });
      }
      const user = await AdminService.warnUser(req.params.id, value.reason, req.user.userId);
      res.status(200).json({ message: 'Formal warning issued to user.', user });
    } catch (err) {
      next(err);
    }
  }

  // Activity Management
  static async listActivities(req, res, next) {
    try {
      const activities = await AdminService.listActivities(req.query);
      res.status(200).json({ items: activities, total: activities.length });
    } catch (err) {
      next(err);
    }
  }

  static async getActivityDetails(req, res, next) {
    try {
      const details = await AdminService.getActivityDetails(req.params.id);
      res.status(200).json(details);
    } catch (err) {
      next(err);
    }
  }

  static async removeActivity(req, res, next) {
    try {
      const { error, value } = moderateActivitySchema.validate({ action: 'remove', reason: req.body.reason });
      if (error) {
        return res.status(400).json({ statusCode: 400, message: error.details[0].message });
      }
      const act = await AdminService.moderateActivity(req.params.id, 'remove', value.reason, req.user.userId);
      res.status(200).json({ message: 'Inappropriate activity removed.', activity: act });
    } catch (err) {
      next(err);
    }
  }

  static async cancelActivity(req, res, next) {
    try {
      const { error, value } = moderateActivitySchema.validate({ action: 'cancel', reason: req.body.reason });
      if (error) {
        return res.status(400).json({ statusCode: 400, message: error.details[0].message });
      }
      const act = await AdminService.moderateActivity(req.params.id, 'cancel', value.reason, req.user.userId);
      res.status(200).json({ message: 'Activity cancelled as fraudulent or unsafe.', activity: act });
    } catch (err) {
      next(err);
    }
  }

  // Reports & Moderation
  static async listReports(req, res, next) {
    try {
      const reports = await AdminService.listReports(req.query);
      res.status(200).json({ items: reports, total: reports.length });
    } catch (err) {
      next(err);
    }
  }

  static async getReportDetails(req, res, next) {
    try {
      const report = await AdminService.getReportDetails(req.params.id);
      res.status(200).json(report);
    } catch (err) {
      next(err);
    }
  }

  static async updateReport(req, res, next) {
    try {
      const updated = await AdminService.updateReport(req.params.id, req.body.status);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  static async resolveReport(req, res, next) {
    try {
      const { error, value } = resolveReportSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ statusCode: 400, message: error.details[0].message });
      }
      const resolved = await AdminService.resolveReport(req.params.id, value, req.user.userId);
      res.status(200).json({ message: 'Moderation decision recorded.', report: resolved });
    } catch (err) {
      next(err);
    }
  }
}
