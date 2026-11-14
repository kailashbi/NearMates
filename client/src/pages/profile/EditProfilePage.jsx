import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { processImageFile } from '../../utils/imageUtils';
import {
  User,
  MapPin,
  Sparkles,
  Check,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Camera,
  Upload,
  X,
  Link as LinkIcon
} from 'lucide-react';

export default function EditProfilePage() {
  const { profile, updateProfileState } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
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

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setIsProcessingImage(true);
    try {
      const optimizedDataUrl = await processImageFile(file, 400, 400, 0.85);
      setAvatarUrl(optimizedDataUrl);
    } catch (err) {
      setError(err.message || 'Failed to process selected image.');
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
        <p className="text-xs text-slate-500 mb-6">Keep your details and photo up to date for better nearby matching.</p>

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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Picture Upload & Preview */}
          <div className="p-4 bg-slate-50 rounded-card border border-slate-200/80 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-full border-2 border-slate-300 hover:border-primary cursor-pointer overflow-hidden flex items-center justify-center bg-white shadow-sm transition-all"
                title="Click to change profile picture"
              >
                <img
                  src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80'}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingImage}
                className="absolute bottom-0 right-0 w-7 h-7 bg-primary hover:bg-primary-hover text-white rounded-full flex items-center justify-center shadow-md border-2 border-white transition-all transform hover:scale-105"
                title="Upload new photo"
              >
                {isProcessingImage ? (
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-xs font-bold text-navy">Profile Picture</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Upload a photo so nearby mates recognize you at activities.
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-2.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-primary text-primary hover:bg-primary-light rounded-btn text-xs font-bold transition-colors flex items-center space-x-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-btn font-semibold transition-colors flex items-center space-x-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-xs text-slate-500 hover:text-navy underline font-medium"
                >
                  {showUrlInput ? 'Hide URL field' : 'Use image URL'}
                </button>
              </div>

              {showUrlInput && (
                <div className="mt-3">
                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-btn text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

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
