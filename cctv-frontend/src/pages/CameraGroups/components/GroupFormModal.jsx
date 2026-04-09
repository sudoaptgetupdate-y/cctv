import React from 'react';
import { Info, Save, Bot, Wand2 } from 'lucide-react';
import Modal from '../../../components/Modal';

const GroupFormModal = ({ isOpen, onClose, onSubmit, formData, setFormData, editingGroup }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingGroup ? 'แก้ไขกลุ่มพื้นที่' : 'สร้างกลุ่มใหม่'}
      subtitle="Zone Configuration & Telegram Alert Setup"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-2xl text-slate-500 font-bold hover:bg-slate-200 transition-all text-sm"
          >
            ยกเลิก
          </button>
          <button 
            onClick={onSubmit}
            className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 text-sm"
          >
            <Save className="h-5 w-5" />
            <span>{editingGroup ? 'อัปเดตข้อมูล' : 'สร้างกลุ่ม'}</span>
          </button>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-8">
        {/* ข้อมูลพื้นฐาน */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
            Basic Information
          </h4>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1">ชื่อกลุ่ม / พื้นที่</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 text-sm font-medium"
                placeholder="เช่น หมู่ 1 - โซนตลาด"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1">คำอธิบาย</label>
              <textarea 
                rows="2"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 text-sm font-medium resize-none"
                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับกลุ่มนี้..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Telegram Config */}
        <div className="space-y-4 pt-6 border-t border-slate-50">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              Telegram Notification
            </h4>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={formData.isNotifyEnabled}
                onChange={(e) => setFormData({...formData, isNotifyEnabled: e.target.checked})}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1 text-blue-600">Telegram Bot Token</label>
              <input 
                type="password"
                className="w-full px-4 py-3 rounded-2xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-blue-50/20 font-mono text-sm"
                placeholder="0000000000:AAxxxxxxxxx..."
                value={formData.telegramBotToken}
                onChange={(e) => setFormData({...formData, telegramBotToken: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1 text-blue-600">Telegram Chat ID</label>
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-2xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-blue-50/20 font-mono text-sm"
                placeholder="-100xxxxxxxxx"
                value={formData.telegramChatId}
                onChange={(e) => setFormData({...formData, telegramChatId: e.target.value})}
              />
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3 items-start">
               <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
               <p className="text-[10px] text-amber-700 leading-relaxed font-bold">
                 ระบบจะส่งแจ้งเตือนสถานะกล้องในกลุ่มนี้ไปยัง Telegram ทันทีที่พบปัญหา โดยใช้ค่า Config ชุดนี้
               </p>
            </div>
          </div>
        </div>

        {/* AI Config */}
        <div className="space-y-4 pt-6 border-t border-slate-50">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              AI Support Integration
            </h4>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={formData.aiEnabled}
                onChange={(e) => setFormData({...formData, aiEnabled: e.target.checked})}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          {formData.aiEnabled && (
            <div className="animate-in fade-in zoom-in-95 duration-200 space-y-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1 flex items-center gap-2">
                <Wand2 size={14} className="text-purple-500" />
                AI System Prompt
              </label>
              <textarea 
                rows="3"
                className="w-full px-4 py-3 rounded-2xl border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-purple-50/20 text-sm font-medium resize-none"
                placeholder="ระบุคำสั่งให้ AI วิเคราะห์เหตุการณ์สำหรับกลุ่มนี้..."
                value={formData.aiSystemPrompt}
                onChange={(e) => setFormData({...formData, aiSystemPrompt: e.target.value})}
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default GroupFormModal;