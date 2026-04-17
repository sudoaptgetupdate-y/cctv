import React from 'react';
import { BarChart3, Download, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ReportHeader = ({ onExport, onRefresh, loading }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-700"></div>
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl text-white shadow-xl shadow-indigo-200 flex items-center justify-center shrink-0">
            <BarChart3 size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
              {t('reports.title')}
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
              <span className="w-8 h-px bg-slate-200"></span>
              {t('reports.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onExport} 
            className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-[11px] font-black text-white transition-all uppercase tracking-widest shadow-xl shadow-indigo-200 active:scale-95 flex items-center gap-3"
          >
            <Download size={16} />
            {t('common.export')}
          </button>
          <button 
            onClick={onRefresh} 
            className="h-12 px-6 bg-white border border-slate-200 rounded-2xl text-[11px] font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest active:scale-95 flex items-center gap-3"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {t('common.refresh')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;
