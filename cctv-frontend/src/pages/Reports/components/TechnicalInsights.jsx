import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TechnicalCard from './TechnicalCard';

const TechnicalInsights = ({ deviceData, browserData, osData }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <TechnicalCard title={t('reports.devices')} data={deviceData} icon={<Globe className="text-indigo-500" size={14} />} />
      <TechnicalCard title={t('reports.browsers')} data={browserData} icon={<Globe className="text-emerald-500" size={14} />} />
      <TechnicalCard title={t('reports.os')} data={osData} icon={<Globe className="text-amber-500" size={14} />} />
    </div>
  );
};

export default TechnicalInsights;
