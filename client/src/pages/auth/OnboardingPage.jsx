import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Check, ArrowRight, Heart } from 'lucide-react';

export default function OnboardingPage() {
  const { profile, updateProfileState } = useAuth();
  const navigate = useNavigate();

  const [bio, setBio] = useState(profile?.bio || '');
  const [availableInterests, setAvailableInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const toggleInterest = (id) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put('/users/me', {
        bio,
        interests: selectedInterests
      });
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
          <h2 className="text-2xl font-black text-navy">Set Up Your Profile</h2>
          <p className="text-xs text-slate-500 mt-1">
            Pick activities and domains you enjoy to power the Smart Matching Engine.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

