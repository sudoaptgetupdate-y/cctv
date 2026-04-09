import React from 'react';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import Modal from '../../../components/Modal';

const AcknowledgeModal = ({ isOpen, onClose, camera, ackReason, setAckReason, onSubmit, isSubmitting }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="รับทราบเหตุการณ์"
      subtitle="ยืนยันการรับทราบปัญหาของกล้องตัวนี้"
      size="sm"
      footer={
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all"
          >
            ยกเลิก
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !ackReason.trim()}
            className="flex-[2] px-4 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <span>ยืนยันรับทราบ</span>
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">กล้องที่เลือก</div>
          <div className="font-bold text-slate-800">{camera?.name}</div>
          <div className="text-xs text-slate-500 mt-0.5">{camera?.rtspUrl}</div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
            เหตุผล / หมายเหตุ
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm min-h-[100px] resize-none"
            placeholder="ระบุเหตุผลที่รับทราบ เช่น กำลังตรวจสอบ, ระบบล่ม, ฯลฯ"
            value={ackReason}
            onChange={(e) => setAckReason(e.target.value)}
          />
        </div>

        <div className="flex items-start gap-3 p-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-medium">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <p>การรับทราบเหตุการณ์จะทำให้สถานะกล้องกลับมาเป็นปกติในระบบ และบันทึกประวัติผู้ที่เข้ามาดำเนินการ</p>
        </div>
      </div>
    </Modal>
  );
};

export default AcknowledgeModal;