import { UserService } from '../services/userService.js';
import { ActivityService } from '../services/activityService.js';
import { MatchingEngine } from '../services/matchingEngine.js';

export class DiscoveryController {
  static async getNearby(req, res, next) {
    try {
      const lat = parseFloat(req.query.lat);
      const lng = parseFloat(req.query.lng);
      const radiusKm = parseFloat(req.query.radiusKm) || 15;

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Valid lat and lng query parameters are required for nearby discovery.'
        });
      }

      const [nearbyUsers, nearbyActivities] = await Promise.all([
        UserService.getNearbyUsers(lat, lng, radiusKm, req.user?.profileId),
        ActivityService.listActivities({ latitude: lat, longitude: lng, radiusKm }, req.user?.profileId)
      ]);

      res.status(200).json({
        nearbyUsers,
        nearbyActivities,
        userLocation: { latitude: lat, longitude: lng, radiusKm }
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMatches(req, res, next) {
    try {
      const radiusKm = req.query.radiusKm ? parseFloat(req.query.radiusKm) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit) : 20;

      const matches = await MatchingEngine.findMatches(req.user.profileId, {
        radiusKm,
        limit
      });

      res.status(200).json({ matches });
    } catch (err) {
      next(err);
    }
  }
}

