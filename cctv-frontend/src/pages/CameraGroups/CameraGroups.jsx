import React, { useState, useEffect, useMemo } from 'react';
import { Plus, FolderKanban, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import groupService from '../../services/groupService';
import Pagination from '../../components/Pagination';

import GroupTable from './components/GroupTable';
import GroupFormModal from './components/GroupFormModal';
import GroupListToolbar from './components/GroupListToolbar';

const PAGE_SIZES = [5, 10, 20, 50];

const CameraGroups = () => {
  const { t } = useTranslation();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZES[0]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await groupService.getAll();
      setGroups(data);
    } catch (error) {
      console.error('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Filtering & Pagination Logic
  // ==========================================
  const filteredGroups = useMemo(() => {
    return groups.filter(g => 
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGroup) await groupService.update(editingGroup.id, formData);
      else await groupService.create(formData);
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณต้องการลบกลุ่มนี้ใช่หรือไม่? (กล้องในกลุ่มนี้จะไม่ถูกลบ)')) {
      try {
        await groupService.delete(id);
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

      {/* 2. Toolbar */}
      <GroupListToolbar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        onRefresh={fetchData} 
        loading={loading} 
      />

      {/* 3. Table Area */}
      <GroupTable 
        loading={loading}
        groups={paginatedGroups}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        pageSizes={PAGE_SIZES}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        from={fromItem}
        to={toItem}
        total={filteredGroups.length}
      />

      {/* 4. Pagination */}
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        setCurrentPage={setCurrentPage} 
      />

      {/* Modal - เพิ่ม/แก้ไขกลุ่ม */}
      <GroupFormModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingGroup={editingGroup}
      />
    </div>
  );
};

export default CameraGroups;