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
        {activeTab === 'cameras' ? (
          <CameraEventTable logs={logs} loading={loading} formatDate={formatDate} />
        ) : (
          <AdminActivityTable logs={logs} loading={loading} formatDate={formatDate} />
        )}

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
