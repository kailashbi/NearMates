import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  Users,
  Calendar,
  MessageSquare,
  MapPin,
  PlusCircle,
  Settings,
  Shield,
  Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { isAdmin } = useAuth();

  const navItemClass = ({ isActive }) =>
    `flex items-center space-x-3 px-3.5 py-2.5 rounded-btn text-xs font-semibold transition-all ${
      isActive
        ? 'bg-primary text-white shadow-sm shadow-primary/20'
        : 'text-slate-600 hover:text-navy hover:bg-slate-100'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-border min-h-[calc(100vh-4rem)] p-4 hidden lg:flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Discovery & Matching
          </p>
          <nav className="space-y-1">
            <NavLink to="/dashboard" className={navItemClass}>
              <Compass className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/discovery/nearby" className={navItemClass}>
              <Users className="w-4 h-4" />
              <span>Nearby People</span>
            </NavLink>
            <NavLink to="/discovery/map" className={navItemClass}>
              <MapPin className="w-4 h-4" />
              <span>Live Map Explorer</span>
            </NavLink>
          </nav>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Activities & Gatherings
          </p>
          <nav className="space-y-1">
            <NavLink to="/activities" end className={navItemClass}>
              <Calendar className="w-4 h-4" />
              <span>Browse Activities</span>
            </NavLink>
            <NavLink to="/activities/create" className={navItemClass}>
              <PlusCircle className="w-4 h-4" />
              <span>Broadcast Intent</span>
            </NavLink>
          </nav>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Social & Chat
          </p>
          <nav className="space-y-1">
            <NavLink to="/chat" className={navItemClass}>
              <MessageSquare className="w-4 h-4" />
              <span>Conversations & Groups</span>
            </NavLink>
          </nav>
        </div>

        {isAdmin && (
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider px-3 mb-2">
              Management
            </p>
            <nav className="space-y-1">
              <NavLink to="/admin" className={navItemClass}>
                <Shield className="w-4 h-4" />
                <span>Admin Console</span>
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 space-y-1">
        <NavLink to="/settings" className={navItemClass}>
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}

