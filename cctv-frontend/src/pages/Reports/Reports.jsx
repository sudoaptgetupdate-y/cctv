import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, Calendar, Camera, Globe, Users, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Clock, MapPin, Eye, Filter, RefreshCw,
  Download
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import logService from '../../services/logService';
import cameraService from '../../services/cameraService';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Reports = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [enhancedData, setEnhancedData] = useState(null);
  const [dateRange, setDateRange] = useState('7'); 
  const [customDates, setCustomDates] = useState({
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [selectedCameraId, setSelectedCameraId] = useState('all');
  const [topLimit, setTopLimit] = useState(5);

  useEffect(() => {
    fetchCameras();
    fetchReport();
  }, [dateRange, selectedCameraId]);

  const fetchCameras = async () => {
    try {
      const data = await cameraService.getAll();
      setCameras(data);
    } catch (error) {
      console.error('Failed to fetch cameras:', error);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      let start, end;
      if (dateRange === 'custom') {
        start = customDates.start;
        end = customDates.end;
      } else {
        const days = parseInt(dateRange);
        start = format(subDays(new Date(), days), 'yyyy-MM-dd');
        end = format(new Date(), 'yyyy-MM-dd');
      }
      const data = await logService.getEnhancedVisitorReport(start, end, selectedCameraId === 'all' ? null : selectedCameraId);
      setEnhancedData(data);
    } catch (error) {
      toast.error(t('reports.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const { value: formatType } = await Swal.fire({
      title: t('reports.export_title'),
      text: t('reports.export_desc'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Excel',
      cancelButtonText: t('common.cancel'),
      confirmButtonColor: '#4F46E5',
      showDenyButton: true,
      denyButtonText: 'PDF',
      denyButtonColor: '#EF4444',
    });
    if (formatType === undefined) return;
    let exportFormat = (Swal.isVisible() && Swal.getConfirmButton().contains(document.activeElement)) ? 'excel' : 'pdf';
    try {
      toast.loading(t('reports.exporting'), { id: 'export' });
      let start = dateRange === 'custom' ? customDates.start : format(subDays(new Date(), parseInt(dateRange)), 'yyyy-MM-dd');
      let end = dateRange === 'custom' ? customDates.end : format(new Date(), 'yyyy-MM-dd');
      const blob = await logService.exportVisitorReport(start, end, selectedCameraId === 'all' ? null : selectedCameraId, exportFormat, i18n.language);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Visitor_Report_${start}_to_${end}.${exportFormat === 'excel' ? 'xlsx' : 'pdf'}`);
      link.click();
      toast.success(t('reports.export_success'), { id: 'export' });
    } catch (error) {
      toast.error(t('reports.export_error'), { id: 'export' });
    }
  };

  const currentLocale = i18n.language === 'en' ? enUS : th;

  const stats = useMemo(() => {
    if (!enhancedData) return { totalViews: 0, uniqueVisitors: 0, topCamera: 'N/A', maxViews: 0, availability: 0 };
    const { dailyStats, trends, availability } = enhancedData;
    const cameraCounts = dailyStats.reduce((acc, item) => {
      if (item.cameraId) acc[item.cameraId] = (acc[item.cameraId] || 0) + item.totalViews;
      return acc;
    }, {});
    let topCameraId = Object.entries(cameraCounts).reduce((a, b) => (b[1] > a[1] ? b : a), [null, 0])[0];
    const topCameraName = cameras.find(c => c.id === parseInt(topCameraId))?.name || 'N/A';
    return { 
      totalViews: trends.views.current, 
      uniqueVisitors: trends.visitors.current, 
      topCamera: topCameraName, 
      maxViews: Math.max(...Object.values(cameraCounts), 0), 
      availability: availability?.score || 100,
      trends 
    };
  }, [enhancedData, cameras, t, i18n.language]);

  const chartData = useMemo(() => {
    if (!enhancedData) return { labels: [], datasets: [] };
    const dailyMap = enhancedData.dailyStats.reduce((acc, item) => {
      const dateKey = format(new Date(item.date || item.createdAt), 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = { views: 0, visitors: 0 };
      acc[dateKey].views += item.totalViews || 0;
      acc[dateKey].visitors += item.uniqueIPs || 0;
      return acc;
    }, {});
    const sortedDates = Object.keys(dailyMap).sort();
    return {
      labels: sortedDates.map(d => format(new Date(d), 'dd MMM', { locale: currentLocale })),
      datasets: [
        { label: t('reports.total_views'), data: sortedDates.map(d => dailyMap[d].views), borderColor: '#4F46E5', backgroundColor: 'rgba(79, 70, 229, 0.05)', fill: true, tension: 0.4, pointRadius: 2 },
        { label: t('reports.unique_visitors'), data: sortedDates.map(d => dailyMap[d].visitors), borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.05)', fill: true, tension: 0.4, pointRadius: 2 }
      ]
    };
  }, [enhancedData, t, i18n.language, currentLocale]);

  const hourlyChartData = useMemo(() => {
    if (!enhancedData) return { labels: [], datasets: [] };
    return {
      labels: enhancedData.hourlyTraffic.map(h => `${h.hour}:00`),
      datasets: [{ label: t('reports.views_by_camera'), data: enhancedData.hourlyTraffic.map(h => h.count), backgroundColor: 'rgba(79, 70, 229, 0.8)', borderRadius: 4 }]
    };
  }, [enhancedData, t, i18n.language]);

  const cameraLeaderboard = useMemo(() => {
    if (!enhancedData?.dailyStats) return [];
    const cameraStats = enhancedData.dailyStats.reduce((acc, item) => {
      if (!item.cameraId) return acc;
      const cam = cameras.find(c => c.id === parseInt(item.cameraId));
      const camName = cam ? cam.name : `Camera ${item.cameraId}`;
      acc[camName] = (acc[camName] || 0) + (item.totalViews || 0);
      return acc;
    }, {});
    return Object.entries(cameraStats).sort((a, b) => b[1] - a[1]).slice(0, topLimit);
  }, [enhancedData, cameras, topLimit, t, i18n.language]);

  const getDoughnutData = (stats, label, palette) => {
    if (!stats) return { labels: [], datasets: [] };
    const entries = Object.entries(stats);
    return { labels: entries.map(e => e[0]), datasets: [{ label, data: entries.map(e => e[1]), backgroundColor: palette, borderColor: '#fff', borderWidth: 2, hoverOffset: 10 }] };
  };

  // 🎨 High-Contrast Categorical Palettes
  const devicePalette = ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6']; // Indigo, Emerald, Amber, Rose, Violet
  const browserPalette = ['#3B82F6', '#06B6D4', '#F97316', '#8B5CF6', '#EC4899']; // Blue, Cyan, Orange, Violet, Pink
  const osPalette = ['#0EA5E9', '#22C55E', '#64748B', '#F43F5E', '#FBBF24']; // Sky, Green, Slate, Rose, Amber

  const deviceData = useMemo(() => getDoughnutData(enhancedData?.techStats?.devices, t('reports.devices'), devicePalette), [enhancedData, t, i18n.language]);
  const browserData = useMemo(() => getDoughnutData(enhancedData?.techStats?.browsers, t('reports.browsers'), browserPalette), [enhancedData, t, i18n.language]);
  const osData = useMemo(() => getDoughnutData(enhancedData?.techStats?.os, t('reports.os'), osPalette), [enhancedData, t, i18n.language]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* 🏷️ Page Header Banner - Consistent with Dashboard */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-700"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl text-white shadow-xl shadow-indigo-200 flex items-center justify-center shrink-0">
              <BarChart3 size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                {t('reports.title')}
              </h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                <span className="w-8 h-px bg-slate-200"></span>
                {t('reports.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleExport} 
              className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-[11px] font-black text-white transition-all uppercase tracking-widest shadow-xl shadow-indigo-200 active:scale-95 flex items-center gap-3"
            >
              <Download size={16} />
              {t('common.export')}
            </button>
            <button 
              onClick={fetchReport} 
              className="h-12 px-6 bg-white border border-slate-200 rounded-2xl text-[11px] font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest active:scale-95 flex items-center gap-3"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {t('common.refresh')}
            </button>
          </div>
        </div>
      </div>

      {/* 🔍 Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {['1', '7', '15', '30'].map(val => (
            <button key={val} onClick={() => setDateRange(val)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${dateRange === val ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {val} {t('common.days')}
            </button>
          ))}
          <button onClick={() => setDateRange('custom')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${dateRange === 'custom' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t('common.custom')}
          </button>
        </div>
        <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>
        <div className="flex-1 min-w-[200px] relative">
          <Camera size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select className="w-full bg-slate-50 border-transparent rounded-xl text-xs font-bold pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none" value={selectedCameraId} onChange={(e) => setSelectedCameraId(e.target.value)}>
            <option value="all">{t('reports.all_cameras')}</option>
            {cameras.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {dateRange === 'custom' && (
          <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
            <input type="date" className="bg-slate-50 border-transparent rounded-xl text-xs font-bold px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20" value={customDates.start} onChange={(e) => setCustomDates({...customDates, start: e.target.value})} />
            <span className="text-slate-300">/</span>
            <input type="date" className="bg-slate-50 border-transparent rounded-xl text-xs font-bold px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20" value={customDates.end} onChange={(e) => setCustomDates({...customDates, end: e.target.value})} />
            <button onClick={fetchReport} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95">{t('common.apply')}</button>
          </div>
        )}
      </div>

      {/* 📊 Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Eye size={18} />} label={t('reports.total_views')} value={stats.totalViews.toLocaleString()} trend={stats.trends?.views?.growth} color="indigo" />
        <StatCard icon={<Users size={18} />} label={t('reports.unique_visitors')} value={stats.uniqueVisitors.toLocaleString()} trend={stats.trends?.visitors?.growth} color="emerald" />
        <StatCard icon={<MapPin size={18} />} label={t('reports.uptime')} value={`${stats.availability}%`} color="blue" subValue={stats.availability > 95 ? t('reports.uptime_excellent') : t('reports.uptime_check')} />
        <StatCard icon={<Camera size={18} />} label={t('reports.top_camera')} value={stats.topCamera} subValue={`${stats.maxViews.toLocaleString()} ${t('reports.times')}`} color="amber" />
      </div>

      {/* 📈 Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-6">
              <TrendingUp className="text-indigo-500" size={16} /> {t('reports.traffic_trend')}
            </h3>
            <div className="h-[320px]"><Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', align: 'end', labels: { boxWidth: 6, usePointStyle: true, font: { size: 10, weight: 'bold' } } } }, scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } }, x: { grid: { display: false }, ticks: { font: { size: 10 } } } } }} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <TechnicalCard title={t('reports.devices')} data={deviceData} icon={<Globe className="text-indigo-500" size={14} />} />
            <TechnicalCard title={t('reports.browsers')} data={browserData} icon={<Globe className="text-emerald-500" size={14} />} />
            <TechnicalCard title={t('reports.os')} data={osData} icon={<Globe className="text-amber-500" size={14} />} />
          </div>
        </div>
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Camera className="text-indigo-500" size={16} /> {t('reports.top_rankings')}
            </h3>
            <select className="text-[10px] font-black bg-slate-100 rounded-lg px-3 py-1.5 outline-none border-none cursor-pointer" value={topLimit} onChange={(e) => setTopLimit(parseInt(e.target.value))}>
              {[5, 10, 20].map(v => <option key={v} value={v}>TOP {v}</option>)}
            </select>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
            {cameraLeaderboard.map(([name, views], idx) => {
              const max = cameraLeaderboard[0][1];
              return (
                <div key={idx} className="group">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black ${idx === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>{idx+1}</span>
                      <span className="truncate max-w-[120px]">{name}</span>
                    </span>
                    <span className="text-[10px] font-black text-slate-400">{views.toLocaleString()}</span>
                  </div>
                  <div className="h-1 bg-slate-50 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-indigo-500' : 'bg-slate-300'}`} style={{ width: `${(views/max)*100}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
           <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-6">
              <Clock className="text-indigo-500" size={16} /> {t('reports.peak_time_analysis')}
            </h3>
            <div className="h-[200px]"><Bar data={hourlyChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false }, ticks: { font: { size: 9, weight: 'bold' } } } } }} /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Users className="text-indigo-500" size={16} /> {t('reports.top_visitors')}
            </h3>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[9px] font-black rounded-md uppercase">{t('reports.unique_ips')}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-tighter border-b border-slate-50">
                  <th className="pb-3">{t('reports.ip_address')}</th>
                  <th className="pb-3 text-center">{t('reports.total_visits')}</th>
                  <th className="pb-3 text-right">{t('reports.last_activity')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {enhancedData?.topVisitors?.map((v, i) => (
                  <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 text-[11px] font-black text-slate-600 font-mono">{v.ip}</td>
                    <td className="py-3 text-center"><span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black">{v.count}</span></td>
                    <td className="py-3 text-right text-[10px] font-bold text-slate-400">{format(new Date(v.lastSeen), 'dd MMM HH:mm', { locale: currentLocale })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const TechnicalCard = ({ title, data, icon }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col h-[260px]">
    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
      {icon} {title}
    </h4>
    <div className="flex-1 relative">
      <Doughnut data={data} options={{ 
        responsive: true, maintainAspectRatio: false, cutout: '75%', spacing: 4,
        plugins: { 
          legend: { position: 'bottom', labels: { boxWidth: 6, usePointStyle: true, font: { size: 9, weight: 'bold' }, padding: 10 } },
          tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', padding: 12, cornerRadius: 8 }
        } 
      }} />
    </div>
  </div>
);

const StatCard = ({ icon, label, value, subValue, color, trend }) => {
  const themes = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all group">
      <div className={`w-11 h-11 rounded-xl ${themes[color]} border flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>{icon}</div>
      <div className="flex justify-between items-start mb-1">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        {trend !== undefined && (
          <div className={`flex items-center text-[9px] font-black ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <h4 className="text-xl font-black text-slate-800 tracking-tight">{value}</h4>
        {subValue && <span className="text-[9px] font-bold text-slate-400 uppercase">{subValue}</span>}
      </div>
    </div>
  );
};

export default Reports;
