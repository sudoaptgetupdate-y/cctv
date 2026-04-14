import React, { Fragment } from 'react';
import { Camera, Save, Activity, Loader2, X, Globe, MapPin, Radio, Volume2, Settings2, ShieldCheck, Cpu, CheckCircle2, Circle } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';

const CameraFormModal = ({ isOpen, onClose, onSubmit, formData, setFormData, editingCamera, groups, isSubmitting, formErrors = {} }) => {
  const { t } = useTranslation();
  const [groupSearch, setGroupSearch] = React.useState('');

  // 🚀 Logic การจัดเรียงและค้นหากลุ่ม
  const sortedAndFilteredGroups = React.useMemo(() => {
    // 1. กรองตามคำค้นหา
    const filtered = groups.filter(g => 
      g.name.toLowerCase().includes(groupSearch.toLowerCase())
    );

    // 2. จัดเรียง: All Camera ก่อน ตามด้วยจำนวนกล้องจากมากไปน้อย
    return [...filtered].sort((a, b) => {
      if (a.name === 'All Camera') return -1;
      if (b.name === 'All Camera') return 1;
      
      const countA = a._count?.cameras || 0;
      const countB = b._count?.cameras || 0;
      return countB - countA;
    });
  }, [groups, groupSearch]);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[1060]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-[2.5rem] bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-4xl flex flex-col border border-slate-100">
                
                {/* 1. Modal Header */}
                <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start shrink-0 relative overflow-hidden">
                  <div className="relative z-10">
                    <Dialog.Title as="h3" className="font-black text-2xl text-slate-800 tracking-tighter flex items-center gap-3">
                      <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
                        <Camera size={24} />
                      </div>
                      <div className="flex flex-col">
                        <span>{editingCamera ? t('cameras.edit_camera') : t('cameras.add_new')}</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{editingCamera ? 'Update Configuration' : 'Register New Device'}</span>
                      </div>
                    </Dialog.Title>
                  </div>
                  <button 
                    type="button"
                    onClick={() => onClose()} 
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100 relative z-20"
                  >
                    <X size={20} strokeWidth={3} />
                  </button>
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
                </div>

                {/* 2. Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white custom-scrollbar max-h-[70vh]">
                  <form id="camera-form" onSubmit={onSubmit} className="space-y-10">
                    
                    {/* Section: Basic Info */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <Globe size={18} className="text-blue-500" />
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">{t('cameras.form.basic_info')}</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">{t('cameras.form.camera_name')}</label>
                          <input 
                            required
                            type="text" 
                            className={`w-full px-5 py-3.5 rounded-2xl border ${formErrors.name ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 text-sm font-bold`}
                            placeholder={t('cameras.form.camera_name_placeholder')}
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                          {formErrors.name && <p className="text-[10px] text-rose-500 font-bold ml-1">{formErrors.name}</p>}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <div className="flex items-center justify-between ml-1 mb-1">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{t('cameras.form.group_zone')}</label>
                            <div className="relative group">
                              <input 
                                type="text"
                                placeholder="Search group..."
                                className="pl-8 pr-3 py-1 text-[10px] font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white"
                                value={groupSearch}
                                onChange={(e) => setGroupSearch(e.target.value)}
                              />
                              <X 
                                size={12} 
                                className={`absolute right-2 top-1.5 text-slate-300 cursor-pointer hover:text-slate-500 transition-colors ${groupSearch ? 'block' : 'hidden'}`}
                                onClick={() => setGroupSearch('')}
                              />
                              <div className="absolute left-2.5 top-1.5 text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-5 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 max-h-[180px] overflow-y-auto custom-scrollbar">
                            {sortedAndFilteredGroups.length > 0 ? (
                              sortedAndFilteredGroups.map(g => {
                                const isSelected = formData.groupIds?.includes(g.id.toString());
                                const isAllCamera = g.name === 'All Camera';
                                
                                return (
                                  <label key={g.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group/item ${isSelected ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500/5' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                                    <input 
                                      type="checkbox" className="sr-only"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        const checked = e.target.checked;
                                        const currentIds = formData.groupIds || [];
                                        if (checked) setFormData({...formData, groupIds: [...currentIds, g.id.toString()]});
                                        else setFormData({...formData, groupIds: currentIds.filter(id => id !== g.id.toString())});
                                      }}
                                    />
                                    <div className="flex flex-col min-w-0 pr-2">
                                      <span className={`text-[10px] font-black truncate ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>{g.name}</span>
                                      {!isAllCamera && g.cameras?.length > 0 && (
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                          {g.cameras.length} Devices
                                        </span>
                                      )}
                                    </div>
                                    {isSelected ? 
                                      <CheckCircle2 size={16} className="text-blue-600 shrink-0" fill="currentColor" fillOpacity={0.1} /> : 
                                      <Circle size={16} className="text-slate-300 shrink-0 group-hover/item:text-blue-300" />
                                    }
                                  </label>
                                );
                              })
                            ) : (
                              <div className="col-span-full py-4 text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('groups.manage.empty_available')}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-2 pt-2">
                          <label className="inline-flex items-center gap-3 cursor-pointer group p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50 hover:bg-blue-50 transition-colors">
                            <div className="relative">
                              <input type="checkbox" className="sr-only peer" checked={formData.isPublic} onChange={(e) => setFormData({...formData, isPublic: e.target.checked})} />
                              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </div>
                            <span className="text-xs font-black text-slate-700 group-hover:text-blue-600 transition-colors uppercase tracking-wider">{t('cameras.form.public_visibility')}</span>
                          </label>
                        </div>
                      </div>
                    </section>

                    {/* Section: Technical Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      
                      {/* Left: Location */}
                      <section className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <MapPin size={18} className="text-emerald-500" />
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">{t('cameras.form.location_map')}</h4>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Latitude</label>
                            <input 
                              required type="number" step="any"
                              className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all bg-emerald-50/10 font-mono text-sm font-bold text-emerald-700"
                              placeholder="13.7563" value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Longitude</label>
                            <input 
                              required type="number" step="any"
                              className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all bg-emerald-50/10 font-mono text-sm font-bold text-emerald-700"
                              placeholder="100.5018" value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                            />
                          </div>
                        </div>
                      </section>

                      {/* Right: Connectivity */}
                      <section className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <Radio size={18} className="text-indigo-500" />
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">{t('cameras.form.streaming_config')}</h4>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">{t('cameras.form.main_rtsp')}</label>
                            <input 
                              required type="text"
                              className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-indigo-50/10 font-mono text-xs font-bold text-indigo-700"
                              placeholder="rtsp://..." value={formData.rtspUrl} onChange={(e) => setFormData({...formData, rtspUrl: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">{t('cameras.form.sub_rtsp')}</label>
                            <input 
                              type="text"
                              className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-indigo-50/10 font-mono text-xs font-bold text-indigo-700"
                              placeholder="Optional sub-stream..." value={formData.subStream} onChange={(e) => setFormData({...formData, subStream: e.target.value})}
                            />
                          </div>
                        </div>
                      </section>
                    </div>

                    {/* Section: Playback & Audio */}
                    <section className="space-y-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                      <div className="flex items-center gap-2 pb-2">
                        <Settings2 size={18} className="text-slate-600" />
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">{t('cameras.form.playback_options')}</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">{t('cameras.form.preferred_stream')}</label>
                          <div className="flex gap-2 p-1 bg-white rounded-2xl border border-slate-200">
                            {['MAIN', 'SUB'].map(type => (
                              <button 
                                key={type} type="button"
                                onClick={() => setFormData({...formData, streamType: type})}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${formData.streamType === type ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                              >
                                {type} STREAM
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">{t('cameras.form.audio_support')}</label>
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, isAudioEnabled: !formData.isAudioEnabled})}
                            className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${formData.isAudioEnabled ? 'bg-white border-emerald-500 shadow-sm' : 'bg-white border-slate-200'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg ${formData.isAudioEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                <Volume2 size={16} />
                              </div>
                              <span className={`text-xs font-black uppercase tracking-tight ${formData.isAudioEnabled ? 'text-emerald-700' : 'text-slate-400'}`}>
                                {formData.isAudioEnabled ? t('cameras.form.enable_audio') : t('cameras.form.mute_audio')}
                              </span>
                            </div>
                            <div className={`w-9 h-5 flex items-center rounded-full p-1 transition-all ${formData.isAudioEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                              <div className={`bg-white w-3 h-3 rounded-full transform transition-all ${formData.isAudioEnabled ? 'translate-x-4' : ''}`}></div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </section>

                    {/* Section: Performance & Transcoding */}
                    <section className={`space-y-6 p-6 rounded-[2.5rem] border-2 transition-all ${formData.isTranscodeEnabled ? 'bg-amber-50/30 border-amber-200 shadow-xl shadow-amber-500/5' : 'bg-slate-50/30 border-slate-100'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-2xl transition-colors ${formData.isTranscodeEnabled ? 'bg-amber-100 text-amber-600 shadow-sm' : 'bg-slate-200 text-slate-500'}`}>
                            <Cpu size={20} />
                          </div>
                          <div>
                            <h4 className={`text-xs font-black uppercase tracking-widest ${formData.isTranscodeEnabled ? 'text-amber-800' : 'text-slate-600'}`}>{t('cameras.form.performance_mode')}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{t('cameras.form.enable_transcoding')}</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, isTranscodeEnabled: !formData.isTranscodeEnabled})}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${formData.isTranscodeEnabled ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-slate-200 text-slate-500'}`}
                        >
                          {formData.isTranscodeEnabled ? 'Activated' : 'Off'}
                        </button>
                      </div>

                      {formData.isTranscodeEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                          {/* Main Config */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[9px] font-black text-amber-600 uppercase tracking-widest">
                              <ShieldCheck size={14} /> {t('cameras.form.main_stream_config')}
                            </div>
                            <div className="space-y-3">
                              <select 
                                className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all bg-white text-xs font-bold"
                                value={formData.resolution} onChange={(e) => setFormData({...formData, resolution: e.target.value})}
                              >
                                <option value="">{t('cameras.form.original')}</option>
                                <option value="3840x2160">4K (2160p)</option>
                                <option value="1920x1080">Full HD (1080p)</option>
                                <option value="1280x720">HD (720p)</option>
                              </select>
                              <div className="relative">
                                <input 
                                  type="number" className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all bg-white text-xs font-bold"
                                  placeholder="FPS (Default: 15)" value={formData.fps} onChange={(e) => setFormData({...formData, fps: e.target.value})}
                                />
                                <span className="absolute right-4 top-2.5 text-[9px] font-black text-amber-400 uppercase h-full flex items-center">FPS</span>
                              </div>
                            </div>
                          </div>

                          {/* Sub Config */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[9px] font-black text-amber-600 uppercase tracking-widest">
                              <Activity size={14} /> {t('cameras.form.sub_stream_config')}
                            </div>
                            <div className="space-y-3">
                              <select 
                                className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all bg-white text-xs font-bold"
                                value={formData.subResolution} onChange={(e) => setFormData({...formData, subResolution: e.target.value})}
                              >
                                <option value="">{t('cameras.form.original')}</option>
                                <option value="1280x720">HD (720p)</option>
                                <option value="704x576">D1 Standard</option>
                                <option value="640x480">VGA Class</option>
                              </select>
                              <div className="relative">
                                <input 
                                  type="number" className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all bg-white text-xs font-bold"
                                  placeholder="FPS (Default: 10)" value={formData.subFps} onChange={(e) => setFormData({...formData, subFps: e.target.value})}
                                />
                                <span className="absolute right-4 top-2.5 text-[9px] font-black text-amber-400 uppercase h-full flex items-center">FPS</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </section>

                  </form>
                </div>

                {/* 3. Modal Footer */}
                <div className="p-6 md:px-10 md:py-8 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between">
                   <button 
                     type="button"
                     onClick={onClose} 
                     className="px-6 py-2.5 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-all"
                   >
                     {t('common.cancel')}
                   </button>
                   
                   <button 
                     type="button"
                     onClick={onSubmit} 
                     disabled={isSubmitting || !!formErrors.name}
                     className="px-12 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-20 disabled:grayscale flex items-center gap-3 active:scale-95"
                   >
                     {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={18} strokeWidth={3} />} 
                     <span>{isSubmitting ? t('common.saving') : (editingCamera ? t('common.save_changes') : t('common.save'))}</span>
                   </button>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CameraFormModal;