import { IRepository } from './IRepository.js';
import {
  DEMO_USERS,
  DEMO_INTERESTS,
  DEMO_ACTIVITIES,
  DEMO_MEMBERSHIPS,
  DEMO_MESSAGES,
  DEMO_NOTIFICATIONS,
  DEMO_REVIEWS,
  DEMO_REPORTS
} from '../../seeds/demoData.js';
import { calculateHaversineDistanceKm } from '../utils/distance.js';
import { logger } from '../utils/logger.js';

export class InMemoryRepository extends IRepository {
  constructor() {
    super();
    // Deep clone demo arrays to prevent mutation of original seeds
    this.users = JSON.parse(JSON.stringify(DEMO_USERS));
    this.interests = JSON.parse(JSON.stringify(DEMO_INTERESTS));
    this.activities = JSON.parse(JSON.stringify(DEMO_ACTIVITIES));
    this.memberships = JSON.parse(JSON.stringify(DEMO_MEMBERSHIPS));
    this.messages = JSON.parse(JSON.stringify(DEMO_MESSAGES));
    this.notifications = JSON.parse(JSON.stringify(DEMO_NOTIFICATIONS));
    this.reviews = JSON.parse(JSON.stringify(DEMO_REVIEWS));
    this.reports = JSON.parse(JSON.stringify(DEMO_REPORTS || []));
    this.blocks = [];
    this.conversations = [];
    this.directMessages = [];

    logger.info('InMemoryRepository initialized with seed demo data.');
  }

  // --- Users & Auth ---
  async createUser(userData) {
    const userId = userData.userId || `u-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const profileId = userData.profileId || `p-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newUser = {
      userId,
      profileId,
      email: userData.email.toLowerCase(),
      passwordHash: userData.passwordHash,
      role: userData.role || 'user',
      status: userData.status || 'active',
      banReason: userData.banReason || null,
      suspendedUntil: userData.suspendedUntil || null,
      suspensionReason: userData.suspensionReason || null,
      warningCount: userData.warningCount || 0,
      displayName: userData.displayName || 'New Explorer',
      bio: userData.bio || '',
      avatarUrl: userData.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      age: userData.age || null,
      locationName: userData.locationName || 'Local Area',
      latitude: userData.latitude || 37.7749,
      longitude: userData.longitude || -122.4194,
      availabilityStatus: 'available',
      searchRadiusKm: 15,
      isDiscoverable: true,
      interests: userData.interests || [],
      rating: 5.0,
      reviewCount: 0,
      lastActiveAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
  }

  async findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findUserById(userId) {
    return this.users.find(u => u.userId === userId) || null;
  }

  async updateUser(userId, data) {
    const user = await this.findUserById(userId);
    if (!user) return null;
    Object.assign(user, data);
    return user;
  }

  async listUsers(filters = {}) {
    let result = [...this.users];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(u =>
        u.displayName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.userId?.toLowerCase().includes(q)
      );
    }
    if (filters.status && filters.status !== 'all') {
      result = result.filter(u => (u.status || 'active') === filters.status);
    }
    if (filters.role && filters.role !== 'all') {
      result = result.filter(u => u.role === filters.role);
    }

    // Attach reports count and user properties
    const mapped = result.map(u => {
      const reportsAgainst = this.reports.filter(r => r.reportedProfileId === u.profileId);
      const profile = this._sanitizeProfile(u);
      return {
        ...profile,
        email: u.email,
        reportsCount: reportsAgainst.length,
        hasReports: reportsAgainst.length > 0
      };
    });

    if (filters.reportedOnly === 'true' || filters.reportedOnly === true) {
      return mapped.filter(u => u.reportsCount > 0);
    }
    return mapped;
  }

  // --- Profiles ---
  async getProfileByUserId(userId) {
    const user = await this.findUserById(userId);
    if (!user) return null;
    return this._sanitizeProfile(user);
  }

