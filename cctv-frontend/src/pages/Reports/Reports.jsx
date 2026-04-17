import React, { useState, useEffect, useMemo } from 'react';
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

// Import Sub-components
import ReportHeader from './components/ReportHeader';
import ReportFilters from './components/ReportFilters';
import ReportStats from './components/ReportStats';
import TrafficTrend from './components/TrafficTrend';
import TechnicalInsights from './components/TechnicalInsights';
import TopCamerasRanking from './components/TopCamerasRanking';
import PeakTimeAnalysis from './components/PeakTimeAnalysis';
import TopVisitorsTable from './components/TopVisitorsTable';

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

  // Logic calculation memoized
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

  const devicePalette = ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6'];
  const browserPalette = ['#3B82F6', '#06B6D4', '#F97316', '#8B5CF6', '#EC4899'];
  const osPalette = ['#0EA5E9', '#22C55E', '#64748B', '#F43F5E', '#FBBF24'];

  const deviceData = useMemo(() => getDoughnutData(enhancedData?.techStats?.devices, t('reports.devices'), devicePalette), [enhancedData, t, i18n.language]);
  const browserData = useMemo(() => getDoughnutData(enhancedData?.techStats?.browsers, t('reports.browsers'), browserPalette), [enhancedData, t, i18n.language]);
  const osData = useMemo(() => getDoughnutData(enhancedData?.techStats?.os, t('reports.os'), osPalette), [enhancedData, t, i18n.language]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <ReportHeader onExport={handleExport} onRefresh={fetchReport} loading={loading} />

      <ReportFilters 
        dateRange={dateRange} setDateRange={setDateRange}
        selectedCameraId={selectedCameraId} setSelectedCameraId={setSelectedCameraId}
        cameras={cameras} customDates={customDates} setCustomDates={setCustomDates}
        onApplyCustom={fetchReport}
      />

      <ReportStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-5">
          <TrafficTrend chartData={chartData} />
          <TechnicalInsights deviceData={deviceData} browserData={browserData} osData={osData} />
        </div>
        <TopCamerasRanking 
          cameraLeaderboard={cameraLeaderboard} 
          topLimit={topLimit} 
          setTopLimit={setTopLimit} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PeakTimeAnalysis hourlyChartData={hourlyChartData} />
        <TopVisitorsTable 
          topVisitors={enhancedData?.topVisitors} 
          currentLocale={currentLocale} 
        />
      </div>
    </div>
  );
};

export default Reports;
