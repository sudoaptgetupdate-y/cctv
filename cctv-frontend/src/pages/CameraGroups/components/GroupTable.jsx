import React from 'react';
import { Loader2, FolderKanban } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GroupTableRow from './GroupTableRow';

const GroupTable = ({ 
  loading, 
  groups, 
  onEdit, 
  onDelete,
  pageSizes,
  itemsPerPage,
  setItemsPerPage,
  from,
  to,
  total
}) => {
  const { t } = useTranslation();

  if (loading && groups.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
        <Loader2 size={48} className="animate-spin text-indigo-600 mb-4" />
        <p className="font-bold text-sm uppercase tracking-widest">กำลังโหลดข้อมูลกลุ่ม...</p>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex-1 bg-white flex flex-col items-center justify-center text-center p-20 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
        <div className="bg-slate-50 p-6 rounded-3xl mb-4 border border-slate-100">
          <FolderKanban size={64} className="text-slate-200" />
        </div>
        <h3 className="text-xl font-bold text-slate-700 mb-1">ไม่พบข้อมูลกลุ่มกล้อง</h3>
        <p className="text-slate-400 text-sm max-w-xs font-medium italic">
          สร้างกลุ่มใหม่เพื่อจัดระเบียบและตั้งค่าการแจ้งเตือน
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"> 
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase tracking-[0.15em] text-slate-500 font-black text-left">
              <th className="p-4 pl-6 w-[80px]">Icon</th>
              <th className="p-4 w-[25%]">{t('groups.details')}</th>
              <th className="p-4 w-[15%]">{t('groups.members')}</th>
              <th className="p-4 w-[25%]">{t('groups.telegram_status')}</th>
              <th className="p-4 w-[15%]">AI Support</th>
              <th className="p-4 text-right pr-6 w-[12%]">{t('groups.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {groups.map((group) => (
              <GroupTableRow 
                key={group.id} 
                group={group}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-slate-50 border-t border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs mt-auto w-full">
        <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3 bg-white sm:bg-transparent p-2 sm:p-0 rounded-xl border border-slate-200 sm:border-transparent shadow-sm sm:shadow-none">
          <span className="text-slate-500 font-black uppercase tracking-widest ml-2">{t('common.items_per_page')}</span>
          <div className="flex gap-1">
            {pageSizes?.map(size => (
              <button 
                key={size} 
                onClick={() => setItemsPerPage(size)} 
                className={`px-3 py-1.5 rounded-lg transition-all font-black ${itemsPerPage === size ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:bg-slate-200'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        <div className="text-slate-500 font-bold bg-white sm:bg-transparent px-4 py-2 sm:p-0 rounded-xl border border-slate-200 sm:border-transparent shadow-sm sm:shadow-none tracking-tight">
          {t('common.showing')} <span className="text-slate-900">{from}</span> {t('common.to')} <span className="text-slate-900">{to}</span> {t('common.from')} <span className="text-indigo-600 underline underline-offset-4">{total}</span> {t('common.records')}
        </div>
      </div>
    </div>
  );
};

export default GroupTable;