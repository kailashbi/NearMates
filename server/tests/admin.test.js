import test from 'node:test';
import assert from 'node:assert/strict';
import { AdminService } from '../src/services/adminService.js';
import { AuthService } from '../src/services/authService.js';
import { ReportService } from '../src/services/reportService.js';
import { initializeRepository, getRepository } from '../src/repositories/repositoryFactory.js';

test('Admin: Dashboard overview returns active users, suspended/banned accounts, activities, reports', async () => {
  await initializeRepository();
  const stats = await AdminService.getDashboardStats();

  assert.ok(stats.totalUsers >= 5, 'Should count total users');
  assert.ok(stats.activeUsersDaily >= 1, 'Should count daily active users');
  assert.ok(stats.activeUsersWeekly >= 1, 'Should count weekly active users');
  assert.ok(stats.totalActivities >= 1, 'Should count total activities');
  assert.equal(typeof stats.suspendedUsers, 'number', 'Should count suspended accounts');
  assert.equal(typeof stats.bannedUsers, 'number', 'Should count banned accounts');
  assert.equal(typeof stats.totalReports, 'number', 'Should count reports');
});

test('Admin: Ban and Suspend user accounts with documented reasons', async () => {
  await initializeRepository();
  const repo = getRepository();

  // Create temporary user to test moderation
  const user = await repo.createUser({
    email: `spammer_${Date.now()}@nearmates.com`,
    passwordHash: 'dummyhash',
    displayName: 'Spam Bot',
    role: 'user'
  });

  // Suspend
  const suspended = await AdminService.suspendUser(user.userId, 7, 'Repeated unsolicited spam messages', 'admin-id');
  assert.equal(suspended.status, 'suspended');
  assert.equal(suspended.suspensionReason, 'Repeated unsolicited spam messages');
  assert.ok(suspended.suspendedUntil);

  // Unsuspend
  const reactivated = await AdminService.unsuspendUser(user.userId);
  assert.equal(reactivated.status, 'active');
  assert.equal(reactivated.suspendedUntil, null);

  // Issue warning
  const warned = await AdminService.warnUser(user.userId, 'Inappropriate bio language', 'admin-id');
  assert.equal(warned.warningCount, 1);

  // Permanently ban
  const banned = await AdminService.banUser(user.userId, 'Repeated harassment and scam activity', 'admin-id');
  assert.equal(banned.status, 'banned');
  assert.equal(banned.banReason, 'Repeated harassment and scam activity');
});

test('Admin: Activity moderation (view participants, remove inappropriate, cancel unsafe)', async () => {
  await initializeRepository();
  const activities = await AdminService.listActivities();
  assert.ok(activities.length > 0, 'Should list activities');

  const act = activities[0];
  const details = await AdminService.getActivityDetails(act.activityId);
  assert.ok(details.activity, 'Should fetch activity');
  assert.ok(Array.isArray(details.participants), 'Should fetch participants list');

  // Cancel unsafe activity
  const cancelled = await AdminService.moderateActivity(act.activityId, 'cancel', 'Unsafe severe weather alert', 'admin-id');
  assert.equal(cancelled.status, 'cancelled');
  assert.equal(cancelled.cancellationReason, 'Unsafe severe weather alert');
});

test('Reports & Moderation: User reports, admin investigation, evidence review, and resolution', async () => {
  await initializeRepository();
  const repo = getRepository();

  // User submits report
  const report = await ReportService.createReport('p1111111-1111-1111-1111-111111111111', {
    reportedProfileId: 'p2222222-2222-2222-2222-222222222222',
    category: 'harassment',
    reason: 'Abusive language in activity chat',
    description: 'User repeatedly sent offensive messages directed at team members.',
    evidenceText: 'Threatening chat transcript sample'
  });

  assert.ok(report.reportId);
  assert.equal(report.status, 'pending');
  assert.equal(report.category, 'harassment');

  // Admin marks investigating
  const updated = await AdminService.updateReport(report.reportId, 'investigating');
  assert.equal(updated.status, 'investigating');

  // Admin resolves report with decision
  const resolved = await AdminService.resolveReport(report.reportId, {
    status: 'resolved',
    adminNotes: 'Evidence verified from chat log. Formal warning issued to user.',
    actionTaken: 'warning_issued'
  }, 'admin-id');

  assert.equal(resolved.status, 'resolved');
  assert.equal(resolved.actionTaken, 'warning_issued');
  assert.ok(resolved.adminNotes);
});

