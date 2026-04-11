import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Camera as CameraIcon, Activity, RefreshCw } from 'lucide-react';
import cameraService from '../../services/cameraService';
import groupService from '../../services/groupService';
import streamService from '../../services/streamService';
import StreamModal from '../../components/StreamModal';
import Pagination from '../../components/Pagination';

import CameraTable from './components/CameraTable';
import CameraFormModal from './components/CameraFormModal';
import CameraListToolbar from './components/CameraListToolbar';
import AcknowledgeModal from './components/AcknowledgeModal';
import EventHistoryModal from './components/EventHistoryModal';

const PAGE_SIZES = [5, 10, 20, 50];

const Cameras = () => {
  const [cameras, setCameras] = useState([]);
  const [groups, setGroups] = useState([]);
  const [streamStatuses, setStreamStatuses] = useState({}); // ✅ สำหรับเก็บ Resolution/FPS
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZES[0]);

  // Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null); // สำหรับสตรีมมิ่ง
  const [editingCamera, setEditingCamera] = useState(null);
  
  const [isAckModalOpen, setIsAckModalOpen] = useState(false);
  const [cameraToAck, setCameraToAck] = useState(null);
  const [ackReason, setAckReason] = useState('');
  const [isAckSubmitting, setIsAckSubmitting] = useState(false);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedHistoryCamera, setSelectedHistoryCamera] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '', latitude: '', longitude: '', rtspUrl: '', subStream: '', username: '', password: '', groupId: '', isPublic: false, streamType: 'MAIN', isAudioEnabled: false, resolution: '', fps: '', isTranscodeEnabled: false
  });

  useEffect(() => {
    fetchData();
    
    // ✅ ดึงสถานะสตรีมครั้งแรก และตั้งเวลาดึงทุก 15 วินาที
    fetchStreamStatuses();
    const interval = setInterval(fetchStreamStatuses, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cameraData, groupData] = await Promise.all([
        cameraService.getAll(),
        groupService.getAll()
      ]);
      setCameras(cameraData);
      setGroups(groupData);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStreamStatuses = async () => {
    try {
      const statuses = await streamService.getStreamStatuses();
      setStreamStatuses(statuses || {});
    } catch (error) {
      console.error('Failed to fetch stream statuses');
    }
  };

  // ==========================================
  // Filtering & Pagination Logic
  // ==========================================
  const filteredCameras = useMemo(() => {
    return cameras.filter(c => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        c.name.toLowerCase().includes(searchLower) ||
        c.rtspUrl.toLowerCase().includes(searchLower);

      if (statusFilter === 'ALL') return matchesSearch;
      return c.status === statusFilter && matchesSearch;
    });
  }, [cameras, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredCameras.length / itemsPerPage) || 1;
  const paginatedCameras = filteredCameras.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const fromItem = filteredCameras.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const toItem = Math.min(currentPage * itemsPerPage, filteredCameras.length);

  useEffect(() => {
    setCurrentPage(1); 
  }, [searchTerm, statusFilter, itemsPerPage]);

  // ==========================================
  // Handlers
  // ==========================================
  const handleOpenForm = (camera = null) => {
    if (camera) {
      setEditingCamera(camera);
      setFormData({
        name: camera.name,
        latitude: camera.latitude.toString(),
        longitude: camera.longitude.toString(),
        rtspUrl: camera.rtspUrl,
        subStream: camera.subStream || '',
        username: camera.username || '',
        password: camera.password || '',
        groupId: camera.groups?.[0]?.id || '',
        isPublic: camera.isPublic || false,
        streamType: camera.streamType || 'MAIN',
        isAudioEnabled: camera.isAudioEnabled || false,
        resolution: camera.resolution || '',
        fps: camera.fps ? camera.fps.toString() : '',
        isTranscodeEnabled: camera.isTranscodeEnabled || false
      });
    } else {
      setEditingCamera(null);
      setFormData({
        name: '', latitude: '', longitude: '', rtspUrl: '', subStream: '', username: '', password: '', groupId: '', isPublic: false, streamType: 'MAIN', isAudioEnabled: false, resolution: '', fps: '', isTranscodeEnabled: false
      });
    }
    setShowFormModal(true);
  };

  const handleAcknowledgeClick = (camera) => {
    setCameraToAck(camera);
    setAckReason('');
    setIsAckModalOpen(true);
  };

  const handleViewHistory = async (camera) => {
    setSelectedHistoryCamera(camera);
    setIsHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const data = await cameraService.getEvents(camera.id);
      setHistoryData(data);
    } catch (error) {
      console.error('Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmitAck = async () => {
    if (!ackReason.trim()) return;
    setIsAckSubmitting(true);
    try {
      await cameraService.acknowledge(cameraToAck.id, { reason: ackReason });
      setIsAckModalOpen(false);
      fetchData();
    } catch (error) {
      alert('บันทึกการรับทราบไม่สำเร็จ');
    } finally {
      setIsAckSubmitting(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const data = { 
      ...formData, 
      latitude: parseFloat(formData.latitude), 
      longitude: parseFloat(formData.longitude),
      fps: formData.fps ? parseInt(formData.fps) : null
    };
    try {
      if (editingCamera) await cameraService.update(editingCamera.id, data);
      else await cameraService.create(data);
      setShowFormModal(false);
      fetchData();
    } catch (error) {
      alert('บันทึกข้อมูลไม่สำเร็จ');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณต้องการลบกล้องตัวนี้ใช่หรือไม่?')) {
      try {
        await cameraService.delete(id);
        fetchData();
      } catch (error) {
        alert('ลบข้อมูลไม่สำเร็จ');
      }
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* 1. Page Header Section (Island Card) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-200 group-hover:scale-110 transition-transform duration-500">
             <CameraIcon size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-2">
              Camera Management
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest italic">
              จัดการข้อมูลและตรวจสอบสถานะกล้องวงจรปิดทั้งหมด
            </p>
          </div>
        </div>
        
        <div className="relative z-10">
          <button 
            onClick={() => handleOpenForm()} 
            className="shrink-0 bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-600 hover:-translate-y-1 transition-all font-bold text-sm shadow-xl shadow-slate-200 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> 
            <span>เพิ่มกล้องใหม่</span>
          </button>
        </div>

        {/* Accent Blur */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-100/50 transition-colors duration-700"></div>
      </div>

      {/* 2. Toolbar (Search & Filter) */}
      <CameraListToolbar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        statusFilter={statusFilter} 
        setStatusFilter={setStatusFilter} 
        onRefresh={fetchData} 
        loading={loading} 
      />

      {/* 3. Table Area */}
      <CameraTable 
        loading={loading}
        cameras={paginatedCameras}
        onEdit={handleOpenForm}
        onDelete={handleDelete}
        onPreview={setSelectedCamera}
        onAcknowledge={handleAcknowledgeClick}
        onViewHistory={handleViewHistory}
        pageSizes={PAGE_SIZES}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        from={fromItem}
        to={toItem}
        total={filteredCameras.length}
        streamStatuses={streamStatuses}
      />

      {/* 4. Pagination */}
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        setCurrentPage={setCurrentPage} 
      />

      {/* Modals */}
      {selectedCamera && (
        <StreamModal camera={selectedCamera} onClose={() => setSelectedCamera(null)} />
      )}
      <CameraFormModal 
        isOpen={showFormModal} onClose={() => setShowFormModal(false)} 
        onSubmit={handleSubmitForm} formData={formData} setFormData={setFormData} 
        editingCamera={editingCamera} groups={groups} 
      />
      <AcknowledgeModal 
        isOpen={isAckModalOpen} onClose={() => setIsAckModalOpen(false)} 
        camera={cameraToAck} ackReason={ackReason} setAckReason={setAckReason} 
        onSubmit={handleSubmitAck} isSubmitting={isAckSubmitting} 
      />
      <EventHistoryModal 
        isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} 
        camera={selectedHistoryCamera} events={historyData} loading={historyLoading} 
      />
    </div>
  );
};

export default Cameras;