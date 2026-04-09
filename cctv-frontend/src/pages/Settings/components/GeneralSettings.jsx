import React from 'react';
import { Info } from 'lucide-react';

const GeneralSettings = ({ settings, handleChange }) => {
  return (
    <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
      <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
        <div className="p-3 bg-primary-50 rounded-2xl text-primary-600">
          <Info className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-black text-slate-800 tracking-tight">General Information</h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">System Name</label>
          <input
            type="text"
            name="systemName"
            value={settings.systemName}
            onChange={handleChange}
            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold text-slate-800"
            placeholder="เช่น CCTV Monitoring System"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Description</label>
          <textarea
            name="systemDescription"
            value={settings.systemDescription}
            onChange={handleChange}
            rows="3"
            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium text-slate-700"
            placeholder="รายละเอียดเพิ่มเติมของระบบ..."
          />
        </div>
      </div>
    </section>
  );
};

export default GeneralSettings;
