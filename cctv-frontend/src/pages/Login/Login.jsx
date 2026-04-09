import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Loader2, Camera, ShieldCheck, Play } from 'lucide-react';
import Footer from '../../components/Footer';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const success = await login(username, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* ฝั่งซ้าย: ฟอร์ม Login */}
      <div className="w-full lg:w-[450px] flex flex-col justify-center px-8 md:px-12 bg-white shadow-2xl z-10">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary-600 rounded-2xl text-white shadow-lg shadow-primary-200">
              <Camera className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 leading-none">CCTV</h1>
              <p className="text-xs font-bold text-primary-600 uppercase tracking-[0.3em] mt-1">Monitoring</p>
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">ยินดีต้อนรับ</h2>
          <p className="text-slate-500 font-medium">กรุณาเข้าสู่ระบบเพื่อจัดการระบบกล้องวงจรปิด</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-widest">Username</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white transition-all font-bold text-slate-800"
                placeholder="ชื่อผู้ใช้งาน"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-widest">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="password"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white transition-all font-bold text-slate-800"
                placeholder="รหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4 group"
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <span>เข้าสู่ระบบ</span>
                <Play className="h-5 w-5 fill-current group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-auto py-8">
          <Footer />
        </div>
      </div>

      {/* ฝั่งขวา: รูปภาพ/กราฟิก (โชว์เฉพาะจอใหญ่) */}
      <div className="hidden lg:flex flex-1 relative bg-slate-900 items-center justify-center overflow-hidden">
        {/* Background กราฟิก */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 max-w-lg text-center px-10">
          <div className="inline-flex p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] mb-8 shadow-2xl shadow-black/50">
            <ShieldCheck className="h-20 w-20 text-primary-400" />
          </div>
          <h3 className="text-5xl font-black text-white mb-6 tracking-tight leading-tight">
            Security & <span className="text-primary-400">Intelligence</span>
          </h3>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            ระบบบริหารจัดการและตรวจติดตามสถานะกล้องวงจรปิดแบบ Real-time พร้อมเทคโนโลยี WebRTC ที่ลื่นไหลที่สุด
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-4">
             <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/5 text-left">
                <p className="text-primary-400 font-black text-2xl mb-1">0%</p>
                <p className="text-white text-xs font-bold uppercase tracking-widest opacity-60">CPU Relay Mode</p>
             </div>
             <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/5 text-left">
                <p className="text-emerald-400 font-black text-2xl mb-1">Live</p>
                <p className="text-white text-xs font-bold uppercase tracking-widest opacity-60">WebRTC Streaming</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;