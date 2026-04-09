import React, { Fragment } from 'react';
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react';
import { X } from 'lucide-react';

/**
 * Reusable Base Modal Component using Headless UI
 * @param {boolean} isOpen - สถานะการเปิด/ปิด
 * @param {function} onClose - ฟังก์ชันเรียกเมื่อปิด Modal
 * @param {string} title - หัวข้อ Modal (Optional)
 * @param {string} subtitle - หัวข้อย่อย Modal (Optional)
 * @param {React.ReactNode} children - เนื้อหาภายใน
 * @param {React.ReactNode} footer - ส่วนท้าย (ปุ่ม) (Optional)
 * @param {string} size - ขนาด (sm, md, lg, xl, full) (Default: md)
 * @param {boolean} showCloseButton - แสดงปุ่ม X มุมขวาบน (Default: true)
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  children, 
  footer,
  size = 'md',
  showCloseButton = true
}) => {

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-[95vw]'
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        
        {/* Backdrop (Fade) */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
        </TransitionChild>

        {/* Content Wrapper */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className={`w-full ${sizeClasses[size] || sizeClasses.md} transform overflow-hidden rounded-3xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-100`}>
                
                {/* Header Area */}
                {(title || showCloseButton) && (
                  <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <div>
                      {title && (
                        <DialogTitle as="h3" className="text-lg font-bold text-slate-800 tracking-tight leading-tight">
                          {title}
                        </DialogTitle>
                      )}
                      {subtitle && (
                        <p className="text-xs text-slate-500 font-medium italic mt-0.5">{subtitle}</p>
                      )}
                    </div>
                    
                    {showCloseButton && (
                      <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                )}

                {/* Body Area */}
                <div className="px-6 py-6">
                  {children}
                </div>

                {/* Footer Area */}
                {footer && (
                  <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-50">
                    {footer}
                  </div>
                )}
                
              </DialogPanel>
            </TransitionChild>

          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;