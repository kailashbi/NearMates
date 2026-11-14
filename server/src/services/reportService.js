import { getRepository } from '../repositories/repositoryFactory.js';

export class ReportService {
  static async createReport(reporterProfileId, data) {
    const repo = getRepository();

    if (data.reportedProfileId && data.reportedProfileId === reporterProfileId) {
      const err = new Error('You cannot report yourself.');
      err.statusCode = 400;
      throw err;
    }

    const report = await repo.createReport({
      reporterProfileId,
      reportedProfileId: data.reportedProfileId || null,
      activityId: data.activityId || null,
      category: data.category || 'other',
      reason: data.reason,
      description: data.description || '',
      evidenceUrl: data.evidenceUrl || '',
      evidenceText: data.evidenceText || ''
    });

    return report;
  }

  static async getMyReports(reporterProfileId) {
    const repo = getRepository();
    const all = await repo.listReports();
    return all.filter(r => r.reporterProfileId === reporterProfileId);
  }
}

