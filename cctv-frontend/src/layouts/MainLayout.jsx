import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Map as MapIcon, Camera, Settings, Users } from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/cameras', name: 'Cameras', icon: Camera },
    { path: '/groups', name: 'Groups/Zones', icon: Users },
    { path: '/settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-black text-white tracking-tighter">CCTV LIVE</h1>
          <p className="text-[10px] uppercase font-bold text-slate-500 mt-1 tracking-widest">Monitoring System</p>
        </div>
        
        <nav className="mt-4 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {menuItems.find(i => i.path === location.pathname)?.name || 'CCTV System'}
            </h2>
            <p className="text-xs text-slate-500 italic">ยินดีต้อนรับคุณ, {user?.firstName} {user?.lastName}</p>
          </div>
          
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all font-medium text-sm border border-slate-200"
          >
            <LogOut className="h-4 w-4" />
            <span>ลงชื่อออก</span>
          </button>
        </header>

        {/* Content Area */}
        <div className="p-8 flex-grow overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
