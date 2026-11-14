import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { processImageFile } from '../../utils/imageUtils';
import { Sparkles, Check, ArrowRight, Heart, Camera, Upload, X, User } from 'lucide-react';

export default function OnboardingPage() {
  const { profile, updateProfileState } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [availableInterests, setAvailableInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  useEffect(() => {
    if (profile?.avatarUrl) {
      setAvatarUrl(profile.avatarUrl);
    }
  }, [profile]);

  useEffect(() => {
    async function loadInterests() {
      try {
        const res = await api.get('/interests');
        setAvailableInterests(res.data.interests || []);
      } catch (err) {
        console.error('Failed to load interests:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInterests();
  }, []);

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    try {
      const optimizedDataUrl = await processImageFile(file, 400, 400, 0.85);
      setAvatarUrl(optimizedDataUrl);
    } catch (err) {
      console.error(err.message || 'Failed to process image');
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
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        bio,
        interests: selectedInterests
      };
      if (avatarUrl) {
        payload.avatarUrl = avatarUrl;
      }
      const res = await api.put('/users/me', payload);
      updateProfileState(res.data);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Group interests by category
  const grouped = availableInterests.reduce((acc, curr) => {
    acc[curr.category] = acc[curr.category] || [];
    acc[curr.category].push(curr);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="bg-white rounded-card border border-slate-border p-6 sm:p-8 shadow-card">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-light text-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-navy">Welcome to NearMates, {profile?.displayName || 'Explorer'}!</h2>
          <p className="text-xs text-slate-500 mt-1">
            Pick activities and domains you enjoy to power the Smart Matching Engine.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Preview & Upload in Onboarding */}
          <div className="p-4 bg-slate-50 rounded-card border border-slate-200 flex items-center space-x-4">
            <div className="relative group">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-full border-2 border-slate-300 hover:border-primary cursor-pointer overflow-hidden flex items-center justify-center bg-white shadow-sm transition-all"
                title="Change photo"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={profile?.displayName || 'Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-slate-400" />
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingImage}
                className="absolute bottom-0 right-0 w-6 h-6 bg-primary hover:bg-primary-hover text-white rounded-full flex items-center justify-center shadow-md border-2 border-white transition-all"
                title="Upload photo"
              >
                {isProcessingImage ? (
                  <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-3 h-3" />
                )}
              </button>
            </div>

            <div className="flex-1">
              <h4 className="text-xs font-bold text-navy">
                {avatarUrl ? 'Profile Photo Ready' : 'Add a Profile Photo'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {avatarUrl
                  ? 'Your profile picture is all set! You can change it anytime.'
                  : 'Add a picture so companions recognize you when attending activities.'}
              </p>
              <div className="flex items-center space-x-2 mt-1.5">
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
                  className="text-xs text-primary font-bold hover:underline flex items-center space-x-1"
                >
                  <Upload className="w-3 h-3" />
                  <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
                </button>
                {avatarUrl && (
                  <>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-xs text-rose-500 font-bold hover:underline flex items-center space-x-0.5"
                    >
                      <X className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Short Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell nearby people what activities you enjoy, your skill level, or times you're usually free..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-btn text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700">
                Select Your Interests & Hobbies ({selectedInterests.length} selected)
              </label>
              <span className="text-[11px] text-slate-400">At least 1 required</span>
            </div>

            {loading ? (
              <p className="text-xs text-slate-400">Loading activity taxonomy...</p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {category}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {items.map((item) => {
                        const isSelected = selectedInterests.includes(item.interestId);
                        return (
                          <button
                            key={item.interestId}
                            type="button"
                            onClick={() => toggleInterest(item.interestId)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                              isSelected
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span>{item.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || selectedInterests.length === 0}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-btn text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{submitting ? 'Saving Profile...' : 'Complete & Start Exploring'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
