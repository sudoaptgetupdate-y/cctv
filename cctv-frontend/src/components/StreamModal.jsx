import React, { useState, useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2, Shield, Info, Loader2, Camera, GripHorizontal } from 'lucide-react';
import WebRTCPlayer from './WebRTCPlayer';
import streamService from '../services/streamService';

const StreamModal = ({ camera, onClose, initialPosition }) => {
  const [streamConfig, setStreamConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Dragging State
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const modalRef = useRef(null);

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

  const loadStreamInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const info = await streamService.getStreamInfo(camera.id);
      setStreamConfig(info);
    } catch (err) {
      console.error('Failed to load stream info:', err);
      setError('ไม่สามารถดึงข้อมูลสตรีมมิ่งได้');
    } finally {
      setLoading(false);
    }
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
    : `fixed z-[3000] ${isMobile ? 'left-4 right-4' : 'w-[350px] md:w-[450px]'} aspect-video transition-all duration-300 ease-out`;

  const contentClasses = isFullscreen
    ? "relative bg-slate-900 w-full h-full md:max-w-6xl md:h-auto md:aspect-video rounded-none md:rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden animate-zoomIn flex flex-col"
    : `relative bg-slate-900 w-full h-full rounded-3xl shadow-2xl border-2 border-primary-500/30 overflow-hidden ${isMobile ? 'animate-slideUp' : 'animate-slideIn'} flex flex-col group select-none`;

  return (
    <div 
      className={containerClasses} 
      style={(!isFullscreen && !isMobile) ? { left: `${position.x}px`, top: `${position.y}px`, transition: isDragging ? 'none' : 'all 0.2s ease-out' } : (!isFullscreen && isMobile ? { bottom: '24px', top: 'auto' } : {})}
    >
      {isFullscreen && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setIsFullscreen(false)}></div>
      )}
      
      <div className={contentClasses}>
        {/* Header */}
        <div 
          onMouseDown={handleMouseDown}
          className={`px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 ${(!isFullscreen && !isMobile) ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'} transition-opacity z-10`}
        >
          <div className="flex items-center gap-2">
            {!isMobile && <GripHorizontal className="h-4 w-4 text-slate-500" />}
            <Camera className="h-4 w-4 text-primary-500" />
            <h3 className="text-xs md:text-sm font-bold text-white truncate max-w-[120px] md:max-w-[250px]">{camera.name}</h3>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
              title={isFullscreen ? "ย่อหน้าต่าง" : "ขยายเต็มจอ"}
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-rose-500/20 rounded-lg text-slate-300 hover:text-rose-500 transition-colors"
              title="ปิด"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Player Section */}
        <div className="relative flex-grow bg-slate-950 flex items-center justify-center overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-6 w-6 text-primary-500 animate-spin mb-2" />
              <p className="text-slate-500 text-[9px] uppercase font-bold tracking-widest">Loading...</p>
            </div>
          ) : error ? (
            <div className="text-center p-4">
              <p className="text-rose-400 text-[10px] mb-2">{error}</p>
              <button onClick={loadStreamInfo} className="text-[9px] font-bold text-white bg-rose-600 px-3 py-1 rounded-lg">Retry</button>
            </div>
          ) : (
            <div className="w-full h-full">
               <WebRTCPlayer streamId={streamConfig.streamId} go2rtcUrl={streamConfig.go2rtcUrl} />
            </div>
          )}

          {!isFullscreen && !loading && !error && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-md">
               <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[8px] font-black text-white uppercase">Live</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamModal;
