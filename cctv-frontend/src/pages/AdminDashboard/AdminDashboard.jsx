import React, { useEffect, useState } from 'react';
import { RefreshCw, Map as MapIcon, PlayCircle, ShieldCheck } from 'lucide-react';
import cameraService from '../../services/cameraService';
import CameraMap from '../../components/CameraMap';
import StreamModal from '../../components/StreamModal';

const AdminDashboard = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0 });
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [initialPosition, setInitialPosition] = useState(null);

  // ฟังก์ชันจำลองการกดดูสตรีมทดสอบ
  const handleFastTest = () => {
    setSelectedCamera({
      id: 'test/direct', // ID พิเศษที่เราทำไว้
      name: '🔴 ระบบทดสอบสตรีมมิ่ง (Big Buck Bunny)',
      status: 'ACTIVE',
      latitude: 13.7563,
      longitude: 100.5018
    });
    setInitialPosition(null);
  };

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

  const handleSelectCamera = (camera, pos = null) => {
    setInitialPosition(pos);
    setSelectedCamera(camera);
  };

  return (
    <>
      {/* Fast Test Button */}
      <div className="mb-8">
        <button 
          onClick={handleFastTest}
          className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-rose-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] border border-rose-400/30 group"
        >
          <div className="p-2 bg-white/20 rounded-xl group-hover:rotate-12 transition-all">
            <PlayCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-left text-[10px] uppercase tracking-widest font-black opacity-80">Streaming Test</span>
            <span>กดทดสอบระบบสตรีมสด (WebRTC)</span>
          </div>
          <ShieldCheck className="h-6 w-6 ml-4 opacity-40 group-hover:opacity-100 transition-all" />
        </button>
      </div>

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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-grow flex flex-col min-h-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <MapIcon className="h-4 w-4 text-primary-500" />
            จุดติดตั้งกล้องบนแผนที่จริง
          </h3>
          <button onClick={fetchData} className="text-slate-400 hover:text-primary-600 transition-all">
             <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex-grow relative min-h-0">
          <CameraMap 
            cameras={cameras} 
            onSelectCamera={handleSelectCamera} 
          />
        </div>
      </div>

      {/* หน้าต่างดูสตรีมสด */}
      {selectedCamera && (
        <StreamModal 
          camera={selectedCamera} 
          initialPosition={initialPosition}
          onClose={() => setSelectedCamera(null)} 
        />
      )}
    </>
  );
};

export default AdminDashboard;
