import React from 'react';
import { Sprout } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-stone-500">
      <div className="relative">
        <div className={`${sizes[size]} rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin`} />
        <Sprout className="w-4 h-4 text-brand-600 absolute inset-0 m-auto" />
      </div>
      {text && <p className="text-sm font-medium animate-pulse">{text}</p>}
    </div>
  );
};

export const Badge = ({ children, variant = 'neutral', size = 'sm', className = '' }) => {
  const variants = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    neutral: 'bg-stone-100 text-stone-700 border-stone-200',
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5 font-medium',
    sm: 'text-xs px-2.5 py-1 font-semibold',
    md: 'text-sm px-3 py-1 font-semibold',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${variants[variant] || variants.neutral} ${sizes[size] || sizes.sm} ${className}`}>
      {children}
    </span>
  );
};

export const EmptyState = ({
  icon: Icon = Sprout,
  title = 'No items found',
  description = 'There are no records to display at this time.',
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border border-stone-200/80 shadow-sm max-w-lg mx-auto my-6">
      <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-400 mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-stone-800 mb-1">{title}</h3>
      <p className="text-sm text-stone-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {action}
    </div>
  );
};

export const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-100 transform scale-100 transition-all">
        <h3 className="text-lg font-bold text-stone-900 mb-2">{title}</h3>
        <p className="text-sm text-stone-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition-colors ${
              isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-600 hover:bg-brand-700'
            }`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
