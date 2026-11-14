import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Settings, Shield, MapPin, Database, LogOut, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, profile, logout, updateProfileState } = useAuth();

  const [radius, setRadius] = useState(profile?.searchRadiusKm || 15);
  const [discoverable, setDiscoverable] = useState(profile?.isDiscoverable ?? true);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      const res = await api.put('/users/me', {
        searchRadiusKm: Number(radius),
        isDiscoverable: discoverable
      });
      updateProfileState(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy tracking-tight">Settings & Preferences</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your account discovery rules and privacy preferences.
        </p>
      </div>

      <div className="bg-white rounded-card border border-slate-border p-6 shadow-card space-y-6">
        {/* Discovery Radius */}
        <div>
          <label className="block text-xs font-bold text-navy mb-1">
            Default Search Radius: {radius} km
          </label>
          <input
            type="range"
            min={1}
            max={50}
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>1 km (Local neighborhood)</span>
            <span>25 km</span>
            <span>50 km (Metro area)</span>
          </div>
        </div>

        {/* Discoverability */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-navy">Public Discoverability</h4>
            <p className="text-[11px] text-slate-500">Allow other nearby users to discover your profile in matching feeds.</p>
          </div>
          <input
            type="checkbox"
            checked={discoverable}
            onChange={(e) => setDiscoverable(e.target.checked)}
            className="w-5 h-5 rounded text-primary focus:ring-primary"
          />
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {saved && (
            <span className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Preferences saved!</span>
            </span>
          )}
          <button
            onClick={handleSave}
            className="ml-auto px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-btn text-xs font-bold shadow-sm transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Account actions */}
      <div className="bg-white rounded-card border border-slate-border p-6 shadow-card flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-navy">Account Session</h4>
          <p className="text-[11px] text-slate-500">Signed in as {user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-btn text-xs font-bold flex items-center space-x-1.5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

