import React, { useState, useEffect, useMemo } from 'react';
import { Plus, FolderKanban, RefreshCw, Search, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import groupService from '../../services/groupService';
import cameraService from '../../services/cameraService';
import Pagination from '../../components/Pagination';

import GroupCard from './components/GroupCard';
import GroupFormModal from './components/GroupFormModal';
import GroupListToolbar from './components/GroupListToolbar';
import ManageCamerasModal from './components/ManageCamerasModal';

const PAGE_SIZES = [6, 12, 24, 60];

const CameraGroups = () => {
  const { t } = useTranslation();
  const [groups, setGroups] = useState([]);
  const [allCameras, setAllCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCameras, setLoadingCameras] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZES[0]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    telegramBotToken: '',
    telegramChatId: '',
    isNotifyEnabled: true,
    aiEnabled: false,
    aiSystemPrompt: ''
  });

  // 🚀 Real-time Validation (Debounced)
  useEffect(() => {
    if (!showModal || !formData.name) {
      setFormErrors(prev => ({ ...prev, name: null }));
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const validation = await groupService.validate({ name: formData.name }, editingGroup?.id);
        if (!validation.isValid) {
          setFormErrors(prev => ({ ...prev, name: validation.errors[0] }));
        } else {
          setFormErrors(prev => ({ ...prev, name: null }));
        }
      } catch (error) {
        console.error('Validation error', error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.name, editingGroup, showModal]);

  useEffect(() => {
    fetchData();
    fetchAllCameras();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await groupService.getAll();
      setGroups(data);
    } catch (error) {
      toast.error(t('groups.messages.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCameras = async () => {
    setLoadingCameras(true);
    try {
      const data = await cameraService.getAll();
      setAllCameras(data);
    } catch (error) {
      console.error('Failed to fetch cameras');
    } finally {
      setLoadingCameras(false);
    }
  };

  // ==========================================
  // Filtering & Pagination Logic
  // ==========================================
  const filteredGroups = useMemo(() => {
    const filtered = groups.filter(g => 
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // จัดเรียงให้ All Camera ขึ้นอันดับ 1
    return filtered.sort((a, b) => {
      if (a.name === 'All Camera') return -1;
      if (b.name === 'All Camera') return 1;
      return 0;
    });
  }, [groups, searchTerm]);

  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage) || 1;
  const paginatedGroups = filteredGroups.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const fromItem = filteredGroups.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const toItem = Math.min(currentPage * itemsPerPage, filteredGroups.length);

  useEffect(() => {
    setCurrentPage(1); 
  }, [searchTerm, itemsPerPage]);

  // ==========================================
  // Handlers
  // ==========================================
  const handleOpenModal = (group = null) => {
    setFormErrors({});
    if (group) {
      setEditingGroup(group);
      setFormData({
        name: group.name,
        description: group.description || '',
        telegramBotToken: group.telegramBotToken || '',
        telegramChatId: group.telegramChatId || '',
        isNotifyEnabled: group.isNotifyEnabled,
        aiEnabled: group.aiEnabled,
        aiSystemPrompt: group.aiSystemPrompt || ''
      });
    } else {
      setEditingGroup(null);
      setFormData({
        name: '', description: '', telegramBotToken: '', telegramChatId: '', isNotifyEnabled: true, aiEnabled: false, aiSystemPrompt: ''
      });
    }
    setShowModal(true);
  };

  const handleOpenManageModal = (group) => {
    setSelectedGroup(group);
    setShowManageModal(true);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (formErrors.name) return toast.error(formErrors.name);

    setIsSubmitting(true);
    try {
      const validation = await groupService.validate(formData, editingGroup?.id);
      if (!validation.isValid) {
        setFormErrors(prev => ({ ...prev, name: validation.errors[0] }));
        setIsSubmitting(false);
        return;
      }

      if (editingGroup) {
        await groupService.update(editingGroup.id, formData);
        toast.success(t('groups.messages.update_success'));
      } else {
        await groupService.create(formData);
        toast.success(t('groups.messages.save_success'));
      }
      
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || t('groups.messages.save_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveCameras = async (groupId, draftIds, originalIds) => {
    const added = draftIds.filter(id => !originalIds.includes(id));
    const removed = originalIds.filter(id => !draftIds.includes(id));

    if (added.length === 0 && removed.length === 0) {
      setShowManageModal(false);
      return;
    }

    try {
      await groupService.updateGroupCameras(groupId, draftIds);
      toast.success(t('groups.messages.update_success'));
      setShowManageModal(false);
      fetchData(); // อัปเดตตัวเลขจำนวนกล้องใน Card
    } catch (error) {
      toast.error(t('groups.messages.save_error'));
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: t('groups.messages.delete_confirm_title'),
      text: t('groups.messages.delete_confirm_text'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: t('groups.messages.confirm_delete'),
      cancelButtonText: t('common.cancel')
    });

    if (result.isConfirmed) {
      try {
        await groupService.delete(id);
        toast.success(t('groups.messages.delete_success'));
        fetchData();
      } catch (error) {
        toast.error(t('groups.messages.delete_error'));
      }
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* 1. Page Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-200 group-hover:scale-110 transition-transform duration-500">
             <FolderKanban size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-2">
              {t('groups.title')}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest italic">
              {t('groups.subtitle')}
            </p>
          </div>
        </div>
        
        <div className="relative z-10">
          <button 
            onClick={() => handleOpenModal()} 
            className="shrink-0 bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-600 hover:-translate-y-1 transition-all font-bold text-sm shadow-xl shadow-slate-200 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> 
            <span>{t('groups.add_new')}</span>
          </button>
        </div>

        {/* Accent Blur */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-100/50 transition-colors duration-700"></div>
      </div>

      {/* 2. Control Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={t('groups.search_placeholder')} 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium" 
          />
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData} 
            disabled={loading}
            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
            {filteredGroups.length} Groups
          </div>
        </div>
      </div>

      {/* 3. Content Area - Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('common.loading')}</span>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-20 shadow-sm">
          <div className="bg-slate-50 p-6 rounded-full mb-4">
            <Layers size={64} className="text-slate-200" />
          </div>
          <h3 className="text-xl font-black text-slate-700 mb-2 uppercase tracking-tight">{t('groups.no_groups_found')}</h3>
          <p className="text-slate-400 text-sm max-w-sm mb-8 font-medium italic">
            {t('groups.search_placeholder')}
          </p>
          <button 
            onClick={() => handleOpenModal()} 
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            {t('groups.add_new')}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedGroups.map(group => (
              <GroupCard 
                key={group.id} 
                group={group} 
                onEdit={handleOpenModal} 
                onDelete={handleDelete} 
                onManageCameras={handleOpenManageModal} 
              />
            ))}
          </div>

          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            setCurrentPage={setCurrentPage} 
          />

          <div className="flex justify-between items-center text-xs font-bold px-4">
            <div className="flex gap-1">
              {PAGE_SIZES.map(size => (
                <button 
                  key={size} 
                  onClick={() => setItemsPerPage(size)} 
                  className={`px-3 py-1.5 rounded-lg transition-all ${itemsPerPage === size ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-200'}`}
                >
                  {size}
                </button>
              ))}
            </div>
            <div className="text-slate-400">
              {t('common.showing')} {fromItem} - {toItem} OF {filteredGroups.length}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <GroupFormModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingGroup={editingGroup}
        isSubmitting={isSubmitting}
        formErrors={formErrors}
      />

      <ManageCamerasModal 
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
        group={selectedGroup}
        allCameras={allCameras}
        loadingCameras={loadingCameras}
        onSave={handleSaveCameras}
      />
    </div>
  );
};

export default CameraGroups;