import React from 'react';
import { Edit, Trash2, Send, Bell, BellOff, ShieldAlert, Camera, FolderKanban } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const GroupCard = ({ group, onEdit, onDelete, onManageCameras }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:border-indigo-300 transition-all hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col group/card relative">
      {/* Card Header */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-black text-slate-800 text-lg tracking-tight truncate">
              {group.name}
            </h3>
            {group.name === 'All Camera' && (
              <span className="text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-lg shadow-indigo-200">
                Default
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 line-clamp-2 font-medium italic">
            {group.description || t('groups.no_description')}
          </p>
        </div>
        <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover/card:opacity-100 transition-all duration-300">
          <button 
            onClick={() => onEdit(group)} 
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" 
            title={t('common.edit')}
          >
            <Edit size={18} />
          </button>
          
          {group.name !== 'All Camera' && (
            <button 
              onClick={() => onDelete(group.id)} 
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" 
              title={t('common.delete')}
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 space-y-5 flex-1 bg-gradient-to-b from-white to-slate-50/30">
        {/* Telegram Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${group.telegramBotToken ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                <Send size={14} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">{t('groups.telegram_status')}</span>
            </div>
            {group.isNotifyEnabled ? 
              <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-wider">
                <Bell size={10} strokeWidth={3}/> {t('groups.status.active')}
              </span> : 
              <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 uppercase tracking-wider">
                <BellOff size={10} strokeWidth={3}/> {t('groups.status.disabled')}
              </span>
            }
          </div>
          
          {group.telegramChatId ? (
            <div className="text-[10px] font-mono text-slate-500 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm break-all flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-blue-400 shrink-0"></div>
              ID: {group.telegramChatId}
            </div>
          ) : (
            <div className="text-[10px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-100 font-bold flex items-center gap-2 italic">
              <ShieldAlert size={14} /> {t('groups.status.config_required')}
            </div>
          )}
        </div>

        {/* AI Section (Optional based on schema) */}
        {group.aiEnabled && (
           <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-xl border border-purple-100 w-fit">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
              <span className="text-[9px] font-black text-purple-700 uppercase tracking-widest">{t('groups.status.ai_enabled')}</span>
           </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="p-4 bg-slate-50/80 border-t border-slate-100">
        <button 
          onClick={() => onManageCameras(group)} 
          className="w-full py-3 bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 group/btn"
        >
          <Camera size={18} className="group-hover/btn:scale-110 transition-transform" /> 
          {t('groups.members')}: {group._count?.cameras || 0}
        </button>
      </div>

      {/* Decoration */}
      <div className="absolute top-0 right-0 p-2 opacity-[0.03] pointer-events-none group-hover/card:opacity-[0.05] transition-opacity">
         <FolderKanban size={100} />
      </div>
    </div>
  );
};

export default GroupCard;