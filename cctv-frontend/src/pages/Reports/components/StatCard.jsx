import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ icon, label, value, subValue, color, trend }) => {
  const themes = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all group">
      <div className={`w-11 h-11 rounded-xl ${themes[color]} border flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>{icon}</div>
      <div className="flex justify-between items-start mb-1">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        {trend !== undefined && (
          <div className={`flex items-center text-[9px] font-black ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <h4 className="text-xl font-black text-slate-800 tracking-tight">{value}</h4>
        {subValue && <span className="text-[9px] font-bold text-slate-400 uppercase">{subValue}</span>}
      </div>
    </div>
  );
};

export default StatCard;
