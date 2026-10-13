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

const OrderTimeline = ({ currentStatus, statusHistory = [] }) => {
  const steps = [
    { key: 'PENDING', label: 'Order Placed', desc: 'Order placed & awaiting confirmation' },
    { key: 'ACCEPTED', label: 'Accepted', desc: 'Farmer confirmed order availability' },
    { key: 'PROCESSING', label: 'Processing', desc: 'Harvesting & organic packing in progress' },
    { key: 'READY_FOR_DISPATCH', label: 'Ready', desc: 'Packaged & staged for transit' },
    { key: 'DISPATCHED', label: 'Dispatched', desc: 'Out for delivery to your address' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Handed over at your doorstep' },
  ];

  const isTerminalFailure = currentStatus === 'CANCELLED' || currentStatus === 'REJECTED';

  const getStepIndex = (status) => {
    return steps.findIndex((s) => s.key === status);
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm">
      <h3 className="text-base font-bold text-stone-900 mb-6 flex items-center justify-between">
        <span>Order Fulfillment Lifecycle</span>
        {isTerminalFailure && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
            {currentStatus}
          </span>
        )}
      </h3>

      {isTerminalFailure ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">This order was {currentStatus.toLowerCase()}</h4>
            <p className="text-xs text-rose-700 mt-0.5">
              The order lifecycle has closed. Inventory has been restored to the producer's catalog.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Desktop timeline horizontal */}
          <div className="hidden md:grid grid-cols-6 gap-2">
            {steps.map((step, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <div key={step.key} className="flex flex-col items-center text-center relative group">
                  {/* Connector bar */}
                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute top-4 left-1/2 w-full h-1 -z-0 transition-colors ${
                        idx < currentIndex ? 'bg-brand-600' : 'bg-stone-200'
                      }`}
                    />
                  )}

                  {/* Step Dot */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs z-10 transition-all ${
                      isPast
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                        : isCurrent
                        ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-md shadow-brand-600/40 animate-pulse'
                        : 'bg-stone-100 text-stone-400 border border-stone-300'
                    }`}
                  >
                    {isPast ? <CheckCheck className="w-4 h-4" /> : idx + 1}
                  </div>

                  <p className={`text-xs font-bold mt-2.5 ${isCurrent || isPast ? 'text-stone-900' : 'text-stone-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-stone-500 mt-0.5 leading-snug line-clamp-2 px-1">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Mobile timeline vertical */}
          <div className="md:hidden space-y-4">
            {steps.map((step, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <div key={step.key} className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      isPast
                        ? 'bg-brand-600 text-white'
                        : isCurrent
                        ? 'bg-brand-600 text-white ring-2 ring-brand-200 animate-pulse'
                        : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    {isPast ? '✓' : idx + 1}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${isCurrent || isPast ? 'text-stone-900' : 'text-stone-400'}`}>
                      {step.label}
                    </h4>
                    <p className="text-[11px] text-stone-500">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Audit History Logs */}
      {statusHistory.length > 0 && (
        <div className="mt-8 pt-6 border-t border-stone-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
            Activity History & Status Notes
          </h4>
          <div className="space-y-2">
            {statusHistory.map((h, i) => (
              <div key={i} className="flex items-start gap-3 text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-bold text-stone-800">{h.status}</span>
                  {h.notes && <span className="text-stone-600 ml-2">— {h.notes}</span>}
                  <span className="text-stone-400 text-[10px] block mt-0.5">
                    Updated by {h.changedByName || 'System'} at {new Date(h.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTimeline;
