import React, { useState } from 'react';
import { User, Mail, Shield, Lock, Eye, EyeOff, Check, X, AlertCircle, Power } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/Modal';

const UserFormModal = ({ 
  isOpen, 
  onClose, 
  isEditing, 
  formData, 
  handleInputChange, 
  handleSubmit, 
  generatedUsername, 
  passwordRules 
}) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getPasswordStrength = () => {
    if (!formData.password) return 0;
    return passwordRules.filter(rule => rule.regex.test(formData.password)).length;
  };

  const strength = getPasswordStrength();

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditing ? t('users.edit_title') : t('users.add_title')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User size={16} className="text-slate-400" />
              {t('users.form.first_name')}
            </label>
            <input 
              type="text" 
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              placeholder={t('users.form.first_name_placeholder')}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User size={16} className="text-slate-400" />
              {t('users.form.last_name')}
            </label>
            <input 
              type="text" 
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              placeholder={t('users.form.last_name_placeholder')}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none"
            />
          </div>
        </div>

        {/* Email & Username */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Mail size={16} className="text-slate-400" />
              {t('users.form.email')}
            </label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isEditing}
              placeholder="example@domain.com"
              className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none ${isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Shield size={16} className="text-slate-400" />
              {t('users.form.username')}
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={isEditing ? formData.username : generatedUsername}
                disabled
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm outline-none cursor-not-allowed font-mono"
              />
              {!isEditing && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Auto</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Role & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Shield size={16} className="text-slate-400" />
              {t('users.form.role')}
            </label>
            <select 
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none appearance-none"
            >
              <option value="EMPLOYEE">{t('users.roles.EMPLOYEE')}</option>
              <option value="ADMIN">{t('users.roles.ADMIN')}</option>
              <option value="SUPER_ADMIN">{t('users.roles.SUPER_ADMIN')}</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Power size={16} className="text-slate-400" />
              {t('users.form.status')}
            </label>
            <div className="flex items-center h-[46px]">
              <label className="relative inline-flex items-center cursor-pointer group">
                <input 
                  type="checkbox" 
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-bold text-slate-600 group-hover:text-blue-600 transition-colors">
                  {formData.isActive ? t('users.status.active') : t('users.status.inactive')}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-200 pb-2 mb-2">
            <Lock size={16} className="text-blue-500" />
            {isEditing ? t('users.form.change_password_title') : t('users.form.password_title')}
            {isEditing && <span className="text-[10px] font-medium text-slate-400 ml-auto italic">*{t('users.form.password_optional')}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-slate-500">{t('users.form.password')}</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!isEditing}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-slate-500">{t('users.form.confirm_password')}</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isEditing || formData.password}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none"
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-1 duration-300">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('users.form.password_strength')}</span>
                <span className={`text-[10px] font-bold uppercase ${
                  strength <= 2 ? 'text-red-500' : strength <= 4 ? 'text-orange-500' : 'text-emerald-500'
                }`}>
                  {strength <= 2 ? t('users.strength.weak') : strength <= 4 ? t('users.strength.medium') : t('users.strength.strong')}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      idx <= strength 
                        ? (strength <= 2 ? 'bg-red-500' : strength <= 4 ? 'bg-orange-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]') 
                        : 'bg-slate-200'
                    }`}
                  ></div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 mt-3 border-t border-slate-200/60 pt-3">
                {passwordRules.map((rule) => {
                  const isMet = rule.regex.test(formData.password);
                  return (
                    <div key={rule.id} className="flex items-center gap-2">
                      <div className={`shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                        isMet ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'
                      }`}>
                        {isMet ? <Check size={10} strokeWidth={4} /> : <AlertCircle size={10} />}
                      </div>
                      <span className={`text-[10px] font-bold transition-colors ${isMet ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {rule.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
          >
            {t('common.cancel')}
          </button>
          <button 
            type="submit"
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-lg shadow-blue-500/20"
          >
            {isEditing ? t('common.save_changes') : t('common.create')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;
