import { getRepository } from '../repositories/repositoryFactory.js';

export class AdminService {
  static async getDashboardStats() {
    const repo = getRepository();
    return repo.getAdminStats();
  }

  static async listUsers(filters = {}) {
    const repo = getRepository();
    return repo.listUsers(filters);
  }

  static async banUser(userId, reason, adminId) {
    const repo = getRepository();
    return repo.banUser(userId, reason, adminId);
  }

  static async suspendUser(userId, days = 7, reason, adminId) {
    const repo = getRepository();
    const suspendedUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * days).toISOString();
    return repo.suspendUser(userId, suspendedUntil, reason, adminId);
  }

  static async unsuspendUser(userId) {
    const repo = getRepository();
    return repo.unsuspendUser(userId);
  }

  static async warnUser(userId, reason, adminId) {
    const repo = getRepository();
    return repo.warnUser(userId, reason, adminId);
  }

  static async listActivities(filters = {}) {
    const repo = getRepository();
    return repo.listActivitiesAdmin(filters);
  }

  static async getActivityDetails(activityId) {
    const repo = getRepository();
    const data = await repo.getActivityWithParticipants(activityId);
    if (!data) {
      const err = new Error('Activity not found.');
      err.statusCode = 404;
      throw err;
    }
    return data;
  }

  static async moderateActivity(activityId, action, reason, adminId) {
    const repo = getRepository();
    return repo.moderateActivity(activityId, action, reason, adminId);
  }

  static async listReports(filters = {}) {
    const repo = getRepository();
    return repo.listReports(filters);
  }

  static async getReportDetails(reportId) {
    const repo = getRepository();
    const report = await repo.getReportById(reportId);
    if (!report) {
      const err = new Error('Report not found.');
      err.statusCode = 404;
      throw err;
    }
    return report;
  }

  static async updateReport(reportId, status) {
    const repo = getRepository();
    return repo.updateReportStatus(reportId, status);
  }

  static async resolveReport(reportId, updateData, adminId) {
    const repo = getRepository();
    const report = await repo.getReportById(reportId);
    if (!report) {
      const err = new Error('Report not found.');
      err.statusCode = 404;
      throw err;
    }

    const payload = {
      ...updateData,
      moderatedBy: adminId
    };

    // Execute linked moderation action if specified
    if (updateData.actionTaken === 'warning_issued' && report.reportedProfileId) {
      const profile = await repo.getProfileById(report.reportedProfileId);
      if (profile && profile.userId) {
        await repo.warnUser(profile.userId, updateData.adminNotes || report.reason, adminId);
      }
    } else if (updateData.actionTaken === 'user_suspended' && report.reportedProfileId) {
      const profile = await repo.getProfileById(report.reportedProfileId);
      if (profile && profile.userId) {
        const days = updateData.suspensionDays || 7;
        const suspendedUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * days).toISOString();
        await repo.suspendUser(profile.userId, suspendedUntil, updateData.adminNotes || report.reason, adminId);
      }
    } else if (updateData.actionTaken === 'user_banned' && report.reportedProfileId) {
      const profile = await repo.getProfileById(report.reportedProfileId);
      if (profile && profile.userId) {
        await repo.banUser(profile.userId, updateData.adminNotes || report.reason, adminId);
      }
    } else if (updateData.actionTaken === 'activity_removed' && report.activityId) {
      await repo.moderateActivity(report.activityId, 'remove', updateData.adminNotes || report.reason, adminId);
    }

    return repo.resolveReport(reportId, payload);
  }
}
