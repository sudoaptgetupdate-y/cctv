import React from 'react';
import { Activity, Clock, Server, MonitorOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import Modal from '../../../components/Modal';

const EventHistoryModal = ({ isOpen, onClose, camera, events, loading }) => {
  const getEventIcon = (type) => {
    switch (type) {
      case 'ONLINE': return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'OFFLINE': return <MonitorOff className="text-rose-500" size={18} />;
      case 'ERROR': return <AlertCircle className="text-amber-500" size={18} />;
      default: return <Activity className="text-blue-500" size={18} />;
    }
  };

  const getEventBg = (type) => {
    switch (type) {
      case 'ONLINE': return 'bg-emerald-50 border-emerald-100';
      case 'OFFLINE': return 'bg-rose-50 border-rose-100';
      case 'ERROR': return 'bg-amber-50 border-amber-100';
      default: return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ประวัติเหตุการณ์"
      subtitle="Camera Event Timeline"
      size="lg"
      footer={
        <div className="flex flex-col items-center gap-4">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">แสดงประวัติย้อนหลังสูงสุด 50 รายการ</p>
           <button
             onClick={onClose}
             className="w-full px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-[0.98]"
           >
             ปิดหน้าต่าง
           </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Camera Info Card */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                 <Server size={24} />
              </div>
              <div>
                 <h4 className="font-bold text-slate-800 tracking-tight">{camera?.name}</h4>
                 <p className="text-xs font-medium text-slate-400 truncate max-w-[250px]">RTSP: {camera?.rtspUrl}</p>
              </div>
           </div>
           <div className="text-right hidden sm:block">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">สถานะปัจจุบัน</div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${camera?.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                 {camera?.status}
              </span>
           </div>
        </div>

        <div className="space-y-3 relative overflow-hidden min-h-[300px] max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
          {/* Timeline Line */}
          <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100"></div>

          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="h-8 w-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">กำลังดึงข้อมูลประวัติ...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="py-20 text-center space-y-4">
               <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                  <Activity size={32} className="text-slate-200" />
               </div>
               <p className="text-slate-400 font-medium italic">ยังไม่มีบันทึกเหตุการณ์สำหรับกล้องตัวนี้</p>
            </div>
          ) : (
            events.map((event, index) => (
              <div key={event.id} className="relative pl-14">
                {/* Timeline Dot */}
                <div className={`absolute left-[18px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-4 border-white shadow-sm z-10 ${
                  event.eventType === 'ONLINE' ? 'bg-emerald-500' : event.eventType === 'OFFLINE' ? 'bg-rose-500' : 'bg-blue-500'
                }`}></div>
                
                <div className={`p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white hover:border-slate-300 transition-colors group`}>
                  <div className="flex items-start gap-3">
                     <div className={`p-2 rounded-xl border shrink-0 group-hover:scale-110 transition-transform ${getEventBg(event.eventType)}`}>
                        {getEventIcon(event.eventType)}
                     </div>
                     <div>
                        <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                           {event.eventType}
                           {event.details && <span className="text-[10px] font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded italic">#{event.details}</span>}
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                           {format(new Date(event.createdAt), "d MMMM yyyy 'เวลา' HH:mm:ss", { locale: th })}
                        </p>
                     </div>
                  </div>
                  
                  <div className="md:text-right flex md:flex-col gap-2 md:gap-0">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">บันทึกโดยระบบ</span>
                     <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full block w-fit md:ml-auto">HealthCheck V1</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

export default EventHistoryModal;