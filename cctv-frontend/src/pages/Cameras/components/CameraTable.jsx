import React from 'react';
import { Loader2, Camera as CameraIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CameraTableRow from './CameraTableRow';

const CameraTable = ({ 
  loading, 
  cameras, 
  onEdit, 
  onDelete, 
  onPreview, 
  onAcknowledge, 
  onViewHistory,
  pageSizes,
  itemsPerPage,
  setItemsPerPage,
  from,
  to,
  total,
  streamStatuses
}) => {
  const { t } = useTranslation();

  if (loading && cameras.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
        <Loader2 size={48} className="animate-spin text-indigo-600 mb-4" />
        <p className="font-bold text-sm uppercase tracking-widest">{t('common.loading')}</p>
      </div>
    );
  }

  if (cameras.length === 0) {
    return (
      <div className="flex-1 bg-white flex flex-col items-center justify-center text-center p-20 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
        <div className="bg-slate-50 p-6 rounded-3xl mb-4 border border-slate-100">
          <CameraIcon size={64} className="text-slate-200" />
        </div>
        <h3 className="text-xl font-bold text-slate-700 mb-1">{t('cameras.no_cameras_found')}</h3>
        <p className="text-slate-400 text-sm max-w-xs font-medium italic">
          {t('cameras.search_placeholder')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"> 
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase tracking-[0.15em] text-slate-500 font-black text-left">
              <th className="p-4 pl-6 w-[15%]">{t('cameras.status')}</th>
              <th className="p-4 w-[25%]">{t('cameras.details')}</th>
              <th className="p-4 w-[20%]">{t('cameras.location')}</th>
              <th className="p-4 w-[25%]">{t('cameras.health')}</th>
              <th className="p-4 text-right pr-6 w-[15%]">{t('cameras.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {cameras.map((camera) => (
              <CameraTableRow 
                key={camera.id} 
                camera={camera}
                onPreview={onPreview}
                onEdit={onEdit}
                onDelete={onDelete}
                onAcknowledge={onAcknowledge}
                onViewHistory={onViewHistory}
                streamStatus={streamStatuses?.[`camera_${camera.id}`]}
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
                className={`px-3 py-1.5 rounded-lg transition-all font-black ${itemsPerPage === size ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
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

export default CameraTable;