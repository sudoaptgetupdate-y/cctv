import React from 'react';
import { Eye, Users, MapPin, Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StatCard from './StatCard';

const ReportStats = ({ stats }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        icon={<Eye size={18} />} 
        label={t('reports.total_views')} 
        value={stats.totalViews.toLocaleString()} 
        trend={stats.trends?.views?.growth} 
        color="indigo" 
      />
      <StatCard 
        icon={<Users size={18} />} 
        label={t('reports.unique_visitors')} 
        value={stats.uniqueVisitors.toLocaleString()} 
        trend={stats.trends?.visitors?.growth} 
        color="emerald" 
      />
      <StatCard 
        icon={<MapPin size={18} />} 
        label={t('reports.uptime')} 
        value={`${stats.availability}%`} 
        color="blue" 
        subValue={stats.availability > 95 ? t('reports.uptime_excellent') : t('reports.uptime_check')} 
      />
      <StatCard 
        icon={<Camera size={18} />} 
        label={t('reports.top_camera')} 
        value={stats.topCamera} 
        subValue={`${stats.maxViews.toLocaleString()} ${t('reports.times')}`} 
        color="amber" 
      />
    </div>
  );
};

export default ReportStats;
