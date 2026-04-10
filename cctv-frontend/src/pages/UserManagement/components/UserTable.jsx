import React from 'react';
import { Edit2, Trash2, Shield, User, Mail, Calendar, Power, RefreshCw, MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

const UserTable = ({ users, loading, onEdit, onDelete, onToggleStatus, onRestore, isArchivedTab }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">{t('common.loading')}...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 bg-slate-50/50">
        <div className="bg-white p-6 rounded-full shadow-sm mb-4">
          <User className="text-slate-300" size={48} />
        </div>
        <h3 className="text-lg font-bold text-slate-700">{t('users.no_users_found')}</h3>
        <p className="text-slate-500 text-sm mt-1">{t('users.no_users_description')}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200">
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('users.table.user')}</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">{t('users.table.role')}</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">{t('users.table.created_at')}</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">{t('users.table.status')}</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${
                    user.role === 'SUPER_ADMIN' ? 'bg-indigo-500' : 
                    user.role === 'ADMIN' ? 'bg-blue-500' : 'bg-slate-400'
                  }`}>
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      {user.firstName} {user.lastName}
                      <span className="text-[10px] text-slate-400 font-medium">(@{user.username})</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Mail size={12} className="shrink-0" />
                      {user.email}
                    </div>
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                <div className="flex items-center gap-1.5">
                  <Shield size={14} className={user.role === 'SUPER_ADMIN' ? 'text-indigo-500' : 'text-slate-400'} />
                  <span className={`text-xs font-bold ${
                    user.role === 'SUPER_ADMIN' ? 'text-indigo-600' : 
                    user.role === 'ADMIN' ? 'text-blue-600' : 'text-slate-600'
                  }`}>
                    {t(`users.roles.${user.role}`)}
                  </span>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-300" />
                  {format(new Date(user.createdAt), 'dd MMM yyyy')}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-center">
                <button 
                  onClick={() => onToggleStatus(user)}
                  disabled={isArchivedTab}
                  className={`relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                    user.isActive 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : 'bg-slate-100 text-slate-500 border border-slate-200 opacity-60'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                  {user.isActive ? t('users.status.active') : t('users.status.inactive')}
                </button>
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {isArchivedTab ? (
                    <button 
                      onClick={() => onRestore(user)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                      title={t('common.restore')}
                    >
                      <RefreshCw size={18} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => onEdit(user)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                      title={t('common.edit')}
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                  
                  <button 
                    onClick={() => onDelete(user)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                    title={t('common.delete')}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                {/* Mobile version of actions if needed could be added here */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
