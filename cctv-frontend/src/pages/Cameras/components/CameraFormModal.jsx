import React from 'react';
import { Camera, Save, Activity } from 'lucide-react';
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

          {/* ✅ เพิ่มส่วน Public Visibility */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                />
                <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">แสดงผลในหน้า Public Dashboard (ไม่ต้อง Login)</span>
            </label>
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

        {/* ✅ เพิ่มส่วน Playback Settings */}
        <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t border-slate-50">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
            Playback Options
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-600 ml-1">สตรีมเริ่มต้นสำหรับแสดงผล (Preferred Stream)</label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all cursor-pointer ${formData.streamType === 'MAIN' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}>
                  <input 
                    type="radio" name="streamType" value="MAIN" className="hidden"
                    checked={formData.streamType === 'MAIN'}
                    onChange={() => setFormData({...formData, streamType: 'MAIN'})}
                  />
                  <span className="text-xs font-bold">Main Stream</span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all cursor-pointer ${formData.streamType === 'SUB' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}>
                  <input 
                    type="radio" name="streamType" value="SUB" className="hidden"
                    checked={formData.streamType === 'SUB'}
                    onChange={() => setFormData({...formData, streamType: 'SUB'})}
                  />
                  <span className="text-xs font-bold">Sub Stream</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-600 ml-1">การจัดการเสียง (Audio Support)</label>
              <div 
                onClick={() => setFormData({...formData, isAudioEnabled: !formData.isAudioEnabled})}
                className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all cursor-pointer ${formData.isAudioEnabled ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}
              >
                <span className={`text-xs font-bold ${formData.isAudioEnabled ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {formData.isAudioEnabled ? 'เปิดใช้งานเสียง (Enable Audio)' : 'ปิดเสียง (Mute Audio)'}
                </span>
                <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-all ${formData.isAudioEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${formData.isAudioEnabled ? 'translate-x-4' : ''}`}></div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium px-1 italic">* กล้องต้องรองรับและเปิดใช้ Audio ในตัวเครื่อง</p>
            </div>
          </div>
        </div>

        {/* ✅ ระบบ Transcoding Toggle (Hybrid System) */}
        <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t border-slate-50">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
            Advanced Performance Mode
          </h4>
          
          <label className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group ${formData.isTranscodeEnabled ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50/50 border-slate-100 hover:border-slate-200 border-dashed'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl transition-colors ${formData.isTranscodeEnabled ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
                <Activity size={20} />
              </div>
              <div>
                <span className={`text-xs font-black uppercase tracking-tight ${formData.isTranscodeEnabled ? 'text-amber-700' : 'text-slate-500'}`}>
                  เปิดใช้งานการแปลงรหัส (Enable Transcoding)
                </span>
                <p className="text-[10px] text-slate-400 font-medium">ประมวลผลวิดีโอใหม่เพื่อบังคับความละเอียด/เฟรมเรต (กิน CPU สูง)</p>
              </div>
            </div>
            <div className="relative">
              <input 
                type="checkbox"
                className="sr-only peer"
                checked={formData.isTranscodeEnabled}
                onChange={(e) => setFormData({...formData, isTranscodeEnabled: e.target.checked})}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </div>
          </label>

          {/* 🚀 แสดงช่องตั้งค่าเฉพาะเมื่อเปิดใช้งาน Transcoding เท่านั้น */}
          {formData.isTranscodeEnabled && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300 bg-amber-50/30 p-6 rounded-2xl border border-amber-100/50">
              
              {/* Main Stream Settings */}
              <div className="space-y-4">
                <h5 className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                  Main Stream (HD) Configuration
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 ml-1">HD Resolution</label>
                    <select 
                      className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-white text-sm font-medium"
                      value={formData.resolution}
                      onChange={(e) => setFormData({...formData, resolution: e.target.value})}
                    >
                      <option value="">-- Original --</option>
                      <option value="3840x2160">4K (3840x2160)</option>
                      <option value="2560x1440">2K (2560x1440)</option>
                      <option value="1920x1080">Full HD (1920x1080)</option>
                      <option value="1280x720">HD (1280x720)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 ml-1">HD Frame Rate (FPS)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-white text-sm font-medium"
                        placeholder="Default: 15"
                        value={formData.fps}
                        onChange={(e) => setFormData({...formData, fps: e.target.value})}
                      />
                      <span className="absolute right-4 top-2.5 text-[9px] font-black text-amber-400 uppercase h-full flex items-center">FPS</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-[1px] bg-amber-100/50"></div>

              {/* Sub Stream Settings */}
              <div className="space-y-4">
                <h5 className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                  Sub Stream (SD) Configuration
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 ml-1">SD Resolution</label>
                    <select 
                      className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-white text-sm font-medium"
                      value={formData.subResolution}
                      onChange={(e) => setFormData({...formData, subResolution: e.target.value})}
                    >
                      <option value="">-- Original --</option>
                      <option value="1280x720">HD (1280x720)</option>
                      <option value="704x576">D1 (704x576)</option>
                      <option value="640x480">VGA (640x480)</option>
                      <option value="640x360">Low (640x360)</option>
                      <option value="320x240">QVGA (320x240)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 ml-1">SD Frame Rate (FPS)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-white text-sm font-medium"
                        placeholder="Default: 10"
                        value={formData.subFps}
                        onChange={(e) => setFormData({...formData, subFps: e.target.value})}
                      />
                      <span className="absolute right-4 top-2.5 text-[9px] font-black text-amber-400 uppercase h-full flex items-center">FPS</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default CameraFormModal;