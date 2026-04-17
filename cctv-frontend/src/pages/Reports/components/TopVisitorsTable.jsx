import React from 'react';
import { Users } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const TopVisitorsTable = ({ topVisitors, currentLocale }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
          <Users className="text-indigo-500" size={16} /> {t('reports.top_visitors')}
        </h3>
        <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[9px] font-black rounded-md uppercase">{t('reports.unique_ips')}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[9px] font-black text-slate-400 uppercase tracking-tighter border-b border-slate-50">
              <th className="pb-3">{t('reports.ip_address')}</th>
              <th className="pb-3 text-center">{t('reports.total_visits')}</th>
              <th className="pb-3 text-right">{t('reports.last_activity')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {topVisitors?.map((v, i) => (
              <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                <td className="py-3 text-[11px] font-black text-slate-600 font-mono">{v.ip}</td>
                <td className="py-3 text-center">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black">{v.count}</span>
                </td>
                <td className="py-3 text-right text-[10px] font-bold text-slate-400">
                  {format(new Date(v.lastSeen), 'dd MMM HH:mm', { locale: currentLocale })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopVisitorsTable;
