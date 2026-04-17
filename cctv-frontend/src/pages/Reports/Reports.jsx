import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, Calendar, Camera, Globe, Users, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Clock, MapPin, Eye, Filter, RefreshCw,
  Download
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { th } from 'date-fns/locale';
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
  const [dateRange, setDateRange] = useState('7'); // '1', '7', '15', '30', 'custom'
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

      const data = await logService.getEnhancedVisitorReport(
        start, 
        end, 
        selectedCameraId === 'all' ? null : selectedCameraId
      );
      setEnhancedData(data);
    } catch (error) {
      console.error('Failed to fetch enhanced report:', error);
      toast.error(t('reports.fetch_error', 'Failed to fetch report data'));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const { value: formatType } = await Swal.fire({
      title: t('reports.export_title', 'Export Report'),
      text: t('reports.export_desc', 'Choose your preferred file format'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Excel (.xlsx)',
      cancelButtonText: t('common.cancel', 'Cancel'),
      confirmButtonColor: '#4F46E5',
      showDenyButton: true,
      denyButtonText: 'PDF (.pdf)',
      denyButtonColor: '#EF4444',
    });

    if (formatType === undefined) return; // Cancelled

    let exportFormat = '';
    const isExcel = formatType === true || (Swal.isVisible() && Swal.getConfirmButton().contains(document.activeElement));
    const isPdf = formatType === false || (Swal.isVisible() && Swal.getDenyButton().contains(document.activeElement));

    if (isExcel) exportFormat = 'excel';
    else if (isPdf) exportFormat = 'pdf';
    else return;

    try {
      toast.loading(t('reports.exporting', 'Exporting report...'), { id: 'export' });
      
      let start, end;
      if (dateRange === 'custom') {
        start = customDates.start;
        end = customDates.end;
      } else {
        const days = parseInt(dateRange);
        start = format(subDays(new Date(), days), 'yyyy-MM-dd');
        end = format(new Date(), 'yyyy-MM-dd');
      }

      const blob = await logService.exportVisitorReport(
        start, 
        end, 
        selectedCameraId === 'all' ? null : selectedCameraId,
        exportFormat,
        i18n.language || 'th'
      );

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      const extension = exportFormat === 'excel' ? 'xlsx' : 'pdf';
      link.setAttribute('download', `Visitor_Report_${start}_to_${end}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast.success(t('reports.export_success', 'Report exported successfully'), { id: 'export' });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(t('reports.export_error', 'Failed to export report'), { id: 'export' });
    }
  };

  // 📊 คำนวณสรุปผล (Stats)
  const stats = useMemo(() => {
    if (!enhancedData) return { totalViews: 0, uniqueVisitors: 0, topCamera: 'N/A', maxViews: 0, availability: 0 };
    
    const { dailyStats, trends, availability } = enhancedData;
    const totalViews = trends.views.current;
    const uniqueVisitors = trends.visitors.current;
    
    // หากล้องที่คนดูเยอะที่สุด
    const cameraCounts = dailyStats.reduce((acc, item) => {
      if (item.cameraId) {
        acc[item.cameraId] = (acc[item.cameraId] || 0) + item.totalViews;
      }
      return acc;
    }, {});

    let topCameraId = null;
    let maxViews = 0;
    Object.entries(cameraCounts).forEach(([id, views]) => {
      if (views > maxViews) {
        maxViews = views;
        topCameraId = id;
      }
    });

    const topCamera = cameras.find(c => c.id === parseInt(topCameraId))?.name || 'N/A';

    return { 
      totalViews, 
      uniqueVisitors, 
      topCamera, 
      maxViews, 
      availability: availability?.score || 100,
      trends 
    };
  }, [enhancedData, cameras]);

  // 📈 เตรียมข้อมูลสำหรับ Line Chart (Traffic)
  const chartData = useMemo(() => {
    if (!enhancedData) return { labels: [], datasets: [] };
    
    const { dailyStats } = enhancedData;
    const dailyMap = dailyStats.reduce((acc, item) => {
      const d = item.date || item.createdAt;
      const dateKey = format(new Date(d), 'yyyy-MM-dd');
      
      if (!acc[dateKey]) acc[dateKey] = { views: 0, visitors: 0 };
      acc[dateKey].views += item.totalViews || 0;
      acc[dateKey].visitors += item.uniqueIPs || 0;
      return acc;
    }, {});

    const sortedDates = Object.keys(dailyMap).sort();
    const labels = sortedDates.map(d => format(new Date(d), 'dd MMM', { locale: th }));
    
    return {
      labels,
      datasets: [
        {
          label: t('reports.total_views', 'Total Views'),
          data: sortedDates.map(d => dailyMap[d].views),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: t('reports.unique_visitors', 'Unique Visitors'),
          data: sortedDates.map(d => dailyMap[d].visitors),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }, [enhancedData, t]);

  // 🕒 Hourly Traffic Chart
  const hourlyChartData = useMemo(() => {
    if (!enhancedData) return { labels: [], datasets: [] };
    
    const { hourlyTraffic } = enhancedData;
    return {
      labels: hourlyTraffic.map(h => `${h.hour}:00`),
      datasets: [
        {
          label: t('reports.peak_time', 'Hourly Views'),
          data: hourlyTraffic.map(h => h.count),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderRadius: 4
        }
      ]
    };
  }, [enhancedData, t]);

  const barChartData = useMemo(() => {
    if (!enhancedData) return { labels: [], datasets: [] };
    
    const { dailyStats } = enhancedData;
    const cameraStats = dailyStats.reduce((acc, item) => {
      if (!item.cameraId) return acc;
      const cam = cameras.find(c => c.id === parseInt(item.cameraId));
      const camName = cam ? cam.name : `Camera ${item.cameraId}`;
      acc[camName] = (acc[camName] || 0) + (item.totalViews || 0);
      return acc;
    }, {});

    const sorted = Object.entries(cameraStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topLimit);

    return {
      labels: sorted.map(s => s[0]),
      datasets: [
        {
          label: t('reports.views_by_camera', 'Views'),
          data: sorted.map(s => s[1]),
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderRadius: 8
        }
      ]
    };
  }, [enhancedData, cameras, t, topLimit]);

  // 🍩 Technical Stats Charts (Devices, Browsers, OS)
  const getDoughnutData = (stats, label, baseColor) => {
    if (!stats) return { labels: [], datasets: [] };
    const entries = Object.entries(stats);
    return {
      labels: entries.map(e => e[0]),
      datasets: [
        {
          label,
          data: entries.map(e => e[1]),
          backgroundColor: [
            `${baseColor}88`,
            `${baseColor}66`,
            `${baseColor}44`,
            `${baseColor}AA`,
            `${baseColor}CC`,
          ],
          borderColor: '#fff',
          borderWidth: 2,
        }
      ]
    };
  };

  const deviceData = useMemo(() => 
    getDoughnutData(enhancedData?.techStats?.devices, t('reports.devices', 'Devices'), '#3B82F6'), 
  [enhancedData, t]);

  const browserData = useMemo(() => 
    getDoughnutData(enhancedData?.techStats?.browsers, t('reports.browsers', 'Browsers'), '#10B981'), 
  [enhancedData, t]);

  const osData = useMemo(() => 
    getDoughnutData(enhancedData?.techStats?.os, t('reports.os', 'OS Distribution'), '#6366F1'), 
  [enhancedData, t]);

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 8,
          font: { size: 9, weight: 'bold' },
          padding: 8,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%',
    spacing: 2
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* 🏷️ Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white shadow-xl shadow-blue-100 flex items-center justify-center">
              <BarChart3 size={24} />
            </div>
            {t('reports.title', 'Visitor Analytics')}
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1 ml-15 italic">
            {t('reports.subtitle', 'Monitor traffic and camera usage statistics')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-[10px] font-black text-white transition-all uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            {t('common.export', 'Export')}
          </button>

          <button 
            onClick={fetchReport}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest active:scale-95"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh', 'Refresh')}
          </button>
        </div>
      </div>

      {/* 🔍 Filters */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl">
            {['1', '7', '15', '30'].map(val => (
              <button
                key={val}
                onClick={() => setDateRange(val)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  dateRange === val 
                  ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/10' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {val} {t('common.days', 'Days')}
              </button>
            ))}
            <button
              onClick={() => setDateRange('custom')}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                dateRange === 'custom' 
                ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/10' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t('common.custom', 'Custom')}
            </button>
          </div>

          <div className="flex-1 min-w-[200px]">
             <div className="relative">
               <Camera size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               <select 
                 className="w-full bg-slate-50 border-slate-200 rounded-2xl text-xs font-bold pl-11 pr-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
                 value={selectedCameraId}
                 onChange={(e) => setSelectedCameraId(e.target.value)}
               >
                 <option value="all">{t('reports.all_cameras', 'All Cameras')}</option>
                 {cameras.map(c => (
                   <option key={c.id} value={c.id}>{c.name}</option>
                 ))}
               </select>
             </div>
          </div>
        </div>

        {dateRange === 'custom' && (
          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('common.from', 'From')}</span>
              <input 
                type="date" 
                className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold px-4 py-2 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                value={customDates.start}
                onChange={(e) => setCustomDates({...customDates, start: e.target.value})}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('common.to', 'To')}</span>
              <input 
                type="date" 
                className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold px-4 py-2 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                value={customDates.end}
                onChange={(e) => setCustomDates({...customDates, end: e.target.value})}
              />
            </div>
            <button 
              onClick={fetchReport}
              className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-black transition-all active:scale-95"
            >
              {t('common.apply', 'Apply')}
            </button>
          </div>
        )}
      </div>

      {/* 📊 Stat Cards with Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Eye size={20} />}
          label={t('reports.total_views', 'Total Views')}
          value={stats.totalViews.toLocaleString()}
          trend={stats.trends?.views?.growth}
          color="blue"
        />
        <StatCard 
          icon={<Users size={20} />}
          label={t('reports.unique_visitors', 'Unique Visitors')}
          value={stats.uniqueVisitors.toLocaleString()}
          trend={stats.trends?.visitors?.growth}
          color="emerald"
        />
        <StatCard 
          icon={<MapPin size={20} />}
          label={t('reports.uptime', 'System Availability')}
          value={`${stats.availability}%`}
          color="indigo"
          subValue={stats.availability > 95 ? t('reports.uptime_excellent', 'Excellent') : t('reports.uptime_check', 'Check Logs')}
        />
        <StatCard 
          icon={<Camera size={20} />}
          label={t('reports.top_camera', 'Top Camera')}
          value={stats.topCamera}
          subValue={`${stats.maxViews.toLocaleString()} ${t('reports.views_by_camera', 'views')}`}
          color="amber"
        />
      </div>

      {/* 📈 Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Traffic Trend */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3 mb-8">
              <TrendingUp className="text-blue-500" size={18} />
              {t('reports.traffic_trend', 'Traffic Trend')}
            </h3>
            <div className="h-[350px]">
              <Line 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { 
                      position: 'top',
                      labels: { font: { weight: 'bold', size: 10 }, usePointStyle: true }
                    } 
                  },
                  scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { size: 10 } } },
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                  }
                }} 
              />
            </div>
          </div>

          {/* Technical Distribution Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TechnicalCard 
              title={t('reports.devices', 'Devices')} 
              data={deviceData} 
              options={doughnutOptions} 
              icon={<Globe className="text-blue-500" size={14} />} 
            />
            <TechnicalCard 
              title={t('reports.browsers', 'Browsers')} 
              data={browserData} 
              options={doughnutOptions} 
              icon={<Globe className="text-emerald-500" size={14} />} 
            />
            <TechnicalCard 
              title={t('reports.os', 'OS Distribution')} 
              data={osData} 
              options={doughnutOptions} 
              icon={<Globe className="text-indigo-500" size={14} />} 
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Top Cameras Rankings */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
                <Camera className="text-indigo-500" size={18} />
                {t('reports.top_rankings', 'Camera Rankings')}
              </h3>
              <select 
                className="text-[10px] font-black bg-slate-100 hover:bg-slate-200 border-none rounded-xl px-4 py-2 outline-none transition-colors cursor-pointer"
                value={topLimit}
                onChange={(e) => setTopLimit(parseInt(e.target.value))}
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
              </select>
            </div>
            <div className="flex-1 min-h-[400px]">
              <Bar 
                data={barChartData}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { size: 10 } } },
                    y: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' } } }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 🕒 Hourly Traffic Chart - Full Width */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3 mb-8">
          <Clock className="text-indigo-500" size={18} />
          {t('reports.peak_time_analysis', 'Hourly Traffic (Peak Time Analysis)')}
        </h3>
        <div className="h-[250px]">
          <Bar 
            data={hourlyChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { size: 10 } } },
                x: { grid: { display: false }, ticks: { font: { size: 10 } } }
              }
            }}
          />
        </div>
      </div>

      {/* 👥 Top Visitors Table - Clean & Compact */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
            <Users className="text-blue-500" size={18} />
            {t('reports.top_visitors', 'Top 10 Visitors (By IP)')}
          </h3>
          <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">
            {t('reports.unique_ips', 'Unique Devices')}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                <th className="px-6 py-2">{t('reports.ip_address', 'IP Address')}</th>
                <th className="px-6 py-2">{t('reports.last_activity', 'Last Activity')}</th>
                <th className="px-6 py-2">{t('reports.total_visits', 'Visits')}</th>
                <th className="px-6 py-2">{t('reports.platform_browser', 'Platform / Browser')}</th>
              </tr>
            </thead>
            <tbody>
              {enhancedData?.topVisitors && enhancedData.topVisitors.map((visitor, idx) => (
                <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 bg-slate-50 group-hover:bg-blue-50/50 rounded-l-2xl border-y border-l border-slate-100 transition-colors">
                    <span className="text-xs font-black text-slate-700 tracking-wider font-mono">{visitor.ip}</span>
                  </td>
                  <td className="px-6 py-4 bg-slate-50 group-hover:bg-blue-50/50 border-y border-slate-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <Clock size={10} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500">
                        {format(new Date(visitor.lastSeen), 'dd MMM yyyy HH:mm', { locale: th })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 bg-slate-50 group-hover:bg-blue-50/50 border-y border-slate-100 transition-colors">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-lg">
                      {visitor.count} {t('reports.times', 'times')}
                    </span>
                  </td>
                  <td className="px-6 py-4 bg-slate-50 group-hover:bg-blue-50/50 rounded-r-2xl border-y border-r border-slate-100 transition-colors">
                    <span className="text-[10px] font-medium text-slate-400 truncate max-w-[250px] block">
                      {visitor.userAgent}
                    </span>
                  </td>
                </tr>
              ))}
              {(!enhancedData?.topVisitors || enhancedData.topVisitors.length === 0) && (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-xs font-bold text-slate-400 uppercase tracking-widest italic">
                    {t('reports.no_data', 'No visitor data found for this period')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TechnicalCard = ({ title, data, options, icon }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[280px]">
    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
      {icon}
      {title}
    </h4>
    <div className="flex-1 relative">
      <Doughnut data={data} options={options} />
    </div>
  </div>
);

const StatCard = ({ icon, label, value, subValue, color, trend }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-500/5',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/5',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-500/5',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 shadow-blue-500/5'
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className={`w-14 h-14 rounded-2xl ${colors[color]} border flex items-center justify-center mb-6 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-lg`}>
        {icon}
      </div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <h4 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h4>
        {subValue && <span className="text-[10px] font-bold text-slate-400 uppercase italic">{subValue}</span>}
      </div>
    </div>
  );
};

export default Reports;
