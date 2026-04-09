import React from 'react';
import { Clock } from 'lucide-react';

const AdminActivityTable = ({ logs, loading, formatDate }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Timestamp</th>
            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">User</th>
            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Action</th>
            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">IP Address</th>
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
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                      {log.user?.username?.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{log.user?.firstName} {log.user?.lastName}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">@{log.user?.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-[10px] font-black uppercase">
                    {log.action}
                  </span>
                </td>
                <td className="px-8 py-6 font-mono text-xs text-slate-400">
                  {log.ipAddress || 'Unknown'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminActivityTable;
