import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  MapPin,
  Users,
  Sparkles,
  Shield,
  ArrowRight,
  Activity,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function LandingPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoSignIn = async (email) => {
    try {
      await login(email, 'Password123!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-canvas min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary-light border border-primary/20 text-primary text-xs font-bold mb-6 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Location-Based Activity Discovery</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy tracking-tight leading-tight mb-6">
              Find Your People. <br />
              <span className="text-primary">Find Your Next Activity.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed">
              Tired of spontaneous activity ideas falling through? NearMates combines real-time geographical proximity, shared interests, and availability to connect you with nearby teammates in minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-btn font-bold text-sm shadow-lg shadow-primary/25 transition-all flex items-center justify-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/activities"
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-50 text-navy border border-slate-border rounded-btn font-bold text-sm shadow-sm transition-all"
              >
                Browse Activities
              </Link>
            </div>

            {/* Quick Demo Admin Bar */}
            <div className="p-3 bg-white/80 backdrop-blur-sm rounded-card border border-slate-border max-w-md mx-auto shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                ⚡ One-Click Admin Demo Login:
              </p>
              <div className="flex items-center justify-center">
                <button
                  onClick={() => handleDemoSignIn('admin@nearmates.com')}
                  className="px-4 py-2 text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 rounded-btn transition-colors flex items-center space-x-2"
                >
                  <span>🛡️ Sign In as Admin</span>
                  <span className="text-[10px] text-slate-500 font-normal">(admin@nearmates.com)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white border-y border-slate-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">How It Works</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy">
              From "I want to do this" to "We made a plan" in 3 steps
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-card bg-canvas border border-slate-border">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-lg mb-4">
                1
              </div>
              <h4 className="text-base font-bold text-navy mb-2">Broadcast Your Intent</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Post what you want to do: "Badminton doubles at 6 PM near Sunset Park", set capacity and participant requirements.
              </p>
            </div>

            <div className="p-6 rounded-card bg-canvas border border-slate-border">
              <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center text-teal font-black text-lg mb-4">
                2
              </div>
              <h4 className="text-base font-bold text-navy mb-2">Smart Geospatial Matching</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our engine compares proximity, common hobbies, and real-time availability to match and notify the most relevant people nearby.
              </p>
            </div>

            <div className="p-6 rounded-card bg-canvas border border-slate-border">
              <div className="w-12 h-12 bg-orange-accent/10 rounded-xl flex items-center justify-center text-orange-accent font-black text-lg mb-4">
                3
              </div>
              <h4 className="text-base font-bold text-navy mb-2">Coordinate in Group Chat</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Approved participants join the dedicated activity group chat with live presence, timing details, and meet in person safely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Activity Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Categories</h2>
              <h3 className="text-2xl font-black text-navy">Popular Spontaneous Gatherings</h3>
            </div>
            <Link to="/activities" className="text-xs font-bold text-primary hover:underline flex items-center">
              <span>View all activities</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: 'Team Sports', icon: '🏸', count: '12 active' },
              { name: 'Fitness & Gym', icon: '💪', count: '8 active' },
              { name: 'Board Games', icon: '🎲', count: '6 active' },
              { name: 'Outdoor Hiking', icon: '🌲', count: '10 active' },
              { name: 'Food & Dining', icon: '☕', count: '15 active' },
              { name: 'Tech & Cowork', icon: '💻', count: '5 active' },
            ].map((cat, idx) => (
              <div key={idx} className="bg-white p-4 rounded-card border border-slate-border text-center hover:shadow-card transition-all">
                <span className="text-2xl mb-2 block">{cat.icon}</span>
                <h4 className="text-xs font-bold text-navy">{cat.name}</h4>
                <span className="text-[10px] text-slate-400 font-medium">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Safety Section */}
      <section className="py-16 bg-white border-t border-slate-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-navy rounded-2xl p-8 sm:p-12 text-white relative overflow-hidden">
            <div className="max-w-2xl">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold mb-4 text-emerald-400">
                <Shield className="w-3.5 h-3.5" />
                <span>Privacy & Safety By Design</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black mb-4">
                Your exact live coordinates are never exposed.
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                NearMates displays approximate relative distances (e.g. "1.5 km away") and protects your exact location. Hosts review and approve participants before admitting them to group chats.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Host approval workflow</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Post-activity reviews & ratings</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>One-click block & report moderation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Configurable discoverability status</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-canvas border-t border-slate-border text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-primary" />
            <span className="font-bold text-navy">NearMates Platform</span>
            <span>© 2026</span>
          </div>
          <div className="flex space-x-4 text-slate-500">
            <Link to="/activities" className="hover:text-primary">Activities</Link>
            <Link to="/discovery/nearby" className="hover:text-primary">Discovery</Link>
            <Link to="/login" className="hover:text-primary">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

