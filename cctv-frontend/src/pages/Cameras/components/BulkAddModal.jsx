import React, { useState, useMemo, Fragment } from 'react';
import { X, Clipboard, Trash2, CheckCircle2, AlertCircle, Info, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const DEFAULT_LAT = 13.7563;
const DEFAULT_LONG = 100.5018;

const BulkAddModal = ({ isOpen, onClose, onConfirm, isSubmitting, groups }) => {
  const { t } = useTranslation();
  const [rawText, setRawText] = useState('');
  const [step, setStep] = useState(1); // 1: Input, 2: Preview
  const [selectedGroupId, setSelectedGroupId] = useState('none');

  const parsedData = useMemo(() => {
    if (!rawText.trim()) return [];

    const lines = rawText.trim().split('\n');
    const nameCounts = {};
    const urlCounts = {};

    // First pass
    const initialParsed = lines.map((line, index) => {
      let parts = [];
      if (line.includes('\t')) {
        parts = line.split('\t');
      } else {
        parts = line.split(',');
      }

      const name = parts[0]?.trim() || '';
      const rtspUrl = parts[4]?.trim() || '';
      
      if (name) nameCounts[name] = (nameCounts[name] || 0) + 1;
      if (rtspUrl) urlCounts[rtspUrl] = (urlCounts[rtspUrl] || 0) + 1;

      return {
        id: index,
        name,
        groupName: parts[1]?.trim() || '',
        latitude: parts[2]?.trim() || '',
        longitude: parts[3]?.trim() || '',
        rtspUrl,
        subStream: parts[5]?.trim() || '',
      };
    });

    // Second pass
    return initialParsed.map(item => {
      const errors = [];
      const warnings = [];

      if (!item.name) errors.push("Missing Name");
      if (!item.rtspUrl) errors.push("Missing RTSP URL");

      // Validate Lat/Long only if provided (otherwise default will be used)
      if (item.latitude && isNaN(parseFloat(item.latitude))) errors.push("Invalid Lat");
      if (item.longitude && isNaN(parseFloat(item.longitude))) errors.push("Invalid Long");

      if (item.name && nameCounts[item.name] > 1) errors.push("Duplicate Name in list");
      if (item.rtspUrl && urlCounts[item.rtspUrl] > 1) warnings.push("Duplicate URL in list");

      return {
        ...item,
        isValid: errors.length === 0,
        errors,
        warnings
      };
    });
  }, [rawText]);

  const handleRemoveRow = (id) => {
    const lines = rawText.trim().split('\n');
    const newLines = lines.filter((_, idx) => idx !== id);
    setRawText(newLines.join('\n'));
  };

  const handleConfirm = () => {
    const validRows = parsedData.filter(d => d.isValid);
    const hasErrors = parsedData.some(d => d.errors.length > 0);

    if (validRows.length === 0) {
      return toast.error("No valid camera data found");
    }

    if (hasErrors) {
      return toast.error("Please remove or fix invalid items before importing");
    }

    const finalData = validRows.map(row => {
      const targetGroupName = row.groupName.trim();
      const foundGroup = groups.find(g => g.name.toLowerCase() === targetGroupName.toLowerCase());
      
      return {
        name: row.name,
        // 🚀 Use defaults if empty
        latitude: row.latitude ? parseFloat(row.latitude) : DEFAULT_LAT,
        longitude: row.longitude ? parseFloat(row.longitude) : DEFAULT_LONG,
        rtspUrl: row.rtspUrl,
        subStream: row.subStream || null,
        targetGroupName: targetGroupName || 'All Cameras',
        groupIds: foundGroup ? [foundGroup.id] : [], 
        status: 'ACTIVE',
        isPublic: true
      };
    });

    onConfirm(finalData);
  };

  const handleCopyExample = () => {
    const example = "Engineer-Office, Main Zone, 8.3993, 99.9699, rtsp://..., rtsp://...\nMain-Gate, , , , rtsp://... (Default Pos)";
    navigator.clipboard.writeText(example);
    toast.success(t('common.copied'));
  };

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
              <Dialog.Panel className="relative transform overflow-hidden rounded-[2.5rem] bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-5xl flex flex-col border border-slate-100">
                
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start shrink-0 relative overflow-hidden">
                  <div className="relative z-10">
                    <Dialog.Title as="h3" className="font-black text-2xl text-slate-800 tracking-tighter flex items-center gap-3">
                      <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                        <Clipboard size={24} />
                      </div>
                      <div className="flex flex-col">
                        <span>{t('cameras.bulk.title')}</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{t('cameras.bulk.subtitle')}</span>
                      </div>
                    </Dialog.Title>
                  </div>
                  <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all relative z-20">
                    <X size={20} strokeWidth={3} />
                  </button>
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white custom-scrollbar max-h-[70vh]">
                  {step === 1 ? (
                    <div className="space-y-6 animate-in fade-in duration-500">
                      <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 relative overflow-hidden">
                        <div className="relative z-10 flex items-start gap-4">
                          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                            <Info size={20} />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div>
                              <h4 className="text-sm font-black text-indigo-900 uppercase tracking-wider">{t('cameras.bulk.format_title')}</h4>
                              <p className="text-[11px] text-indigo-700/70 font-bold mt-1">
                                {t('cameras.bulk.format_desc')}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 py-1">
                              {[
                                t('cameras.bulk.guide_name'),
                                t('cameras.bulk.guide_rtsp'),
                                t('cameras.bulk.guide_group'),
                                t('cameras.bulk.guide_pos'),
                                t('cameras.bulk.guide_sub')
                              ].map((guide, i) => (
                                <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-indigo-800/80">
                                  <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                                  {guide}
                                </div>
                              ))}
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-indigo-100/50 font-mono text-[11px] text-indigo-900 leading-relaxed shadow-inner">
                              Engineer-Office, Main Zone, 8.3993, 99.9699, rtsp://..., rtsp://...<br/>
                              Main-Gate, , , , rtsp://... <span className="text-slate-400 italic">(Empty Pos = 13.75, 100.50)</span>
                            </div>
                            <button onClick={handleCopyExample} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                              <Clipboard size={14} /> {t('cameras.bulk.copy_example')}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">{t('cameras.bulk.paste_label')}</label>
                        <textarea
                          value={rawText}
                          onChange={(e) => setRawText(e.target.value)}
                          placeholder="Name, Group, Lat, Long, RTSP_Main, RTSP_Sub..."
                          className="w-full h-64 p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 transition-all font-mono text-sm resize-none"
                        ></textarea>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="text-emerald-500" size={18} />
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">{t('cameras.bulk.preview_list')}</h4>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-lg">
                          {parsedData.length} {t('cameras.bulk.items')}
                        </span>
                      </div>
                      
                      <div className="overflow-x-auto border border-slate-100 rounded-[2rem] shadow-sm">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4">Name</th>
                              <th className="px-6 py-4">Group</th>
                              <th className="px-6 py-4">Position</th>
                              <th className="px-6 py-4">RTSP Main</th>
                              <th className="px-4 py-4 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-600 bg-white">
                            {parsedData.map((row) => (
                              <tr key={row.id} className={`hover:bg-slate-50/50 transition-colors ${!row.isValid ? 'bg-rose-50/30' : ''}`}>
                                <td className="px-6 py-4">
                                  {row.isValid ? (
                                    row.warnings.length > 0 ? <AlertCircle size={18} className="text-amber-500" /> : <CheckCircle2 size={18} className="text-emerald-500" />
                                  ) : (
                                    <AlertCircle size={18} className="text-rose-500" />
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                    <span className="truncate max-w-[150px]">{row.name || '-'}</span>
                                    {row.errors.map((err, i) => <span key={i} className="text-[8px] text-rose-500 uppercase font-black">{err}</span>)}
                                    {row.warnings.map((warn, i) => <span key={i} className="text-[8px] text-amber-500 uppercase font-black">{warn}</span>)}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${row.groupName ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {row.groupName || 'All Cameras'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col font-mono text-[10px]">
                                    <span className={row.latitude ? 'text-slate-600' : 'text-indigo-400 font-bold'}>{row.latitude || DEFAULT_LAT}</span>
                                    <span className={row.longitude ? 'text-slate-600' : 'text-indigo-400 font-bold'}>{row.longitude || DEFAULT_LONG}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 truncate max-w-[150px] font-mono text-[10px] text-slate-400">{row.rtspUrl || '-'}</td>
                                <td className="px-4 py-4 text-center">
                                  <button onClick={() => handleRemoveRow(row.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50">
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 md:px-10 md:py-8 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between">
                  {step === 1 ? (
                    <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-all">
                      {t('common.cancel')}
                    </button>
                  ) : (
                    <button type="button" onClick={() => setStep(1)} className="px-6 py-2.5 text-indigo-600 font-black text-xs uppercase tracking-widest hover:bg-indigo-50 rounded-xl transition-all flex items-center gap-2">
                      <ArrowLeft size={16} /> {t('common.back')}
                    </button>
                  )}

                  <div className="flex items-center gap-4">
                    {step === 1 ? (
                      <button 
                        type="button" onClick={() => rawText.trim() && setStep(2)} disabled={!rawText.trim()}
                        className="px-10 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-20 flex items-center gap-3 active:scale-95"
                      >
                        <span>{t('cameras.bulk.next_preview')}</span>
                        <ArrowRight size={18} strokeWidth={3} />
                      </button>
                    ) : (
                      <button 
                        type="button" onClick={handleConfirm} disabled={isSubmitting || parsedData.filter(d => d.isValid).length === 0}
                        className="px-12 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-20 flex items-center gap-3 active:scale-95"
                      >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 size={18} strokeWidth={3} />} 
                        <span>{isSubmitting ? t('common.saving') : t('cameras.bulk.confirm')}</span>
                      </button>
                    )}
                  </div>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default BulkAddModal;
