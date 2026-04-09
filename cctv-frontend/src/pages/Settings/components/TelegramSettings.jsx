import React from 'react';
import { Send, Terminal } from 'lucide-react';

const TelegramSettings = ({ settings, handleChange }) => {
  return (
    <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
            <Send className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Telegram Notifications</h3>
        </div>
        
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            name="isGlobalNotifyEnabled"
            checked={settings.isGlobalNotifyEnabled}
            onChange={handleChange}
            className="sr-only peer" 
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Bot Token</label>
          <input
            type="password"
            name="telegramBotToken"
            value={settings.telegramBotToken}
            onChange={handleChange}
            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-mono text-sm"
            placeholder="บอทโทเค็นจาก BotFather"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Default Chat ID</label>
          <input
            type="text"
            name="telegramChatId"
            value={settings.telegramChatId}
            onChange={handleChange}
            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-mono text-sm"
            placeholder="แชทไอดีหลัก (เช่น -100xxxxxxxxxx)"
          />
        </div>
        
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
          <Terminal className="h-5 w-5 text-amber-600 shrink-0 mt-1" />
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            การแจ้งเตือนระดับ Global จะทำงานเมื่อมีการตั้งค่าไว้ และ "Zones" เฉพาะยังไม่ได้ตั้งค่าบอทแยกเอาไว้
          </p>
        </div>
      </div>
    </section>
  );
};

export default TelegramSettings;