  async getProfileById(profileId) {
    const user = this.users.find(u => u.profileId === profileId);
    if (!user) return null;
    return this._sanitizeProfile(user);
  }

  async updateProfile(profileId, updateData) {
    const user = this.users.find(u => u.profileId === profileId);
    if (!user) return null;
    if (updateData.displayName !== undefined) user.displayName = updateData.displayName;
    if (updateData.bio !== undefined) user.bio = updateData.bio;
    if (updateData.avatarUrl !== undefined) user.avatarUrl = updateData.avatarUrl;
    if (updateData.age !== undefined) user.age = updateData.age;
    if (updateData.locationName !== undefined) user.locationName = updateData.locationName;
    if (updateData.latitude !== undefined) user.latitude = updateData.latitude;
    if (updateData.longitude !== undefined) user.longitude = updateData.longitude;
    if (updateData.availabilityStatus !== undefined) user.availabilityStatus = updateData.availabilityStatus;
    if (updateData.searchRadiusKm !== undefined) user.searchRadiusKm = updateData.searchRadiusKm;
    if (updateData.isDiscoverable !== undefined) user.isDiscoverable = updateData.isDiscoverable;
    if (updateData.interests !== undefined) user.interests = updateData.interests;
    return this._sanitizeProfile(user);
  }

  async findNearbyProfiles(lat, lng, radiusKm = 15, currentProfileId = null) {
    return this.users
      .filter(u => {
        if (!u.isDiscoverable) return false;
        if (currentProfileId && u.profileId === currentProfileId) return false;
        if (this._isBlocked(currentProfileId, u.profileId)) return false;
        const dist = calculateHaversineDistanceKm(lat, lng, u.latitude, u.longitude);
        return dist !== null && dist <= radiusKm;
      })
      .map(u => {
        const profile = this._sanitizeProfile(u);
        profile.approxDistanceKm = calculateHaversineDistanceKm(lat, lng, u.latitude, u.longitude);
        return profile;
      })
      .sort((a, b) => a.approxDistanceKm - b.approxDistanceKm);
  }

  // --- Interests ---
  async getAllInterests() {
    return this.interests;
  }

  async getUserInterests(profileId) {
    const user = this.users.find(u => u.profileId === profileId);
    if (!user || !user.interests) return [];
    return this.interests.filter(i => user.interests.includes(i.interestId));
  }

  async setUserInterests(profileId, interestIds) {
    const user = this.users.find(u => u.profileId === profileId);
    if (!user) return [];
    user.interests = interestIds;
    return this.getUserInterests(profileId);
  }

