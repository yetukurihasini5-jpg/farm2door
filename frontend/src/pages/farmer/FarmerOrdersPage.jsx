import React, { useState, useEffect } from 'react';
import {
  Package,
  Calendar,
  User,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  ArrowRight,
  Filter,
  Check,
  Ban,
  MessageSquare,
} from 'lucide-react';
import { farmerService } from '../../services/farmerService';
import { useToast } from '../../context/ToastContext';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import { LoadingSpinner, ConfirmationModal } from '../../components/common/LoadingSpinner';

const STATUS_TABS = [
  { label: 'All Orders', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Ready for Dispatch', value: 'READY_FOR_DISPATCH' },
  { label: 'Dispatched', value: 'DISPATCHED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Rejected / Cancelled', value: 'CANCELLED' },
];

const FarmerOrdersPage = () => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Status Action Modal
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await farmerService.getOrders(selectedStatus || null, page, 10);
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      addToast('Failed to fetch incoming orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, page]);

  const openStatusModal = (order, nextStatus) => {
    setSelectedOrder(order);
    setTargetStatus(nextStatus);
    setStatusNote('');
    setActionModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !targetStatus) return;
    try {
      setSubmittingStatus(true);
      await farmerService.updateOrderStatus(selectedOrder.id, targetStatus, statusNote.trim() || null);
      addToast(`Order #${selectedOrder.orderNumber} updated to ${targetStatus}`, 'success');
      setActionModalOpen(false);
      fetchOrders();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update order status', 'error');
    } finally {
      setSubmittingStatus(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          Incoming Consumer Orders
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Review, accept, pack, and advance the status of fresh farm direct consumer orders.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setSelectedStatus(tab.value);
              setPage(0);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              selectedStatus === tab.value
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white border border-stone-200/80 text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <LoadingSpinner text="Loading orders..." />
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200/60 flex items-center justify-center text-brand-700 font-bold">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-stone-900">
                        #{ord.orderNumber}
                      </span>
                      <OrderStatusBadge status={ord.status} />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-lg font-black text-stone-900">
                    ₹{(ord.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    COD Payment
                  </span>
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                {/* Consumer & Address info */}
                <div className="space-y-2 text-xs text-stone-600">
                  <div className="flex items-center gap-2 text-stone-800 font-bold">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span>{ord.consumerName || 'Consumer Customer'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-600">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>{ord.shippingPhone || 'Contact phone provided'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-stone-600">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      {ord.shippingAddressLine1}
                      {ord.shippingAddressLine2 ? `, ${ord.shippingAddressLine2}` : ''}, {ord.shippingCity},{' '}
                      {ord.shippingState} - {ord.shippingPostalCode}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="bg-stone-50/70 rounded-2xl p-4 border border-stone-100">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                    Ordered Items
                  </h4>
                  <div className="space-y-2">
                    {ord.items && ord.items.map((it) => (
                      <div key={it.id} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-800">
                          {it.productTitle}{' '}
                          <span className="text-stone-400 font-normal">
                            × {it.quantity} {it.unit || ''}
                          </span>
                        </span>
                        <span className="font-bold text-stone-900">
                          ₹{(it.totalPrice || (it.unitPrice * it.quantity)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-stone-400 italic">
                  {ord.notes ? `Note: "${ord.notes}"` : 'Direct farmer-to-door fulfillment'}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {ord.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => openStatusModal(ord, 'ACCEPTED')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Accept Order
                      </button>
                      <button
                        onClick={() => openStatusModal(ord, 'REJECTED')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Reject Order
                      </button>
                    </>
                  )}

                  {ord.status === 'ACCEPTED' && (
                    <button
                      onClick={() => openStatusModal(ord, 'PROCESSING')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Start Processing & Packing
                    </button>
                  )}

                  {ord.status === 'PROCESSING' && (
                    <button
                      onClick={() => openStatusModal(ord, 'READY_FOR_DISPATCH')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-colors"
                    >
                      <Package className="w-3.5 h-3.5" />
                      Mark Ready for Dispatch
                    </button>
                  )}

                  {ord.status === 'READY_FOR_DISPATCH' && (
                    <button
                      onClick={() => openStatusModal(ord, 'DISPATCHED')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Dispatch Produce
                    </button>
                  )}

                  {ord.status === 'DISPATCHED' && (
                    <button
                      onClick={() => openStatusModal(ord, 'DELIVERED')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Confirm Delivered & Paid (COD)
                    </button>
                  )}

                  {ord.status === 'DELIVERED' && (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Order Fulfilled & Complete
                    </span>
                  )}

                  {(ord.status === 'CANCELLED' || ord.status === 'REJECTED') && (
                    <span className="text-xs font-semibold text-rose-500">
                      Closed ({ord.status})
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 bg-white rounded-2xl border border-stone-200/80 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No orders matching this filter</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1">
            {selectedStatus ? `No orders found with status "${selectedStatus}".` : 'You do not have any incoming orders right now.'}
          </p>
        </div>
      )}

      {/* Advance Status Modal */}
      {actionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-100">
            <h3 className="text-lg font-black text-stone-900 mb-1">
              Advance Order #{selectedOrder?.orderNumber}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Transition status to <strong className="text-brand-700">{targetStatus}</strong>.
            </p>

            <div className="space-y-3 mb-6">
              <label className="block text-xs font-bold text-stone-700">
                Fulfillment Note / Tracking Remark (Optional)
              </label>
              <textarea
                rows="3"
                placeholder="e.g. Harvested this morning, packed in eco-friendly crates..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingStatus}
                onClick={handleUpdateStatus}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-md shadow-brand-600/20 disabled:opacity-50"
              >
                {submittingStatus ? 'Updating...' : `Confirm ${targetStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerOrdersPage;
