import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Camera, MapPin, Link as LinkIcon, Save, X, Search, PlayCircle } from 'lucide-react';
import cameraService from '../services/cameraService';
import groupService from '../services/groupService';
import StreamModal from '../components/StreamModal';

const Cameras = () => {
  const [cameras, setCameras] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State สำหรับ Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [editingCamera, setEditingCamera] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    rtspUrl: '',
    subStream: '',
    username: '',
    password: '',
    groupId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cameraData, groupData] = await Promise.all([
        cameraService.getAll(),
        groupService.getAll()
      ]);
      setCameras(cameraData);
      setGroups(groupData);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (camera = null) => {
    if (camera) {
      setEditingCamera(camera);
      setFormData({
        name: camera.name,
        latitude: camera.latitude.toString(),
        longitude: camera.longitude.toString(),
        rtspUrl: camera.rtspUrl,
        subStream: camera.subStream || '',
        username: camera.username || '',
        password: camera.password || '',
        groupId: camera.groups?.[0]?.id || ''
      });
    } else {
      setEditingCamera(null);
      setFormData({
        name: '',
        latitude: '',
        longitude: '',
        rtspUrl: '',
        subStream: '',
        username: '',
        password: '',
        groupId: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude)
    };

    try {
      if (editingCamera) {
        await cameraService.update(editingCamera.id, data);
      } else {
        await cameraService.create(data);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณต้องการลบกล้องตัวนี้ใช่หรือไม่?')) {
      try {
        await cameraService.delete(id);
        fetchData();
      } catch (error) {
        alert('ลบข้อมูลไม่สำเร็จ');
      }
    }
  };

  const filteredCameras = cameras.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.rtspUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อกล้อง หรือ IP..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-900/10 whitespace-nowrap"
        >
          <Plus className="h-5 w-5" />
          <span>เพิ่มกล้องใหม่</span>
        </button>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4">ชื่อกล้อง / กลุ่ม</th>
                <th className="px-6 py-4">พิกัด (LAT/LNG)</th>
                <th className="px-6 py-4">การเชื่อมต่อ (RTSP)</th>
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-400">กำลังโหลดข้อมูล...</td>
                </tr>
              ) : filteredCameras.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-medium">ไม่พบข้อมูลกล้อง</td>
                </tr>
              ) : filteredCameras.map((camera) => (
                <tr key={camera.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      camera.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${camera.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      {camera.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{camera.name}</div>
                    <div className="text-xs text-slate-400 italic">กลุ่ม: {camera.groups?.[0]?.name || 'ไม่มีกลุ่ม'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <MapPin className="h-3 w-3 text-slate-300" />
                      <span>{camera.latitude.toFixed(4)}, {camera.longitude.toFixed(4)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 w-fit max-w-[200px] overflow-hidden truncate">
                      <LinkIcon className="h-3 w-3 flex-shrink-0" />
                      {camera.rtspUrl}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setSelectedCamera(camera)}
                        className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all" title="ดูสตรีมสด">
                        <PlayCircle className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(camera)}
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="แก้ไข">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(camera.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="ลบ">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* สตรีมมิ่ง Modal */}
      {selectedCamera && (
        <StreamModal 
          camera={selectedCamera} 
          onClose={() => setSelectedCamera(null)} 
        />
      )}

      {/* Modal - เพิ่ม/แก้ไขกล้อง */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-zoomIn">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-100 rounded-2xl text-primary-600">
                  <Camera className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{editingCamera ? 'แก้ไขข้อมูลกล้อง' : 'เพิ่มกล้องใหม่'}</h3>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-0.5">Camera Configuration</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ข้อมูลพื้นฐาน */}
                <div className="col-span-1 md:col-span-2 space-y-4 border-b border-slate-100 pb-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block ml-1">ชื่อกล้อง / จุดติดตั้ง</label>
                      <input 
                        required
                        type="text" 
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all bg-slate-50"
                        placeholder="เช่น หน้าตลาดหมู่ 1"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block ml-1">กลุ่ม / พื้นที่ (Zones)</label>
                      <select 
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all bg-slate-50"
                        value={formData.groupId}
                        onChange={(e) => setFormData({...formData, groupId: e.target.value})}
                      >
                        <option value="">-- เลือกกลุ่ม --</option>
                        {groups.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* พิกัดแผนที่ */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Location (Map)</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block ml-1 text-emerald-600">Latitude</label>
                      <input 
                        required
                        type="number" step="any"
                        className="w-full px-4 py-2.5 rounded-xl border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-emerald-50/30 font-mono text-sm"
                        placeholder="13.7563"
                        value={formData.latitude}
                        onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block ml-1 text-emerald-600">Longitude</label>
                      <input 
                        required
                        type="number" step="any"
                        className="w-full px-4 py-2.5 rounded-xl border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-emerald-50/30 font-mono text-sm"
                        placeholder="100.5018"
                        value={formData.longitude}
                        onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* การเชื่อมต่อสตรีม */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Streaming Config</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block ml-1 text-blue-600">Main RTSP URL</label>
                      <input 
                        required
                        type="text"
                        className="w-full px-4 py-2.5 rounded-xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-blue-50/30 font-mono text-sm"
                        placeholder="rtsp://admin:pass@ip:port/live"
                        value={formData.rtspUrl}
                        onChange={(e) => setFormData({...formData, rtspUrl: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block ml-1 text-blue-600">Sub-stream URL (Optional)</label>
                      <input 
                        type="text"
                        className="w-full px-4 py-2.5 rounded-xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-blue-50/30 font-mono text-sm"
                        placeholder="สำหรับแสดงหน้าแผนที่"
                        value={formData.subStream}
                        onChange={(e) => setFormData({...formData, subStream: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-200 transition-all"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="px-10 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-900/20 flex items-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{editingCamera ? 'อัปเดตข้อมูล' : 'บันทึกกล้อง'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cameras;
