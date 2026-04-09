import React from 'react';
import { 
  Edit2, Trash2, FolderKanban, Send, 
  CheckCircle2, AlertCircle, Bot, Zap, Wand2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const GroupTableRow = ({ group, onEdit, onDelete }) => {
  const { t } = useTranslation();

  const getTelegramStatus = () => {
    if (group.isNotifyEnabled && group.telegramBotToken && group.telegramChatId) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-600 border border-emerald-200">
          <CheckCircle2 size={12} strokeWidth={3} />
          Active
        </span>
      );
    }
    if (group.isNotifyEnabled) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-600 border border-amber-200">
          <AlertCircle size={12} strokeWidth={3} />
          Config Required
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200">
        Disabled
      </span>
    );
  };

  return (
    <tr className="hover:bg-slate-50/80 transition-all group">
      {/* 1. Status/Icon Column */}
      <td className="p-4 pl-6">
        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
          <FolderKanban size={20} />
        </div>
      </td>

      {/* 2. Details Column */}
      <td className="p-4">
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 text-sm tracking-tight group-hover:text-indigo-600 transition-colors">
            {group.name}
          </span>
          <span className="text-xs text-slate-400 italic mt-0.5 max-w-[250px] truncate">
            {group.description || 'ไม่มีรายละเอียด'}
          </span>
        </div>
      </td>

      {/* 3. Members Count Column */}
      <td className="p-4">
        <div className="flex items-center gap-2">
           <div className="px-3 py-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-black text-slate-600">
              {group._count?.cameras || 0} กล้อง
           </div>
        </div>
      </td>

      {/* 4. Telegram Status Column */}
      <td className="p-4">
        <div className="flex flex-col gap-1.5">
           {getTelegramStatus()}
           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
              <Bot size={12} />
              <span className="truncate max-w-[150px]">
                {group.telegramChatId ? `Chat: ${group.telegramChatId}` : 'ยังไม่ระบุ Chat ID'}
              </span>
           </div>
        </div>
      </td>

      {/* 5. AI Support Column */}
      <td className="p-4">
        <div className="flex items-center gap-2">
          {group.aiEnabled ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
               <Wand2 size={12} />
               <span className="text-[10px] font-black uppercase">AI Enabled</span>
            </div>
          ) : (
            <span className="text-[10px] font-bold text-slate-300 uppercase">Standard</span>
          )}
        </div>
      </td>

      {/* 6. Actions Column */}
      <td className="p-4 text-right pr-6">
        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(group)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" 
            title={t('common.edit')}
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={() => onDelete(group.id)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" 
            title={t('common.delete')}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default GroupTableRow;