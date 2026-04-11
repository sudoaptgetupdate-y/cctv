import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Cpu, Users } from 'lucide-react';
import streamService from '../services/streamService';

const WebRTCPlayer = ({ streamId, isAudioEnabled = false, initialTranscode = false, isPublic = false }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cacheBuster] = useState(Date.now());
  const [status, setStatus] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // 🚀 เพิ่ม &t=${cacheBuster} เพื่อบังคับให้ iframe โหลดใหม่เสมอ ไม่จำภาพเก่า
  // 🚀 เพิ่ม &info=0 เพื่อซ่อนตัวอักษรสถานะ (WebRTC/MSE) ของ go2rtc ต้นฉบับ
  const playerUrl = `/go2rtc-ui/stream.html?src=${streamId}&mode=webrtc,mse&autoplay=1&mute=${isAudioEnabled ? '0' : '1'}&controls=1&info=0&t=${cacheBuster}`;

  useEffect(() => {
    setLoading(true);
    setError(null);
    setStatus(null);
    setRetryCount(0);
    
    // ดึงข้อมูลสถานะครั้งแรกทันที
    fetchStatus();

    // 🚀 Adaptive Polling: ช่วงแรก (10 วิ) ดึงทุกวินาทีเพื่อให้ Badge ขึ้นเร็วที่สุด
    const fastInterval = setInterval(() => {
      setRetryCount(prev => {
        if (prev < 10) {
          fetchStatus();
          return prev + 1;
        } else {
          clearInterval(fastInterval);
          return prev;
        }
      });
    }, 1000);

    // หลังจากนั้นดึงทุก 5 วินาทีตามปกติ
    const normalInterval = setInterval(fetchStatus, 5000);

    return () => {
      clearInterval(fastInterval);
      clearInterval(normalInterval);
    };
  }, [streamId]);

  const fetchStatus = async () => {
    try {
      const statuses = await streamService.getStreamStatuses();
      if (statuses && statuses[streamId]) {
        setStatus(statuses[streamId]);
      }
    } catch (err) {
      console.warn('Failed to fetch stream status');
    }
  };

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden flex items-center justify-center">
      <iframe
        key={streamId}
        src={playerUrl}
        className="w-full h-full border-none"
        scrolling="no"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture"
        onLoad={() => setLoading(false)}
      />
      
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 pointer-events-none">
          <Loader2 className="h-10 w-10 text-primary-500 animate-spin mb-3" />
          <p className="text-slate-400 text-sm font-medium">กำลังเชื่อมต่อภาพสด...</p>
        </div>
      )}

      {/* 🆕 Badge แสดงผลทันทีและเร็วขึ้น */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none select-none z-20">
        {/* Main Status Row */}
        <div className="flex items-center gap-1.5">
          {!loading && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-600 text-white text-[10px] font-black uppercase rounded shadow-lg">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              Live
            </div>
          )}

              {/* Viewer Count Badge - แสดงผลทั้ง Public และ Admin และขึ้นทันทีที่ข้อมูลมา */}
              {status && (
                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-600/60 backdrop-blur-md text-white text-[10px] font-black rounded border border-emerald-400/20 shadow-lg">
                  <Users className="h-3 w-3" />
                  <span className="animate-pulse">{status.viewerCount}</span>
                </div>
              )}
          
          {/* แสดงข้อมูลเทคนิคเฉพาะเมื่อไม่ใช่หน้า Public */}
          {!isPublic && (
            status ? (
              <div className="px-2.5 py-1 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold rounded-md border border-white/10 uppercase tracking-widest flex items-center gap-2">
                {status.codec} / {status.mode}
                {status.isTranscoded && <Cpu className="h-4 w-4 text-amber-400 animate-pulse" />}
              </div>
            ) : (
              <div className="px-2.5 py-1 bg-black/40 backdrop-blur-md text-slate-400 text-[10px] font-bold rounded-md border border-white/10 uppercase tracking-widest flex items-center gap-2 italic">
                Connecting...
                {initialTranscode && <Cpu className="h-4 w-4 text-amber-400/50 animate-pulse" />}
              </div>
            )
          )}
        </div>
        
        {/* Technical Specs Row - ซ่อนเมื่อเป็น Public */}
        {!isPublic && status && (
          <div className="flex items-center gap-1">
            <div className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-sm text-[8px] font-black text-slate-300 rounded border border-white/5 uppercase tracking-tighter">
              {status.resolution}
            </div>
            <div className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-sm text-[8px] font-black text-primary-400 rounded border border-white/5 uppercase tracking-tighter">
              {status.fps} FPS
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 p-6 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500 mb-3" />
          <p className="text-white font-bold mb-1">สตรีมขัดข้อง</p>
          <p className="text-slate-400 text-xs">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg transition-all"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      )}
    </div>
  );
};

export default WebRTCPlayer;
