import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg, duration) => showToast(msg, 'success', duration), [showToast]);
  const error = useCallback((msg, duration) => showToast(msg, 'error', duration), [showToast]);
  const info = useCallback((msg, duration) => showToast(msg, 'info', duration), [showToast]);
  const warning = useCallback((msg, duration) => showToast(msg, 'warning', duration), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, addToast: showToast, success, error, info, warning }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          let bgClass = 'bg-stone-900 text-white';
          let icon = <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />;

          if (t.type === 'success') {
            bgClass = 'bg-emerald-800 text-emerald-50 border border-emerald-700 shadow-emerald-950/20';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />;
          } else if (t.type === 'error') {
            bgClass = 'bg-rose-900 text-rose-50 border border-rose-800 shadow-rose-950/20';
            icon = <AlertCircle className="w-5 h-5 text-rose-300 flex-shrink-0" />;
          } else if (t.type === 'warning') {
            bgClass = 'bg-amber-800 text-amber-50 border border-amber-700 shadow-amber-950/20';
            icon = <AlertTriangle className="w-5 h-5 text-amber-300 flex-shrink-0" />;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl transition-all duration-300 transform translate-y-0 ${bgClass}`}
            >
              {icon}
              <p className="text-sm font-medium flex-1 pt-0.5 leading-snug">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="text-white/60 hover:text-white transition-colors p-0.5 rounded-lg"
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
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
