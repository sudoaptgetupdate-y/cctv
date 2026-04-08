import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

const WebRTCPlayer = ({ streamId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🚀 ใช้ WebRTC เป็นหลัก (Ultra-Low Latency) และ MSE เป็นตัวสำรอง
  // - webrtc: ภาพสดทันใจ ไม่หมุนค้าง (ถ้าเน็ตช้าภาพจะกระตุกแทนการหมุนโหลด)
  // - mse: เสถียรกว่าในแง่คุณภาพของภาพ แต่มีโอกาสหมุนโหลด (Buffering)
  const playerUrl = `/go2rtc-ui/stream.html?src=${streamId}&mode=webrtc,mse&autoplay=1&mute=1`;

  useEffect(() => {
    setLoading(true);
    setError(null);
  }, [streamId]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center">
      <iframe
        key={streamId}
        src={playerUrl}
        className="w-full h-full border-none"
        scrolling="no"
        onLoad={() => setLoading(false)}
      />
      
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 pointer-events-none">
          <Loader2 className="h-10 w-10 text-primary-500 animate-spin mb-3" />
          <p className="text-slate-400 text-sm font-medium">กำลังเชื่อมต่อภาพสด...</p>
        </div>
      )}

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

      {!loading && (
        <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-md shadow-lg">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            Live
          </div>
          <div className="px-2.5 py-1 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold rounded-md border border-white/10 uppercase tracking-widest">
            H.264 / Stable Feed
          </div>
        </div>
      )}
    </div>
  );
};

export default WebRTCPlayer;
