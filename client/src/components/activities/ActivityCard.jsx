import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ShieldCheck } from 'lucide-react';
import Badge from '../common/Badge';

export default function ActivityCard({ activity, onJoin = null }) {
  const startDate = new Date(activity.startsAt);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });

  const isFull = activity.remainingPlaces === 0;

  return (
    <div className="bg-white rounded-card border border-slate-border p-5 hover:shadow-cardHover transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Category & Status Bar */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="primary">
            {activity.categoryName || activity.category || 'Meetup'}
          </Badge>
          <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-500">
            {activity.approxDistanceKm !== undefined && (
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                {activity.approxDistanceKm} km away
              </span>
            )}
            {activity.joinPolicy === 'auto_join' ? (
              <span className="text-teal flex items-center text-[11px] font-medium" title="Instant Join">
                <ShieldCheck className="w-3.5 h-3.5 mr-0.5" /> Instant
              </span>
            ) : (
              <span className="text-slate-400 text-[11px]">Approval</span>
            )}
          </div>
        </div>

        {/* Title */}
        <Link to={`/activities/${activity.activityId}`}>
          <h3 className="text-base font-bold text-navy group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {activity.title}
          </h3>
        </Link>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {activity.description}
        </p>

        {/* Info Rows */}
        <div className="space-y-2 text-xs text-slate-600 mb-5">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="font-medium text-slate-700">{formattedDate}</span>
            <span className="text-slate-300">•</span>
            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{formattedTime}</span>
          </div>

          <div className="flex items-center space-x-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-orange-accent flex-shrink-0" />
            <span className="truncate">{activity.locationName}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Users className="w-3.5 h-3.5 text-teal flex-shrink-0" />
            <span>
              {activity.participantCount || 1}/{activity.maxParticipants} participants
            </span>
            {isFull ? (
              <span className="text-rose-600 font-semibold text-[11px] ml-1">(Full)</span>
            ) : (
              <span className="text-emerald-600 font-medium text-[11px] ml-1">
                ({activity.remainingPlaces} spots left)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Host & CTA */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2 min-w-0">
          <img
            src={activity.hostAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
            alt={activity.hostName}
            className="w-7 h-7 rounded-full object-cover border border-slate-200 flex-shrink-0"
          />
          <span className="text-xs font-medium text-slate-700 truncate">
            {activity.hostName}
          </span>
        </div>

        <Link
          to={`/activities/${activity.activityId}`}
          className="text-xs font-semibold px-3 py-1.5 rounded-btn bg-slate-100 hover:bg-primary hover:text-white text-navy transition-all"
        >
          Details
        </Link>
      </div>
    </div>
  );
}

