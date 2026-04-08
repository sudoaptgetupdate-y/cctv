import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Send, MessageSquare, Save, X, Search, Bell, BellOff, Bot, Info } from 'lucide-react';
import groupService from '../services/groupService';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State สำหรับ Modal
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
        name: '',
        description: '',
        telegramBotToken: '',
        telegramChatId: '',
        isNotifyEnabled: true,
        aiEnabled: false,
        aiSystemPrompt: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await groupService.update(editingGroup.id, formData);
      } else {
        await groupService.create(formData);
      }
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

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.description && g.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อกลุ่ม หรือ รายละเอียด..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/10 whitespace-nowrap"
        >
          <Plus className="h-5 w-5" />
          <span>สร้างกลุ่มใหม่</span>
        </button>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 text-center">#</th>
                <th className="px-6 py-4">กลุ่ม / พื้นที่</th>
                <th className="px-6 py-4 text-center">จำนวนกล้อง</th>
                <th className="px-6 py-4">การแจ้งเตือน Telegram</th>
                <th className="px-6 py-4 text-center">AI Support</th>
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-400">กำลังโหลดข้อมูลกลุ่ม...</td>
                </tr>
              ) : filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-400 font-medium">ไม่พบข้อมูลกลุ่มพื้นที่</td>
                </tr>
              ) : filteredGroups.map((group, index) => (
                <tr key={group.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-center text-xs font-bold text-slate-300">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{group.name}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 max-w-[200px]">{group.description || 'ไม่มีคำอธิบาย'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-black text-slate-600">
                      {group._count?.cameras || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      {group.telegramChatId ? (
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            group.isNotifyEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {group.isNotifyEnabled ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
                            {group.isNotifyEnabled ? 'เปิดแจ้งเตือน' : 'ปิดแจ้งเตือน'}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">
                            <Send className="h-3 w-3" /> Ready
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> ยังไม่ได้ตั้งค่า
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {group.aiEnabled ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-indigo-100">
                        <Bot className="h-3 w-3" /> AI Active
                      </div>
                    ) : (
                      <span className="text-slate-200">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleOpenModal(group)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="แก้ไข">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(group.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="ลบ">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - เพิ่ม/แก้ไขกลุ่ม (เหมือนเดิมแต่ปรับ Layout เล็กน้อยให้กระชับ) */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-zoomIn">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{editingGroup ? 'แก้ไขกลุ่มพื้นที่' : 'สร้างกลุ่มใหม่'}</h3>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-0.5">Zone & Alert Config</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Basic Information</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block ml-1">ชื่อกลุ่ม / พื้นที่</label>
                      <input 
                        required
                        type="text" 
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50"
                        placeholder="เช่น หมู่ 1 - โซนตลาด"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block ml-1">คำอธิบาย</label>
                      <textarea 
                        rows="2"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50"
                        placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับกลุ่มนี้..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Telegram Notification</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={formData.isNotifyEnabled}
                        onChange={(e) => setFormData({...formData, isNotifyEnabled: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-600 mb-1 block ml-1 text-indigo-600">Telegram Bot Token</label>
                      <input 
                        type="password"
                        className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-indigo-50/20 font-mono text-sm"
                        placeholder="0000000000:AAxxxxxxxxx..."
                        value={formData.telegramBotToken}
                        onChange={(e) => setFormData({...formData, telegramBotToken: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block ml-1 text-indigo-600">Telegram Chat ID</label>
                      <input 
                        type="text"
                        className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-indigo-50/20 font-mono text-sm"
                        placeholder="-100xxxxxxxxx"
                        value={formData.telegramChatId}
                        onChange={(e) => setFormData({...formData, telegramChatId: e.target.value})}
                      />
                    </div>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 items-start">
                       <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                       <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                         ระบบจะส่งแจ้งเตือนสถานะกล้องในกลุ่มนี้ไปยัง Telegram ทันทีที่พบปัญหา โดยใช้ค่า Config ชุดนี้
                       </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-100">
                   <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">AI Support Integration</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={formData.aiEnabled}
                        onChange={(e) => setFormData({...formData, aiEnabled: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  {formData.aiEnabled && (
                    <div className="animate-fadeIn">
                      <label className="text-xs font-bold text-slate-600 mb-1 block ml-1">AI System Prompt</label>
                      <textarea 
                        rows="3"
                        className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-indigo-50/20 text-sm"
                        placeholder="ระบุคำสั่งให้ AI วิเคราะห์เหตุการณ์สำหรับกลุ่มนี้..."
                        value={formData.aiSystemPrompt}
                        onChange={(e) => setFormData({...formData, aiSystemPrompt: e.target.value})}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-200 transition-all"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="px-10 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{editingGroup ? 'อัปเดตข้อมูล' : 'สร้างกลุ่ม'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
