import React from 'react';
import { Doughnut } from 'react-chartjs-2';

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

export default TechnicalCard;