  // --- Activities ---
  async createActivity(activityData) {
    const activityId = activityData.activityId || `a-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const hostProfile = await this.getProfileById(activityData.hostProfileId);

    const interest = this.interests.find(i => i.interestId === activityData.categoryId);

    const newActivity = {
      activityId,
      hostProfileId: activityData.hostProfileId,
      hostName: hostProfile ? hostProfile.displayName : 'Host',
      hostAvatar: hostProfile ? hostProfile.avatarUrl : null,
      title: activityData.title,
      description: activityData.description,
      categoryId: activityData.categoryId,
      categoryName: interest ? interest.name : 'Activity',
      categoryGroup: interest ? interest.category : 'General',
      locationName: activityData.locationName,
      locationDescription: activityData.locationDescription || '',
      latitude: activityData.latitude || 37.7749,
      longitude: activityData.longitude || -122.4194,
      startsAt: activityData.startsAt,
      endsAt: activityData.endsAt || null,
      minParticipants: activityData.minParticipants || 1,
      maxParticipants: activityData.maxParticipants || 10,
      estimatedCost: activityData.estimatedCost !== undefined ? activityData.estimatedCost : 0,
      visibility: activityData.visibility || 'public',
      joinPolicy: activityData.joinPolicy || 'approval',
      status: 'open',
      createdAt: new Date().toISOString()
    };

    this.activities.unshift(newActivity);

    // Initial message from host if description provided
    if (newActivity.description) {
      await this.createActivityMessage(activityId, activityData.hostProfileId, newActivity.description);
    }

    return newActivity;
  }

  async getActivityById(activityId) {
    const act = this.activities.find(a => a.activityId === activityId);
    if (!act) return null;

    const participants = await this.listActivityParticipants(activityId);
    const host = await this.getProfileById(act.hostProfileId);

    return {
      ...act,
      hostName: host ? host.displayName : act.hostName,
      hostAvatar: host ? host.avatarUrl : act.hostAvatar,
      participantCount: participants.length + 1, // include host
      remainingPlaces: Math.max(0, act.maxParticipants - (participants.length + 1)),
      participants
    };
  }

  async updateActivity(activityId, data) {
    const act = this.activities.find(a => a.activityId === activityId);
    if (!act) return null;
    Object.assign(act, data);
    return this.getActivityById(activityId);
  }

  async deleteActivity(activityId) {
    const idx = this.activities.findIndex(a => a.activityId === activityId);
    if (idx !== -1) {
      this.activities[idx].status = 'cancelled';
      return true;
    }
    return false;
  }

  async listActivities(filters = {}) {
    let result = [...this.activities].filter(a => a.status !== 'cancelled');

    if (filters.categoryId) {
      result = result.filter(a => a.categoryId === filters.categoryId);
    }
    if (filters.categoryGroup) {
      result = result.filter(a => a.categoryGroup === filters.categoryGroup);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.locationName.toLowerCase().includes(q)
      );
    }
    if (filters.from) {
      result = result.filter(a => new Date(a.startsAt) >= new Date(filters.from));
    }
    if (filters.to) {
      result = result.filter(a => new Date(a.startsAt) <= new Date(filters.to));
    }
    if (filters.status) {
      result = result.filter(a => a.status === filters.status);
    }

    // Attach participant counts
    const mapped = await Promise.all(result.map(async (act) => {
      const parts = await this.listActivityParticipants(act.activityId);
      return {
        ...act,
        participantCount: parts.length + 1,
        remainingPlaces: Math.max(0, act.maxParticipants - (parts.length + 1))
      };
    }));

    return mapped;
  }

  async findNearbyActivities(lat, lng, radiusKm = 15, filters = {}) {
    const all = await this.listActivities(filters);
    return all
      .map(a => {
        const dist = calculateHaversineDistanceKm(lat, lng, a.latitude, a.longitude);
        return {
          ...a,
          approxDistanceKm: dist !== null ? dist : 0
        };
      })
      .filter(a => a.approxDistanceKm <= radiusKm)
      .sort((a, b) => a.approxDistanceKm - b.approxDistanceKm);
  }

  // --- Memberships ---
  async getMembership(activityId, profileId) {
    return this.memberships.find(m => m.activityId === activityId && m.profileId === profileId) || null;
  }

  async createMembership(membershipData) {
    const membershipId = `m-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newMembership = {
      membershipId,
      activityId: membershipData.activityId,
      profileId: membershipData.profileId,
      role: membershipData.role || 'participant',
      status: membershipData.status || 'requested',
      requestedAt: new Date().toISOString(),
      decidedAt: membershipData.status === 'approved' ? new Date().toISOString() : null
    };
    this.memberships.push(newMembership);
    return newMembership;
  }

  async updateMembershipStatus(membershipId, status) {
    const m = this.memberships.find(mem => mem.membershipId === membershipId);
    if (!m) return null;
    m.status = status;
    m.decidedAt = new Date().toISOString();
    return m;
  }

  async listActivityParticipants(activityId) {
    const approved = this.memberships.filter(m => m.activityId === activityId && m.status === 'approved');
    return Promise.all(approved.map(async m => {
      const p = await this.getProfileById(m.profileId);
      return {
        membershipId: m.membershipId,
        profileId: m.profileId,
        displayName: p?.displayName || 'Participant',
        avatarUrl: p?.avatarUrl,
        role: m.role,
        joinedAt: m.decidedAt || m.requestedAt
      };
    }));
  }

