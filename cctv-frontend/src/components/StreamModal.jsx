import React, { useState, useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2, Shield, Info, Loader2, Camera, GripHorizontal } from 'lucide-react';
import WebRTCPlayer from './WebRTCPlayer';
import streamService from '../services/streamService';

const StreamModal = ({ camera, onClose, initialPosition, isPublic = false }) => {
  const [streamConfig, setStreamConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Dragging State
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const modalRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    if (camera) {
      loadStreamInfo();
      
      if (isMobile) {
        // บนมือถือ ให้เด้งจากด้านล่าง (Bottom Sheet Style)
        setPosition({ x: 16, y: window.innerHeight - 280 });
      } else if (initialPosition) {
        // บน Desktop ตามตำแหน่งกล้อง
        setPosition({ 
          x: Math.min(window.innerWidth - 460, Math.max(20, initialPosition.x + 20)), 
          y: Math.min(window.innerHeight - 320, Math.max(20, initialPosition.y - 150))
        });
      } else {
        // มุมขวาล่างปกติ
        setPosition({ x: window.innerWidth - 470, y: window.innerHeight - 300 });
      }
    }
  }, [camera, initialPosition, isMobile]);

  const loadStreamInfo = async (type = null) => {
    try {
      setLoading(true);
      setError(null);
      const info = await streamService.getStreamInfo(camera.id, type);
      
      // 🚀 หน่วงเวลาเพิ่ม 300ms เพื่อให้ go2rtc เคลียร์สตรีมเก่าและสร้างใหม่เสร็จสมบูรณ์
      setTimeout(() => {
        setStreamConfig(info);
        setLoading(false);
      }, 300);
      
    } catch (err) {
      console.error('Failed to load stream info:', err);
      setError('ไม่สามารถดึงข้อมูลสตรีมมิ่งได้');
      setLoading(false);
    }
  };

  const handleTypeSwitch = (newType) => {
    if (loading || newType === streamConfig?.streamType) return;
    loadStreamInfo(newType);
  };

  // Logic การลาก (Drag) - ปิดการลากบนมือถือเพื่อความง่าย
  const handleMouseDown = (e) => {
    if (isFullscreen || isMobile) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      setPosition({ 
        x: Math.min(window.innerWidth - 100, Math.max(-200, newX)), 
        y: Math.min(window.innerHeight - 100, Math.max(0, newY)) 
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!camera) return null;

  const containerClasses = isFullscreen
    ? "fixed inset-0 z-[3000] flex items-center justify-center p-0 md:p-8"
    : `fixed z-[3000] ${isMobile ? 'left-4 right-4' : 'w-[350px] md:w-[450px]'} transition-all duration-300 ease-out`;

  const contentClasses = isFullscreen
    ? "relative bg-white w-full h-full md:max-w-6xl md:h-auto md:aspect-video rounded-none md:rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-zoomIn flex flex-col"
    : `relative bg-white w-full rounded-3xl shadow-2xl border-2 border-indigo-100 overflow-hidden ${isMobile ? 'animate-slideUp' : 'animate-slideIn'} flex flex-col group select-none`;

  return (
    <div 
      className={containerClasses} 
      style={(!isFullscreen && !isMobile) ? { left: `${position.x}px`, top: `${position.y}px`, transition: isDragging ? 'none' : 'all 0.2s ease-out' } : (!isFullscreen && isMobile ? { bottom: '24px', top: 'auto' } : {})}
    >
      {isFullscreen && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsFullscreen(false)}></div>
      )}
      
      <div className={contentClasses}>
        {/* Header */}
        <div 
          onMouseDown={handleMouseDown}
          className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white transition-opacity z-10"
        >
          <div className="flex items-center gap-2">
            {!isMobile && <GripHorizontal className="h-4 w-4 text-slate-400" />}
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <Camera className="h-4 w-4 text-indigo-600" />
            </div>
            <h3 className="text-[10px] md:text-sm font-black text-slate-800 truncate max-w-[150px] md:max-w-[250px] uppercase tracking-tight">
              {camera.name}
            </h3>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
              title={isFullscreen ? "ย่อหน้าต่าง" : "ขยายเต็มจอ"}
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
              title="ปิด"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Player Section - Fixed 16:9 Aspect Ratio to eliminate sidebars */}
        <div className="relative w-full aspect-video bg-slate-50 flex items-center justify-center overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Synchronizing...</p>
            </div>
          ) : error ? (
            <div className="text-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
              <p className="text-rose-500 text-xs font-bold mb-3">{error}</p>
              <button onClick={loadStreamInfo} className="text-[10px] font-black text-white bg-indigo-600 px-4 py-2 rounded-xl shadow-lg shadow-indigo-200 uppercase tracking-widest">Retry Connection</button>
            </div>
          ) : (
            <div className="w-full h-full">
               <WebRTCPlayer 
                 streamId={streamConfig.streamId} 
                 go2rtcUrl={streamConfig.go2rtcUrl} 
                 isAudioEnabled={streamConfig.isAudioEnabled}
                 initialTranscode={streamConfig.isTranscoded}
                 isPublic={isPublic}
               />
            </div>
          )}
        </div>

        {/* Footer Section - Always Visible */}
        <div 
          className="px-4 py-3 border-t border-slate-100 bg-white flex items-center justify-between z-10"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">
              {camera.groups?.[0]?.name || 'General Area'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Time Clock */}
             <div className="hidden sm:flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/50">
                <span className="text-[10px] font-black tracking-tighter">
                  {currentTime.toLocaleTimeString('th-TH', { hour12: false })}
                </span>
             </div>

             {/* Stream Type Toggle */}
             {!loading && streamConfig?.hasSubStream && (
                <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200/50">
                  <button 
                    onClick={() => handleTypeSwitch('MAIN')}
                    className={`px-2 py-0.5 text-[8px] md:text-[9px] font-black rounded-md transition-all ${streamConfig.streamType === 'MAIN' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    HD
                  </button>
                  <button 
                    onClick={() => handleTypeSwitch('SUB')}
                    className={`px-2 py-0.5 text-[8px] md:text-[9px] font-black rounded-md transition-all ${streamConfig.streamType === 'SUB' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    SD
                  </button>
                </div>
              )}

             <div className="flex items-center gap-1 text-slate-400">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-50">v2.4</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamModal;
