import React from 'react';
import { Info, Save, Bot, Wand2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/Modal';

const GroupFormModal = ({ isOpen, onClose, onSubmit, formData, setFormData, editingGroup, isSubmitting, formErrors = {} }) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingGroup ? t('groups.edit_group') : t('groups.add_new')}
      subtitle="Zone Configuration & Telegram Alert Setup"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-2xl text-slate-500 font-bold hover:bg-slate-200 transition-all text-sm disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button 
            onClick={onSubmit}
            disabled={isSubmitting || !!formErrors.name}
            className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 text-sm disabled:opacity-70 disabled:grayscale"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            <span>{isSubmitting ? t('groups.messages.saving') : (editingGroup ? t('common.save_changes') : t('common.create'))}</span>
          </button>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
            {t('groups.form.basic_info')}
          </h4>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1">{t('groups.form.group_name')}</label>
              <input 
                required
                type="text" 
                className={`w-full px-4 py-3 rounded-2xl border ${formErrors.name ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 text-sm font-medium`}
                placeholder={t('groups.form.group_name_placeholder')}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              {formErrors.name && (
                <p className="text-[10px] text-red-500 font-bold ml-1 animate-in slide-in-from-top-1 duration-200">
                  {formErrors.name}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1">{t('groups.description')}</label>
              <textarea 
                rows="2"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 text-sm font-medium resize-none"
                placeholder={t('groups.form.description_placeholder')}
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
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
              {t('groups.form.telegram_section')}
            </h4>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={formData.isNotifyEnabled}
                onChange={(e) => setFormData({...formData, isNotifyEnabled: e.target.checked})}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold ml-1 text-indigo-600">{t('groups.form.bot_token')}</label>
              <input 
                type="password"
                className="w-full px-4 py-3 rounded-2xl border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-indigo-50/20 font-mono text-sm"
                placeholder="0000000000:AAxxxxxxxxx..."
                value={formData.telegramBotToken}
                onChange={(e) => setFormData({...formData, telegramBotToken: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold ml-1 text-indigo-600">{t('groups.form.chat_id')}</label>
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-2xl border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-indigo-50/20 font-mono text-sm"
                placeholder="-100xxxxxxxxx"
                value={formData.telegramChatId}
                onChange={(e) => setFormData({...formData, telegramChatId: e.target.value})}
              />
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3 items-start">
               <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
               <p className="text-[10px] text-amber-700 leading-relaxed font-bold">
                 {t('groups.form.notify_hint')}
               </p>
            </div>
          </div>
        </div>

        {/* AI Config */}
        <div className="space-y-4 pt-6 border-t border-slate-50">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              {t('groups.form.ai_section')}
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
                {t('groups.form.ai_prompt')}
              </label>
              <textarea 
                rows="3"
                className="w-full px-4 py-3 rounded-2xl border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-purple-50/20 text-sm font-medium resize-none"
                placeholder={t('groups.form.ai_prompt_placeholder')}
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