import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import ReportModal from '../../components/common/ReportModal';
import {
  User,
  MapPin,
  Star,
  Calendar,
  MessageSquare,
  Shield,
  Edit3,
  Flag,
  UserX,
  AlertCircle
} from 'lucide-react';

export default function ProfilePage() {
  const { id } = useParams();
  const { user, profile: myProfile } = useAuth();

  const isMe = !id || id === myProfile?.profileId;
  const targetId = isMe ? myProfile?.profileId : id;

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!targetId) return;
      setLoading(true);
      try {
        const [profileRes, reviewsRes] = await Promise.all([
          api.get(`/users/${targetId}`),
          api.get(`/reviews/user/${targetId}`)
        ]);
        setProfile(profileRes.data);
        setReviews(reviewsRes.data.items || []);
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [targetId]);

  if (loading) return <LoadingSpinner text="Loading member profile..." />;
  if (!profile) return <p className="text-sm text-center p-8">Profile not found.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-card border border-slate-border p-6 sm:p-8 shadow-card relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
            <div className="relative">
              <img
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80'}
                alt={profile.displayName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-slate-200 shadow-sm"
              />
              <span
                className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${profile.availabilityStatus === 'available' ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                title={`Status: ${profile.availabilityStatus}`}
              />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-navy">{profile.displayName}</h1>
                <Badge variant={profile.availabilityStatus === 'available' ? 'success' : 'neutral'}>
                  {profile.availabilityStatus || 'Available'}
                </Badge>
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-accent" />
                  <span>{profile.approxDistanceKm !== null && profile.approxDistanceKm !== undefined ? `${profile.approxDistanceKm} km away` : (profile.locationName || 'Nearby')}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1 font-semibold text-slate-700">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{profile.rating || 5.0} ({reviews.length} reviews)</span>
                </span>
              </div>

              {profile.age && (
                <p className="text-xs text-slate-400 mt-1">{profile.age} years old</p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {isMe ? (
              <Link
                to="/profile/edit"
                className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-navy rounded-btn text-xs font-bold transition-colors w-full sm:w-auto"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Link
                  to={`/chat?user=${profile.profileId}`}
                  className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-btn text-xs font-bold transition-all shadow-sm flex-1 sm:flex-none"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setReportModalOpen(true)}
                  className="flex items-center justify-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-btn text-xs font-bold transition-colors border border-slate-200"
                  title="Report this member for fake profile, harassment, or safety concerns"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About</h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {profile.bio || 'No biography provided yet.'}
          </p>
        </div>

        {/* Domain Interests */}
        <div className="mt-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Interests & Preferred Activities
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests && profile.interests.length > 0 ? (
              profile.interests.map((item, idx) => {
                const name = typeof item === 'object' ? item.name : item.replace(/_/g, ' ');
                return (
                  <Badge key={idx} variant="primary" className="py-1 px-3 text-xs">
                    {name}
                  </Badge>
                );
              })
            ) : (
              <p className="text-xs text-slate-400">No interests selected yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-card border border-slate-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-navy flex items-center space-x-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Activity Feedback & Ratings ({reviews.length})</span>
          </h3>
        </div>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No activity reviews yet. After completing an activity with this member, teammates can leave verified feedback!
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map((rev) => (
              <div key={rev.reviewId} className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-navy">{rev.reviewerName || 'Teammate'}</span>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < rev.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'
                          }`}
                      />
                    ))}
                  </div>
                </div>
                {rev.comment && <p className="text-xs text-slate-600">{rev.comment}</p>}
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="user"
        targetId={profile?.profileId}
        targetName={profile?.displayName}
      />
    </div>
  );
}

