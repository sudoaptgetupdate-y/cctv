import React from 'react';
import { 
  PlayCircle, Edit2, Trash2, MapPin, Link as LinkIcon, 
  CheckCircle2, AlertTriangle, MonitorOff, Clock, ShieldCheck 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

const CameraTableRow = ({ camera, onPreview, onEdit, onDelete, onAcknowledge, onViewHistory }) => {
  const getStatusBadge = () => {
    // กรณีที่ Offline และยังไม่ได้รับทราบเหตุการณ์ (isAcknowledged === false)
    if (camera.status === 'ERROR' && !camera.isAcknowledged) {
       return (
         <div className="flex flex-col gap-1">
           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-600 border border-rose-200 shadow-sm animate-pulse">
             <AlertTriangle size={12} strokeWidth={3} />
             Critical Error
           </span>
           <button 
             onClick={() => onAcknowledge(camera)}
             className="text-[9px] font-bold text-rose-500 hover:text-rose-700 underline text-left ml-1"
           >
             กดเพื่อรับทราบปัญหา
           </button>
         </div>
       );
    }

    if (camera.status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-600 border border-emerald-200">
          <CheckCircle2 size={12} strokeWidth={3} />
          Online
        </span>
      );
    }

    if (camera.isAcknowledged && camera.status === 'ERROR') {
       return (
         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-600 border border-amber-200">
           <ShieldCheck size={12} strokeWidth={3} />
           Acknowledged
         </span>
       );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200">
        <MonitorOff size={12} strokeWidth={3} />
        {camera.status}
      </span>
    );
  };

  const lastSeenText = camera.lastSeen 
    ? formatDistanceToNow(new Date(camera.lastSeen), { addSuffix: true, locale: th })
    : 'ไม่เคยเชื่อมต่อ';

  return (
    <tr className="hover:bg-slate-50/80 transition-all group">
      {/* 1. Status Column */}
      <td className="p-4 pl-6">
        {getStatusBadge()}
      </td>

      {/* 2. Details Column */}
      <td className="p-4">
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 text-sm tracking-tight group-hover:text-blue-600 transition-colors">
            {camera.name}
          </span>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-tighter">
                ID: {camera.id.toString().padStart(4, '0')}
             </span>
             <span className="text-[10px] font-bold text-slate-400 italic">
                กลุ่ม: {camera.groups?.[0]?.name || 'ทั่วไป'}
             </span>
          </div>
        </div>
      </td>

      {/* 3. Resources/Location Column */}
      <td className="p-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
            <MapPin size={12} className="text-slate-400 shrink-0" />
            <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100 italic">
               {camera.latitude.toFixed(4)}, {camera.longitude.toFixed(4)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 max-w-[180px] truncate bg-white px-2 py-0.5 rounded border border-slate-100 shadow-sm w-fit">
            <LinkIcon size={10} className="shrink-0" />
            {camera.rtspUrl}
          </div>
        </div>
      </td>

      {/* 4. Health/Last Seen Column */}
      <td className="p-4">
        <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
              <Clock size={12} className="text-blue-500" />
              <span>เห็นล่าสุด: {lastSeenText}</span>
           </div>
           {camera.isAcknowledged && camera.acknowledgeReason && (
             <p className="text-[9px] text-slate-400 italic bg-amber-50 px-2 py-0.5 rounded border border-amber-100/50 w-fit">
               Ack: {camera.acknowledgeReason}
             </p>
           )}
        </div>
      </td>

      {/* 5. Actions Column */}
      <td className="p-4 text-right pr-6">
        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onPreview(camera)}
            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all" 
            title="ดูสตรีมสด"
          >
            <PlayCircle size={18} />
          </button>
          <button 
            onClick={() => onViewHistory(camera)}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all" 
            title="ประวัติเหตุการณ์"
          >
            <Clock size={18} />
          </button>
          <button 
            onClick={() => onEdit(camera)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" 
            title="แก้ไข"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={() => onDelete(camera.id)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" 
            title="ลบ"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CameraTableRow;