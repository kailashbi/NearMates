import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Compass, Mail, Lock, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-card border border-slate-border p-8 shadow-card">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-light text-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-navy tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-1">Sign in to coordinate activities with nearby friends</p>
        </div>

        {/* Demo Fast-Login Strip */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-btn p-3 mb-6">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900 mb-2">
            <UserCheck className="w-4 h-4 text-amber-700" />
            <span>One-Click Demo Credentials:</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => fillDemoAccount('alex@nearmates.com')}
              className="text-left px-2 py-1 bg-white hover:bg-amber-100 rounded border border-amber-200 text-amber-950 font-medium truncate transition-colors"
            >
              🏸 Alex Turner (Host)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('sarah@nearmates.com')}
              className="text-left px-2 py-1 bg-white hover:bg-amber-100 rounded border border-amber-200 text-amber-950 font-medium truncate transition-colors"
            >
              🎲 Sarah Chen
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('marcus@nearmates.com')}
              className="text-left px-2 py-1 bg-white hover:bg-amber-100 rounded border border-amber-200 text-amber-950 font-medium truncate transition-colors"
            >
              🚴 Marcus Rivera
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@nearmates.com')}
              className="text-left px-2 py-1 bg-white hover:bg-amber-100 rounded border border-amber-200 text-amber-950 font-medium truncate transition-colors"
            >
              🛡️ Admin Account
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-btn text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-btn text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

