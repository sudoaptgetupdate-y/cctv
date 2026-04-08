import React, { useState, useEffect } from 'react';
import { Save, Bell, Shield, Info, Database, Send, Terminal, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import apiClient from '../utils/apiClient';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Settings State
  const [settings, setSettings] = useState({
    systemName: 'CCTV Monitoring System',
    systemDescription: 'ระบบติดตามสถานะกล้องวงจรปิดอัจฉริยะ',
    telegramBotToken: '',
    telegramChatId: '',
    isGlobalNotifyEnabled: true,
    healthCheckInterval: 60, // วินาที
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/settings');
      if (res.data.success) {
        // แปลงข้อมูลจาก [ {key, value}, ... ] เป็น Object
        const settingsObj = {};
        res.data.data.forEach(item => {
          settingsObj[item.key] = item.value;
        });
        setSettings(prev => ({ ...prev, ...settingsObj }));
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      await apiClient.put('/settings', settings);
      setMessage({ type: 'success', text: 'บันทึกการตั้งค่าเรียบร้อยแล้ว' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-slate-500 font-medium">จัดการการตั้งค่าพื้นฐานและการแจ้งเตือนของระบบ</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-3xl font-bold shadow-xl shadow-primary-900/20 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-slideIn ${
          message.type === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' : 'bg-rose-50 border border-rose-100 text-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="font-bold text-sm uppercase tracking-wider">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Navigation */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <nav className="space-y-1">
              {[
                { id: 'general', name: 'General', icon: Info, active: true },
                { id: 'notify', name: 'Notifications', icon: Bell, active: false },
                { id: 'security', name: 'Security & Database', icon: Database, active: false }
              ].map(item => (
                <button
                  key={item.id}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${
                    item.active ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative group">
            <div className="relative z-10">
              <Shield className="h-10 w-10 text-primary-400 mb-4" />
              <h4 className="font-black text-xl mb-1 tracking-tight">AI Readiness</h4>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                ระบบพร้อมเชื่อมต่อ AI เพื่อวิเคราะห์ภาพในอนาคต (Planned Feature)
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-all duration-500"></div>
          </div>
        </div>

        {/* Right Column - Form Content */}
        <div className="md:col-span-2 space-y-6">
          {/* General Section */}
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
                  placeholder="เช่น CCTVMonitoring System"
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

          {/* Telegram Section */}
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

          {/* Advanced Section */}
          <section className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200/50 space-y-6">
            <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-[0.2em]">Maintenance Mode</h4>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <p className="text-xs text-slate-500 font-medium max-w-md">
                เปิดโหมดการทำงานบำรุงรักษา เพื่อระงับการแจ้งเตือนชั่วคราวขณะกำลังทำงานกับระบบกล้อง
              </p>
              <button className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-100 rounded-2xl font-bold text-slate-700 text-xs shadow-sm transition-all">
                Enter Maintenance Mode
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
