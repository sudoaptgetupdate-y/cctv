import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Camera, Radio } from 'lucide-react';
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

const CameraMap = ({ cameras, onSelectCamera }) => {
  const defaultCenter = [13.7563, 100.5018];
  const center = cameras.length > 0 
    ? [cameras[0].latitude, cameras[0].longitude] 
    : defaultCenter;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-inner bg-slate-100">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <AutoBounds cameras={cameras} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {cameras.map((camera) => (
          <Marker 
            key={camera.id} 
            position={[camera.latitude, camera.longitude]}
            icon={createCameraIcon(camera.status)}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center justify-between mb-2 border-b pb-2">
                  <h3 className="font-bold text-slate-800">{camera.name}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    camera.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {camera.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <Radio className="h-3 w-3" /> 
                    <span>พิกัด: {camera.latitude.toFixed(4)}, {camera.longitude.toFixed(4)}</span>
                  </p>
                </div>

                <button 
                  className="w-full bg-primary-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-900/20 flex items-center justify-center gap-2"
                  onClick={() => onSelectCamera(camera)}
                >
                  <Camera className="h-3.5 w-3.5" />
                  ดูภาพสด (Live Feed)
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CameraMap;
