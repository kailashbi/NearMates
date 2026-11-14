import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, MessageSquare, Plus, Calendar, User } from 'lucide-react';

export default function MobileNav() {
  const navClass = ({ isActive }) =>
    `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
      isActive ? 'text-primary' : 'text-slate-500 hover:text-navy'
    }`;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-border px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        <NavLink to="/dashboard" className={navClass}>
          <Compass className="w-5 h-5 mb-0.5" />
          <span>Discover</span>
        </NavLink>

        <NavLink to="/activities" className={navClass}>
          <Calendar className="w-5 h-5 mb-0.5" />
          <span>Activities</span>
        </NavLink>

        {/* Center quick broadcast action */}
        <NavLink
          to="/activities/create"
          className="flex items-center justify-center -mt-5 w-11 h-11 bg-primary hover:bg-primary-hover text-white rounded-full shadow-lg shadow-primary/30 transition-transform active:scale-95"
          title="Create activity"
        >
          <Plus className="w-6 h-6" />
        </NavLink>

        <NavLink to="/chat" className={navClass}>
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span>Chat</span>
        </NavLink>

        <NavLink to="/profile" className={navClass}>
          <User className="w-5 h-5 mb-0.5" />
          <span>Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}

