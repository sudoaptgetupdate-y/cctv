import React from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const CameraEventTable = ({ logs, loading, formatDate }) => {
  const getStatusBadge = (type) => {
    switch (type) {
      case 'ONLINE':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase"><CheckCircle2 className="h-3 w-3" /> Online</span>;
      case 'OFFLINE':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-[10px] font-black uppercase"><AlertCircle className="h-3 w-3" /> Offline</span>;
      case 'ERROR':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase"><AlertCircle className="h-3 w-3" /> Error</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase">{type}</span>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Timestamp</th>
            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Camera Name</th>
            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Event</th>
            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-medium">กำลังโหลด...</td>
            </tr>
          ) : logs.length === 0 ? (
            <tr>
              <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">ไม่พบข้อมูลประวัติ</td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-slate-300" />
                    <span className="text-sm font-bold text-slate-600">{formatDate(log.createdAt)}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-black text-slate-900 group-hover:text-primary-600 transition-colors">
                    {log.camera?.name || 'N/A'}
                  </span>
                </td>
                <td className="px-8 py-6">{getStatusBadge(log.eventType)}</td>
                <td className="px-8 py-6">
                  <span className="text-xs font-medium text-slate-500 italic max-w-xs truncate block">
                    {log.details || '-'}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CameraEventTable;
