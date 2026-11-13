import { getRepository } from '../repositories/repositoryFactory.js';

export class ReviewService {
  static async createReview(reviewerProfileId, data) {
    const repo = getRepository();

    if (reviewerProfileId === data.revieweeProfileId) {
      const err = new Error('You cannot review yourself.');
      err.statusCode = 400;
      throw err;
    }

    const activity = await repo.getActivityById(data.activityId);
    if (!activity) {
      const err = new Error('Activity not found.');
      err.statusCode = 404;
      throw err;
    }

    // Check participation
    const participants = await repo.listActivityParticipants(data.activityId);
    const participantIds = new Set(participants.map(p => p.profileId));
    participantIds.add(activity.hostProfileId);

    if (!participantIds.has(reviewerProfileId)) {
      const err = new Error('Only confirmed participants or the host can submit a review.');
      err.statusCode = 403;
      throw err;
    }

    if (!participantIds.has(data.revieweeProfileId)) {
      const err = new Error('You can only review someone who participated in this activity.');
      err.statusCode = 400;
      throw err;
    }

    // Check for duplicate reviews
    const existing = await repo.getReviewsForProfile(data.revieweeProfileId);
    const alreadyReviewed = existing.some(
      r => r.activityId === data.activityId && r.reviewerProfileId === reviewerProfileId
    );
    if (alreadyReviewed) {
      const err = new Error('You have already submitted a review for this participant in this activity.');
      err.statusCode = 409;
      throw err;
    }

    return repo.createReview({
      activityId: data.activityId,
      reviewerProfileId,
      revieweeProfileId: data.revieweeProfileId,
      rating: data.rating,
      comment: data.comment
    });
  }

  static async getReviewsForUser(profileId) {
    const repo = getRepository();
    return repo.getReviewsForProfile(profileId);
  }
}

