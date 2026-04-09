import React from 'react';
import { Search, RefreshCw, Filter, ShieldCheck, ShieldAlert, Wifi, WifiOff } from 'lucide-react';

const CameraListToolbar = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, onRefresh, loading }) => {
  const filters = [
    { id: 'ALL', label: 'ทั้งหมด', icon: Filter, color: 'text-slate-500' },
    { id: 'ACTIVE', label: 'ออนไลน์', icon: Wifi, color: 'text-emerald-500' },
    { id: 'ERROR', label: 'มีปัญหา', icon: ShieldAlert, color: 'text-rose-500' },
    { id: 'OFFLINE', label: 'ออฟไลน์', icon: WifiOff, color: 'text-slate-400' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
      
      {/* Search Bar */}
      <div className="relative w-full lg:max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="ค้นหาชื่อกล้อง, พิกัด หรือ RTSP URL..."
          className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                ${statusFilter === filter.id 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
                }
              `}
            >
              <filter.icon size={14} className={statusFilter === filter.id ? 'text-blue-600' : filter.color} />
              <span>{filter.label}</span>
            </button>
          ))}
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className={`
            p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all
            ${loading ? 'animate-spin text-blue-600' : ''}
          `}
          title="รีเฟรชข้อมูล"
        >
          <RefreshCw size={18} />
        </button>
      </div>
    </div>
  );
};

export default CameraListToolbar;