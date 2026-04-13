import React from 'react';
import { Search, RefreshCw, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const GroupListToolbar = ({ searchTerm, setSearchTerm, onRefresh, loading }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
      
      {/* Search Bar */}
      <div className="relative w-full lg:max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder={t('groups.search_placeholder')}
          className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-50/20 focus:border-indigo-500 transition-all text-sm font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
        <button
          onClick={onRefresh}
          disabled={loading}
          className={`
            p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all
            ${loading ? 'animate-spin text-indigo-600' : ''}
          `}
          title={t('common.refresh')}
        >
          <RefreshCw size={18} />
        </button>
      </div>
    </div>
  );
};

export default GroupListToolbar;