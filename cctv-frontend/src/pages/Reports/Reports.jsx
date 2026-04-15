import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, Calendar, Camera, Globe, Users, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Clock, MapPin, Eye, Filter, RefreshCw
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { th } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import logService from '../../services/logService';
import cameraService from '../../services/cameraService';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Reports = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [dateRange, setDateRange] = useState('7'); // '1', '7', '15', '30', 'custom'
  const [customDates, setCustomDates] = useState({
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [selectedCameraId, setSelectedCameraId] = useState('all');

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

      const data = await logService.getVisitorReport(
        start, 
        end, 
        selectedCameraId === 'all' ? null : selectedCameraId
      );
      setReportData(data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
      toast.error(t('reports.fetch_error', 'Failed to fetch report data'));
    } finally {
      setLoading(false);
    }
  };

  // 📊 คำนวณสรุปผล (Stats)
  const stats = useMemo(() => {
    const totalViews = reportData.reduce((sum, item) => sum + item.totalViews, 0);
    const uniqueVisitors = reportData.reduce((sum, item) => sum + (item.uniqueIPs || 0), 0);
    
    // หากล้องที่คนดูเยอะที่สุด
    const cameraCounts = reportData.reduce((acc, item) => {
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

    return { totalViews, uniqueVisitors, topCamera, maxViews };
  }, [reportData, cameras]);

  // 📈 เตรียมข้อมูลสำหรับ Line Chart (Traffic)
  const chartData = useMemo(() => {
    // 1. รวมข้อมูลแยกตามวัน (ใช้ YYYY-MM-DD เป็น Key เพื่อให้เรียงลำดับง่าย)
    const dailyMap = reportData.reduce((acc, item) => {
      const d = item.date || item.createdAt;
      const dateKey = format(new Date(d), 'yyyy-MM-dd');
      
      if (!acc[dateKey]) acc[dateKey] = { views: 0, visitors: 0 };
      acc[dateKey].views += item.totalViews || 0;
      acc[dateKey].visitors += item.uniqueIPs || 0;
      return acc;
    }, {});

    // 2. เรียงลำดับวันที่จากน้อยไปมาก
    const sortedDates = Object.keys(dailyMap).sort();
    
    // 3. แปลงเป็น Label สำหรับแสดงผล (dd MMM)
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
  }, [reportData, t]);

  const barChartData = useMemo(() => {
    const cameraStats = reportData.reduce((acc, item) => {
      if (!item.cameraId) return acc;
      const cam = cameras.find(c => c.id === parseInt(item.cameraId));
      const camName = cam ? cam.name : `Camera ${item.cameraId}`;
      acc[camName] = (acc[camName] || 0) + (item.totalViews || 0);
      return acc;
    }, {});

    const sorted = Object.entries(cameraStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

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
  }, [reportData, cameras, t]);

  return (
    <div className="space-y-6">
      {/* 🏷️ Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
              <BarChart3 className="h-6 w-6" />
            </div>
            {t('reports.title', 'Visitor Analytics')}
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {t('reports.subtitle', 'Monitor traffic and camera usage statistics')}
          </p>
        </div>

        <button 
          onClick={fetchReport}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          {t('common.refresh', 'Refresh')}
        </button>
      </div>

      {/* 🔍 Filters */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
            {['1', '7', '15', '30'].map(val => (
              <button
                key={val}
                onClick={() => setDateRange(val)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  dateRange === val 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {val} {t('common.days', 'Days')}
              </button>
            ))}
            <button
              onClick={() => setDateRange('custom')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                dateRange === 'custom' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t('common.custom', 'Custom')}
            </button>
          </div>

          <div className="flex-1 min-w-[200px]">
             <select 
               className="w-full bg-slate-50 border-slate-200 rounded-2xl text-xs font-bold px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
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

        {dateRange === 'custom' && (
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">{t('common.from', 'From')}</span>
              <input 
                type="date" 
                className="bg-slate-50 border-slate-200 rounded-xl text-xs font-bold px-3 py-2 outline-none"
                value={customDates.start}
                onChange={(e) => setCustomDates({...customDates, start: e.target.value})}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">{t('common.to', 'To')}</span>
              <input 
                type="date" 
                className="bg-slate-50 border-slate-200 rounded-xl text-xs font-bold px-3 py-2 outline-none"
                value={customDates.end}
                onChange={(e) => setCustomDates({...customDates, end: e.target.value})}
              />
            </div>
            <button 
              onClick={fetchReport}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
            >
              {t('common.apply', 'Apply')}
            </button>
          </div>
        )}
      </div>

      {/* 📊 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Eye className="h-5 w-5" />}
          label={t('reports.total_views', 'Total Views')}
          value={stats.totalViews.toLocaleString()}
          color="blue"
        />
        <StatCard 
          icon={<Users className="h-5 w-5" />}
          label={t('reports.unique_visitors', 'Unique Visitors')}
          value={stats.uniqueVisitors.toLocaleString()}
          color="emerald"
        />
        <StatCard 
          icon={<Camera className="h-5 w-5" />}
          label={t('reports.top_camera', 'Most Active Camera')}
          value={stats.topCamera}
          subValue={`${stats.maxViews.toLocaleString()} views`}
          color="indigo"
        />
        <StatCard 
          icon={<TrendingUp className="h-5 w-5" />}
          label={t('reports.avg_daily', 'Avg. Daily Views')}
          value={Math.round(stats.totalViews / (reportData.length || 1)).toLocaleString()}
          color="amber"
        />
      </div>

      {/* 📈 Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              {t('reports.traffic_trend', 'Traffic Trend')}
            </h3>
          </div>
          <div className="h-[300px]">
            <Line 
              data={chartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                  x: { grid: { display: false } }
                }
              }} 
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Camera className="h-4 w-4 text-indigo-500" />
              {t('reports.top_5_cameras', 'Top 5 Cameras')}
            </h3>
          </div>
          <div className="h-[300px]">
            <Bar 
              data={barChartData}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                  y: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subValue, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className={`w-12 h-12 rounded-2xl ${colors[color]} border flex items-center justify-center mb-4 transition-all group-hover:scale-110`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-xl font-black text-slate-800 tracking-tight">{value}</h4>
        {subValue && <span className="text-[10px] font-bold text-slate-400">{subValue}</span>}
      </div>
    </div>
  );
};

export default Reports;
