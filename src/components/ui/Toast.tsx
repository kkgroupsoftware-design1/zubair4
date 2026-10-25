import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  theme?: 'light' | 'dark';
}

interface ToastContextType {
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>(() => {
    return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') ||
      (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark =
        document.documentElement.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark';
      setActiveTheme(isDark ? 'dark' : 'light');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  const showToast = useCallback((title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    const currentTheme =
      (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') ||
      (document.documentElement.classList.contains('dark') ? 'dark' : 'light');

    setToasts((prev) => [...prev, { id, title, message, type, theme: currentTheme }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0 z-[9999] flex flex-col items-center sm:items-end gap-2.5 w-[calc(100%-2rem)] sm:w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          const isToastDark = toast.theme ? toast.theme === 'dark' : activeTheme === 'dark';

          return (
            <div
              key={toast.id}
              className={`w-full pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl border backdrop-blur-xl transition-all animate-in fade-in slide-in-from-top-4 duration-300 ${
                isToastDark
                  ? toast.type === 'success'
                    ? 'bg-[#061912]/95 text-white border-emerald-500/40 shadow-[0_15px_35px_rgba(0,0,0,0.6)]'
                    : toast.type === 'error'
                    ? 'bg-[#1C0910]/95 text-white border-rose-500/40 shadow-[0_15px_35px_rgba(0,0,0,0.6)]'
                    : 'bg-[#07192E]/95 text-white border-blue-500/40 shadow-[0_15px_35px_rgba(0,0,0,0.6)]'
                  : toast.type === 'success'
                  ? 'bg-white/95 text-slate-900 border-emerald-200 shadow-[0_15px_35px_rgba(16,185,129,0.12)]'
                  : toast.type === 'error'
                  ? 'bg-white/95 text-slate-900 border-rose-200 shadow-[0_15px_35px_rgba(244,63,94,0.12)]'
                  : 'bg-white/95 text-slate-900 border-blue-200 shadow-[0_15px_35px_rgba(21,94,239,0.12)]'
              }`}
            >
              {toast.type === 'success' && (
                <div
                  className={`w-8 h-8 rounded-xl ${
                    isToastDark
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  } flex items-center justify-center shrink-0`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              {toast.type === 'error' && (
                <div
                  className={`w-8 h-8 rounded-xl ${
                    isToastDark
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-rose-50 text-rose-600 border border-rose-200'
                  } flex items-center justify-center shrink-0`}
                >
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
              {toast.type === 'info' && (
                <div
                  className={`w-8 h-8 rounded-xl ${
                    isToastDark
                      ? 'bg-blue-500/20 text-sky-300 border border-blue-500/30'
                      : 'bg-blue-50 text-blue-600 border border-blue-200'
                  } flex items-center justify-center shrink-0`}
                >
                  <Info className="w-5 h-5" />
                </div>
              )}

              <div className="flex-1 min-w-0 pt-0.5">
                <h4
                  className={`text-xs sm:text-sm font-bold tracking-tight ${
                    isToastDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {toast.title}
                </h4>
                <p
                  className={`text-[11px] sm:text-xs mt-0.5 leading-relaxed ${
                    isToastDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {toast.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className={`p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  isToastDark
                    ? 'text-slate-400 hover:text-white hover:bg-white/10'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
