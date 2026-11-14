import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ActivityCard from '../../components/activities/ActivityCard';
import UserCard from '../../components/discovery/UserCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { MapPin, Users, Calendar, Compass, Radio, Layers } from 'lucide-react';

export default function MapDiscoveryPage() {
  const { profile } = useAuth();
  const [radiusKm, setRadiusKm] = useState(20);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'activities' | 'users'

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const lat = profile?.latitude || 37.7749;
        const lng = profile?.longitude || -122.4194;
        const res = await api.get(`/discovery/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`);
        setActivities(res.data.nearbyActivities || []);
        setUsers(res.data.nearbyUsers || []);
        if (res.data.nearbyActivities?.length > 0) {
          setSelectedItem({ type: 'activity', data: res.data.nearbyActivities[0] });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [radiusKm, profile]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-primary mb-1">
            <Radio className="w-3.5 h-3.5 text-orange-accent animate-pulse" />
            <span>Interactive Geospatial Map Radar</span>
          </div>
          <h1 className="text-2xl font-black text-navy tracking-tight">Map Discovery</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore activities and people positioned relative to your area.
          </p>
        </div>

        {/* Radius pills */}
        <div className="flex items-center space-x-1 bg-white p-1 rounded-btn border border-slate-border">
          <span className="text-[11px] font-bold text-slate-400 px-2">Radar:</span>
          {[5, 10, 20, 50].map((r) => (
            <button
              key={r}
              onClick={() => setRadiusKm(r)}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${
                radiusKm === r ? 'bg-primary text-white' : 'text-slate-600 hover:text-navy'
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Rendering radar coordinates..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual Interactive Map / Radar Canvas */}
          <div className="lg:col-span-2 bg-navy-dark rounded-card p-6 min-h-[460px] flex flex-col justify-between relative overflow-hidden shadow-card border border-navy/50">
            {/* Background grid lines simulating radar map */}
            <div className="absolute inset-0 bg-[radial-gradient(#356AE6_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

            {/* Radar Concentric Circles */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[180px] h-[180px] rounded-full border border-primary/20 animate-ping opacity-25" />
              <div className="w-[300px] h-[300px] rounded-full border border-primary/25 absolute" />
              <div className="w-[420px] h-[420px] rounded-full border border-primary/15 absolute" />
            </div>

            {/* Top map controls */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="bg-navy/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-semibold text-white flex items-center space-x-2">
                <Compass className="w-3.5 h-3.5 text-primary" />
                <span>Center: {profile?.locationName || 'Your Location'}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-2.5 py-1 rounded text-xs font-medium border ${
                    activeTab === 'all' ? 'bg-primary text-white border-primary' : 'bg-navy text-slate-300 border-white/10'
                  }`}
                >
                  All ({activities.length + users.length})
                </button>
                <button
                  onClick={() => setActiveTab('activities')}
                  className={`px-2.5 py-1 rounded text-xs font-medium border ${
                    activeTab === 'activities' ? 'bg-primary text-white border-primary' : 'bg-navy text-slate-300 border-white/10'
                  }`}
                >
                  Activities ({activities.length})
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-2.5 py-1 rounded text-xs font-medium border ${
                    activeTab === 'users' ? 'bg-primary text-white border-primary' : 'bg-navy text-slate-300 border-white/10'
                  }`}
                >
                  People ({users.length})
                </button>
              </div>
            </div>

            {/* Simulated Radar Pins */}
            <div className="relative z-10 h-72 flex items-center justify-center">
              {/* User Center Anchor */}
              <div className="w-7 h-7 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white z-20" title="You are here">
                <span className="w-2 h-2 bg-white rounded-full" />
              </div>

              {/* Pin 1: Activities */}
              {(activeTab === 'all' || activeTab === 'activities') && activities.map((act, idx) => {
                const offsets = [
                  { top: '25%', left: '35%' },
                  { top: '65%', left: '70%' },
                  { top: '30%', left: '75%' },
                  { top: '75%', left: '25%' }
                ];
                const pos = offsets[idx % offsets.length];
                const isSelected = selectedItem?.data?.activityId === act.activityId;
                return (
                  <button
                    key={act.activityId}
                    style={{ position: 'absolute', top: pos.top, left: pos.left }}
                    onClick={() => setSelectedItem({ type: 'activity', data: act })}
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-transform hover:scale-110 shadow-lg ${
                      isSelected
                        ? 'bg-orange-accent text-white ring-4 ring-orange-accent/30'
                        : 'bg-white text-navy border border-slate-200'
                    }`}
                  >
                    <Calendar className="w-3 h-3 text-orange-accent" />
                    <span className="max-w-[100px] truncate">{act.title}</span>
                  </button>
                );
              })}

              {/* Pin 2: Nearby Users */}
              {(activeTab === 'all' || activeTab === 'users') && users.map((u, idx) => {
                const offsets = [
                  { top: '45%', left: '20%' },
                  { top: '20%', left: '60%' },
                  { top: '60%', left: '40%' },
                  { top: '80%', left: '65%' }
                ];
                const pos = offsets[idx % offsets.length];
                const isSelected = selectedItem?.data?.profileId === u.profileId;
                return (
                  <button
                    key={u.profileId}
                    style={{ position: 'absolute', top: pos.top, left: pos.left }}
                    onClick={() => setSelectedItem({ type: 'user', data: u })}
                    className={`flex items-center space-x-1.5 p-1 pr-2.5 rounded-full text-xs font-bold transition-transform hover:scale-110 shadow-lg ${
                      isSelected
                        ? 'bg-teal text-white ring-4 ring-teal/30'
                        : 'bg-white text-navy border border-slate-200'
                    }`}
                  >
                    <img
                      src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="max-w-[80px] truncate">{u.displayName}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom radar legend */}
            <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span>You</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-accent" />
                  <span>Activities</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal" />
                  <span>People</span>
                </span>
              </div>
              <span>Radius: {radiusKm} km</span>
            </div>
          </div>

          {/* Selected Pin Details Sidebar */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Selected Item Details
            </h3>
            {selectedItem ? (
              selectedItem.type === 'activity' ? (
                <ActivityCard activity={selectedItem.data} />
              ) : (
                <UserCard match={selectedItem.data} />
              )
            ) : (
              <div className="bg-white rounded-card border border-slate-border p-6 text-center text-xs text-slate-400">
                Click any pin on the radar map to inspect its details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

