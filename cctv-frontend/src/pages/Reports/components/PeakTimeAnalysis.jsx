import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PeakTimeAnalysis = ({ hourlyChartData }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-6">
        <Clock className="text-indigo-500" size={16} /> {t('reports.peak_time_analysis')}
      </h3>
      <div className="h-[200px]">
        <Bar 
          data={hourlyChartData} 
          options={{ 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { legend: { display: false } }, 
            scales: { 
              y: { display: false }, 
              x: { grid: { display: false }, ticks: { font: { size: 9, weight: 'bold' } } } 
            } 
          }} 
        />
      </div>
    </div>
  );
};

export default PeakTimeAnalysis;
