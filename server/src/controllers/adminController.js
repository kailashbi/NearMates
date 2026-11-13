import { AdminService } from '../services/adminService.js';

export class AdminController {
  static async getDashboard(req, res, next) {
    try {
      const stats = await AdminService.getDashboardStats();
      res.status(200).json(stats);
    } catch (err) {
      next(err);
    }
  }

  static async listUsers(req, res, next) {
    try {
      const users = await AdminService.listUsers(req.query);
      res.status(200).json({ items: users, total: users.length });
    } catch (err) {
      next(err);
    }
  }

  static async listReports(req, res, next) {
    try {
      const reports = await AdminService.listReports(req.query.status);
      res.status(200).json({ items: reports });
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
}

