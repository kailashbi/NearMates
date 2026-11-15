import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Compass,
  Bell,
  PlusCircle,
  User,
  Settings,
  LogOut,
  Shield,
  ChevronDown,
  UserCheck
} from 'lucide-react';

export default function Navbar() {
  const { user, profile, logout, isAuthenticated, isAdmin, login } = useAuth();
  const { unreadCount } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [demoSwitchOpen, setDemoSwitchOpen] = useState(false);
  const navigate = useNavigate();

  const handleDemoSwitch = async (email) => {
    try {
      await login(email, 'Password123!');
      setDemoSwitchOpen(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/20">
              <Compass className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-navy tracking-tight leading-none">
                Near<span className="text-primary">Mates</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Find Your People
              </span>
            </div>
          </Link>

          {/* Quick links for desktop */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-1 pl-4">
              <Link
                to="/dashboard"
                className="px-3 py-1.5 rounded-btn text-sm font-semibold text-slate-700 hover:text-primary hover:bg-primary-light transition-colors"
              >
                Discover
              </Link>
              <Link
                to="/activities"
                className="px-3 py-1.5 rounded-btn text-sm font-semibold text-slate-700 hover:text-primary hover:bg-primary-light transition-colors"
              >
                Activities
              </Link>
              <Link
                to="/discovery/nearby"
                className="px-3 py-1.5 rounded-btn text-sm font-semibold text-slate-700 hover:text-primary hover:bg-primary-light transition-colors"
              >
                Nearby People
              </Link>
              <Link
                to="/discovery/map"
                className="px-3 py-1.5 rounded-btn text-sm font-semibold text-slate-700 hover:text-primary hover:bg-primary-light transition-colors"
              >
                Map View
              </Link>
            </nav>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              {/* Quick Admin Persona Switcher / Status */}
              {user?.role !== 'admin' ? (
                <div className="relative hidden lg:block">
                  <button
                    onClick={() => handleDemoSwitch('admin@nearmates.com')}
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-btn text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
                    title="Switch to Admin Account"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                    <span>Switch to Admin</span>
                  </button>
                </div>
              ) : (
                <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-btn text-xs font-semibold bg-primary-light text-primary border border-primary/20">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Mode</span>
                </div>
              )}

              {/* Create Activity Button */}
              <Link
                to="/activities/create"
                className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-btn text-xs font-bold shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Activity</span>
              </Link>

              {/* Notifications Icon with Badge */}
              <Link
                to="/notifications"
                className="relative p-2 text-slate-600 hover:text-navy hover:bg-slate-100 rounded-full transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-orange-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 p-1 pl-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <img
                    src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={profile?.displayName || 'Avatar'}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <span className="hidden sm:inline text-xs font-bold text-navy max-w-[100px] truncate">
                    {profile?.displayName || user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-card shadow-dropdown border border-slate-border py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-navy truncate">{profile?.displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Preferences</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-xs text-primary font-semibold hover:bg-primary-light transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                        navigate('/login');
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-navy hover:text-primary transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-btn text-xs font-bold shadow-sm transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

