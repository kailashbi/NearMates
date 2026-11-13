import { getRepository } from '../repositories/repositoryFactory.js';
import { NotificationService } from './notificationService.js';

export class ActivityService {
  static async createActivity(hostProfileId, data) {
    const repo = getRepository();

    const activity = await repo.createActivity({
      hostProfileId,
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      locationName: data.locationName,
      locationDescription: data.locationDescription,
      latitude: data.latitude,
      longitude: data.longitude,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      minParticipants: data.minParticipants,
      maxParticipants: data.maxParticipants,
      estimatedCost: data.estimatedCost,
      visibility: data.visibility,
      joinPolicy: data.joinPolicy
    });

    // Notify nearby users with matching interests asynchronously
    setTimeout(async () => {
      try {
        const nearby = await repo.findNearbyProfiles(activity.latitude, activity.longitude, 25, hostProfileId);
        for (const user of nearby) {
          if (user.interests && user.interests.includes(activity.categoryId)) {
            await NotificationService.createNotification({
              recipientProfileId: user.profileId,
              type: 'match',
              title: `New ${activity.categoryName} Nearby!`,
              message: `${activity.hostName} just posted "${activity.title}". Check it out!`,
              activityId: activity.activityId,
              data: { activityId: activity.activityId }
            });
          }
        }
      } catch (e) {
        // Log & proceed
      }
    }, 100);

    return activity;
  }

  static async getActivityById(activityId, viewerProfileId = null) {
    const repo = getRepository();
    const act = await repo.getActivityById(activityId);
    if (!act) {
      const err = new Error('Activity not found.');
      err.statusCode = 404;
      throw err;
    }

    let userMembership = null;
    let pendingRequests = [];

    if (viewerProfileId) {
      userMembership = await repo.getMembership(activityId, viewerProfileId);
      if (act.hostProfileId === viewerProfileId) {
        pendingRequests = await repo.listActivityRequests(activityId);
      }
    }

    return {
      ...act,
      isHost: viewerProfileId ? act.hostProfileId === viewerProfileId : false,
      userMembership: userMembership ? userMembership.status : 'none',
      userMembershipId: userMembership ? userMembership.membershipId : null,
      pendingRequests
    };
  }

  static async listActivities(filters, viewerProfileId = null) {
    const repo = getRepository();
    if (filters.latitude && filters.longitude) {
      return repo.findNearbyActivities(
        parseFloat(filters.latitude),
        parseFloat(filters.longitude),
        parseFloat(filters.radiusKm) || 15,
        filters
      );
    }
    return repo.listActivities(filters);
  }

  static async updateActivity(activityId, hostProfileId, updateData) {
    const repo = getRepository();
    const act = await repo.getActivityById(activityId);
    if (!act) {
      const err = new Error('Activity not found.');
      err.statusCode = 404;
      throw err;
    }
    if (act.hostProfileId !== hostProfileId) {
      const err = new Error('Only the host can update this activity.');
      err.statusCode = 403;
      throw err;
    }
    return repo.updateActivity(activityId, updateData);
  }

  static async cancelActivity(activityId, hostProfileId) {
    const repo = getRepository();
    const act = await repo.getActivityById(activityId);
    if (!act) {
      const err = new Error('Activity not found.');
      err.statusCode = 404;
      throw err;
    }
    if (act.hostProfileId !== hostProfileId) {
      const err = new Error('Only the host can cancel this activity.');
      err.statusCode = 403;
      throw err;
    }
    await repo.deleteActivity(activityId);

    // Notify all participants
    const participants = await repo.listActivityParticipants(activityId);
    for (const p of participants) {
      await NotificationService.createNotification({
        recipientProfileId: p.profileId,
        type: 'activity_cancelled',
        title: 'Activity Cancelled',
        message: `The activity "${act.title}" was cancelled by the host.`,
        activityId,
        data: { activityId }
      });
    }

    return { message: 'Activity successfully cancelled.' };
  }

  static async joinActivity(activityId, profileId) {
    const repo = getRepository();
    const act = await repo.getActivityById(activityId);
    if (!act) {
      const err = new Error('Activity not found.');
      err.statusCode = 404;
      throw err;
    }
    if (act.hostProfileId === profileId) {
      const err = new Error('You are already the host of this activity.');
      err.statusCode = 400;
      throw err;
    }
    if (act.status !== 'open') {
      const err = new Error('This activity is no longer accepting participants.');
      err.statusCode = 400;
      throw err;
    }

    const existingMembership = await repo.getMembership(activityId, profileId);
    if (existingMembership) {
      if (existingMembership.status === 'approved') {
        const err = new Error('You are already an approved participant.');
        err.statusCode = 400;
        throw err;
      }
      if (existingMembership.status === 'requested') {
        const err = new Error('Your join request is currently pending host approval.');
        err.statusCode = 400;
        throw err;
      }
    }

    // Capacity check
    const participants = await repo.listActivityParticipants(activityId);
    if (participants.length + 1 >= act.maxParticipants) {
      const err = new Error('This activity has reached full capacity.');
      err.statusCode = 409;
      throw err;
    }

    const autoApprove = act.joinPolicy === 'auto_join';
    const status = autoApprove ? 'approved' : 'requested';

    const membership = await repo.createMembership({
      activityId,
      profileId,
      status
    });

    const applicant = await repo.getProfileById(profileId);

    // Notify the host
    await NotificationService.createNotification({
      recipientProfileId: act.hostProfileId,
      type: autoApprove ? 'system' : 'join_request',
      title: autoApprove ? 'New Participant Joined' : 'New Join Request',
      message: `${applicant?.displayName || 'A user'} ${autoApprove ? 'joined' : 'requested to join'} "${act.title}".`,
      activityId,
      data: { activityId, membershipId: membership.membershipId }
    });

    return {
      status: membership.status,
      membershipId: membership.membershipId,
      message: autoApprove ? 'Joined successfully!' : 'Join request submitted for host review.'
    };
  }

  static async leaveActivity(activityId, profileId) {
    const repo = getRepository();
    const membership = await repo.getMembership(activityId, profileId);
    if (!membership) {
      const err = new Error('You do not have an active membership in this activity.');
      err.statusCode = 404;
      throw err;
    }
    await repo.deleteMembership(activityId, profileId);
    return { message: 'Successfully left activity.' };
  }

  static async handleMembershipRequest(activityId, hostProfileId, membershipId, decision) {
    const repo = getRepository();
    const act = await repo.getActivityById(activityId);
    if (!act || act.hostProfileId !== hostProfileId) {
      const err = new Error('Unauthorized or activity not found.');
      err.statusCode = 403;
      throw err;
    }

    const newStatus = decision === 'approve' ? 'approved' : 'rejected';
    const updated = await repo.updateMembershipStatus(membershipId, newStatus);
    if (!updated) {
      const err = new Error('Membership request not found.');
      err.statusCode = 404;
      throw err;
    }

    // Notify user
    await NotificationService.createNotification({
      recipientProfileId: updated.profileId,
      type: decision === 'approve' ? 'request_approved' : 'request_rejected',
      title: decision === 'approve' ? 'Request Approved!' : 'Request Update',
      message: decision === 'approve'
        ? `Your request to join "${act.title}" was approved!`
        : `Your request to join "${act.title}" was not accepted this time.`,
      activityId,
      data: { activityId }
    });

    return updated;
  }
}

