import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Map as MapIcon, Camera, Settings, RefreshCw } from 'lucide-react';
import cameraService from '../services/cameraService';
import CameraMap from '../components/CameraMap';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0 });

  useEffect(() => {
    fetchData();
    // Refresh ข้อมูลทุก 30 วินาที
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const data = await cameraService.getAll();
      setCameras(data);
      
      const online = data.filter(c => c.status === 'ACTIVE').length;
      setStats({
        total: data.length,
        online: online,
        offline: data.length - online
      });
    } catch (error) {
      console.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-black text-white tracking-tighter">CCTV LIVE</h1>
          <p className="text-[10px] uppercase font-bold text-slate-500 mt-1 tracking-widest">Monitoring System</p>
        </div>
        
        <nav className="mt-4 px-4 space-y-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-600 text-white font-medium transition-all">
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all text-slate-400 hover:text-white">
            <MapIcon className="h-5 w-5" />
            <span>Map View</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all text-slate-400 hover:text-white">
            <Camera className="h-5 w-5" />
            <span>Cameras</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all text-slate-400 hover:text-white">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Overview Dashboard</h2>
            <p className="text-xs text-slate-500">ยินดีต้อนรับคุณ, {user?.firstName}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchData}
              className="p-2 rounded-xl text-slate-400 hover:text-primary-600 hover:bg-slate-50 transition-all"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all font-medium text-sm border border-slate-200"
            >
              <LogOut className="h-4 w-4" />
              <span>ลงชื่อออก</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 flex-grow overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">กล้องทั้งหมด</h4>
              <p className="text-4xl font-black text-slate-900">{stats.total}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
              <h4 className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-2">กล้องออนไลน์</h4>
              <p className="text-4xl font-black text-slate-900">{stats.online}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-rose-500">
              <h4 className="text-rose-500 text-xs font-bold uppercase tracking-widest mb-2">กล้องออฟไลน์</h4>
              <p className="text-4xl font-black text-slate-900">{stats.offline}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-grow flex flex-col min-h-[500px]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <MapIcon className="h-4 w-4 text-primary-500" />
                จุดติดตั้งกล้องบนแผนที่จริง
              </h3>
              <span className="text-[10px] text-slate-400 font-medium italic">อัปเดตสถานะอัตโนมัติทุก 30 วินาที</span>
            </div>
            <div className="flex-grow relative">
              {loading && cameras.length === 0 ? (
                <div className="absolute inset-0 z-[1000] bg-white/50 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 text-primary-500 animate-spin mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">กำลังโหลดพิกัดกล้อง...</p>
                  </div>
                </div>
              ) : null}
              <CameraMap cameras={cameras} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
