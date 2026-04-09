import React from 'react';
import { Camera, Save } from 'lucide-react';
import Modal from '../../../components/Modal';

const CameraFormModal = ({ isOpen, onClose, onSubmit, formData, setFormData, editingCamera, groups }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCamera ? 'แก้ไขข้อมูลกล้อง' : 'เพิ่มกล้องใหม่'}
      subtitle="Camera Configuration & Streaming Setup"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-2xl text-slate-500 font-bold hover:bg-slate-200 transition-all text-sm"
          >
            ยกเลิก
          </button>
          <button 
            onClick={onSubmit}
            className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 text-sm"
          >
            <Save className="h-5 w-5" />
            <span>{editingCamera ? 'อัปเดตข้อมูล' : 'บันทึกกล้อง'}</span>
          </button>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ข้อมูลพื้นฐาน */}
        <div className="col-span-1 md:col-span-2 space-y-4 border-b border-slate-50 pb-8">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1">ชื่อกล้อง / จุดติดตั้ง</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 text-sm font-medium"
                placeholder="เช่น หน้าตลาดหมู่ 1"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1">กลุ่ม / พื้นที่ (Zones)</label>
              <select 
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 text-sm font-medium"
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
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
            Location (Map)
          </h4>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1 text-emerald-600">Latitude</label>
              <input 
                required
                type="number" step="any"
                className="w-full px-4 py-3 rounded-2xl border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-emerald-50/20 font-mono text-sm"
                placeholder="13.7563"
                value={formData.latitude}
                onChange={(e) => setFormData({...formData, latitude: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1 text-emerald-600">Longitude</label>
              <input 
                required
                type="number" step="any"
                className="w-full px-4 py-3 rounded-2xl border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-emerald-50/20 font-mono text-sm"
                placeholder="100.5018"
                value={formData.longitude}
                onChange={(e) => setFormData({...formData, longitude: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* การเชื่อมต่อสตรีม */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
            Streaming Config
          </h4>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1 text-indigo-600">Main RTSP URL</label>
              <input 
                required
                type="text"
                className="w-full px-4 py-3 rounded-2xl border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-indigo-50/20 font-mono text-sm"
                placeholder="rtsp://admin:pass@ip:port/live"
                value={formData.rtspUrl}
                onChange={(e) => setFormData({...formData, rtspUrl: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1 text-indigo-600">Sub-stream URL (Optional)</label>
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-2xl border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-indigo-50/20 font-mono text-sm"
                placeholder="สำหรับแสดงหน้าแผนที่"
                value={formData.subStream}
                onChange={(e) => setFormData({...formData, subStream: e.target.value})}
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CameraFormModal;