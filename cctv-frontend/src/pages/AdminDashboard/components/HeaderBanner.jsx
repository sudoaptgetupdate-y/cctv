import React from 'react';
import { Activity, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HeaderBanner = ({ user, stats }) => {
  const { t, i18n } = useTranslation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting.morning', 'Good morning');
    if (hour < 18) return t('dashboard.greeting.afternoon', 'Good afternoon');
    return t('dashboard.greeting.evening', 'Good evening');
  };

  const currentDate = new Date().toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'th-TH', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  const isSystemHealthy = stats.offline === 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative mb-6">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 p-6 md:p-8 relative z-10">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Activity size={16} />
            <span className="text-[11px] font-black uppercase tracking-widest">{t('dashboard.title', 'CCTV Dashboard')}</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user?.firstName || 'User'}</span>! 👋
          </h2>
          <p className="text-sm text-slate-500 mt-1.5 flex items-center gap-1.5 font-medium">
            <Calendar size={14} /> {currentDate}
          </p>
        </div>

        <div className="relative z-10 flex flex-col items-start md:items-end gap-2 mt-4 md:mt-0">
          <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
            isSystemHealthy 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-700' 
              : 'bg-orange-50/80 border-orange-200 text-orange-700'
          }`}>
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSystemHealthy ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isSystemHealthy ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider">
                {isSystemHealthy ? t('dashboard.status.optimal', 'System Optimal') : t('dashboard.status.attention', 'Needs Attention')}
              </span>
            </div>
            {isSystemHealthy ? <CheckCircle2 size={18} className="ml-1 opacity-80" /> : <AlertTriangle size={18} className="ml-1 opacity-80" />}
          </div>
          <p className="text-[11px] text-slate-400 font-medium tracking-wide">
            {t('dashboard.status.last_updated', 'Last Sync')}: <span className="text-slate-500">{new Date().toLocaleTimeString()}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeaderBanner;
