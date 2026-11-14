import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ActivityCard from '../../components/activities/ActivityCard';
import UserCard from '../../components/discovery/UserCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Compass,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  PlusCircle,
  SlidersHorizontal,
  ChevronRight,
  Radio
} from 'lucide-react';

export default function DashboardPage() {
  const { user, profile, updateProfileState } = useAuth();

  const [radiusKm, setRadiusKm] = useState(profile?.searchRadiusKm || 20);
  const [matches, setMatches] = useState([]);
  const [activities, setActivities] = useState([]);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Availability status toggle
  const [availability, setAvailability] = useState(profile?.availabilityStatus || 'available');

  const handleStatusChange = async (newStatus) => {
    setAvailability(newStatus);
    try {
      const res = await api.put('/users/me', { availabilityStatus: newStatus });
      updateProfileState(res.data);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const lat = profile?.latitude || 37.7749;
      const lng = profile?.longitude || -122.4194;

      const [matchesRes, activitiesRes, nearbyRes, interestsRes] = await Promise.all([
        api.get(`/discovery/matches?radiusKm=${radiusKm}&limit=4`),
        api.get(`/activities?latitude=${lat}&longitude=${lng}&radiusKm=${radiusKm}${selectedCategory ? `&categoryId=${selectedCategory}` : ''}`),
        api.get(`/discovery/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`),
        api.get('/interests')
      ]);

      setMatches(matchesRes.data.matches || []);
      setActivities(activitiesRes.data.items || []);
      setNearbyUsers(nearbyRes.data.nearbyUsers || []);
      setCategories(interestsRes.data.interests || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [radiusKm, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-card border border-slate-border p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link to="/profile" className="relative group shrink-0" title="View Profile">
            <img
              src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80'}
              alt={profile?.displayName || 'My Profile'}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-slate-200 group-hover:border-primary transition-all shadow-sm"
            />
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                availability === 'available' ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
          </Link>
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-primary mb-1">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
              <span>Active Discovery Zone</span>
            </div>
            <h1 className="text-2xl font-black text-navy tracking-tight">
              Hello, {profile?.displayName || 'Explorer'}! 👋
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Discover like-minded people and spontaneous activities near {profile?.locationName || 'you'}.
            </p>
          </div>
        </div>

        {/* Status & Radius Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Availability Pill Toggle */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-btn p-1 text-xs">
            {['available', 'busy', 'offline'].map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`px-3 py-1 rounded capitalize font-semibold transition-all ${
                  availability === st
                    ? st === 'available'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : st === 'busy'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-400 text-white shadow-xs'
                    : 'text-slate-600 hover:text-navy'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <Link
            to="/activities/create"
            className="flex items-center space-x-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-btn text-xs font-bold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Activity</span>
          </Link>
        </div>
      </div>

      {/* Radius Filter & Category Bar */}
      <div className="bg-white rounded-card border border-slate-border p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Radius:</span>
          <div className="flex items-center space-x-1">
            {[5, 10, 20, 50].map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-btn border transition-all ${
                  radiusKm === r
                    ? 'bg-navy text-white border-navy'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-52 py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Activity Domains</option>
            {categories.map((c) => (
              <option key={c.interestId} value={c.interestId}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Section 1: Recommended Matches (Smart Matching Engine) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-primary-light rounded-lg flex items-center justify-center text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-navy leading-none">Smart Matches For You</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Ranked by proximity (40%), interests (30%), availability (20%), and activity intent (10%)
              </p>
            </div>
          </div>
          <Link
            to="/discovery/nearby"
            className="text-xs font-bold text-primary hover:underline flex items-center"
          >
            <span>View All Nearby</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Computing smart compatibility scores..." />
        ) : matches.length === 0 ? (
          <EmptyState
            title="No matches in this radius"
            description="Try expanding your search radius to 25 km or 50 km."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {matches.map((m) => (
              <UserCard key={m.user.profileId} match={m} />
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Spontaneous Activities Nearby */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-teal-light rounded-lg flex items-center justify-center text-teal">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-navy leading-none">Activities & Gatherings</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Upcoming meetups looking for participants within {radiusKm} km
              </p>
            </div>
          </div>
          <Link
            to="/activities"
            className="text-xs font-bold text-primary hover:underline flex items-center"
          >
            <span>See All ({activities.length})</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Querying nearby activities via PostGIS..." />
        ) : activities.length === 0 ? (
          <EmptyState
            title="No scheduled activities nearby"
            description="Be the first to propose an activity like badminton, coffee, or cycling!"
            action={
              <Link
                to="/activities/create"
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-btn inline-block"
              >
                Post Activity Intent
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.slice(0, 6).map((act) => (
              <ActivityCard key={act.activityId} activity={act} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

