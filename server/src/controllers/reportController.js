import { ReportService } from '../services/reportService.js';
import { reportSchema } from '../validators/schemaValidators.js';

export class ReportController {
  static async createReport(req, res, next) {
    try {
      const { error, value } = reportSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          statusCode: 400,
          error: 'Bad Request',
          message: error.details[0].message
        });
      }

      const report = await ReportService.createReport(req.user.profileId, value);
      res.status(201).json({
        message: 'Report submitted successfully. Our safety team will review it.',
        report
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMyReports(req, res, next) {
    try {
      const reports = await ReportService.getMyReports(req.user.profileId);
      res.status(200).json({ items: reports, total: reports.length });
    } catch (err) {
      next(err);
    }
  }
}
