import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  RefreshCcw, 
  Camera, 
  User as UserIcon, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Activity,
  History
} from 'lucide-react';
import apiClient from '../utils/apiClient';

const AuditLogs = () => {
  const [activeTab, setActiveTab] = useState('cameras'); // 'cameras' or 'activities'
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ cameraId: '', eventType: '' });

  // ฟังก์ชันจัดรูปแบบวันที่แบบ Native (ไทย)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  };

  useEffect(() => {
    fetchLogs();
  }, [activeTab, pagination.page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'cameras' ? '/logs/cameras' : '/logs/activities';
      const params = {
        page: pagination.page,
        limit: 20,
        ...(activeTab === 'cameras' && filters.cameraId ? { cameraId: filters.cameraId } : {})
      };
      
      const res = await apiClient.get(endpoint, { params });
      if (res.data.success) {
        setLogs(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-900 rounded-[2rem] text-white shadow-xl shadow-slate-900/20">
            <ClipboardList className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Audit Logs</h1>
            <p className="text-slate-500 font-medium">ประวัติการทำงานของระบบและสถานะกล้องวงจรปิด</p>
          </div>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm">
          <button 
            onClick={() => { setActiveTab('cameras'); setPagination({ ...pagination, page: 1 }); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'cameras' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Camera className="h-4 w-4" /> Camera Events
          </button>
          <button 
            onClick={() => { setActiveTab('activities'); setPagination({ ...pagination, page: 1 }); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'activities' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <History className="h-4 w-4" /> Admin Activity
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header / Filters */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${activeTab === 'cameras' ? 'bg-rose-50 text-rose-600' : 'bg-primary-50 text-primary-600'}`}>
              {activeTab === 'cameras' ? <Activity className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />}
            </div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">
              {activeTab === 'cameras' ? 'Camera Event History' : 'User Activity Logs'}
            </h3>
          </div>
          
          <button 
            onClick={fetchLogs}
            className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-900"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Timestamp</th>
                {activeTab === 'cameras' ? (
                  <>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Camera Name</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Event</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Details</th>
                  </>
                ) : (
                  <>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">User</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Action</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">IP Address</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <RefreshCcw className="h-10 w-10 text-slate-200 animate-spin mb-4" />
                      <p className="text-slate-400 font-medium">กำลังโหลดประวัติ...</p>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">ไม่พบข้อมูลประวัติในขณะนี้</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-slate-300" />
                        <span className="text-sm font-bold text-slate-600">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                    </td>
                    
                    {activeTab === 'cameras' ? (
                      <>
                        <td className="px-8 py-6">
                          <span className="text-sm font-black text-slate-900 group-hover:text-primary-600 transition-colors">
                            {log.camera?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          {getStatusBadge(log.eventType)}
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs font-medium text-slate-500 italic max-w-xs truncate block">
                            {log.details || '-'}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Page <span className="text-slate-900">{pagination.page}</span> of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button 
                disabled={pagination.page === 1}
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
