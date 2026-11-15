import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Shield,
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function CreateActivityPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationName, setLocationName] = useState(profile?.locationName || '');
  const [locationDescription, setLocationDescription] = useState('');
  const [startsAtDate, setStartsAtDate] = useState(
    new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split('T')[0]
  );
  const [startsAtTime, setStartsAtTime] = useState('18:00');
  const [endsAtTime, setEndsAtTime] = useState('20:00');
  const [minParticipants, setMinParticipants] = useState(2);
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [joinPolicy, setJoinPolicy] = useState('approval');
  const [visibility, setVisibility] = useState('public');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load interests taxonomy
  useEffect(() => {
    async function loadInterests() {
      try {
        const res = await api.get('/interests');
        const list = res.data.interests || [];
        setCategories(list);
        if (list.length > 0) {
          setCategoryId(prev => (prev && list.some(c => c.interestId === prev) ? prev : list[0].interestId));
        }
      } catch (err) {
        console.error('Failed to load interests:', err);
      } finally {
        setLoadingCats(false);
      }
    }
    loadInterests();
  }, []);

  // Smart defaults adapted to match whatever interests exist in the active database
  const applySmartPreset = (presetCategory) => {
    // Keywords for matching against loaded database categories
    const keywordMap = {
      sports_badminton: ['badminton', 'tennis', 'sport', 'fitness'],
      sports_football: ['football', 'soccer', 'sport', 'fitness'],
      games_board: ['board', 'game', 'gaming', 'entertainment'],
      fitness_cycling: ['cycling', 'bike', 'running', 'fitness', 'sport']
    };

    const keywords = keywordMap[presetCategory] || [presetCategory];

    // Find the best match in the user's actual database categories
    const matched = categories.find(c =>
      c.interestId === presetCategory ||
      keywords.some(k =>
        c.interestId.toLowerCase().includes(k) ||
        c.name.toLowerCase().includes(k) ||
        c.category.toLowerCase().includes(k)
      )
    );

    const targetId = matched ? matched.interestId : (categories[0]?.interestId || presetCategory);
    setCategoryId(targetId);

    if (presetCategory === 'sports_badminton') {
      setTitle('Friendly Badminton Doubles Match');
      setDescription('Looking for 3 players for doubles. Synthetic wooden court booked for 2 hours. Bring indoor shoes!');
      setMaxParticipants(4);
      setLocationName('Indoor Community Sports Arena');
      setLocationDescription('Court #2');
      setEstimatedCost(10);
    } else if (presetCategory === 'sports_football') {
      setTitle('Evening 5-a-side Football Turf Match');
      setDescription('Casual turf football match. Bibs and match ball provided. All skill levels welcome!');
      setMaxParticipants(10);
      setLocationName('City Sports Turf Complex');
      setEstimatedCost(8);
    } else if (presetCategory === 'games_board') {
      setTitle('Board Games & Coffee Afternoon');
      setDescription('Bringing Catan, Ticket to Ride, and casual card games. Let’s grab a large table and roll some dice!');
      setMaxParticipants(6);
      setLocationName('Local Coffee Roasters Lounge');
      setEstimatedCost(0);
      setJoinPolicy('auto_join');
    } else if (presetCategory === 'fitness_cycling') {
      setTitle('Morning Road Cycling Loop (35km)');
      setDescription('Smooth morning group ride. 24-28 km/h rolling pace. Helmets mandatory!');
      setMaxParticipants(8);
      setLocationName('Golden Gate Plaza');
      setEstimatedCost(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const startDateTime = new Date(`${startsAtDate}T${startsAtTime}:00`);
    const endDateTime = endsAtTime ? new Date(`${startsAtDate}T${endsAtTime}:00`) : null;

    if (startDateTime.getTime() <= Date.now()) {
      setError('Start time must be in the future.');
      return;
    }

    if (endDateTime && endDateTime <= startDateTime) {
      setError('End time must be after the start time.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/activities', {
        title,
        description,
        categoryId,
        locationName,
        locationDescription,
        latitude: profile?.latitude || 37.7749,
        longitude: profile?.longitude || -122.4194,
        startsAt: startDateTime.toISOString(),
        endsAt: endDateTime ? endDateTime.toISOString() : null,
        minParticipants: Number(minParticipants),
        maxParticipants: Number(maxParticipants),
        estimatedCost: Number(estimatedCost),
        joinPolicy,
        visibility
      });

      navigate(`/activities/${res.data.activityId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish activity.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="bg-white rounded-card border border-slate-border p-6 sm:p-8 shadow-card">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-primary mb-1">
            <Calendar className="w-4 h-4" />
            <span>Activity Intent Broadcast</span>
          </div>
          <h1 className="text-2xl font-black text-navy tracking-tight">Create an Activity</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            State your plan, set the group capacity, and invite nearby participants to join.
          </p>
        </div>

        {/* Quick Smart Presets from Mobile App */}
        <div className="bg-slate-50 border border-slate-200 rounded-btn p-3 mb-6">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Fast Template Presets:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applySmartPreset('sports_badminton')}
              className="px-2.5 py-1 bg-white hover:bg-primary hover:text-white rounded border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              🏸 Badminton (4p)
            </button>
            <button
              type="button"
              onClick={() => applySmartPreset('sports_football')}
              className="px-2.5 py-1 bg-white hover:bg-primary hover:text-white rounded border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              ⚽ Football (10p)
            </button>
            <button
              type="button"
              onClick={() => applySmartPreset('games_board')}
              className="px-2.5 py-1 bg-white hover:bg-primary hover:text-white rounded border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              🎲 Board Games (6p)
            </button>
            <button
              type="button"
              onClick={() => applySmartPreset('fitness_cycling')}
              className="px-2.5 py-1 bg-white hover:bg-primary hover:text-white rounded border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              🚴 Cycling Ride (8p)
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-btn text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Activity Title *
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Badminton doubles at Sunset Park"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category Domain *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {categories.map((c) => (
                  <option key={c.interestId} value={c.interestId}>
                    {c.category}: {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Join Policy */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Join Policy
              </label>
              <select
                value={joinPolicy}
                onChange={(e) => setJoinPolicy(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="approval">Host Approval Required (Recommended)</option>
                <option value="auto_join">Instant Auto-Join</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description & Details *
            </label>
            <textarea
              required
              rows={3}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the plan, what to bring, skill expectations, and court/venue details..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-btn text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Location Name / Venue *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Sunset Park Recreation Center"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Meeting Point / Specific Area
              </label>
              <input
                type="text"
                value={locationDescription}
                onChange={(e) => setLocationDescription(e.target.value)}
                placeholder="e.g. Court #3 near north entrance"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={startsAtDate}
                onChange={(e) => setStartsAtDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Time *</label>
              <input
                type="time"
                required
                value={startsAtTime}
                onChange={(e) => setStartsAtTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={endsAtTime}
                onChange={(e) => setEndsAtTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Capacity & Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Min. Participants
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={minParticipants}
                onChange={(e) => setMinParticipants(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Max. Capacity *
              </label>
              <input
                type="number"
                required
                min={1}
                max={100}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimated Cost ($)
              </label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium focus:bg-white"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/activities')}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-navy"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-btn text-xs font-bold shadow-md shadow-primary/20 flex items-center space-x-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Broadcasting...' : 'Publish Activity Intent'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

