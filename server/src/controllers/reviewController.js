import { ReviewService } from '../services/reviewService.js';
import { reviewSchema } from '../validators/schemaValidators.js';

export class ReviewController {
  static async create(req, res, next) {
    try {
      const { error, value } = reviewSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          statusCode: 400,
          error: 'Bad Request',
          message: error.details[0].message
        });
      }

      const review = await ReviewService.createReview(req.user.profileId, value);
      res.status(201).json(review);
    } catch (err) {
      next(err);
    }
  }

  static async getForUser(req, res, next) {
    try {
      const reviews = await ReviewService.getReviewsForUser(req.params.id);
      res.status(200).json({ items: reviews });
    } catch (err) {
      next(err);
    }
  }
}

