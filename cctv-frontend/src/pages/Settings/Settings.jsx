import React, { useState, useEffect } from 'react';
import { Save, Bell, Shield, Info, Database, Loader2, CheckCircle2, AlertCircle, Settings as SettingsIcon } from 'lucide-react';
import apiClient from '../../utils/apiClient';
import GeneralSettings from './components/GeneralSettings';
import TelegramSettings from './components/TelegramSettings';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  
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
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 pb-10">
      {/* 1. Page Header Section (Island Card) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform duration-500">
             <SettingsIcon size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-2">
              System Settings
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest italic">
              จัดการการตั้งค่าพื้นฐานและการแจ้งเตือนของระบบ
            </p>
          </div>
        </div>
        
        <div className="relative z-10">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50 active:scale-95"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
          </button>
        </div>

        {/* Accent Blur */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-slate-50/50 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-50/50 transition-colors duration-700"></div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${
          message.type === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' : 'bg-rose-50 border border-rose-100 text-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="font-bold text-sm uppercase tracking-wider">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Navigation */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
            <nav className="space-y-1">
              {[
                { id: 'general', name: 'General', icon: Info },
                { id: 'notify', name: 'Notifications', icon: Bell },
                { id: 'security', name: 'Security', icon: Database }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${
                    activeTab === item.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="bg-slate-900 p-8 rounded-3xl text-white overflow-hidden relative group shadow-xl">
            <div className="relative z-10">
              <Shield className="h-10 w-10 text-blue-400 mb-4" />
              <h4 className="font-black text-xl mb-1 tracking-tight">AI Readiness</h4>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                ระบบพร้อมเชื่อมต่อ AI เพื่อวิเคราะห์ภาพในอนาคต (Planned Feature)
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
          </div>
        </div>

        {/* Right Column - Form Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[400px]">
            {activeTab === 'general' && (
              <GeneralSettings settings={settings} handleChange={handleChange} />
            )}

            {activeTab === 'notify' && (
              <TelegramSettings settings={settings} handleChange={handleChange} />
            )}

            {activeTab === 'security' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div>
                  <h3 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">
                    <Database className="text-blue-600" size={24} />
                    Security & Data Maintenance
                  </h3>
                  <p className="text-sm text-slate-500 font-medium tracking-tight">
                    จัดการนโยบายการจัดเก็บข้อมูลและการบำรุงรักษาระบบฐานข้อมูล
                  </p>
                </div>

                {/* Log Retention Section */}
                <div className="grid grid-cols-1 gap-6">
                  <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Database size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 tracking-tight uppercase text-xs tracking-widest">Log Retention Policy</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">นโยบายการลบข้อมูลประวัติผู้เข้าชมอัตโนมัติ</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Raw Logs */}
                      <div className="group">
                        <label className="block text-sm font-black text-slate-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                          ระยะเวลาเก็บ Raw Visitor Logs (วัน)
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="number"
                            name="VISITOR_LOG_RETENTION_DAYS"
                            value={settings.VISITOR_LOG_RETENTION_DAYS}
                            onChange={handleChange}
                            min="7"
                            max="365"
                            className="w-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-800"
                          />
                          <div className="flex-1">
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                              เก็บข้อมูลดิบ เช่น IP Address, Browser, Device Type อย่างละเอียด
                              <br/>
                              <span className="text-amber-600 font-bold italic text-[10px] uppercase">🚩 ใช้พื้นที่ HDD ปานกลาง (แนะนำ 30-90 วัน)</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Summary Data */}
                      <div className="group">
                        <label className="block text-sm font-black text-slate-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                          ระยะเวลาเก็บ Visitor Summary Data (เดือน)
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="number"
                            name="VISITOR_SUMMARY_RETENTION_MONTHS"
                            value={settings.VISITOR_SUMMARY_RETENTION_MONTHS}
                            onChange={handleChange}
                            min="1"
                            max="120"
                            className="w-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-800"
                          />
                          <div className="flex-1">
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                              เก็บยอดสรุปจำนวนผู้เข้าชมรายวันสำหรับแสดงผลบนกราฟ Trend ย้อนหลัง
                              <br/>
                              <span className="text-emerald-600 font-bold italic text-[10px] uppercase">✅ ใช้พื้นที่ HDD น้อยมาก (แนะนำ 12-60 เดือน)</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="bg-slate-900 p-8 rounded-3xl text-white overflow-hidden relative group shadow-xl">
                    <div className="relative z-10">
                      <h4 className="font-black text-slate-100 uppercase text-[10px] tracking-[0.2em] mb-4">Maintenance Mode</h4>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <p className="text-sm text-slate-400 font-medium max-w-md">
                          เปิดโหมดการทำงานบำรุงรักษา เพื่อระงับการแจ้งเตือนชั่วคราวขณะกำลังทำงานกับระบบกล้อง
                        </p>
                        <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold text-sm transition-all active:scale-95 whitespace-nowrap">
                          Enter Maintenance Mode
                        </button>
                      </div>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl transition-all duration-700 group-hover:bg-blue-500/20"></div>
                  </section>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
