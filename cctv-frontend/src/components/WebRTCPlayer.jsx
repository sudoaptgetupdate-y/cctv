import React, { useState, useEffect, useRef } from 'react';
import { Loader2, AlertCircle, Cpu, Users, RefreshCw } from 'lucide-react';
import streamService from '../services/streamService';

const WebRTCPlayer = ({ streamId, isAudioEnabled = false, initialTranscode = false, isPublic = false }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const videoContainerRef = useRef(null);
  const fastIntervalRef = useRef(null);
  const normalIntervalRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const streamIdRef = useRef(streamId);
  const sessionIdRef = useRef(null);

  useEffect(() => {
    streamIdRef.current = streamId;
  }, [streamId]);

  useEffect(() => {
    // 🚀 ล้างค่าเก่าและเตรียมตัวเล่นใหม่
    setLoading(true);
    setError(null);
    setStatus(null);
    streamIdRef.current = streamId;

    if (!sessionIdRef.current) {
      sessionIdRef.current = Math.random().toString(36).substring(2, 15);
    }

    // 1. ตรวจสอบ Script
    const scriptId = 'go2rtc-player-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = '/libs/go2rtc-player.js';
      script.async = true;
      document.body.appendChild(script);
    }

    let isCancelled = false;

    const initPlayer = () => {
      if (!videoContainerRef.current || isCancelled) return;
      
      console.log(`[Player] 🎬 Initializing Player for: ${streamId}`);
      
      // ล้าง DOM เก่า
      videoContainerRef.current.innerHTML = '';
      
      const videoElement = document.createElement('video-stream');
      
      videoElement.setAttribute('autoplay', '');
      videoElement.setAttribute('playsinline', '');
      if (!isAudioEnabled) videoElement.setAttribute('muted', '');
      
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.display = 'block';

      // 🚀 ใส่เข้า DOM ก่อนเพื่อให้ isConnected เป็น true
      videoContainerRef.current.appendChild(videoElement);

      // 🚀 ตั้งค่า src เพื่อเริ่มการเชื่อมต่อ WebSocket
      const cacheBuster = `&t=${Date.now()}`;
      const finalSrc = `/go2rtc-ws?src=${streamId}&mode=mse,webrtc${cacheBuster}`;
      console.log(`[Player] 🔗 Connection URL: ${finalSrc}`);
      videoElement.src = finalSrc;

      const checkVideoEvents = () => {
        const internalVideo = videoElement.querySelector('video');
        if (internalVideo) {
          internalVideo.addEventListener('playing', () => {
            console.log(`[Player] ✅ Playing: ${streamId}`);
            setLoading(false);
          });
        } else {
          if (!isCancelled) setTimeout(checkVideoEvents, 50);
        }
      };
      checkVideoEvents();
    };

    // 🚀 เรียกใช้งานทันที ไม่ต้องรอเงื่อนไขซับซ้อน
    initPlayer();
    
    startPolling();
    startHeartbeat();

    return () => {
      console.log(`[Player] 🛑 Cleanup: ${streamId}`);
      isCancelled = true;
      stopPolling();
      stopHeartbeat();
      if (videoContainerRef.current) videoContainerRef.current.innerHTML = '';
    };
  }, [streamId, isAudioEnabled]);

  // ✅ Force hide loading if status shows active video
  useEffect(() => {
    if (loading && status && status.codec !== 'WAIT' && status.fps !== '??') {
      console.log('[Player] Forcing loading to false based on API status');
      setLoading(false);
    }
  }, [status, loading]);

  const stopPolling = () => {
    if (fastIntervalRef.current) clearInterval(fastIntervalRef.current);
    if (normalIntervalRef.current) clearInterval(normalIntervalRef.current);
  };

  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
  };

  const startHeartbeat = () => {
    stopHeartbeat();
    const sendPulse = async () => {
      if (!streamIdRef.current || !sessionIdRef.current) return;
      try {
        await streamService.sendHeartbeat(streamIdRef.current, sessionIdRef.current);
      } catch (err) {
        console.warn('[Heartbeat] Pulse failed');
      }
    };

    sendPulse(); // Send first pulse immediately
    heartbeatIntervalRef.current = setInterval(sendPulse, 15000); // Pulse every 15s
  };

  const fetchStatus = async () => {
    const currentId = streamIdRef.current;
    if (!currentId) return null;

    try {
      setIsSyncing(true);
      // 🚀 ใช้ API เจาะจงรายสตรีม
      const currentStatus = await streamService.getSingleStreamStatus(currentId);
      
      // ✅ อัปเดตเสมอ ห้ามมีเงื่อนไข if(currentStatus)
      // เพื่อให้ UI เปลี่ยนจาก null เป็น Object WAIT ได้ทันที
      setStatus(currentStatus);
      
      setIsSyncing(false);
      return currentStatus;
    } catch (err) {
      console.warn('[Player Debug] Fetch Error:', err);
      setIsSyncing(false);
      return null;
    }
  };

  const startPolling = () => {
    fetchStatus();
    let polls = 0;
    fastIntervalRef.current = setInterval(async () => {
      polls++;
      const currentStatus = await fetchStatus();
      if ((currentStatus && currentStatus.codec !== 'WAIT') || polls >= 25) {
        if (fastIntervalRef.current) clearInterval(fastIntervalRef.current);
        normalIntervalRef.current = setInterval(fetchStatus, 5000);
      }
    }, 1200);
  };

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden flex items-center justify-center">
      {/* 🎬 Native Video Container */}
      <div ref={videoContainerRef} className="w-full h-full z-0" />
      
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 pointer-events-none">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-3" />
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Establishing Link...</p>
        </div>
      )}

      {/* Badge UI (Always Visible for Real-time Feedback) */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none select-none z-20 w-full pr-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {!loading && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-600 text-white text-[10px] font-black uppercase rounded shadow-lg pointer-events-auto shadow-rose-900/20">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                Live
              </div>
            )}

            {/* 👥 Viewer Count: แสดงทันที แม้จะเป็น 0 */}
            <div className={`flex items-center gap-1 px-2 py-1 backdrop-blur-md text-white text-[10px] font-black rounded border shadow-lg pointer-events-auto transition-all duration-500 ${status ? 'bg-emerald-600/60 border-emerald-400/20' : 'bg-slate-800/40 border-slate-700/30 text-slate-400'}`}>
              <Users className="h-3 w-3" />
              <span className={status?.viewerCount > 0 ? "animate-pulse" : ""}>
                {status ? status.viewerCount : '0'}
              </span>
            </div>
            
            {!isPublic && (
              <div className={`px-2.5 py-1 backdrop-blur-md text-[10px] font-bold rounded-md border uppercase tracking-widest flex items-center gap-2 pointer-events-auto transition-all duration-500 ${status && status.codec !== 'WAIT' ? 'bg-black/40 text-white border-white/10' : 'bg-slate-800/40 text-slate-400 border-slate-700/30'}`}>
                {status && status.codec !== 'WAIT' ? (
                  <>
                    {status.codec} / {status.mode}
                    {status.isTranscoded && <Cpu className="h-4 w-4 text-amber-400 animate-pulse" />}
                  </>
                ) : (
                  <>
                    {isSyncing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3 text-indigo-400" />}
                    {status?.codec === 'WAIT' ? 'Negotiating...' : 'Linking...'}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* 📊 Technical Specs: แสดงตลอดเวลา ใช้ placeholder ถ้ายังไม่มีค่า */}
        {!isPublic && (
          <div className="flex items-center gap-1">
            <div className={`px-2 py-0.5 backdrop-blur-sm text-[8px] font-black rounded border uppercase tracking-tighter transition-all ${status && status.resolution !== 'Unknown' ? 'bg-slate-900/80 text-slate-300 border-white/5' : 'bg-slate-800/40 text-slate-500 border-transparent'}`}>
              {status && status.resolution !== 'Unknown' ? status.resolution : '--- x ---'}
            </div>
            <div className={`px-2 py-0.5 backdrop-blur-sm text-[8px] font-black rounded border uppercase tracking-tighter transition-all ${status && status.fps !== '??' ? 'bg-slate-900/80 text-indigo-400 border-white/5' : 'bg-slate-800/40 text-slate-500 border-transparent'}`}>
              {status && status.fps !== '??' ? `${status.fps} FPS` : '00 FPS'}
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
