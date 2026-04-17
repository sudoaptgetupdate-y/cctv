import React, { useState, useEffect } from 'react';
import { Save, Bell, Shield, Info, Database, Loader2, CheckCircle2, AlertCircle, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import apiClient from '../../utils/apiClient';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import GeneralSettings from './components/GeneralSettings';
import TelegramSettings from './components/TelegramSettings';

const Settings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  // Settings State
  const [settings, setSettings] = useState({
    systemName: 'CCTV Monitoring System',
    systemDescription: 'ระบบติดตามสถานะกล้องวงจรปิดอัจฉริยะ',
    telegramBotToken: '',
    telegramChatId: '',
    isGlobalNotifyEnabled: true,
    healthCheckInterval: 60,
    VISITOR_LOG_RETENTION_DAYS: 60,
    VISITOR_SUMMARY_RETENTION_MONTHS: 36,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/settings');
      if (res.data.success) {
        const settingsMap = res.data.data.reduce((acc, item) => {
          acc[item.key] = item.value;
          return acc;
        }, {});

        setSettings(prev => ({ 
          ...prev, 
          ...settingsMap,
          isGlobalNotifyEnabled: settingsMap.isGlobalNotifyEnabled === 'true',
          healthCheckInterval: parseInt(settingsMap.healthCheckInterval || '60'),
          VISITOR_LOG_RETENTION_DAYS: parseInt(settingsMap.VISITOR_LOG_RETENTION_DAYS || '60'),
          VISITOR_SUMMARY_RETENTION_MONTHS: parseInt(settingsMap.VISITOR_SUMMARY_RETENTION_MONTHS || '36'),
        }));
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      toast.error('Failed to load settings');
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

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      await apiClient.post('/settings', { settings });
      toast.success('Settings saved successfully');
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleClearVisitorData = async () => {
    const result = await Swal.fire({
      title: 'ล้างข้อมูลสถิติทั้งหมด?',
      text: "ข้อมูล Raw Logs และ Summary ทั้งหมดจะถูกลบทิ้งอย่างถาวร! (เฉพาะ Super Admin เท่านั้น)",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'ยืนยัน ลบข้อมูลทั้งหมด',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        toast.loading('กำลังล้างข้อมูล...', { id: 'clear-data' });
        await apiClient.delete('/logs/clear-visitor-data');
        toast.success('ล้างข้อมูลเรียบร้อยแล้ว', { id: 'clear-data' });
      } catch (error) {
        toast.error('เกิดข้อผิดพลาดในการล้างข้อมูล', { id: 'clear-data' });
      }
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform duration-500">
             <SettingsIcon size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter">System Settings</h1>
            <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest italic">
              จัดการการตั้งค่าพื้นฐานและความปลอดภัยของระบบ
            </p>
          </div>
        </div>
        <div className="relative z-10">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50 active:scale-95">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {saving ? 'Saving...' : 'บันทึกการตั้งค่า'}
          </button>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-slate-50/50 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-50/50 transition-colors duration-700"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
            <nav className="space-y-1">
              {[
                { id: 'general', name: 'General', icon: Info },
                { id: 'notify', name: 'Notifications', icon: Bell },
                { id: 'security', name: 'Security', icon: Database }
              ].map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === item.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <item.icon className="h-4 w-4" /> {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[400px]">
            {activeTab === 'general' && <GeneralSettings settings={settings} handleChange={handleChange} />}
            {activeTab === 'notify' && <TelegramSettings settings={settings} handleChange={handleChange} />}
            {activeTab === 'security' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"><Database size={20} /></div>
                  <div>
                    <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">Log Retention Policy</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">นโยบายการจัดเก็บและบำรุงรักษาข้อมูล</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Raw Logs Setting */}
                  <div className="group">
                    <label className="block text-sm font-black text-slate-700 mb-2">ระยะเวลาเก็บ Raw Visitor Logs (วัน)</label>
                    <div className="flex items-center gap-4">
                      <input type="number" name="VISITOR_LOG_RETENTION_DAYS" value={settings.VISITOR_LOG_RETENTION_DAYS} onChange={handleChange} min="7" max="365" className="w-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-800" />
                      <p className="text-[10px] text-slate-400 font-bold max-w-xs leading-relaxed italic">ข้อมูลดิบเชิงลึก (IP, Browser) <br/><span className="text-amber-600 font-black">🚩 ใช้พื้นที่ HDD ปานกลาง</span></p>
                    </div>
                  </div>

                  {/* Summary Logs Setting */}
                  <div className="group">
                    <label className="block text-sm font-black text-slate-700 mb-2">ระยะเวลาเก็บ Visitor Summary Data (เดือน)</label>
                    <div className="flex items-center gap-4">
                      <input type="number" name="VISITOR_SUMMARY_RETENTION_MONTHS" value={settings.VISITOR_SUMMARY_RETENTION_MONTHS} onChange={handleChange} min="1" max="120" className="w-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-800" />
                      <p className="text-[10px] text-slate-400 font-bold max-w-xs leading-relaxed italic">ข้อมูลสรุปรายวันสำหรับกราฟ Trend <br/><span className="text-emerald-600 font-black">✅ ใช้พื้นที่ HDD น้อยมาก</span></p>
                    </div>
                  </div>
                </div>

                <section className="bg-slate-900 p-8 rounded-3xl text-white overflow-hidden relative group shadow-xl mt-10">
                  <div className="relative z-10">
                    <h4 className="font-black text-slate-100 uppercase text-[10px] tracking-[0.2em] mb-4">Maintenance Mode</h4>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <p className="text-sm text-slate-400 font-medium max-w-md">เปิดโหมดการทำงานบำรุงรักษา เพื่อระงับการแจ้งเตือนชั่วคราวขณะกำลังทำงานกับระบบกล้อง</p>
                      <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold text-sm transition-all active:scale-95 whitespace-nowrap">Enter Maintenance Mode</button>
                    </div>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl transition-all duration-700 group-hover:bg-blue-500/20"></div>
                </section>

                {/* Danger Zone (Super Admin Only) */}
                {user?.role === 'SUPER_ADMIN' && (
                  <section className="bg-rose-50 p-8 rounded-3xl border border-rose-200 border-dashed space-y-6 mt-6">
                    <div className="flex items-center gap-3 border-b border-rose-100 pb-4">
                      <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600"><Trash2 size={20} /></div>
                      <div>
                        <h4 className="font-black text-rose-800 uppercase text-xs tracking-widest">Danger Zone</h4>
                        <p className="text-[10px] text-rose-400 font-bold uppercase mt-0.5">สำหรับการทดสอบ - ไม่สามารถย้อนกลับได้</p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-1">
                        <p className="text-sm font-black text-rose-900">Clear All Analytics Data</p>
                        <p className="text-xs text-rose-500 font-medium max-w-md">ลบข้อมูลประวัติผู้เข้าชมทั้งหมดออกจากฐานข้อมูลถาวร</p>
                      </div>
                      <button onClick={handleClearVisitorData} className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-rose-200 transition-all active:scale-95 flex items-center gap-2">
                        <Trash2 size={16} /> ล้างสถิติทั้งหมด
                      </button>
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
