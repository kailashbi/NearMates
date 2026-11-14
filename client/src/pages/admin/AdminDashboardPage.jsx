import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import {
  Shield,
  Users,
  Calendar,
  Star,
  Flag,
  CheckCircle,
  XCircle,
  Database,
  BarChart3,
  Search,
  Filter,
  AlertTriangle,
  UserX,
  UserCheck,
  Ban,
  Clock,
  Eye,
  Trash2,
  AlertOctagon,
  FileText,
  MapPin,
  ExternalLink,
  RefreshCw,
  ChevronRight,
  X,
  MessageSquare,
  Send,
  UserMinus,
  Check
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user: currentUser, isAdmin } = useAuth();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'activities' | 'reports'

  // User filters
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [reportedUsersOnly, setReportedUsersOnly] = useState(false);

  // Activity filters
  const [activitySearch, setActivitySearch] = useState('');
  const [activityStatusFilter, setActivityStatusFilter] = useState('all');

  // Report filters
  const [reportStatusFilter, setReportStatusFilter] = useState('all');
  const [reportCategoryFilter, setReportCategoryFilter] = useState('all');

  // Modals & Action Drawers state
  const [selectedUserForAction, setSelectedUserForAction] = useState(null);
  const [userActionType, setUserActionType] = useState(null); // 'ban' | 'suspend' | 'warn' | 'unsuspend'
  const [actionReason, setActionReason] = useState('');
  const [suspensionDays, setSuspensionDays] = useState(7);
  const [actionSubmitting, setActionSubmitting] = useState(false);

  // Activity participant modal
  const [selectedActivityDetails, setSelectedActivityDetails] = useState(null);
  const [activityActionType, setActivityActionType] = useState(null); // 'remove' | 'cancel'
  const [selectedActivityForAction, setSelectedActivityForAction] = useState(null);

  // Report investigation modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportAdminNotes, setReportAdminNotes] = useState('');
  const [reportActionTaken, setReportActionTaken] = useState('none');

  const loadAdminData = async () => {
    if (!isAdmin) return;
    try {
      const [statsRes, usersRes, activitiesRes, reportsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/admin/activities'),
        api.get('/admin/reports')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.items || []);
      setActivities(activitiesRes.data.items || []);
      setReports(reportsRes.data.items || []);
    } catch (err) {
      console.error('Admin API error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [isAdmin]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAdminData();
  };

  // --- User Moderation Actions ---
  const handleUserActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserForAction || !actionReason.trim()) return;

    setActionSubmitting(true);
    try {
      const userId = selectedUserForAction.userId;
      if (userActionType === 'ban') {
        await api.post(`/admin/users/${userId}/ban`, { reason: actionReason.trim() });
      } else if (userActionType === 'suspend') {
        await api.post(`/admin/users/${userId}/suspend`, {
          days: Number(suspensionDays),
          reason: actionReason.trim()
        });
      } else if (userActionType === 'warn') {
        await api.post(`/admin/users/${userId}/warn`, { reason: actionReason.trim() });
      } else if (userActionType === 'unsuspend') {
        await api.post(`/admin/users/${userId}/unsuspend`);
      }
      setSelectedUserForAction(null);
      setUserActionType(null);
      setActionReason('');
      loadAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply moderation action.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleQuickUnsuspend = async (user) => {
    if (!window.confirm(`Reinstate ${user.displayName} back to active standing?`)) return;
    try {
      await api.post(`/admin/users/${user.userId}/unsuspend`);
      loadAdminData();
    } catch (err) {
      alert('Failed to reinstate user.');
    }
  };

  // --- Activity Moderation Actions ---
  const handleOpenActivityDetails = async (activityId) => {
    try {
      const res = await api.get(`/admin/activities/${activityId}`);
      setSelectedActivityDetails(res.data);
    } catch (err) {
      alert('Failed to load activity details.');
    }
  };

  const handleActivityActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedActivityForAction || !actionReason.trim()) return;

    setActionSubmitting(true);
    try {
      const id = selectedActivityForAction.activityId;
      if (activityActionType === 'remove') {
        await api.post(`/admin/activities/${id}/remove`, { reason: actionReason.trim() });
      } else if (activityActionType === 'cancel') {
        await api.post(`/admin/activities/${id}/cancel`, { reason: actionReason.trim() });
      }
      setSelectedActivityForAction(null);
      setActivityActionType(null);
      setActionReason('');
      setSelectedActivityDetails(null);
      loadAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to moderate activity.');
    } finally {
      setActionSubmitting(false);
    }
  };

  // --- Report Moderation Actions ---
  const handleOpenReportInvestigation = (report) => {
    setSelectedReport(report);
    setReportAdminNotes(report.adminNotes || '');
    setReportActionTaken(report.actionTaken || 'none');
  };

  const handleUpdateReportStatus = async (status) => {
    if (!selectedReport) return;
    try {
      await api.put(`/admin/reports/${selectedReport.reportId}/status`, { status });
      setSelectedReport({ ...selectedReport, status });
      loadAdminData();
    } catch (err) {
      alert('Failed to update report status.');
    }
  };

  const handleResolveReport = async (resolutionStatus) => {
    if (!selectedReport) return;
    try {
      await api.put(`/admin/reports/${selectedReport.reportId}`, {
        status: resolutionStatus, // 'resolved' | 'rejected'
        adminNotes: reportAdminNotes.trim(),
        actionTaken: reportActionTaken
      });
      setSelectedReport(null);
      loadAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record moderation decision.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-white rounded-card border border-rose-200">
        <Shield className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-navy">Access Restricted</h2>
        <p className="text-xs text-slate-500 mt-1">This section requires administrative privileges.</p>
      </div>
    );
  }

  if (loading) return <LoadingSpinner text="Loading platform administration data..." />;

  // Filtered lists
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !userSearch ||
      u.displayName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchStatus = userStatusFilter === 'all' || (u.status || 'active') === userStatusFilter;
    const matchReported = !reportedUsersOnly || (u.reportsCount > 0);
    return matchSearch && matchStatus && matchReported;
  });

  const filteredActivities = activities.filter((a) => {
    const matchSearch =
      !activitySearch ||
      a.title?.toLowerCase().includes(activitySearch.toLowerCase()) ||
      a.locationName?.toLowerCase().includes(activitySearch.toLowerCase()) ||
      a.categoryName?.toLowerCase().includes(activitySearch.toLowerCase()) ||
      a.hostName?.toLowerCase().includes(activitySearch.toLowerCase());
    const matchStatus = activityStatusFilter === 'all' || a.status === activityStatusFilter;
    return matchSearch && matchStatus;
  });

  const filteredReports = reports.filter((r) => {
    const matchStatus = reportStatusFilter === 'all' || r.status === reportStatusFilter;
    const matchCategory = reportCategoryFilter === 'all' || r.category === reportCategoryFilter;
    return matchStatus && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-card border border-slate-border shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-primary mb-1">
            <Shield className="w-4 h-4 text-primary" />
            <span>NearMates Security, Moderation & Operations</span>
          </div>
          <h1 className="text-2xl font-black text-navy tracking-tight">Admin Console</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full control over registered accounts, spontaneous activities, safety reports, and platform compliance.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-btn text-xs font-bold text-slate-700 transition-colors"
            title="Refresh statistics and lists"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-card border border-slate-border shadow-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-btn text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-primary text-white shadow-sm'
              : 'text-slate-600 hover:text-navy hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>A. Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-btn text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-primary text-white shadow-sm'
              : 'text-slate-600 hover:text-navy hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>B. User Management ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-btn text-xs font-bold transition-all ${
            activeTab === 'activities'
              ? 'bg-primary text-white shadow-sm'
              : 'text-slate-600 hover:text-navy hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>C. Activity Management ({activities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-btn text-xs font-bold transition-all ${
            activeTab === 'reports'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy hover:bg-slate-50'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>D. Reports & Moderation ({reports.filter(r => r.status === 'pending').length} open)</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECTION A: DASHBOARD OVERVIEW */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Registered Users */}
            <div className="bg-white p-5 rounded-card border border-slate-border shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Registered Users</span>
                <Users className="w-4 h-4 text-primary" />
              </div>
              <p className="text-3xl font-black text-navy">{stats?.totalUsers || 0}</p>
              <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-slate-100 text-[11px]">
                <span className="text-emerald-600 font-bold">{stats?.activeUsersDaily || 0} active today</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">{stats?.activeUsersWeekly || 0} weekly</span>
              </div>
            </div>

            {/* Active Users (Daily, Weekly, Monthly) */}
            <div className="bg-white p-5 rounded-card border border-slate-border shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Active Engagement</span>
                <Clock className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-black text-emerald-600">{stats?.activeUsersDaily || 0}</p>
                <span className="text-xs text-slate-400 font-medium">Daily Active</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-400">Weekly: </span>
                  <span className="font-bold text-navy">{stats?.activeUsersWeekly || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400">Monthly: </span>
                  <span className="font-bold text-navy">{stats?.activeUsersMonthly || 0}</span>
                </div>
              </div>
            </div>

            {/* Total Activities Created */}
            <div className="bg-white p-5 rounded-card border border-slate-border shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Activities</span>
                <Calendar className="w-4 h-4 text-teal" />
              </div>
              <p className="text-3xl font-black text-navy">{stats?.totalActivities || 0}</p>
              <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-slate-100 text-[11px]">
                <span className="text-emerald-600 font-bold">{stats?.openActivities || 0} open</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">{stats?.completedActivities || 0} completed</span>
              </div>
            </div>

            {/* Suspended & Banned Accounts */}
            <div className="bg-white p-5 rounded-card border border-slate-border shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Suspended & Banned</span>
                <Ban className="w-4 h-4 text-rose-500" />
              </div>
              <div className="flex items-baseline space-x-3">
                <p className="text-3xl font-black text-rose-600">{stats?.bannedUsers || 0}</p>
                <span className="text-xs text-rose-600 font-bold">banned</span>
                <span className="text-slate-300">•</span>
                <span className="text-base font-black text-amber-600">{stats?.suspendedUsers || 0}</span>
                <span className="text-xs text-amber-600 font-bold">suspended</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span>{stats?.pendingReports || 0} pending safety reports</span>
              </div>
            </div>
          </div>

          {/* Activity Breakdown & Safety Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-card border border-slate-border p-6 shadow-sm">
              <h3 className="text-sm font-bold text-navy mb-4 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Activity Operations Breakdown</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-emerald-50 rounded-btn border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Open Meetups</span>
                  <p className="text-xl font-black text-emerald-800 mt-1">{stats?.openActivities || 0}</p>
                </div>
                <div className="p-3 bg-teal/10 rounded-btn border border-teal/20">
                  <span className="text-[10px] font-bold text-teal uppercase">Completed</span>
                  <p className="text-xl font-black text-teal mt-1">{stats?.completedActivities || 0}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-btn border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-800 uppercase">Cancelled</span>
                  <p className="text-xl font-black text-amber-900 mt-1">{stats?.cancelledActivities || 0}</p>
                </div>
                <div className="p-3 bg-rose-50 rounded-btn border border-rose-100">
                  <span className="text-[10px] font-bold text-rose-700 uppercase">Moderator Removed</span>
                  <p className="text-xl font-black text-rose-800 mt-1">{stats?.removedActivities || 0}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Verified participant feedback ratings:</span>
                <span className="font-bold text-navy flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{stats?.totalReviews || 0} Total Reviews logged</span>
                </span>
              </div>
            </div>

            {/* Quick Actions & Moderation Alerts */}
            <div className="bg-white rounded-card border border-slate-border p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-navy flex items-center space-x-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Safety & Moderation Queue</span>
              </h3>

              <div className="space-y-2.5">
                <div className="p-3 bg-rose-50 rounded-btn border border-rose-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Flag className="w-4 h-4 text-rose-600" />
                    <div>
                      <p className="text-xs font-bold text-rose-900">Pending Reports</p>
                      <p className="text-[11px] text-rose-700">Awaiting moderator review</p>
                    </div>
                  </div>
                  <span className="text-base font-black text-rose-700">{stats?.pendingReports || 0}</span>
                </div>

                <div className="p-3 bg-amber-50 rounded-btn border border-amber-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">Under Investigation</p>
                      <p className="text-[11px] text-amber-700">Evidence being verified</p>
                    </div>
                  </div>
                  <span className="text-base font-black text-amber-700">{stats?.investigatingReports || 0}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('reports')}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-btn text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Open Moderation Queue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION B: USER MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Controls & Filter Bar */}
          <div className="bg-white p-4 rounded-card border border-slate-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search registered users by name, email, or user ID..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-btn border border-slate-200 text-xs">
                {['all', 'active', 'suspended', 'banned'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setUserStatusFilter(st)}
                    className={`px-3 py-1 rounded capitalize font-bold transition-all ${
                      userStatusFilter === st
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-slate-600 hover:text-navy'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Reported users toggle */}
              <button
                onClick={() => setReportedUsersOnly(!reportedUsersOnly)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-btn text-xs font-bold border transition-colors ${
                  reportedUsersOnly
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Flag className="w-3.5 h-3.5 text-rose-500" />
                <span>Reported Users Only</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-card border border-slate-border overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-border font-bold">
                  <tr>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Safety Flags</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No registered users match the applied filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isBanned = u.status === 'banned';
                      const isSuspended = u.status === 'suspended';
                      return (
                        <tr key={u.userId} className="hover:bg-slate-50/70 transition-colors">
                          {/* Member info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'}
                                alt=""
                                className="w-9 h-9 rounded-full object-cover border border-slate-200"
                              />
                              <div>
                                <h4 className="font-bold text-navy flex items-center space-x-1.5">
                                  <span>{u.displayName}</span>
                                  {u.role === 'admin' && (
                                    <span className="px-1.5 py-0.2 bg-primary-light text-primary text-[9px] font-black rounded uppercase">
                                      Admin
                                    </span>
                                  )}
                                </h4>
                                <span className="text-[10px] text-slate-400">ID: {u.userId.slice(0, 12)}...</span>
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="py-3 px-4 font-medium text-slate-600">{u.email}</td>

                          {/* Account status */}
                          <td className="py-3 px-4">
                            {isBanned ? (
                              <div>
                                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px] inline-flex items-center space-x-1">
                                  <Ban className="w-3 h-3" />
                                  <span>Permanently Banned</span>
                                </span>
                                {u.banReason && (
                                  <p className="text-[10px] text-rose-600 mt-0.5 line-clamp-1" title={u.banReason}>
                                    {u.banReason}
                                  </p>
                                )}
                              </div>
                            ) : isSuspended ? (
                              <div>
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px] inline-flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Suspended</span>
                                </span>
                                {u.suspendedUntil && (
                                  <p className="text-[10px] text-amber-700 mt-0.5">
                                    Until {new Date(u.suspendedUntil).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                                Active
                              </span>
                            )}
                          </td>

                          {/* Safety Flags & Warnings */}
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              {u.warningCount > 0 ? (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-bold">
                                  {u.warningCount} Warnings
                                </span>
                              ) : (
                                <span className="text-slate-300 text-[11px]">—</span>
                              )}

                              {u.reportsCount > 0 && (
                                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px] font-bold flex items-center space-x-1">
                                  <Flag className="w-3 h-3" />
                                  <span>{u.reportsCount} Reports</span>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {u.locationName || 'Local'}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            {u.role !== 'admin' ? (
                              <div className="flex items-center justify-end space-x-1.5">
                                {isBanned || isSuspended ? (
                                  <button
                                    onClick={() => handleQuickUnsuspend(u)}
                                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[11px] font-bold transition-colors"
                                    title="Reinstate to active standing"
                                  >
                                    Reactivate
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedUserForAction(u);
                                        setUserActionType('warn');
                                      }}
                                      className="px-2 py-1 bg-slate-100 hover:bg-amber-100 text-amber-800 rounded text-[11px] font-bold transition-colors"
                                      title="Issue formal warning"
                                    >
                                      Warn
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedUserForAction(u);
                                        setUserActionType('suspend');
                                      }}
                                      className="px-2 py-1 bg-slate-100 hover:bg-amber-100 text-amber-800 rounded text-[11px] font-bold transition-colors"
                                      title="Suspend account for a period"
                                    >
                                      Suspend
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedUserForAction(u);
                                        setUserActionType('ban');
                                      }}
                                      className="px-2 py-1 bg-slate-100 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-bold transition-colors"
                                      title="Permanently ban account"
                                    >
                                      Ban
                                    </button>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-semibold">Protected</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION C: ACTIVITY MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'activities' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-card border border-slate-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                placeholder="Search activities by title, description, category, or location..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-btn border border-slate-200 text-xs">
              {['all', 'open', 'full', 'completed', 'cancelled', 'removed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setActivityStatusFilter(st)}
                  className={`px-3 py-1 rounded capitalize font-bold transition-all ${
                    activityStatusFilter === st
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-slate-600 hover:text-navy'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Activities Table */}
          <div className="bg-white rounded-card border border-slate-border overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-border font-bold">
                  <tr>
                    <th className="py-3 px-4">Activity Title</th>
                    <th className="py-3 px-4">Host</th>
                    <th className="py-3 px-4">Category & Location</th>
                    <th className="py-3 px-4">Participation</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredActivities.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No activities found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredActivities.map((act) => {
                      const isRemoved = act.status === 'removed';
                      const isCancelled = act.status === 'cancelled';
                      return (
                        <tr key={act.activityId} className="hover:bg-slate-50/70 transition-colors">
                          {/* Title */}
                          <td className="py-3 px-4 max-w-xs">
                            <h4 className="font-bold text-navy line-clamp-1">{act.title}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{act.description}</p>
                            {act.reportsCount > 0 && (
                              <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 bg-rose-50 text-rose-700 text-[10px] font-bold rounded mt-1">
                                <Flag className="w-3 h-3" />
                                <span>{act.reportsCount} Reports Against Activity</span>
                              </span>
                            )}
                          </td>

                          {/* Host */}
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <img
                                src={act.hostAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'}
                                alt=""
                                className="w-7 h-7 rounded-full object-cover"
                              />
                              <div>
                                <p className="font-bold text-navy">{act.hostName}</p>
                                <p className="text-[10px] text-slate-400">{act.hostEmail || 'host'}</p>
                              </div>
                            </div>
                          </td>

                          {/* Category & Location */}
                          <td className="py-3 px-4">
                            <span className="font-semibold text-primary">{act.categoryName || act.category}</span>
                            <div className="flex items-center space-x-1 text-slate-500 text-[11px] mt-0.5">
                              <MapPin className="w-3 h-3 text-orange-accent" />
                              <span className="truncate max-w-[150px]">{act.locationName}</span>
                            </div>
                          </td>

                          {/* Participation Monitor */}
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1 font-bold text-navy">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span>{act.approvedParticipantsCount || 1} / {act.maxParticipants} max</span>
                            </div>
                            {act.pendingRequestsCount > 0 && (
                              <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
                                {act.pendingRequestsCount} pending requests
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            {isRemoved ? (
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">
                                Removed
                              </span>
                            ) : isCancelled ? (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                                Cancelled
                              </span>
                            ) : act.status === 'open' ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                                Open
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-bold text-[10px] capitalize">
                                {act.status}
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => handleOpenActivityDetails(act.activityId)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-navy rounded text-[11px] font-bold transition-colors flex items-center space-x-1"
                                title="View activity participant roster"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Roster</span>
                              </button>

                              {!isRemoved && !isCancelled && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedActivityForAction(act);
                                      setActivityActionType('cancel');
                                    }}
                                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded text-[11px] font-bold transition-colors"
                                    title="Cancel fraudulent or unsafe activity"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedActivityForAction(act);
                                      setActivityActionType('remove');
                                    }}
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-bold transition-colors"
                                    title="Remove inappropriate activity"
                                  >
                                    Remove
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION D: REPORTS AND MODERATION */}
      {/* ======================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-card border border-slate-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
            {/* Status Pills */}
            <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-btn border border-slate-200 text-xs">
              {['all', 'pending', 'investigating', 'resolved', 'rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setReportStatusFilter(st)}
                  className={`px-3 py-1 rounded capitalize font-bold transition-all ${
                    reportStatusFilter === st
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-navy'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-bold text-slate-500">Violation Type:</span>
              <select
                value={reportCategoryFilter}
                onChange={(e) => setReportCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-btn text-xs font-bold focus:bg-white focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="fake_profile">Fake Profiles</option>
                <option value="harassment">Harassment</option>
                <option value="spam">Spam Accounts</option>
                <option value="inappropriate_photo">Inappropriate Photos</option>
                <option value="suspicious_activity">Suspicious Activities</option>
                <option value="abusive_message">Abusive Messages</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-card border border-slate-border p-6 shadow-card">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-navy">No Reports Found</h4>
                <p className="text-xs text-slate-400 mt-1">There are no open reports matching the selected filter criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((r) => {
                  const isPending = r.status === 'pending';
                  const isInvestigating = r.status === 'investigating';
                  const isResolved = r.status === 'resolved';

                  return (
                    <div
                      key={r.reportId}
                      className="p-5 bg-slate-50/70 hover:bg-slate-50 rounded-card border border-slate-200 transition-all flex flex-col md:flex-row items-start justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded font-black text-[10px] uppercase tracking-wider">
                            {r.category?.replace('_', ' ') || 'Report'}
                          </span>

                          <Badge
                            variant={
                              isPending
                                ? 'danger'
                                : isInvestigating
                                ? 'warning'
                                : isResolved
                                ? 'success'
                                : 'neutral'
                            }
                          >
                            {r.status}
                          </Badge>

                          <span className="text-[11px] text-slate-400">
                            Logged {new Date(r.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-navy">{r.reason}</h4>
                          {r.description && (
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{r.description}</p>
                          )}
                        </div>

                        {/* Target & Reporter Summary */}
                        <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-slate-500">
                          {r.reportedName && (
                            <div className="flex items-center space-x-1.5">
                              <span className="text-slate-400">Reported User:</span>
                              <span className="font-bold text-navy">{r.reportedName}</span>
                            </div>
                          )}

                          {r.activityTitle && (
                            <div className="flex items-center space-x-1.5">
                              <span className="text-slate-400">Activity:</span>
                              <span className="font-bold text-navy truncate max-w-[200px]">{r.activityTitle}</span>
                            </div>
                          )}

                          <div className="flex items-center space-x-1.5">
                            <span className="text-slate-400">Filed by:</span>
                            <span className="font-semibold text-slate-700">{r.reporterName || 'Member'}</span>
                          </div>
                        </div>

                        {/* Evidence preview if present */}
                        {(r.evidenceText || r.evidenceUrl) && (
                          <div className="p-2.5 bg-white rounded border border-slate-200 text-xs text-slate-700 mt-2">
                            <span className="font-bold text-[10px] text-slate-400 uppercase block mb-1">
                              Evidence Attached:
                            </span>
                            {r.evidenceText && <p className="italic">"{r.evidenceText}"</p>}
                            {r.evidenceUrl && (
                              <a
                                href={r.evidenceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline text-xs flex items-center space-x-1 mt-1 font-semibold"
                              >
                                <span>{r.evidenceUrl}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Admin resolution notes if resolved */}
                        {r.adminNotes && (
                          <div className="p-2.5 bg-emerald-50/50 rounded border border-emerald-200 text-xs text-emerald-900 mt-2">
                            <span className="font-bold text-[10px] uppercase block text-emerald-700 mb-0.5">
                              Moderation Decision ({r.actionTaken || 'resolved'}):
                            </span>
                            <p>{r.adminNotes}</p>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenReportInvestigation(r)}
                          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-btn text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>Investigate</span>
                        </button>

                        {isPending && (
                          <button
                            onClick={() => {
                              setSelectedReport(r);
                              handleUpdateReportStatus('investigating');
                            }}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-btn text-xs font-bold transition-colors"
                          >
                            Mark Investigating
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: USER ACTION (Ban / Suspend / Warn) */}
      {/* ======================================================== */}
      {selectedUserForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-card border border-slate-border max-w-md w-full p-6 shadow-dropdown relative">
            <button
              onClick={() => {
                setSelectedUserForAction(null);
                setUserActionType(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-navy"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  userActionType === 'ban' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-700'
                }`}
              >
                {userActionType === 'ban' ? <Ban className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-black text-navy capitalize">
                  {userActionType === 'ban'
                    ? 'Permanently Ban Account'
                    : userActionType === 'suspend'
                    ? 'Suspend Account'
                    : 'Issue Warning'}
                </h3>
                <p className="text-xs text-slate-500">Target: {selectedUserForAction.displayName} ({selectedUserForAction.email})</p>
              </div>
            </div>

            <form onSubmit={handleUserActionSubmit} className="space-y-4">
              {userActionType === 'suspend' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Suspension Duration (Days)</label>
                  <select
                    value={suspensionDays}
                    onChange={(e) => setSuspensionDays(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-btn text-xs font-bold focus:bg-white"
                  >
                    <option value={1}>1 Day (24 Hours)</option>
                    <option value={3}>3 Days</option>
                    <option value={7}>7 Days (1 Week)</option>
                    <option value={14}>14 Days (2 Weeks)</option>
                    <option value={30}>30 Days (1 Month)</option>
                    <option value={90}>90 Days (Quarter)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Documented Reason for Moderation Record <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Document clear reason for this action (sent to member and preserved in audit log)..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserForAction(null);
                    setUserActionType(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-navy rounded-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting || !actionReason.trim()}
                  className={`px-5 py-2.5 rounded-btn text-xs font-bold text-white shadow-sm flex items-center space-x-1.5 ${
                    userActionType === 'ban' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  <span>Confirm Moderation Action</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ACTIVITY PARTICIPANTS / ROSTER */}
      {/* ======================================================== */}
      {selectedActivityDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-card border border-slate-border max-w-xl w-full p-6 shadow-dropdown relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedActivityDetails(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-navy"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black text-navy mb-1">{selectedActivityDetails.activity?.title}</h3>
            <p className="text-xs text-slate-500 mb-4">
              Host: <span className="font-bold text-navy">{selectedActivityDetails.activity?.hostName}</span> ({selectedActivityDetails.activity?.hostEmail})
            </p>

            {/* Participants list */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Activity Participants ({selectedActivityDetails.participants?.length || 0} members)
              </h4>

              {selectedActivityDetails.participants?.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No attendees have joined this activity yet.</p>
              ) : (
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto border border-slate-100 rounded-btn p-2">
                  {selectedActivityDetails.participants?.map((p) => (
                    <div key={p.membershipId} className="py-2 px-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={p.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-navy text-xs">{p.displayName}</p>
                          <p className="text-[10px] text-slate-400">{p.email || 'Participant'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="capitalize text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {p.role} ({p.status})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedActivityDetails(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-navy font-bold rounded-btn text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ACTIVITY MODERATION (Remove / Cancel) */}
      {/* ======================================================== */}
      {selectedActivityForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-card border border-slate-border max-w-md w-full p-6 shadow-dropdown relative">
            <button
              onClick={() => {
                setSelectedActivityForAction(null);
                setActivityActionType(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-navy"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  activityActionType === 'remove' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-700'
                }`}
              >
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-navy">
                  {activityActionType === 'remove' ? 'Remove Inappropriate Activity' : 'Cancel Fraudulent / Unsafe Activity'}
                </h3>
                <p className="text-xs text-slate-500">Activity: {selectedActivityForAction.title}</p>
              </div>
            </div>

            <form onSubmit={handleActivityActionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Documented Reason for Host & Participants <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Document reason for cancellation/removal..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedActivityForAction(null);
                    setActivityActionType(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-navy rounded-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting || !actionReason.trim()}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-btn text-xs font-bold shadow-sm"
                >
                  <span>Confirm Moderation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DRAWER / MODAL: REPORT INVESTIGATION & DECISION */}
      {/* ======================================================== */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-card border border-slate-border max-w-xl w-full p-6 shadow-dropdown relative max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-navy"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px] uppercase">
                  {selectedReport.category?.replace('_', ' ')}
                </span>
                <h3 className="text-base font-black text-navy mt-0.5">Investigate Safety Report</h3>
              </div>
            </div>

            {/* Report Facts */}
            <div className="p-4 bg-slate-50 rounded-card border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Report Reason:</span>
                <span className="font-bold text-navy">{selectedReport.reason}</span>
              </div>
              {selectedReport.description && (
                <div>
                  <span className="text-slate-500 block mb-0.5">Full Description:</span>
                  <p className="bg-white p-2.5 rounded border border-slate-200 text-slate-700">
                    {selectedReport.description}
                  </p>
                </div>
              )}
              {selectedReport.evidenceText && (
                <div>
                  <span className="text-slate-500 block mb-0.5">Attached Evidence Quote / Text:</span>
                  <p className="bg-white p-2.5 rounded border border-slate-200 italic text-slate-800 font-medium">
                    "{selectedReport.evidenceText}"
                  </p>
                </div>
              )}
              {selectedReport.evidenceUrl && (
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500">Evidence Link:</span>
                  <a
                    href={selectedReport.evidenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline font-bold flex items-center space-x-1"
                  >
                    <span>Inspect Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Investigation Actions Form */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider">Record Moderation Decision</h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Action to Take Against Offender / Target:
                </label>
                <select
                  value={reportActionTaken}
                  onChange={(e) => setReportActionTaken(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-btn text-xs font-bold focus:bg-white"
                >
                  <option value="none">None (Record note only)</option>
                  <option value="warning_issued">Issue Formal Warning to Reported Member</option>
                  <option value="user_suspended">Suspend Reported Member Account (7 Days)</option>
                  <option value="user_banned">Permanently Ban Reported Member Account</option>
                  {selectedReport.activityId && (
                    <option value="activity_removed">Remove Reported Inappropriate Activity</option>
                  )}
                  <option value="report_rejected">Reject Report as Invalid / False Claim</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Moderator Notes & Investigation Findings:
                </label>
                <textarea
                  rows={3}
                  value={reportAdminNotes}
                  onChange={(e) => setReportAdminNotes(e.target.value)}
                  placeholder="Record summary of evidence reviewed, investigation steps, and decision rationale..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleUpdateReportStatus('investigating')}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-btn text-xs font-bold border border-amber-200"
                >
                  Keep Investigating
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleResolveReport('rejected')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-btn text-xs font-bold"
                  >
                    Reject Invalid Report
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResolveReport('resolved')}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-btn text-xs font-bold shadow-sm flex items-center space-x-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Resolve & Execute Decision</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
