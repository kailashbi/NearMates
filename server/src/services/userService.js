import { getRepository } from '../repositories/repositoryFactory.js';
import { calculateHaversineDistanceKm } from '../utils/distance.js';

export class UserService {
  static async getProfile(profileId, viewerProfileId = null) {
    const repo = getRepository();
    const profile = await repo.getProfileById(profileId);
    if (!profile) {
      const err = new Error('Profile not found.');
      err.statusCode = 404;
      throw err;
    }

    const interests = await repo.getUserInterests(profileId);
    let approxDistanceKm = null;

    if (viewerProfileId && viewerProfileId !== profileId) {
      const viewer = await repo.getProfileById(viewerProfileId);
      if (viewer && viewer.latitude && profile.latitude) {
        approxDistanceKm = calculateHaversineDistanceKm(
          viewer.latitude,
          viewer.longitude,
          profile.latitude,
          profile.longitude
        );
      }
    }

    return {
      profileId: profile.profileId,
      displayName: profile.displayName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      age: profile.age,
      locationName: profile.locationName,
      availabilityStatus: profile.availabilityStatus,
      rating: profile.rating,
      reviewCount: profile.reviewCount,
      approxDistanceKm,
      interests
    };
  }

  static async updateProfile(profileId, updateData) {
    const repo = getRepository();
    const updated = await repo.updateProfile(profileId, updateData);
    if (updateData.interests && Array.isArray(updateData.interests)) {
      await repo.setUserInterests(profileId, updateData.interests);
    }
    const interests = await repo.getUserInterests(profileId);
    return { ...updated, interests };
  }

  static async getInterests() {
    const repo = getRepository();
    return repo.getAllInterests();
  }

  static async getUserInterests(profileId) {
    const repo = getRepository();
    return repo.getUserInterests(profileId);
  }

  static async setUserInterests(profileId, interestIds) {
    const repo = getRepository();
    return repo.setUserInterests(profileId, interestIds);
  }

  static async getNearbyUsers(lat, lng, radiusKm, currentProfileId) {
    const repo = getRepository();
    return repo.findNearbyProfiles(lat, lng, radiusKm, currentProfileId);
  }
}

