import React from 'react';
import { Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ReportFilters = ({ 
  dateRange, setDateRange, 
  selectedCameraId, setSelectedCameraId, 
  cameras, customDates, setCustomDates, onApplyCustom 
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
        {['1', '7', '15', '30'].map(val => (
          <button 
            key={val} 
            onClick={() => setDateRange(val)} 
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${dateRange === val ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {val} {t('common.days')}
          </button>
        ))}
        <button 
          onClick={() => setDateRange('custom')} 
          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${dateRange === 'custom' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {t('common.custom')}
        </button>
      </div>
      <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>
      <div className="flex-1 min-w-[200px] relative">
        <Camera size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <select 
          className="w-full bg-slate-50 border-transparent rounded-xl text-xs font-bold pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none" 
          value={selectedCameraId} 
          onChange={(e) => setSelectedCameraId(e.target.value)}
        >
          <option value="all">{t('reports.all_cameras')}</option>
          {cameras.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      {dateRange === 'custom' && (
        <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
          <input 
            type="date" 
            className="bg-slate-50 border-transparent rounded-xl text-xs font-bold px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20" 
            value={customDates.start} 
            onChange={(e) => setCustomDates({...customDates, start: e.target.value})} 
          />
          <span className="text-slate-300">/</span>
          <input 
            type="date" 
            className="bg-slate-50 border-transparent rounded-xl text-xs font-bold px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20" 
            value={customDates.end} 
            onChange={(e) => setCustomDates({...customDates, end: e.target.value})} 
          />
          <button 
            onClick={onApplyCustom} 
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95"
          >
            {t('common.apply')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportFilters;
