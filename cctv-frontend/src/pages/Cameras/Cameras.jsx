import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Camera as CameraIcon, Activity, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
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
  const { t } = useTranslation();
  const [cameras, setCameras] = useState([]);
  const [groups, setGroups] = useState([]);
  const [streamStatuses, setStreamStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [formErrors, setFormErrors] = useState({});
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZES[0]);

  const [showFormModal, setShowFormModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [modalPosition, setModalPosition] = useState(null);
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
    name: '', latitude: '', longitude: '', rtspUrl: '', subStream: '', username: '', password: '', groupIds: [], isPublic: false, streamType: 'MAIN', isAudioEnabled: false, resolution: '', fps: '', subResolution: '', subFps: '', isTranscodeEnabled: false
  });

  // 🚀 Real-time Validation (Debounced)
  useEffect(() => {
    if (!showFormModal || !formData.name) {
      setFormErrors(prev => ({ ...prev, name: null }));
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const validation = await cameraService.validate({ name: formData.name }, editingCamera?.id);
        if (!validation.isValid) {
          setFormErrors(prev => ({ ...prev, name: validation.errors[0] }));
        } else {
          setFormErrors(prev => ({ ...prev, name: null }));
        }
      } catch (error) {}
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.name, editingCamera, showFormModal]);

  useEffect(() => {
    fetchData();
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
      toast.error(t('cameras.messages.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchStreamStatuses = async () => {
    try {
      const statuses = await streamService.getStreamStatuses();
      setStreamStatuses(statuses || {});
    } catch (error) { }
  };

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

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, itemsPerPage]);

  const handleOpenForm = (camera = null) => {
    setFormErrors({});
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
        groupIds: camera.groups ? camera.groups.map(g => g.id.toString()) : [],
        isPublic: camera.isPublic || false,
        streamType: camera.streamType || 'MAIN',
        isAudioEnabled: camera.isAudioEnabled || false,
        resolution: camera.resolution || '',
        fps: camera.fps ? camera.fps.toString() : '',
        subResolution: camera.subResolution || '',
        subFps: camera.subFps ? camera.subFps.toString() : '',
        isTranscodeEnabled: camera.isTranscodeEnabled || false
      });
    } else {
      setEditingCamera(null);

      // 🚀 ค้นหา ID ของกลุ่ม "All Camera" เพื่อเลือกเป็น Default
      const allGroup = groups.find(g => g.name === 'All Camera');
      const defaultGroupIds = allGroup ? [allGroup.id.toString()] : [];

      setFormData({
        name: '', 
        latitude: '13.7563', // Default: Bangkok
        longitude: '100.5018', // Default: Bangkok
        rtspUrl: '', 
        subStream: '', 
        username: '', 
        password: '', 
        groupIds: defaultGroupIds, 
        isPublic: false, 
        streamType: 'MAIN', 
        isAudioEnabled: false, 
        resolution: '', 
        fps: '', 
        subResolution: '', 
        subFps: '', 
        isTranscodeEnabled: false
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
      toast.error(t('cameras.messages.history_fetch_error'));
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
      toast.success(t('cameras.messages.ack_success'));
      fetchData();
    } catch (error) {
      toast.error(t('cameras.messages.ack_error'));
    } finally {
      setIsAckSubmitting(false);
    }
  };

  const handleSubmitForm = async (e) => {
    if (e) e.preventDefault();
    if (formErrors.name) return toast.error(formErrors.name);

    setIsSubmitting(true);

    const data = { 
      ...formData, 
      latitude: parseFloat(formData.latitude), 
      longitude: parseFloat(formData.longitude),
      fps: formData.fps ? parseInt(formData.fps) : null,
      subFps: formData.subFps ? parseInt(formData.subFps) : null
    };

    try {
      // 🚀 Pre-submit Validation
      const validation = await cameraService.validate(data, editingCamera?.id);
      
      if (!validation.isValid) {
        setFormErrors(prev => ({ ...prev, name: validation.errors[0] }));
        Swal.fire({
          icon: 'error',
          title: t('common.error'),
          text: validation.errors[0],
          confirmButtonColor: '#4f46e5'
        });
        setIsSubmitting(false);
        return;
      }

      // RTSP Warning
      if (validation.warnings.length > 0) {
        const result = await Swal.fire({
          icon: 'warning',
          title: 'Duplicate RTSP URL',
          text: validation.warnings[0],
          showCancelButton: true,
          confirmButtonText: 'Yes, use anyway',
          cancelButtonText: t('common.cancel'),
          confirmButtonColor: '#4f46e5',
          cancelButtonColor: '#ef4444'
        });

        if (!result.isConfirmed) {
          setIsSubmitting(false);
          return;
        }
      }

      if (editingCamera) {
        await cameraService.update(editingCamera.id, data);
        toast.success(t('cameras.messages.update_success'));
      } else {
        await cameraService.create(data);
        toast.success(t('cameras.messages.save_success'));
      }
      
      setShowFormModal(false);
      fetchData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || t('cameras.messages.save_error');
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: t('cameras.messages.delete_confirm_title'),
      text: t('cameras.messages.delete_confirm_text'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: t('cameras.messages.confirm_delete'),
      cancelButtonText: t('common.cancel')
    });

    if (result.isConfirmed) {
      try {
        await cameraService.delete(id);
        toast.success(t('cameras.messages.delete_success'));
        fetchData();
      } catch (error) {
        toast.error(t('cameras.messages.delete_error'));
      }
    }
  };

  const handlePreview = (camera) => {
    const centerX = (window.innerWidth / 2) - 225;
    const centerY = (window.innerHeight / 2) - 180;
    setModalPosition({ x: centerX, y: centerY });
    setSelectedCamera(camera);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* 1. Page Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-200 group-hover:scale-110 transition-transform duration-500">
             <CameraIcon size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-2">
              {t('cameras.title')}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest italic">
              {t('cameras.subtitle')}
            </p>
          </div>
        </div>
        
        <div className="relative z-10">
          <button 
            onClick={() => handleOpenForm()} 
            className="shrink-0 bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-600 hover:-translate-y-1 transition-all font-bold text-sm shadow-xl shadow-slate-200 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> 
            <span>{t('cameras.add_new')}</span>
          </button>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-100/50 transition-colors duration-700"></div>
      </div>

      <CameraListToolbar 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
        statusFilter={statusFilter} setStatusFilter={setStatusFilter} 
        onRefresh={fetchData} loading={loading} 
      />

      <CameraTable 
        loading={loading} cameras={paginatedCameras}
        onEdit={handleOpenForm} onDelete={handleDelete}
        onPreview={handlePreview} onAcknowledge={handleAcknowledgeClick}
        onViewHistory={handleViewHistory} pageSizes={PAGE_SIZES}
        itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage}
        from={fromItem} to={toItem} total={filteredCameras.length}
        streamStatuses={streamStatuses}
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />

      {selectedCamera && (
        <StreamModal 
          key={selectedCamera.id}
          camera={selectedCamera} 
          initialPosition={modalPosition} 
          onClose={() => setSelectedCamera(null)} 
        />
      )}
      <CameraFormModal 
        isOpen={showFormModal} onClose={() => setShowFormModal(false)} 
        onSubmit={handleSubmitForm} formData={formData} setFormData={setFormData} 
        editingCamera={editingCamera} groups={groups} isSubmitting={isSubmitting}
        formErrors={formErrors}
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
