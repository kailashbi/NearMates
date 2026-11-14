import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import Sidebar from '../components/navigation/Sidebar';
import MobileNav from '../components/navigation/MobileNav';
import DemoModeBanner from '../components/common/DemoModeBanner';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans">
      <DemoModeBanner />
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {isAuthenticated && <Sidebar />}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 min-w-0">
          <Outlet />
        </main>
      </div>

      {isAuthenticated && <MobileNav />}
    </div>
  );
}

