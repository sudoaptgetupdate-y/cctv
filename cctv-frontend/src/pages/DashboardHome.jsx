import React, { useEffect, useState } from 'react';
import { RefreshCw, Map as MapIcon } from 'lucide-react';
import cameraService from '../services/cameraService';
import CameraMap from '../components/CameraMap';
import StreamModal from '../components/StreamModal';

const DashboardHome = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0 });
  const [selectedCamera, setSelectedCamera] = useState(null);

  useEffect(() => {
    fetchData();
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
    <>
      {/* ส่วนตัวเลขสถิติ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">กล้องทั้งหมด</h4>
          <p className="text-4xl font-black text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
          <h4 className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-2">กล้องออนไลน์</h4>
          <p className="text-4xl font-black text-emerald-600">{stats.online}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-rose-500">
          <h4 className="text-rose-500 text-xs font-bold uppercase tracking-widest mb-2">กล้องออฟไลน์</h4>
          <p className="text-4xl font-black text-rose-600">{stats.offline}</p>
        </div>
      </div>

      {/* ส่วนแผนที่ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-grow flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <MapIcon className="h-4 w-4 text-primary-500" />
            จุดติดตั้งกล้องบนแผนที่จริง
          </h3>
          <button onClick={fetchData} className="text-slate-400 hover:text-primary-600 transition-all">
             <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex-grow relative min-h-[500px]">
          <CameraMap 
            cameras={cameras} 
            onSelectCamera={(camera) => setSelectedCamera(camera)} 
          />
        </div>
      </div>

      {/* หน้าต่างดูสตรีมสด */}
      {selectedCamera && (
        <StreamModal 
          camera={selectedCamera} 
          onClose={() => setSelectedCamera(null)} 
        />
      )}
    </>
  );
};

export default DashboardHome;
