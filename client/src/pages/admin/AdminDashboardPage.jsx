import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import {
  Shield,
  Users,
  Calendar,
  Star,
  Flag,
  CheckCircle,
  XCircle,
  Database,
  BarChart3
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { isAdmin } = useAuth();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'reports'

  useEffect(() => {
    async function loadAdminData() {
      if (!isAdmin) return;
      setLoading(true);
      try {
        const [statsRes, usersRes, reportsRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/users'),
          api.get('/admin/reports')
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data.items || []);
        setReports(reportsRes.data.items || []);
      } catch (err) {
        console.error('Admin API error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-white rounded-card border border-rose-200">
        <Shield className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-navy">Access Restricted</h2>
        <p className="text-xs text-slate-500 mt-1">This section requires administrative privileges.</p>
      </div>
    );
  }

  if (loading) return <LoadingSpinner text="Loading platform administration data..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-primary mb-1">
            <Shield className="w-4 h-4" />
            <span>Platform Moderation & Analytics</span>
          </div>
          <h1 className="text-2xl font-black text-navy tracking-tight">Admin Console</h1>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 bg-white p-1 rounded-btn border border-slate-border">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === 'overview' ? 'bg-primary text-white' : 'text-slate-600 hover:text-navy'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === 'users' ? 'bg-primary text-white' : 'text-slate-600 hover:text-navy'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === 'reports' ? 'bg-primary text-white' : 'text-slate-600 hover:text-navy'
            }`}
          >
            Reports ({reports.length})
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-card border border-slate-border shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Users</span>
              <p className="text-2xl font-black text-navy mt-1">{stats?.totalUsers || 0}</p>
              <span className="text-[11px] text-emerald-600 font-medium">
                {stats?.activeUsers || 0} currently active
              </span>
            </div>

            <div className="bg-white p-5 rounded-card border border-slate-border shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Activities</span>
              <p className="text-2xl font-black text-navy mt-1">{stats?.totalActivities || 0}</p>
              <span className="text-[11px] text-teal font-medium">
                {stats?.openActivities || 0} open meetups
              </span>
            </div>

            <div className="bg-white p-5 rounded-card border border-slate-border shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Activity Reviews</span>
              <p className="text-2xl font-black text-navy mt-1">{stats?.totalReviews || 0}</p>
              <span className="text-[11px] text-amber-600 font-medium">Verified ratings</span>
            </div>

            <div className="bg-white p-5 rounded-card border border-slate-border shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Reports</span>
              <p className="text-2xl font-black text-navy mt-1">{stats?.pendingReports || 0}</p>
              <span className="text-[11px] text-slate-400">Content moderation</span>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-card border border-slate-border overflow-hidden shadow-card">
          <div className="p-4 border-b border-slate-border font-bold text-xs text-navy">
            Registered Users ({users.length})
          </div>
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {users.map((u) => (
              <div key={u.userId} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-navy">{u.displayName}</h4>
                    <p className="text-[11px] text-slate-500">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge variant={u.role === 'admin' ? 'orange' : 'primary'}>
                    {u.role}
                  </Badge>
                  <span className="text-[11px] text-slate-400">
                    {u.locationName || 'Local'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-card border border-slate-border p-6 shadow-card">
          {reports.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">
              No open reports or safety flags!
            </p>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r.reportId} className="p-3 bg-slate-50 rounded-btn border border-slate-200 text-xs">
                  <div className="flex justify-between font-bold mb-1">
                    <span>Reason: {r.reason}</span>
                    <Badge variant="warning">{r.status}</Badge>
                  </div>
                  <p className="text-slate-600">{r.description || 'No additional remarks'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