  async listActivityRequests(activityId) {
    const requested = this.memberships.filter(m => m.activityId === activityId && m.status === 'requested');
    return Promise.all(requested.map(async m => {
      const p = await this.getProfileById(m.profileId);
      return {
        membershipId: m.membershipId,
        profileId: m.profileId,
        displayName: p?.displayName || 'Applicant',
        avatarUrl: p?.avatarUrl,
        bio: p?.bio,
        requestedAt: m.requestedAt
      };
    }));
  }

  async listUserMemberships(profileId) {
    return this.memberships.filter(m => m.profileId === profileId);
  }

  async deleteMembership(activityId, profileId) {
    const idx = this.memberships.findIndex(m => m.activityId === activityId && m.profileId === profileId);
    if (idx !== -1) {
      this.memberships.splice(idx, 1);
      return true;
    }
    return false;
  }

  // --- Chat & Messages ---
  async createActivityMessage(activityId, senderProfileId, content) {
    const sender = await this.getProfileById(senderProfileId);
    const msg = {
      messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      activityId,
      senderProfileId,
      senderName: sender ? sender.displayName : 'Participant',
      senderAvatar: sender ? sender.avatarUrl : null,
      content,
      createdAt: new Date().toISOString()
    };
    this.messages.push(msg);
    return msg;
  }

