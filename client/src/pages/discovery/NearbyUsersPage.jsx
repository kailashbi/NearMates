import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import UserCard from '../../components/discovery/UserCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Users, SlidersHorizontal, MapPin, Search } from 'lucide-react';

export default function NearbyUsersPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [radiusKm, setRadiusKm] = useState(profile?.searchRadiusKm || 20);
  const [search, setSearch] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNearbyUsers() {
      setLoading(true);
      try {
        const lat = profile?.latitude || 37.7749;
        const lng = profile?.longitude || -122.4194;
        const res = await api.get(`/discovery/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`);
        setUsers(res.data.nearbyUsers || []);
      } catch (err) {
        console.error('Failed to load nearby users:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNearbyUsers();
  }, [radiusKm, profile]);

  const filteredUsers = users.filter((u) => {
    if (search && !u.displayName.toLowerCase().includes(search.toLowerCase()) && !u.bio?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (availabilityFilter && u.availabilityStatus !== availabilityFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-primary mb-1">
          <Users className="w-4 h-4" />
          <span>Geographical Proximity Feed</span>
        </div>
        <h1 className="text-2xl font-black text-navy tracking-tight">Nearby People</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Connecting you with like-minded individuals within {radiusKm} km. Exact locations are shielded for privacy.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-card border border-slate-border p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or bio..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-btn text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Availability */}
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-btn text-xs text-slate-700"
          >
            <option value="">All Availability</option>
            <option value="available">Available Now</option>
            <option value="busy">Busy</option>
          </select>

          {/* Radius selector */}
          <div className="flex items-center space-x-1">
            {[5, 10, 25, 50].map((r) => (
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
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner text="Searching nearby users using spatial index..." />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="No users found in this radius"
          description="Try expanding the radius to 25 or 50 km to discover more members."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredUsers.map((u) => (
            <UserCard key={u.profileId} match={u} />
          ))}
        </div>
      )}
    </div>
  );
}

