import React, { useState, useEffect } from 'react';
import { X, Maximize2, Shield, Info, Loader2 } from 'lucide-react';
import WebRTCPlayer from './WebRTCPlayer';
import streamService from '../services/streamService';

const StreamModal = ({ camera, onClose }) => {
  const [streamConfig, setStreamConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (camera) {
      loadStreamInfo();
    }
  }, [camera]);

  const loadStreamInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const info = await streamService.getStreamInfo(camera.id);
      setStreamConfig(info);
    } catch (err) {
      console.error('Failed to load stream info:', err);
      setError('ไม่สามารถดึงข้อมูลสตรีมมิ่งได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  if (!camera) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative bg-slate-900 w-full max-w-5xl rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden animate-zoomIn flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-500">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{camera.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Secure Feed</span>
                <span className="text-slate-500 text-[10px]">•</span>
                <span className="text-slate-400 text-[10px] font-medium uppercase tracking-tighter">ID: {camera.id}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full transition-all text-slate-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Player Section */}
        <div className="p-4 md:p-8 bg-slate-950 flex-grow min-h-[300px] flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-primary-500 animate-spin mb-4" />
              <p className="text-slate-400 text-sm">กำลังติดต่อเซิร์ฟเวอร์...</p>
            </div>
          ) : error ? (
            <div className="text-center p-8 bg-rose-500/5 border border-rose-500/20 rounded-3xl max-w-sm">
              <p className="text-rose-400 text-sm mb-4">{error}</p>
              <button 
                onClick={loadStreamInfo}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs rounded-xl transition-all"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          ) : (
            <WebRTCPlayer 
              streamId={streamConfig.streamId} 
              go2rtcUrl={streamConfig.go2rtcUrl} 
            />
          )}
        </div>

        {/* Footer / Meta Info */}
        <div className="px-8 py-6 bg-slate-900 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${camera.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-rose-500'}`}></div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{camera.status}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Location</p>
              <p className="text-xs font-mono text-slate-300">{camera.latitude.toFixed(4)}, {camera.longitude.toFixed(4)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
            <Info className="h-4 w-4 text-primary-400" />
            <p className="text-[10px] text-slate-400 font-medium">
              กำลังสตรีมมิ่งผ่าน <b>go2rtc Gateway</b> เพื่อลดภาระของตัวกล้องและรักษาความปลอดภัย
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamModal;
