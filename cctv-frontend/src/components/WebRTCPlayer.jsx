import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

const WebRTCPlayer = ({ streamId, go2rtcUrl }) => {
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    startStream();
    return () => stopStream();
  }, [streamId]);

  const startStream = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. สร้าง Peer Connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      pcRef.current = pc;

      // จัดการเมื่อได้ Track วิดีโอมา
      pc.ontrack = (event) => {
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
        }
      };

      // 2. เพิ่ม Transceiver สำหรับรับวิดีโอและเสียง
      pc.addTransceiver('video', { direction: 'recvonly' });
      pc.addTransceiver('audio', { direction: 'recvonly' });

      // 3. สร้าง Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 4. ส่ง Offer ไปที่ go2rtc API
      // หมายเหตุ: go2rtc WebRTC API มักจะเป็น /api/webrtc?src=STREAM_ID
      const url = `${go2rtcUrl}/api/webrtc?src=${streamId}`;
      const response = await fetch(url, {
        method: 'POST',
        body: pc.localDescription.sdp
      });

      if (!response.ok) throw new Error('Failed to connect to streaming server');

      // 5. รับ Answer และตั้งค่า Remote Description
      const answerSdp = await response.text();
      await pc.setRemoteDescription(new RTCSessionDescription({
        type: 'answer',
        sdp: answerSdp
      }));

      setLoading(false);
    } catch (err) {
      console.error('WebRTC Error:', err);
      setError('ไม่สามารถเชื่อมต่อสตรีมได้ กรุณาตรวจสอบการตั้งค่ากล้อง');
      setLoading(false);
    }
  };

  const stopStream = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
          <Loader2 className="h-10 w-10 text-primary-500 animate-spin mb-3" />
          <p className="text-slate-400 text-sm font-medium">กำลังเตรียมการสตรีม...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 p-6 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500 mb-3" />
          <p className="text-white font-bold mb-1">การเชื่อมต่อผิดพลาด</p>
          <p className="text-slate-400 text-xs">{error}</p>
          <button 
            onClick={startStream}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg transition-all"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain"
      />
      
      {/* Overlay Info */}
      {!loading && !error && (
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-600 text-white text-[10px] font-black uppercase rounded-md animate-pulse shadow-lg">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            Live
          </div>
          <div className="px-2.5 py-1 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold rounded-md border border-white/10 uppercase tracking-widest">
            WebRTC / Zero Latency
          </div>
        </div>
      )}
    </div>
  );
};

export default WebRTCPlayer;
