import React from 'react';
import { Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TopCamerasRanking = ({ cameraLeaderboard, topLimit, setTopLimit }) => {
  const { t } = useTranslation();

  return (
    <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
          <Camera className="text-indigo-500" size={16} /> {t('reports.top_rankings')}
        </h3>
        <select 
          className="text-[10px] font-black bg-slate-100 rounded-lg px-3 py-1.5 outline-none border-none cursor-pointer" 
          value={topLimit} 
          onChange={(e) => setTopLimit(parseInt(e.target.value))}
        >
          {[5, 10, 20].map(v => <option key={v} value={v}>TOP {v}</option>)}
        </select>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
        {cameraLeaderboard.map(([name, views], idx) => {
          const max = cameraLeaderboard[0][1];
          return (
            <div key={idx} className="group">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black ${idx === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>{idx+1}</span>
                  <span className="truncate max-w-[120px]">{name}</span>
                </span>
                <span className="text-[10px] font-black text-slate-400">{views.toLocaleString()}</span>
              </div>
              <div className="h-1 bg-slate-50 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-indigo-500' : 'bg-slate-300'}`} 
                  style={{ width: `${(views/max)*100}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopCamerasRanking;
