import React from 'react';
import { Camera, Wifi, Radio, CheckCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const StatCards = ({ stats }) => {
  const { t } = useTranslation();
  const onlinePercentage = stats.total > 0 ? (stats.online / stats.total) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Cameras */}
      <div className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
        <Camera size={80} className="absolute -bottom-4 -right-2 text-blue-50 opacity-60 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500" />
        <div className="relative z-10">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-inner">
            <Camera size={24} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">{t('dashboard.stats.total_cameras', 'Total Cameras')}</p>
          <h3 className="text-4xl font-black text-slate-900 mt-1">{stats.total}</h3>
        </div>
      </div>

      {/* Online Cameras */}
      <div className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
        <Wifi size={80} className="absolute -bottom-4 -right-2 text-emerald-50 opacity-60 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500" />
        <div className="relative z-10">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 shadow-inner">
            <CheckCircle size={24} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">{t('dashboard.stats.online', 'Online')}</p>
          <div className="flex items-end gap-2 mt-1">
            <h3 className="text-4xl font-black text-slate-900">{stats.online}</h3>
            {stats.total > 0 && (<span className="text-sm font-bold text-emerald-500 mb-1">({Math.round(onlinePercentage)}%)</span>)}
          </div>
        </div>
      </div>

      {/* Offline Cameras */}
      <div className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-rose-300 hover:shadow-lg hover:shadow-rose-500/10 hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
        <Radio size={80} className="absolute -bottom-4 -right-2 text-rose-50 opacity-60 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500" />
        <div className="relative z-10">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-rose-500 group-hover:text-white transition-colors duration-300 shadow-inner">
            <Radio size={24} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-rose-600 transition-colors">{t('dashboard.stats.offline', 'Offline')}</p>
          <div className="flex items-end gap-2 mt-1">
            <h3 className="text-4xl font-black text-slate-900">{stats.offline}</h3>
            {stats.offline > 0 && <AlertTriangle size={20} className="text-rose-500 mb-2 animate-pulse" />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCards;
