import React from 'react';
import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  CheckCheck,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

const OrderStatusBadge = ({ status, size = 'sm' }) => {
  const configs = {
    PENDING: {
      label: 'Order Placed',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock,
    },
    ACCEPTED: {
      label: 'Accepted by Farmer',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: CheckCircle,
    },
    PROCESSING: {
      label: 'Harvesting & Packing',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: Package,
    },
    READY_FOR_DISPATCH: {
      label: 'Ready for Dispatch',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Package,
    },
    DISPATCHED: {
      label: 'Dispatched / In Transit',
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      icon: Truck,
    },
    DELIVERED: {
      label: 'Delivered',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCheck,
    },
    CANCELLED: {
      label: 'Cancelled',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
    },
    REJECTED: {
      label: 'Rejected',
      color: 'bg-stone-100 text-stone-700 border-stone-300',
      icon: AlertTriangle,
    },
  };

  const config = configs[status] || configs.PENDING;
  const Icon = config.icon;

  const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-xs' : 'px-2.5 py-1 text-[11px]';

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold rounded-full border shadow-sm ${config.color} ${sizeClasses}`}>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;
