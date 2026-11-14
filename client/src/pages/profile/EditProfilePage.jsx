import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { User, MapPin, Sparkles, Check, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function EditProfilePage() {
  const { profile, updateProfileState } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [age, setAge] = useState(profile?.age || '');
  const [locationName, setLocationName] = useState(profile?.locationName || '');
  const [searchRadiusKm, setSearchRadiusKm] = useState(profile?.searchRadiusKm || 15);
  const [isDiscoverable, setIsDiscoverable] = useState(profile?.isDiscoverable ?? true);

  const [availableInterests, setAvailableInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadInterests() {
      try {
        const [intRes, myIntRes] = await Promise.all([
          api.get('/interests'),
          api.get('/users/interests/me')
        ]);
        setAvailableInterests(intRes.data.interests || []);
        setSelectedInterests((myIntRes.data.interests || []).map(i => i.interestId || i));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInterests();
  }, []);

  const toggleInterest = (id) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.put('/users/me', {
        displayName,
        bio,
        avatarUrl,
        age: age ? Number(age) : null,
        locationName,
        searchRadiusKm: Number(searchRadiusKm),
        isDiscoverable,
        interests: selectedInterests
      });

      updateProfileState(res.data);
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/profile'), 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/profile')}
        className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-navy transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to profile</span>
      </button>

      <div className="bg-white rounded-card border border-slate-border p-6 sm:p-8 shadow-card">
        <h1 className="text-2xl font-black text-navy mb-1">Edit Profile</h1>
        <p className="text-xs text-slate-500 mb-6">Keep your details up to date for better nearby matching.</p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-btn text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-btn text-xs text-emerald-700 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Display Name</label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={50}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bio (max 500 chars)</label>
            <textarea
              rows={3}
              maxLength={500}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Avatar Image URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
              <input
                type="number"
                min={13}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Search Radius (km)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={searchRadiusKm}
                onChange={(e) => setSearchRadiusKm(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Location Neighborhood</label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium focus:bg-white focus:outline-none"
            />
          </div>

          {/* Discoverability checkbox */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="disc"
              checked={isDiscoverable}
              onChange={(e) => setIsDiscoverable(e.target.checked)}
              className="rounded text-primary focus:ring-primary w-4 h-4"
            />
            <label htmlFor="disc" className="text-xs font-medium text-slate-700">
              Make my profile discoverable to nearby members
            </label>
          </div>

          {/* Interests section */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Update Activity Interests ({selectedInterests.length} selected)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-btn border border-slate-200">
              {availableInterests.map((item) => {
                const isSelected = selectedInterests.includes(item.interestId);
                return (
                  <button
                    key={item.interestId}
                    type="button"
                    onClick={() => toggleInterest(item.interestId)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-navy"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-btn text-xs font-bold shadow-md shadow-primary/20 flex items-center space-x-2 disabled:opacity-50"
            >
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

