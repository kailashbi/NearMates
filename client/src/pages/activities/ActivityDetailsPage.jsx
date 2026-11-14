import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import ReportModal from '../../components/common/ReportModal';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Shield,
  MessageSquare,
  UserCheck,
  UserX,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Flag
} from 'lucide-react';

export default function ActivityDetailsPage() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const loadActivity = async () => {
    try {
      const res = await api.get(`/activities/${id}`);
      setActivity(res.data);
    } catch (err) {
      setError('Activity not found or cancelled.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, [id]);

  const handleJoin = async () => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.post(`/activities/${id}/join`);
      setSuccessMsg(res.data.message || 'Joined successfully!');
      loadActivity();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join activity.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this activity?')) return;
    setActionLoading(true);
    try {
      await api.post(`/activities/${id}/leave`);
      setSuccessMsg('Successfully left activity.');
      loadActivity();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave activity.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecision = async (membershipId, decision) => {
    setActionLoading(true);
    try {
      await api.post(`/activities/${id}/memberships/${membershipId}/${decision}`);
      loadActivity();
    } catch (err) {
      setError('Failed to update membership request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminCancel = async () => {
    const reason = window.prompt('Document reason for cancelling fraudulent or unsafe activity:');
    if (!reason) return;
    try {
      await api.post(`/admin/activities/${id}/cancel`, { reason });
      setSuccessMsg('Activity cancelled by moderation.');
      loadActivity();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel activity.');
    }
  };

  const handleAdminRemove = async () => {
    const reason = window.prompt('Document reason for removing inappropriate activity:');
    if (!reason) return;
    try {
      await api.post(`/admin/activities/${id}/remove`, { reason });
      setSuccessMsg('Activity removed by moderation.');
      loadActivity();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove activity.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading activity details..." />;
  if (!activity) {
    return (
      <div className="p-8 text-center bg-white rounded-card border border-slate-border">
        <p className="text-sm font-bold text-navy mb-4">Activity not found.</p>
        <Link to="/activities" className="text-xs font-bold text-primary hover:underline">
          Return to Activities
        </Link>
      </div>
    );
  }

  const isHost = activity.isHost;
  const isApproved = activity.userMembership === 'approved';
  const isRequested = activity.userMembership === 'requested';
  const isFull = activity.remainingPlaces === 0;

  const startDate = new Date(activity.startsAt);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedStartTime = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const formattedEndTime = activity.endsAt
    ? new Date(activity.endsAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-navy transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to feed</span>
      </button>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-btn text-xs text-rose-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-btn text-xs text-emerald-700 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Activity Hero Card */}
      <div className="bg-white rounded-card border border-slate-border p-6 sm:p-8 shadow-card">
        {/* Header Tags */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <Badge variant="primary">{activity.categoryName || activity.category}</Badge>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">
              Policy: {activity.joinPolicy === 'auto_join' ? 'Instant Auto-Join' : 'Host Approval'}
            </span>
            <span className="text-slate-300">•</span>
            <span className={`font-semibold capitalize ${activity.status === 'open' ? 'text-emerald-600' : 'text-slate-500'}`}>
              Status: {activity.status}
            </span>
            {!isHost && (
              <>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => setReportModalOpen(true)}
                  className="text-rose-600 hover:text-rose-700 font-bold flex items-center space-x-1"
                  title="Report suspicious, fraudulent or unsafe activity"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report Activity</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Admin Moderation Controls if Admin */}
        {user?.role === 'admin' && (
          <div className="mb-4 p-3 bg-amber-50 rounded-btn border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-1.5 font-bold text-amber-900">
              <Shield className="w-4 h-4 text-amber-700" />
              <span>Admin Moderation Controls</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleAdminCancel}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-[11px] transition-colors"
              >
                Cancel (Fraudulent/Unsafe)
              </button>
              <button
                type="button"
                onClick={handleAdminRemove}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[11px] transition-colors"
              >
                Remove Inappropriate
              </button>
            </div>
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-navy mb-4 leading-tight">
          {activity.title}
        </h1>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4 my-4 border-y border-slate-100 text-xs">
          <div className="flex items-start space-x-2.5">
            <Calendar className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">{formattedDate}</p>
              <p className="text-slate-500">{formattedStartTime} {formattedEndTime && `– ${formattedEndTime}`}</p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5">
            <MapPin className="w-4 h-4 text-orange-accent mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">{activity.locationName}</p>
              <p className="text-slate-500">{activity.locationDescription || 'Central meeting point'}</p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5">
            <Users className="w-4 h-4 text-teal mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">{activity.participantCount} / {activity.maxParticipants} Attending</p>
              <p className="text-slate-500">{activity.remainingPlaces} spot(s) remaining</p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5">
            <DollarSign className="w-4 h-4 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">{activity.estimatedCost ? `$${activity.estimatedCost}` : 'Free'}</p>
              <p className="text-slate-500">Estimated cost</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Activity Details
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {activity.description}
          </p>
        </div>

        {/* Action Controls Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          {/* Host info */}
          <div className="flex items-center space-x-3">
            <img
              src={activity.hostAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
              alt={activity.hostName}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Organized by</span>
              <p className="text-xs font-bold text-navy">{activity.hostName} {isHost && '(You)'}</p>
            </div>
          </div>

          {/* Action Button States */}
          <div className="flex items-center space-x-3">
            {isHost ? (
              <Link
                to={`/chat?activity=${activity.activityId}`}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-btn text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open Group Chat</span>
              </Link>
            ) : isApproved ? (
              <div className="flex items-center space-x-2">
                <Link
                  to={`/chat?activity=${activity.activityId}`}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-btn text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Open Group Chat</span>
                </Link>
                <button
                  onClick={handleLeave}
                  disabled={actionLoading}
                  className="px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-btn text-xs font-bold text-slate-600 transition-colors"
                >
                  Leave
                </button>
              </div>
            ) : isRequested ? (
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-btn text-xs font-semibold">
                  ⏳ Join Request Pending Host Approval
                </span>
                <button
                  onClick={handleLeave}
                  disabled={actionLoading}
                  className="px-2.5 py-1.5 text-xs text-rose-600 hover:underline font-semibold"
                >
                  Withdraw
                </button>
              </div>
            ) : isFull ? (
              <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-btn text-xs font-bold">
                Capacity Reached
              </span>
            ) : (
              <button
                onClick={handleJoin}
                disabled={actionLoading}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-btn text-xs font-bold shadow-md shadow-primary/20 flex items-center space-x-1.5 transition-all"
              >
                <Users className="w-4 h-4" />
                <span>{activity.joinPolicy === 'auto_join' ? 'Instant Join' : 'Request to Join'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Host Pending Requests Management */}
      {isHost && activity.pendingRequests && activity.pendingRequests.length > 0 && (
        <div className="bg-white rounded-card border border-amber-200 p-6 shadow-sm">
          <h3 className="text-sm font-black text-navy mb-3 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Pending Join Requests ({activity.pendingRequests.length})</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {activity.pendingRequests.map((req) => (
              <div key={req.membershipId} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={req.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'}
                    alt={req.displayName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-navy">{req.displayName}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{req.bio || 'Wants to join your activity'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDecision(req.membershipId, 'approve')}
                    disabled={actionLoading}
                    className="p-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-btn text-xs font-bold flex items-center space-x-1 transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleDecision(req.membershipId, 'reject')}
                    disabled={actionLoading}
                    className="p-1.5 px-3 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-btn text-xs font-bold flex items-center space-x-1 transition-colors"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmed Participants */}
      <div className="bg-white rounded-card border border-slate-border p-6 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Confirmed Teammates ({activity.participants?.length ? activity.participants.length + 1 : 1})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Host card */}
          <div className="flex items-center space-x-3 p-3 rounded-btn bg-slate-50 border border-slate-200/80">
            <img
              src={activity.hostAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'}
              alt={activity.hostName}
              className="w-9 h-9 rounded-full object-cover border border-slate-200"
            />
            <div>
              <p className="text-xs font-bold text-navy">{activity.hostName}</p>
              <Badge variant="orange" className="text-[10px]">Host</Badge>
            </div>
          </div>

          {/* Other participants */}
          {activity.participants && activity.participants.map((p) => (
            <div key={p.profileId} className="flex items-center space-x-3 p-3 rounded-btn bg-slate-50 border border-slate-200/80">
              <img
                src={p.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'}
                alt={p.displayName}
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
              <div>
                <p className="text-xs font-bold text-navy">{p.displayName}</p>
                <Badge variant="teal" className="text-[10px]">Participant</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="activity"
        targetId={activity?.activityId}
        targetName={activity?.title}
        defaultCategory="suspicious_activity"
      />
    </div>
  );
}

