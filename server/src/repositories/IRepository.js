/**
 * Repository interface contract that both SupabaseRepository and InMemoryRepository satisfy.
 */
export class IRepository {
  // Users & Auth
  async createUser(userData) { throw new Error('Not implemented'); }
  async findUserByEmail(email) { throw new Error('Not implemented'); }
  async findUserById(userId) { throw new Error('Not implemented'); }
  async updateUser(userId, data) { throw new Error('Not implemented'); }
  async listUsers(filters) { throw new Error('Not implemented'); }

  // Profiles
  async getProfileByUserId(userId) { throw new Error('Not implemented'); }
  async getProfileById(profileId) { throw new Error('Not implemented'); }
  async updateProfile(profileId, updateData) { throw new Error('Not implemented'); }
  async findNearbyProfiles(lat, lng, radiusKm, currentProfileId) { throw new Error('Not implemented'); }

  // Interests
  async getAllInterests() { throw new Error('Not implemented'); }
  async getUserInterests(profileId) { throw new Error('Not implemented'); }
  async setUserInterests(profileId, interestIds) { throw new Error('Not implemented'); }

  // Activities
  async createActivity(activityData) { throw new Error('Not implemented'); }
  async getActivityById(activityId) { throw new Error('Not implemented'); }
  async updateActivity(activityId, data) { throw new Error('Not implemented'); }
  async listActivities(filters) { throw new Error('Not implemented'); }
  async findNearbyActivities(lat, lng, radiusKm, filters) { throw new Error('Not implemented'); }
  async deleteActivity(activityId) { throw new Error('Not implemented'); }

  // Memberships
  async getMembership(activityId, profileId) { throw new Error('Not implemented'); }
  async createMembership(membershipData) { throw new Error('Not implemented'); }
  async updateMembershipStatus(membershipId, status) { throw new Error('Not implemented'); }
  async listActivityParticipants(activityId) { throw new Error('Not implemented'); }
  async listActivityRequests(activityId) { throw new Error('Not implemented'); }
  async listUserMemberships(profileId) { throw new Error('Not implemented'); }
  async deleteMembership(activityId, profileId) { throw new Error('Not implemented'); }

  // Chat & Messages
  async createActivityMessage(activityId, senderProfileId, content) { throw new Error('Not implemented'); }
  async getActivityMessages(activityId, limit, offset) { throw new Error('Not implemented'); }
  async getConversationsForProfile(profileId) { throw new Error('Not implemented'); }
  async getDirectMessages(conversationId, limit, offset) { throw new Error('Not implemented'); }
  async createDirectMessage(conversationId, senderProfileId, content) { throw new Error('Not implemented'); }
  async getOrCreateDirectConversation(profileId1, profileId2) { throw new Error('Not implemented'); }

  // Notifications
  async createNotification(notifData) { throw new Error('Not implemented'); }
  async getUserNotifications(profileId, limit, offset) { throw new Error('Not implemented'); }
  async markNotificationRead(notificationId, profileId) { throw new Error('Not implemented'); }
  async markAllNotificationsRead(profileId) { throw new Error('Not implemented'); }
  async getUnreadNotificationCount(profileId) { throw new Error('Not implemented'); }

  // Reviews
  async createReview(reviewData) { throw new Error('Not implemented'); }
  async getReviewsForProfile(profileId) { throw new Error('Not implemented'); }

  // Moderation (Blocks & Reports)
  async blockUser(blockerProfileId, blockedProfileId) { throw new Error('Not implemented'); }
  async unblockUser(blockerProfileId, blockedProfileId) { throw new Error('Not implemented'); }
  async isUserBlocked(profileId1, profileId2) { throw new Error('Not implemented'); }
  async createReport(reportData) { throw new Error('Not implemented'); }
  async listReports(status) { throw new Error('Not implemented'); }
  async updateReportStatus(reportId, status) { throw new Error('Not implemented'); }

  // Platform Analytics (Admin)
  async getAdminStats() { throw new Error('Not implemented'); }
}

