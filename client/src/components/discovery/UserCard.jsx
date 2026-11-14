import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, MessageSquare } from 'lucide-react';
import MatchScoreBadge from './MatchScoreBadge';
import Badge from '../common/Badge';

export default function UserCard({ match, onConnect = null }) {
  const user = match.user || match;
  const score = match.matchScore;
  const approxDistance = match.approxDistanceKm !== undefined ? match.approxDistanceKm : user.approxDistanceKm;
  const shared = match.sharedInterests || [];

  return (
    <div className="bg-white rounded-card border border-slate-border p-5 hover:shadow-cardHover transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header with avatar & match badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                alt={user.displayName}
                className="w-12 h-12 rounded-full object-cover border border-slate-200"
              />
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  user.availabilityStatus === 'available' ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
                title={`Status: ${user.availabilityStatus || 'offline'}`}
              />
            </div>
            <div>
              <Link to={`/profile/${user.profileId}`}>
                <h4 className="text-base font-bold text-navy group-hover:text-primary transition-colors">
                  {user.displayName}
                </h4>
              </Link>
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5">
                <MapPin className="w-3 h-3 text-orange-accent" />
                <span>{approxDistance !== undefined ? `${approxDistance} km away` : (user.locationName || 'Nearby')}</span>
              </div>
            </div>
          </div>

          {score !== undefined && <MatchScoreBadge score={score} />}
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {user.bio || 'Exploring new activities and meeting nearby friends on NearMates.'}
        </p>

        {/* Shared or Selected Interests */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {shared.length > 0 ? (
              shared.slice(0, 3).map((interest, idx) => (
                <Badge key={idx} variant="teal" className="text-[11px]">
                  {interest}
                </Badge>
              ))
            ) : user.interests && user.interests.length > 0 ? (
              user.interests.slice(0, 3).map((interest, idx) => (
                <Badge key={idx} variant="primary" className="text-[11px]">
                  {interest.replace(/_/g, ' ')}
                </Badge>
              ))
            ) : null}
          </div>
        </div>
      </div>

      {/* Footer Rating & Chat Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-1 text-xs font-semibold text-slate-700">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{user.rating || 5.0}</span>
          <span className="text-slate-400 font-normal">({user.reviewCount || 0})</span>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={`/profile/${user.profileId}`}
            className="text-xs font-semibold px-2.5 py-1.5 text-slate-600 hover:text-navy hover:bg-slate-100 rounded-btn transition-colors"
          >
            Profile
          </Link>
          <Link
            to={`/chat?user=${user.profileId}`}
            className="text-xs font-semibold px-3 py-1.5 rounded-btn bg-primary text-white hover:bg-primary-hover flex items-center space-x-1 transition-colors shadow-sm"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Chat</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

