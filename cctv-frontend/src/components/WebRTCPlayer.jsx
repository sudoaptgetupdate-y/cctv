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
    setLoading(true);
    setError(null);
    setStatus(null);
    streamIdRef.current = streamId;

    if (!sessionIdRef.current) {
      sessionIdRef.current = Math.random().toString(36).substring(2, 15);
    }

    let isCancelled = false;

    const initPlayer = () => {
      if (!videoContainerRef.current || isCancelled) return;
      
      // 🚀 ตรวจสอบความพร้อมของ Custom Element (รอจนกว่าจะถูก Register)
      if (!customElements.get('video-stream')) {
        console.log('[Player] ⏳ Waiting for Streaming Library...');
        setTimeout(initPlayer, 200); // เพิ่มหน่วงเวลาเล็กน้อยสำหรับครั้งแรกหลัง Refresh
        return;
      }

      console.log(`[Player] 🎬 Initializing Player: ${streamId}`);
      videoContainerRef.current.innerHTML = '';
      
      const videoElement = document.createElement('video-stream');
      videoElement.setAttribute('autoplay', '');
      videoElement.setAttribute('playsinline', '');
      if (!isAudioEnabled) videoElement.setAttribute('muted', '');
      
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.display = 'block';

      videoContainerRef.current.appendChild(videoElement);

      // 🚀 หน่วงเวลาสั้นๆ ก่อนส่ง URL เพื่อให้ DOM พร้อม 100%
      setTimeout(() => {
        if (isCancelled) return;
        const cacheBuster = `&t=${Date.now()}`;
        videoElement.src = `/go2rtc-ws?src=${streamId}&mode=mse,webrtc${cacheBuster}`;
      }, 50);

      const checkVideoEvents = () => {
        const internalVideo = videoElement.querySelector('video');
        if (internalVideo) {
          // ฟังเหตุการณ์ playing และ canplay
          const onPlaying = () => {
            console.log(`[Player] ✅ Video Started: ${streamId}`);
            setLoading(false);
          };
          internalVideo.addEventListener('playing', onPlaying);
          internalVideo.addEventListener('canplay', onPlaying);
        } else {
          if (!isCancelled) setTimeout(checkVideoEvents, 100);
        }
      };
      checkVideoEvents();
    };

    // เริ่มต้นทำงานทันที (เพราะสคริปต์โหลดที่ index.html แล้ว)
    initPlayer();
    
    startPolling();
    startHeartbeat();

    return () => {
      isCancelled = true;
      stopPolling();
      stopHeartbeat();
      if (videoContainerRef.current) videoContainerRef.current.innerHTML = '';
    };
  }, [streamId, isAudioEnabled]);

  // ✅ Force hide loading ถ้ามี Technical Status ยืนยันว่าภาพติดแล้ว
  useEffect(() => {
    if (loading && status && status.codec !== 'WAIT' && status.fps !== '??') {
      console.log('[Player] Auto-revealing based on API status');
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
      } catch (err) { }
    };
    sendPulse();
    heartbeatIntervalRef.current = setInterval(sendPulse, 15000);
  };

  const fetchStatus = async () => {
    const currentId = streamIdRef.current;
    if (!currentId) return null;
    try {
      setIsSyncing(true);
      const currentStatus = await streamService.getSingleStreamStatus(currentId);
      setStatus(currentStatus);
      setIsSyncing(false);
      return currentStatus;
    } catch (err) {
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
      if ((currentStatus && currentStatus.codec !== 'WAIT') || polls >= 20) {
        if (fastIntervalRef.current) clearInterval(fastIntervalRef.current);
        normalIntervalRef.current = setInterval(fetchStatus, 5000);
      }
    }, 1500);
  };

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden flex items-center justify-center">
      <div ref={videoContainerRef} className="w-full h-full z-0" />
      
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 pointer-events-none">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-3" />
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Establishing Link...</p>
        </div>
      )}

      {/* technischen status badges (Live / Viewers / Specs) */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none select-none z-20 w-full pr-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {!loading && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-600 text-white text-[10px] font-black uppercase rounded shadow-lg pointer-events-auto shadow-rose-900/20">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                Live
              </div>
            )}

            <div className={`flex items-center gap-1 px-2 py-1 backdrop-blur-md text-white text-[10px] font-black rounded border shadow-lg pointer-events-auto transition-all duration-500 ${status ? 'bg-emerald-600/60 border-emerald-400/20' : 'bg-slate-800/40 border-slate-700/30 text-slate-400'}`}>
              <Users className="h-3 w-3" />
              <span>{status ? status.viewerCount : '0'}</span>
            </div>
            
            {!isPublic && (
              <div className={`px-2.5 py-1 backdrop-blur-md text-[10px] font-bold rounded-md border uppercase tracking-widest flex items-center gap-2 pointer-events-auto transition-all duration-500 ${status && status.codec !== 'WAIT' ? 'bg-black/40 text-white border-white/10' : 'bg-slate-800/40 text-slate-400 border-slate-700/30'}`}>
                {status && status.codec !== 'WAIT' ? (
                  <>{status.codec} / {status.mode} {status.isTranscoded && <Cpu className="h-4 w-4 text-amber-400 animate-pulse" />}</>
                ) : (
                  <><RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : 'text-indigo-400'}`} /> {status?.codec === 'WAIT' ? 'Negotiating...' : 'Linking...'}</>
                )}
              </div>
            )}
          </div>
        </div>
        
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
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg transition-all">ลองใหม่อีกครั้ง</button>
        </div>
      )}
    </div>
  );
};

export default WebRTCPlayer;
