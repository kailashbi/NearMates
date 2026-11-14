import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import ActivityCard from '../../components/activities/ActivityCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Calendar, Search, PlusCircle, Filter } from 'lucide-react';

export default function ActivityListPage() {
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [actsRes, catsRes] = await Promise.all([
          api.get(`/activities${selectedCategory ? `?categoryId=${selectedCategory}` : ''}`),
          api.get('/interests')
        ]);
        setActivities(actsRes.data.items || []);
        setCategories(catsRes.data.interests || []);
      } catch (err) {
        console.error('Failed to load activities:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCategory]);

  const filtered = activities.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.locationName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-primary mb-1">
            <Calendar className="w-4 h-4" />
            <span>Spontaneous Meetups & Sports</span>
          </div>
          <h1 className="text-2xl font-black text-navy tracking-tight">Browse Activities</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover upcoming local activities and join with one click.
          </p>
        </div>

        <Link
          to="/activities/create"
          className="flex items-center space-x-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-btn text-xs font-bold shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Activity</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-card border border-slate-border p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities, sports, venues..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-btn text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-56 py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium text-slate-700"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.interestId} value={c.interestId}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activities Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching activities from repository..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No activities matched"
          description="Try broadening your search term or select another category."
          action={
            <Link
              to="/activities/create"
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-btn inline-block"
            >
              Post Your Own Activity
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((act) => (
            <ActivityCard key={act.activityId} activity={act} />
          ))}
        </div>
      )}
    </div>
  );
}

