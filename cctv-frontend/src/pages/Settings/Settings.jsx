import React, { useState, useEffect } from 'react';
import { Save, Bell, Shield, Info, Database, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
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
          {activeTab === 'general' && (
            <GeneralSettings settings={settings} handleChange={handleChange} />
          )}

          {activeTab === 'notify' && (
            <TelegramSettings settings={settings} handleChange={handleChange} />
          )}

          {activeTab === 'security' && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
