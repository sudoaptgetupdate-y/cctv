import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Camera, Radio, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';

// คอมโพเนนต์ช่วยปรับมุมมองแผนที่ให้ครอบคลุมกล้องทุกตัว
const AutoBounds = ({ cameras }) => {
  const map = useMap();
  
  useEffect(() => {
    if (cameras.length > 0) {
      const bounds = L.latLngBounds(cameras.map(c => [c.latitude, c.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [cameras, map]);
  
  return null;
};

// คอมโพเนนต์สำหรับเลื่อนแผนที่ไปยังกล้องที่เลือก (Focus)
const FlyToCamera = ({ focusedCamera }) => {
  const map = useMap();
  
  useEffect(() => {
    if (focusedCamera) {
      map.flyTo([focusedCamera.latitude, focusedCamera.longitude], 17, {
        duration: 1.5
      });
    }
  }, [focusedCamera, map]);
  
  return null;
};

const createCameraIcon = (status) => {
  const color = status === 'ACTIVE' ? '#10b981' : '#ef4444';
  const html = `
    <div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      border: 3px solid white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
    </div>
  `;
  
  return L.divIcon({
    html: html,
    className: 'custom-camera-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

const CameraMap = ({ cameras, onSelectCamera, focusedCamera }) => {
  const { t } = useTranslation();
  const defaultCenter = [13.7563, 100.5018];
  const center = cameras.length > 0 
    ? [cameras[0].latitude, cameras[0].longitude] 
    : defaultCenter;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-inner bg-slate-100">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <AutoBounds cameras={cameras} />
        <FlyToCamera focusedCamera={focusedCamera} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {cameras.map((camera) => (
          <Marker 
            key={camera.id} 
            position={[camera.latitude, camera.longitude]}
            icon={createCameraIcon(camera.status)}
            eventHandlers={{
              click: (e) => {
                // คำนวณตำแหน่ง Pixel บนหน้าจอจากพิกัด LatLng
                const point = e.target._map.latLngToContainerPoint(e.latlng);
                // ดึงพิกัดจริงของ Map container เพื่อหาตำแหน่งสัมพัทธ์กับหน้าจอ
                const mapRect = e.target._map.getContainer().getBoundingClientRect();
                
                const screenPos = {
                  x: point.x + mapRect.left,
                  y: point.y + mapRect.top
                };

                if (onSelectCamera) onSelectCamera(camera, screenPos);
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -30]} opacity={1} className="custom-tooltip">
              <div className="p-1 min-w-[150px]">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="font-black text-slate-800 text-sm">{camera.name}</span>
                  <div className={`w-2 h-2 rounded-full ${camera.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                  <Activity className="h-3 w-3" />
                  <span>{t('dashboard.map.tooltip_hint')}</span>
                </div>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CameraMap;
