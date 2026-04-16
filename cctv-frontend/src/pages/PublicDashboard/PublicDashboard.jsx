import React, { useState, useEffect, useMemo } from 'react';
import { Camera, Map as MapIcon, Info, Search, Filter, Play, ChevronDown, ChevronRight, Menu, X, Globe, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import cameraService from '../../services/cameraService';
import groupService from '../../services/groupService';
import logService from '../../services/logService';
import CameraMap from '../../components/CameraMap';
import StreamModal from '../../components/StreamModal';
import Footer from '../../components/Footer';

const PublicDashboard = () => {
  const [cameras, setCameras] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState('all');
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [focusedCamera, setFocusedCamera] = useState(null);
  const [initialPosition, setInitialPosition] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    fetchInitialData();
    // บันทึกการเข้าชมหน้า Dashboard
    logService.recordVisit({ action: 'VIEW_PAGE' });
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [cameraData, groupData] = await Promise.all([
        cameraService.getPublic(),
        groupService.getPublic()
      ]);
      setCameras(cameraData);
      setGroups(groupData);
      
      // ขยายกลุ่มแรกไว้รอเลยเป็น Default
      if (groupData.length > 0) {
        setExpandedGroups({ [groupData[0].id]: true });
      }
    } catch (error) {
      console.error('Failed to fetch public data:', error);
    } finally {
      setLoading(false);
    }
  };

  // จัดกลุ่มกล้องตาม Group ID
  const groupedData = useMemo(() => {
    const groupsMap = {};
    
    // กรองข้อมูลตาม Search Term ก่อน
    const filtered = cameras.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // จัดใส่กลุ่ม (1 กล้องอาจอยู่ได้หลายกลุ่ม)
    filtered.forEach(camera => {
      if (camera.groups && camera.groups.length > 0) {
        camera.groups.forEach(group => {
          const gId = group.id;
          if (!groupsMap[gId]) groupsMap[gId] = [];
          groupsMap[gId].push(camera);
        });
      } else {
        const gId = 'uncategorized';
        if (!groupsMap[gId]) groupsMap[gId] = [];
        groupsMap[gId].push(camera);
      }
    });

    return groupsMap;
  }, [cameras, searchTerm]);

  // 🔍 กรองเฉพาะกลุ่มที่มีกล้องอยู่จริง (Public Cameras) และไม่ใช่กลุ่ม All Camera (เพราะเรามีปุ่มแยกแล้ว)
  const filteredGroups = useMemo(() => {
    return groups.filter(group => {
      // ซ่อนกลุ่ม All Camera/All Cameras เพราะเราแสดงเป็นปุ่มหลักแล้ว
      const isAllGroup = group.name.toLowerCase() === 'all camera' || group.name.toLowerCase() === 'all cameras';
      if (isAllGroup) return false;

      const camerasInGroup = groupedData[group.id] || [];
      return camerasInGroup.length > 0;
    });
  }, [groups, groupedData]);

  const toggleGroup = (id) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectCamera = (camera, pos = null) => {
    setFocusedCamera(camera);
    
    // ถ้าไม่มีตำแหน่ง (เช่น คลิกจาก Sidebar) ให้หาตำแหน่งกลางของแผนที่
    let finalPos = pos;
    if (!finalPos) {
      const mapContainer = document.querySelector('.leaflet-container');
      if (mapContainer) {
        const rect = mapContainer.getBoundingClientRect();
        finalPos = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      }
    }

    setInitialPosition(finalPos);
    setSelectedCamera(camera);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);

    // บันทึกการคลิกดูสตรีม
    logService.recordVisit({ cameraId: camera.id, action: 'WATCH_STREAM' });
  };

  const currentGroupCameras = useMemo(() => {
    if (selectedGroupId === 'all') {
      return cameras.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    // ดึงจาก groupedData ที่คำนวณไว้แล้ว (รองรับ 1 กล้องหลายกลุ่ม)
    return groupedData[selectedGroupId] || [];
  }, [cameras, selectedGroupId, searchTerm, groupedData]);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
      {/* 🏙️ Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between z-[1001] shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-600 rounded-xl text-white shadow-lg shadow-primary-200">
            <Camera className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm md:text-lg font-black text-slate-900 leading-none uppercase tracking-tighter">NST Smart City</h1>
            <p className="text-[9px] font-bold text-primary-600 uppercase tracking-[0.2em] mt-0.5">CCTV Monitoring</p>
          </div>
        </div>

        {/* Search Bar - Desktop & Large Screens */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อกล้อง..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
           <Link to="/dashboard" className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-black text-slate-500 hover:text-primary-600 transition-colors uppercase tracking-widest border border-slate-200 rounded-xl">
              <Globe className="h-3.5 w-3.5" />
              <span>Admin</span>
           </Link>
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="p-2.5 bg-slate-900 text-white rounded-xl lg:hidden shadow-lg shadow-slate-900/20"
           >
             {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
           </button>
        </div>
      </header>

      {/* 🏷️ Horizontal Category Pills - ส่วนที่เพิ่มเข้ามาใหม่เพื่อให้ดูง่ายขึ้น */}
      <div className="bg-white border-b border-slate-100 px-4 md:px-8 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <button 
          onClick={() => setSelectedGroupId('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all uppercase tracking-wider ${
            selectedGroupId === 'all' 
            ? 'bg-primary-600 text-white shadow-md shadow-primary-900/20' 
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          All Cameras ({cameras.length})
        </button>
        {filteredGroups.map(group => (
          <button 
            key={group.id}
            onClick={() => setSelectedGroupId(group.id.toString())}
            className={`px-4 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all uppercase tracking-wider ${
              selectedGroupId === group.id.toString() 
              ? 'bg-primary-600 text-white shadow-md shadow-primary-900/20' 
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {group.name} ({groupedData[group.id]?.length || 0})
          </button>
        ))}
      </div>

      {/* 🗺️ Main Content */}
      <main className="flex-grow relative flex min-h-0">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        {/* 📋 Sidebar - Accordion Style */}
        <aside className={`fixed lg:relative left-0 top-0 bottom-0 w-[300px] bg-white border-r border-slate-200 z-[1001] lg:z-0 transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col shadow-2xl lg:shadow-none`}>
          <div className="p-4 border-b border-slate-100 lg:hidden">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search cameras..." 
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar bg-slate-50/30">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <div className="w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing...</span>
              </div>
            ) : (
              <div className="py-2">
                {/* วนลูปตามกลุ่มที่มีกล้อง (Filtered Groups) */}
                {filteredGroups.map(group => {
                  const camerasInGroup = groupedData[group.id] || [];
                  const isExpanded = expandedGroups[group.id];

                  return (
                    <div key={group.id} className="mb-1">
                      <button 
                        onClick={() => toggleGroup(group.id)}
                        className={`w-full flex items-center justify-between px-5 py-3 transition-all hover:bg-white ${isExpanded ? 'bg-white' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${isExpanded ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Layers className="h-3.5 w-3.5" />
                          </div>
                          <span className={`text-[11px] font-black uppercase tracking-wider ${isExpanded ? 'text-slate-900' : 'text-slate-500'}`}>
                            {group.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full">{camerasInGroup.length}</span>
                          {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                        </div>
                      </button>

                      {/* รายชื่อกล้องภายใต้กลุ่ม (Accordion Content) */}
                      {isExpanded && (
                        <div className="bg-white/50 py-1 px-2 space-y-1">
                          {camerasInGroup.map(camera => (
                            <button 
                              key={camera.id}
                              onClick={() => handleSelectCamera(camera)}
                              className="w-full text-left p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all group flex items-center justify-between"
                            >
                              <div className="flex-1 min-w-0 pr-2">
                                <p className="text-xs font-bold text-slate-700 group-hover:text-primary-600 truncate transition-colors">{camera.name}</p>
                                <div className="text-[9px] font-medium text-slate-400 uppercase flex items-center gap-1">
                                  <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                                  Live Streaming
                                </div>
                              </div>
                              <Play className="h-3 w-3 text-slate-300 group-hover:text-primary-500 transition-colors" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
             <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-100">
                <p className="text-[9px] font-black text-indigo-600 uppercase mb-1 tracking-widest">Status Report</p>
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-bold text-slate-500">Active Cameras:</span>
                   <span className="text-[10px] font-black text-indigo-700">{cameras.length} Units</span>
                </div>
             </div>
          </div>
        </aside>

        {/* 🗺️ Full-screen Map */}
        <div className="flex-grow relative z-0">
          <CameraMap 
            cameras={currentGroupCameras} 
            onSelectCamera={handleSelectCamera}
            focusedCamera={focusedCamera}
          />
          
          {/* Floating UI Overlay */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 shadow-xl z-[999] hidden sm:flex items-center gap-2">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Network Online</span>
          </div>
        </div>
      </main>

      {/* 🏁 Global Footer */}
      <div className="bg-white border-t border-slate-100 shrink-0">
         <Footer />
      </div>

      {/* 🎬 Live Stream Modal */}
      {selectedCamera && (
        <StreamModal 
          key={selectedCamera.id}
          camera={selectedCamera} 
          initialPosition={initialPosition}
          onClose={() => setSelectedCamera(null)} 
          isPublic={true}
        />
      )}
    </div>
  );
};

export default PublicDashboard;
