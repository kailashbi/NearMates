import { getRepository } from '../repositories/repositoryFactory.js';
import { calculateHaversineDistanceKm } from '../utils/distance.js';

export class MatchingEngine {
  // Configurable weights (summing to 100)
  static DEFAULT_WEIGHTS = {
    location: 40,
    interests: 30,
    availability: 20,
    activity: 10
  };

  /**
   * Calculate compatibility score between current user profile and a candidate profile.
   */
  static calculateScore(currentUser, candidate, currentUserActivities = [], weights = MatchingEngine.DEFAULT_WEIGHTS) {
    // 1. Location Proximity Score (Max 40)
    let locationScore = 0;
    const distanceKm = calculateHaversineDistanceKm(
      currentUser.latitude,
      currentUser.longitude,
      candidate.latitude,
      candidate.longitude
    );

    const maxRadius = currentUser.searchRadiusKm || 20;

    if (distanceKm !== null) {
      if (distanceKm <= 1) {
        locationScore = weights.location; // Max points if within 1km
      } else if (distanceKm <= maxRadius) {
        // Linear decay from max weight down to 20% of max weight at boundary
        const factor = 1 - (distanceKm / maxRadius);
        locationScore = Math.round(weights.location * (0.2 + 0.8 * Math.max(0, factor)));
      }
    }

    // 2. Shared Interests Score (Max 30)
    let interestScore = 0;
    const myInterests = new Set(currentUser.interests || []);
    const candidateInterests = candidate.interests || [];
    const sharedInterests = candidateInterests.filter(i => myInterests.has(i));

    if (myInterests.size > 0 && candidateInterests.length > 0) {
      // Jaccard similarity index
      const union = new Set([...myInterests, ...candidateInterests]);
      const similarity = sharedInterests.length / union.size;
      interestScore = Math.round(weights.interests * Math.min(1, similarity * 2)); // 50% overlap gets full score
    }

    // 3. Availability Compatibility (Max 20)
    let availabilityScore = 0;
    if (candidate.availabilityStatus === 'available') {
      availabilityScore = weights.availability;
    } else if (candidate.availabilityStatus === 'busy') {
      availabilityScore = Math.round(weights.availability * 0.4);
    } else {
      availabilityScore = 0;
    }

    // 4. Activity Compatibility (Max 10)
    let activityScore = 0;
    // Check if candidate's interests overlap with any active activities hosted by current user
    if (currentUserActivities.length > 0 && candidateInterests.length > 0) {
      const activeCategories = new Set(currentUserActivities.map(a => a.categoryId));
      const hasMatch = candidateInterests.some(ci => activeCategories.has(ci));
      if (hasMatch) {
        activityScore = weights.activity;
      }
    }

    const totalScore = Math.min(100, Math.max(0, locationScore + interestScore + availabilityScore + activityScore));

    return {
      matchScore: totalScore,
      breakdown: {
        locationScore,
        interestScore,
        availabilityScore,
        activityScore
      },
      approxDistanceKm: distanceKm !== null ? distanceKm : 0,
      sharedInterests
    };
  }

  /**
   * Find and rank matching candidates for the given profile.
   */
  static async findMatches(profileId, options = {}) {
    const repo = getRepository();
    const currentUser = await repo.getProfileById(profileId);
    if (!currentUser) {
      const err = new Error('User profile not found.');
      err.statusCode = 404;
      throw err;
    }

    const radiusKm = options.radiusKm || currentUser.searchRadiusKm || 25;
    const limit = options.limit || 20;

    // Get nearby discoverable candidates
    const candidates = await repo.findNearbyProfiles(
      currentUser.latitude,
      currentUser.longitude,
      radiusKm,
      profileId
    );

    // Get current user's active activities
    const myActivities = await repo.listActivities({ hostProfileId: profileId });

    // Fetch taxonomy for interest names
    const allInterests = await repo.getAllInterests();
    const interestNameMap = new Map(allInterests.map(i => [i.interestId, i.name]));

    const matches = candidates.map(candidate => {
      const matchData = MatchingEngine.calculateScore(currentUser, candidate, myActivities);
      return {
        user: {
          profileId: candidate.profileId,
          displayName: candidate.displayName,
          bio: candidate.bio,
          avatarUrl: candidate.avatarUrl,
          locationName: candidate.locationName,
          availabilityStatus: candidate.availabilityStatus,
          rating: candidate.rating,
          reviewCount: candidate.reviewCount
        },
        matchScore: matchData.matchScore,
        breakdown: matchData.breakdown,
        approxDistanceKm: matchData.approxDistanceKm,
        sharedInterests: matchData.sharedInterests.map(id => interestNameMap.get(id) || id)
      };
    });

    // Sort by matchScore descending
    matches.sort((a, b) => b.matchScore - a.matchScore);

    return matches.slice(0, limit);
  }
}

