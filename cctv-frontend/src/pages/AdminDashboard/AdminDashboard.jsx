import React, { useEffect, useState } from 'react';
import { RefreshCw, Map as MapIcon } from 'lucide-react';
import cameraService from '../../services/cameraService';
import CameraMap from '../../components/CameraMap';
import StreamModal from '../../components/StreamModal';
import { useAuth } from '../../context/AuthContext';
import HeaderBanner from './components/HeaderBanner';
import StatCards from './components/StatCards';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0 });
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [focusedCamera, setFocusedCamera] = useState(null);
  const [initialPosition, setInitialPosition] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
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
    setFocusedCamera(camera);
    setInitialPosition(pos);
    setSelectedCamera(camera);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Banner */}
      <HeaderBanner user={user} stats={stats} />

      {/* สถิติ */}
      <StatCards stats={stats} />

      {/* ส่วนแผนที่ */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div>
            <h3 className="font-black text-slate-800 flex items-center gap-2.5 text-lg tracking-tight">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <MapIcon className="h-5 w-5" />
              </div>
              จุดติดตั้งกล้องบนแผนที่จริง
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5 ml-9">แสดงตำแหน่งกล้อง CCTV ทั้งหมดในระบบ</p>
          </div>
          <button 
            onClick={fetchData} 
            disabled={loading}
            className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
            title="Refresh Map"
          >
             <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>
        <div className="flex-grow relative">
          <CameraMap 
            cameras={cameras} 
            onSelectCamera={handleSelectCamera} 
            focusedCamera={focusedCamera}
          />
        </div>
      </div>

      {/* หน้าต่างดูสตรีมสด */}
      {selectedCamera && (
        <StreamModal 
          key={selectedCamera.id}
          camera={selectedCamera} 
          initialPosition={initialPosition}
          onClose={() => setSelectedCamera(null)} 
        />
      )}
    </div>
  );
};

export default AdminDashboard;
