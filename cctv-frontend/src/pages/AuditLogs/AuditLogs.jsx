import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  RefreshCcw, 
  Camera, 
  User as UserIcon, 
  ChevronLeft, 
  ChevronRight,
  Activity,
  History
} from 'lucide-react';
import apiClient from '../../utils/apiClient';
import CameraEventTable from './components/CameraEventTable';
import AdminActivityTable from './components/AdminActivityTable';

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

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* 1. Page Header Section (Island Card) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform duration-500">
             <ClipboardList size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-2">
              Audit Logs
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest italic">
              ประวัติการทำงานของระบบและสถานะกล้องวงจรปิด
            </p>
          </div>
        </div>
        
        <div className="relative z-10 flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
          <button 
            onClick={() => { setActiveTab('cameras'); setPagination({ ...pagination, page: 1 }); }}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'cameras' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'}`}
          >
            <Camera className="h-4 w-4" /> Camera Events
          </button>
          <button 
            onClick={() => { setActiveTab('activities'); setPagination({ ...pagination, page: 1 }); }}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'activities' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'}`}
          >
            <History className="h-4 w-4" /> Admin Activity
          </button>
        </div>

        {/* Accent Blur */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-slate-50/50 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-slate-100/50 transition-colors duration-700"></div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Table Header / Filters */}
        <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${activeTab === 'cameras' ? 'bg-rose-50 text-rose-600 shadow-inner' : 'bg-blue-50 text-blue-600 shadow-inner'}`}>
              {activeTab === 'cameras' ? <Activity className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />}
            </div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">
              {activeTab === 'cameras' ? 'Camera Event History' : 'User Activity Logs'}
            </h3>
          </div>
          
          <button 
            onClick={fetchLogs}
            className="p-3 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-blue-600 border border-transparent hover:border-slate-200 active:scale-95 shadow-sm hover:shadow-md"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Table Body */}
        <div className="flex-1">
          {activeTab === 'cameras' ? (
            <CameraEventTable logs={logs} loading={loading} formatDate={formatDate} />
          ) : (
            <AdminActivityTable logs={logs} loading={loading} formatDate={formatDate} />
          )}
        </div>

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Page <span className="text-slate-900">{pagination.page}</span> of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button 
                disabled={pagination.page === 1}
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm active:scale-95"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm active:scale-95"
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
