import React from 'react';
import { Line } from 'react-chartjs-2';
import { TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TrafficTrend = ({ chartData }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-6">
        <TrendingUp className="text-indigo-500" size={16} /> {t('reports.traffic_trend')}
      </h3>
      <div className="h-[320px]">
        <Line 
          data={chartData} 
          options={{ 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { 
              legend: { 
                position: 'top', 
                align: 'end', 
                labels: { boxWidth: 6, usePointStyle: true, font: { size: 10, weight: 'bold' } } 
              } 
            }, 
            scales: { 
              y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } }, 
              x: { grid: { display: false }, ticks: { font: { size: 10 } } } 
            } 
          }} 
        />
      </div>
    </div>
  );
};

export default TrafficTrend;