  async getActivityMessages(activityId, limit = 50, offset = 0) {
    const filtered = this.messages
      .filter(m => m.activityId === activityId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const total = filtered.length;
    const items = filtered.slice(offset, offset + limit);
    return {
      items,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  }

  async getOrCreateDirectConversation(profileId1, profileId2) {
    let conv = this.conversations.find(c =>
      (c.member1 === profileId1 && c.member2 === profileId2) ||
      (c.member1 === profileId2 && c.member2 === profileId1)
    );
    if (!conv) {
      conv = {
        conversationId: `c-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        member1: profileId1,
        member2: profileId2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.conversations.push(conv);
    }
    return conv;
  }

  async createDirectMessage(conversationId, senderProfileId, content) {
    const sender = await this.getProfileById(senderProfileId);
    const msg = {
      messageId: `dm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      conversationId,
      senderProfileId,
      senderName: sender?.displayName || 'User',
      senderAvatar: sender?.avatarUrl,
      content,
      readAt: null,
      createdAt: new Date().toISOString()
    };
    this.directMessages.push(msg);

    const conv = this.conversations.find(c => c.conversationId === conversationId);
    if (conv) conv.updatedAt = msg.createdAt;

    return msg;
  }

  async getDirectMessages(conversationId, limit = 50, offset = 0) {
    const msgs = this.directMessages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const total = msgs.length;
    const items = msgs.slice(offset, offset + limit);
    return { items, pagination: { total, limit, offset, hasMore: offset + limit < total } };
  }

  async getConversationsForProfile(profileId) {
    const profileConvs = this.conversations.filter(c => c.member1 === profileId || c.member2 === profileId);

    return Promise.all(profileConvs.map(async conv => {
      const partnerId = conv.member1 === profileId ? conv.member2 : conv.member1;
      const partner = await this.getProfileById(partnerId);
      const lastMsg = this.directMessages
        .filter(m => m.conversationId === conv.conversationId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      return {
        conversationId: conv.conversationId,
        partner: partner ? {
          profileId: partner.profileId,
          displayName: partner.displayName,
          avatarUrl: partner.avatarUrl,
          availabilityStatus: partner.availabilityStatus
        } : null,
        lastMessage: lastMsg || null,
        updatedAt: conv.updatedAt
      };
    }));
  }

  // --- Notifications ---
  async createNotification(notifData) {
    const notif = {
      notificationId: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      recipientProfileId: notifData.recipientProfileId,
      type: notifData.type,
      title: notifData.title,
      message: notifData.message,
      activityId: notifData.activityId || null,
      data: notifData.data || {},
      readAt: null,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(notif);
    return notif;
  }

  async getUserNotifications(profileId, limit = 20, offset = 0) {
    const userNotifs = this.notifications
      .filter(n => n.recipientProfileId === profileId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const unreadCount = userNotifs.filter(n => !n.readAt).length;
    const total = userNotifs.length;
    const items = userNotifs.slice(offset, offset + limit);

    return {
      items,
      unreadCount,
      pagination: { total, limit, offset, hasMore: offset + limit < total }
    };
  }

  async markNotificationRead(notificationId, profileId) {
    const n = this.notifications.find(notif => notif.notificationId === notificationId && notif.recipientProfileId === profileId);
    if (n) {
      n.readAt = new Date().toISOString();
      return n;
    }
    return null;
  }

  async markAllNotificationsRead(profileId) {
    const now = new Date().toISOString();
    this.notifications
      .filter(n => n.recipientProfileId === profileId && !n.readAt)
      .forEach(n => { n.readAt = now; });
    return true;
  }

  async getUnreadNotificationCount(profileId) {
    return this.notifications.filter(n => n.recipientProfileId === profileId && !n.readAt).length;
  }

  // --- Reviews ---
  async createReview(reviewData) {
    const reviewer = await this.getProfileById(reviewData.reviewerProfileId);
    const rev = {
      reviewId: `r-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      activityId: reviewData.activityId,
      reviewerProfileId: reviewData.reviewerProfileId,
      reviewerName: reviewer ? reviewer.displayName : 'Participant',
      revieweeProfileId: reviewData.revieweeProfileId,
      rating: reviewData.rating,
      comment: reviewData.comment || '',
      createdAt: new Date().toISOString()
    };
    this.reviews.push(rev);

    // Update reviewee aggregate rating
    const userReviews = this.reviews.filter(r => r.revieweeProfileId === reviewData.revieweeProfileId);
    const avg = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
    const user = this.users.find(u => u.profileId === reviewData.revieweeProfileId);
    if (user) {
      user.rating = Math.round(avg * 10) / 10;
      user.reviewCount = userReviews.length;
    }

    return rev;
  }

  async getReviewsForProfile(profileId) {
    return this.reviews
      .filter(r => r.revieweeProfileId === profileId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // --- Moderation ---
  async blockUser(blockerProfileId, blockedProfileId) {
    if (!this.blocks.some(b => b.blocker === blockerProfileId && b.blocked === blockedProfileId)) {
      this.blocks.push({ blocker: blockerProfileId, blocked: blockedProfileId });
    }
    return true;
  }

  async unblockUser(blockerProfileId, blockedProfileId) {
    this.blocks = this.blocks.filter(b => !(b.blocker === blockerProfileId && b.blocked === blockedProfileId));
    return true;
  }

  async isUserBlocked(profileId1, profileId2) {
    return this._isBlocked(profileId1, profileId2);
  }

  async createReport(reportData) {
    const reporter = this.users.find(u => u.profileId === reportData.reporterProfileId);
    let reportedName = null;
    let reportedAvatar = null;
    let activityTitle = null;

    if (reportData.reportedProfileId) {
      const rep = this.users.find(u => u.profileId === reportData.reportedProfileId);
      if (rep) {
        reportedName = rep.displayName;
        reportedAvatar = rep.avatarUrl;
      }
    }
    if (reportData.activityId) {
      const act = this.activities.find(a => a.activityId === reportData.activityId);
      if (act) {
        activityTitle = act.title;
        if (!reportData.reportedProfileId) {
          reportData.reportedProfileId = act.hostProfileId;
          const host = this.users.find(u => u.profileId === act.hostProfileId);
          if (host) {
            reportedName = host.displayName;
            reportedAvatar = host.avatarUrl;
          }
        }
      }
    }

    const report = {
      reportId: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      reporterProfileId: reportData.reporterProfileId,
      reporterName: reporter ? reporter.displayName : 'Member',
      reporterAvatar: reporter ? reporter.avatarUrl : null,
      reportedProfileId: reportData.reportedProfileId || null,
      reportedName,
      reportedAvatar,
      activityId: reportData.activityId || null,
      activityTitle,
      category: reportData.category || 'other',
      reason: reportData.reason,
      description: reportData.description || '',
      evidenceUrl: reportData.evidenceUrl || '',
      evidenceText: reportData.evidenceText || '',
      status: 'pending',
      adminNotes: '',
      actionTaken: 'none',
      moderatedBy: null,
      moderatedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.reports.unshift(report);
    return report;
  }

  async listReports(filters = {}) {
    let result = [...this.reports];
    if (filters.status && filters.status !== 'all') {
      result = result.filter(r => r.status === filters.status);
    }
    if (filters.category && filters.category !== 'all') {
      result = result.filter(r => r.category === filters.category);
    }
    return result;
  }

  async getReportById(reportId) {
    return this.reports.find(r => r.reportId === reportId) || null;
  }

  async updateReportStatus(reportId, status) {
    const r = this.reports.find(rep => rep.reportId === reportId);
    if (r) {
      r.status = status;
      r.updatedAt = new Date().toISOString();
      return r;
    }
    return null;
  }

  async resolveReport(reportId, updateData) {
    const r = this.reports.find(rep => rep.reportId === reportId);
    if (!r) throw new Error('Report not found.');

    r.status = updateData.status || 'resolved';
    if (updateData.adminNotes !== undefined) r.adminNotes = updateData.adminNotes;
    if (updateData.actionTaken !== undefined) r.actionTaken = updateData.actionTaken;
    if (updateData.moderatedBy !== undefined) r.moderatedBy = updateData.moderatedBy;
    r.moderatedAt = new Date().toISOString();
    r.updatedAt = new Date().toISOString();

    if (r.reporterProfileId) {
      await this.createNotification({
        recipientProfileId: r.reporterProfileId,
        type: 'report_updated',
        title: 'Safety Report Update',
        message: `Your report regarding "${r.reason}" has been reviewed by moderation (${r.status}). Thank you for keeping NearMates safe!`
      });
    }

    return r;
  }

  // --- Admin Moderation & Management Actions ---
  async banUser(userId, reason, adminId = null) {
    const user = await this.findUserById(userId);
    if (!user) throw new Error('User not found.');
    user.status = 'banned';
    user.banReason = reason;
    user.bannedAt = new Date().toISOString();
    user.bannedBy = adminId;
    user.isDiscoverable = false;
    user.availabilityStatus = 'offline';

    await this.createNotification({
      recipientProfileId: user.profileId,
      type: 'account_banned',
      title: 'Account Permanently Banned',
      message: `Your NearMates account was permanently banned by moderation. Reason: ${reason}`
    });

    return this._sanitizeProfile(user);
  }

  async suspendUser(userId, suspendedUntil, reason, adminId = null) {
    const user = await this.findUserById(userId);
    if (!user) throw new Error('User not found.');
    user.status = 'suspended';
    user.suspendedUntil = suspendedUntil;
    user.suspensionReason = reason;
    user.suspendedAt = new Date().toISOString();
    user.suspendedBy = adminId;
    user.isDiscoverable = false;
    user.availabilityStatus = 'offline';

    await this.createNotification({
      recipientProfileId: user.profileId,
      type: 'account_suspended',
      title: 'Account Suspended',
      message: `Your account is suspended until ${new Date(suspendedUntil).toLocaleDateString()}. Reason: ${reason}`
    });

    return this._sanitizeProfile(user);
  }

  async unsuspendUser(userId) {
    const user = await this.findUserById(userId);
    if (!user) throw new Error('User not found.');
    user.status = 'active';
    user.suspendedUntil = null;
    user.suspensionReason = null;
    user.banReason = null;
    user.isDiscoverable = true;
    user.availabilityStatus = 'available';

    await this.createNotification({
      recipientProfileId: user.profileId,
      type: 'account_reactivated',
      title: 'Account Reinstated',
      message: 'Your NearMates account suspension/ban has been lifted. You can now participate in activities again.'
    });

    return this._sanitizeProfile(user);
  }

  async warnUser(userId, reason, adminId = null) {
    const user = await this.findUserById(userId);
    if (!user) throw new Error('User not found.');
    user.warningCount = (user.warningCount || 0) + 1;

    await this.createNotification({
      recipientProfileId: user.profileId,
      type: 'moderation_warning',
      title: `Formal Moderation Warning (${user.warningCount}/3)`,
      message: `Warning issued by moderation team: ${reason}. Repeated community violations may lead to account suspension.`
    });

    return this._sanitizeProfile(user);
  }

  async listActivitiesAdmin(filters = {}) {
    let result = [...this.activities];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.locationName?.toLowerCase().includes(q) ||
        a.categoryName?.toLowerCase().includes(q)
      );
    }
    if (filters.status && filters.status !== 'all') {
      result = result.filter(a => a.status === filters.status);
    }
    if (filters.category && filters.category !== 'all') {
      result = result.filter(a => a.categoryId === filters.category);
    }

    return result.map(a => {
      const host = this.users.find(u => u.profileId === a.hostProfileId);
      const participantMembers = this.memberships.filter(m => m.activityId === a.activityId && m.status === 'approved');
      const reports = this.reports.filter(r => r.activityId === a.activityId);
      return {
        ...a,
        hostName: host ? host.displayName : (a.hostName || 'Host'),
        hostAvatar: host ? host.avatarUrl : a.hostAvatar,
        hostEmail: host ? host.email : null,
        approvedParticipantsCount: participantMembers.length + 1,
        pendingRequestsCount: this.memberships.filter(m => m.activityId === a.activityId && m.status === 'requested').length,
        reportsCount: reports.length
      };
    });
  }

  async getActivityWithParticipants(activityId) {
    const activity = this.activities.find(a => a.activityId === activityId);
    if (!activity) return null;
    const host = this.users.find(u => u.profileId === activity.hostProfileId);
    const members = this.memberships.filter(m => m.activityId === activityId);
    const reports = this.reports.filter(r => r.activityId === activityId);

    const detailedMembers = members.map(m => {
      const user = this.users.find(u => u.profileId === m.profileId);
      return {
        ...m,
        displayName: user ? user.displayName : 'Member',
        email: user ? user.email : null,
        avatarUrl: user ? user.avatarUrl : null,
        rating: user ? user.rating : 5.0
      };
    });

    return {
      activity: {
        ...activity,
        hostName: host ? host.displayName : activity.hostName,
        hostEmail: host ? host.email : null,
        hostAvatar: host ? host.avatarUrl : activity.hostAvatar
      },
      participants: detailedMembers,
      reports
    };
  }

  async moderateActivity(activityId, action, reason, adminId = null) {
    const activity = this.activities.find(a => a.activityId === activityId);
    if (!activity) throw new Error('Activity not found.');

    if (action === 'remove') {
      activity.status = 'removed';
      activity.moderationNotes = reason;
      activity.removedAt = new Date().toISOString();
      activity.moderatedBy = adminId;
    } else if (action === 'cancel') {
      activity.status = 'cancelled';
      activity.cancellationReason = reason;
      activity.cancelledAt = new Date().toISOString();
      activity.moderatedBy = adminId;
    }

    // Notify host
    await this.createNotification({
      recipientProfileId: activity.hostProfileId,
      type: 'activity_moderated',
      title: action === 'remove' ? 'Activity Removed by Moderation' : 'Activity Cancelled by Moderation',
      message: `Your activity "${activity.title}" was ${action === 'remove' ? 'removed for community guidelines violations' : 'cancelled as fraudulent/unsafe'}. Reason: ${reason}`,
      activityId: activity.activityId
    });

    // Notify approved participants
    const approved = this.memberships.filter(m => m.activityId === activityId && m.status === 'approved');
    for (const member of approved) {
      if (member.profileId !== activity.hostProfileId) {
        await this.createNotification({
          recipientProfileId: member.profileId,
          type: 'activity_cancelled',
          title: `Activity Cancelled: ${activity.title}`,
          message: `The activity "${activity.title}" has been cancelled by platform moderation. Reason: ${reason}`,
          activityId: activity.activityId
        });
      }
    }

    return activity;
  }

  // --- Admin Analytics ---
  async getAdminStats() {
    const now = Date.now();
    const oneDay = 1000 * 60 * 60 * 24;
    const sevenDays = oneDay * 7;
    const thirtyDays = oneDay * 30;

    const activeDaily = this.users.filter(u => {
      const ts = new Date(u.lastActiveAt || u.createdAt).getTime();
      return (now - ts) <= oneDay || u.availabilityStatus === 'available';
    }).length;

    const activeWeekly = this.users.filter(u => {
      const ts = new Date(u.lastActiveAt || u.createdAt).getTime();
      return (now - ts) <= sevenDays || u.availabilityStatus === 'available';
    }).length;

    const activeMonthly = this.users.filter(u => {
      const ts = new Date(u.lastActiveAt || u.createdAt).getTime();
      return (now - ts) <= thirtyDays;
    }).length;

    return {
      totalUsers: this.users.length,
      activeUsersDaily: activeDaily,
      activeUsersWeekly: activeWeekly,
      activeUsersMonthly: activeMonthly,
      suspendedUsers: this.users.filter(u => u.status === 'suspended').length,
      bannedUsers: this.users.filter(u => u.status === 'banned').length,
      totalActivities: this.activities.length,
      openActivities: this.activities.filter(a => a.status === 'open').length,
      completedActivities: this.activities.filter(a => a.status === 'completed').length,
      cancelledActivities: this.activities.filter(a => a.status === 'cancelled').length,
      removedActivities: this.activities.filter(a => a.status === 'removed').length,
      totalReviews: this.reviews.length,
      totalReports: this.reports.length,
      pendingReports: this.reports.filter(r => r.status === 'pending').length,
      investigatingReports: this.reports.filter(r => r.status === 'investigating').length,
      resolvedReports: this.reports.filter(r => r.status === 'resolved').length,
      rejectedReports: this.reports.filter(r => r.status === 'rejected').length
    };
  }

  // --- Private Helpers ---
  _sanitizeProfile(user) {
    return {
      profileId: user.profileId,
      userId: user.userId,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      age: user.age,
      locationName: user.locationName,
      latitude: user.latitude,
      longitude: user.longitude,
      availabilityStatus: user.availabilityStatus,
      searchRadiusKm: user.searchRadiusKm,
      isDiscoverable: user.isDiscoverable,
      interests: user.interests || [],
      rating: user.rating,
      reviewCount: user.reviewCount,
      role: user.role,
      status: user.status || 'active',
      warningCount: user.warningCount || 0,
      banReason: user.banReason || null,
      suspendedUntil: user.suspendedUntil || null,
      suspensionReason: user.suspensionReason || null,
      lastActiveAt: user.lastActiveAt || user.createdAt,
      createdAt: user.createdAt
    };
  }

  _isBlocked(p1, p2) {
    if (!p1 || !p2) return false;
    return this.blocks.some(b =>
      (b.blocker === p1 && b.blocked === p2) ||
      (b.blocker === p2 && b.blocked === p1)
    );
  }
}
