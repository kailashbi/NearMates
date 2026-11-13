import { getRepository } from '../repositories/repositoryFactory.js';

export class AdminService {
  static async getDashboardStats() {
    const repo = getRepository();
    return repo.getAdminStats();
  }

  static async listUsers(filters) {
    const repo = getRepository();
    return repo.listUsers(filters);
  }

  static async listReports(status) {
    const repo = getRepository();
    return repo.listReports(status);
  }

  static async updateReport(reportId, status) {
    const repo = getRepository();
    return repo.updateReportStatus(reportId, status);
  }
}

