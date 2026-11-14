import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Database, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function DemoModeBanner() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await api.get('/health');
      setHealth(res.data);
    } catch (err) {
      setHealth({
        status: 'error',
        database: 'disconnected',
        storageMode: 'memory',
        message: 'Could not contact backend API'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  if (!health) return null;

  const isDemo = health.storageMode === 'memory';

  return (
    <div className={`text-xs px-4 py-2 border-b flex items-center justify-between transition-colors ${
      isDemo
        ? 'bg-amber-50/90 border-amber-200 text-amber-900'
        : 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
    }`}>
      <div className="flex items-center space-x-2">
        <Database className={`w-3.5 h-3.5 ${isDemo ? 'text-amber-600' : 'text-emerald-600'}`} />
        <span className="font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded ${
          isDemo ? 'bg-amber-200/70 text-amber-900' : 'bg-emerald-200/70 text-emerald-900'
        }">
          {health.storageMode} Mode
        </span>
        <span className="hidden sm:inline text-slate-600">
          {isDemo
            ? 'Running with In-Memory Adapter. All discovery, matching, and activities work in demo state.'
            : 'Connected to Supabase PostgreSQL & PostGIS.'}
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <span className="text-[11px] font-mono text-slate-500 hidden md:inline">
          DB: {health.database}
        </span>
        <button
          onClick={checkHealth}
          disabled={loading}
          className="flex items-center space-x-1 hover:opacity-80 transition-opacity text-slate-600"
          title="Refresh connection status"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden xs:inline">Check</span>
        </button>
      </div>
    </div>
  );
}

