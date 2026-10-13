import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Package,
  MapPin,
  Clock,
  ArrowLeft,
  XCircle,
  Star,
  CheckCircle2,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import OrderTimeline from '../../components/orders/OrderTimeline';
import ReviewModal from '../../components/feedback/ReviewModal';
import Button from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Review modal state
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderById(id);
      setOrder(data);
    } catch (err) {
      console.error('Failed to load order details:', err);
      error(err.message || 'Could not retrieve order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      error('Please provide a cancellation reason');
      return;
    }

    try {
      setCancelling(true);
      const updated = await orderService.cancelOrder(order.id, cancelReason.trim());
      setOrder(updated);
      setCancelModalOpen(false);
      success('Order cancelled successfully. Producer inventory has been restored.');
    } catch (err) {
      error(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving order specifications..." />;
  }

  if (!order) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-stone-800">Order Record Not Found</h2>
        <Link to="/consumer/orders" className="text-xs font-bold text-brand-600 hover:underline">
          Return to My Orders
        </Link>
      </div>
    );
  }

  const canCancel = order.status === 'PENDING' || order.status === 'ACCEPTED';
  const isDelivered = order.status === 'DELIVERED';

  return (
    <div className="space-y-8">
      {/* Top back navigation and header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/consumer/orders"
            className="text-xs font-bold text-stone-500 hover:text-stone-900 inline-flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Order #{order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} size="lg" />
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {canCancel && (
          <button
            type="button"
            onClick={() => setCancelModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* Visual Lifecycle State Machine Timeline */}
      <OrderTimeline currentStatus={order.status} statusHistory={order.statusHistory} />

      {/* Grid: Delivery Info and Items Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Items Snapshot Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-stone-900">Ordered Produce</h3>

          <div className="divide-y divide-stone-100">
            {order.items?.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={item.productImageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=200&q=80'}
                    alt={item.productTitleSnapshot}
                    className="w-14 h-14 rounded-2xl object-cover bg-stone-100 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-stone-900 text-sm truncate">
                      {item.productTitleSnapshot}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Farmer: {item.farmName || item.farmerName}
                    </p>
                    <p className="text-xs font-medium text-stone-700 mt-1">
                      {item.quantity} {item.unitSnapshot} × ₹{item.unitPriceSnapshot}
                    </p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-2">
                  <span className="text-sm font-black text-stone-900">
                    ₹{Number(item.subtotal).toFixed(2)}
                  </span>

                  {isDelivered && (
                    <button
                      type="button"
                      onClick={() => {
                        setReviewProduct(item);
                        setReviewModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      Rate & Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {order.notes && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 text-xs">
              <span className="font-bold text-stone-700">Delivery Instructions:</span>
              <p className="text-stone-600 mt-0.5">{order.notes}</p>
            </div>
          )}

          {order.cancellationReason && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              <span className="font-bold">Cancellation Reason:</span>
              <p className="mt-0.5">{order.cancellationReason}</p>
            </div>
          )}
        </div>

        {/* Right: Delivery Address & Billing Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          {/* Address Card */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Delivery Destination
            </h4>
            <div className="text-xs text-stone-700 space-y-1">
              <p className="font-bold text-sm text-stone-900">{order.deliveryRecipientName}</p>
              <p className="text-stone-600 leading-relaxed">{order.deliveryAddressText}</p>
              <p className="text-stone-500 pt-1">Phone: {order.deliveryPhone}</p>
            </div>
          </div>

          {/* Payment and Financials */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Payment & Totals
            </h4>

            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="flex items-center justify-between">
                <span>Payment Mode</span>
                <span className="font-bold text-stone-900 uppercase">
                  {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' : order.paymentMethod}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Payment Status</span>
                <span className={`font-bold px-2 py-0.5 rounded-md ${
                  order.paymentStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <span>Produce Subtotal</span>
                <span className="font-bold text-stone-900">₹{Number(order.subtotalAmount).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery Charge</span>
                <span className="font-bold text-stone-900">
                  {order.deliveryFee > 0 ? `₹${Number(order.deliveryFee).toFixed(2)}` : 'FREE'}
                </span>
              </div>
              <div className="pt-2 border-t border-stone-100 flex items-baseline justify-between text-base font-black text-stone-900">
                <span>Total Paid / Payable</span>
                <span className="text-xl text-brand-700">₹{Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Modal Dialog */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-100 space-y-4">
            <h3 className="text-lg font-black text-stone-900">Cancel Order #{order.orderNumber}</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to cancel this order? Once cancelled, the reserved produce inventory will be immediately restored to the producer.
            </p>

            <form onSubmit={handleCancelOrder} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Reason for Cancellation
                </label>
                <textarea
                  rows={3}
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Ordered incorrect quantity, traveling out of town, etc."
                  className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Keep Order
                </button>
                <Button type="submit" variant="danger" loading={cancelling} size="md">
                  Confirm Cancellation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verified Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        product={reviewProduct}
        orderId={order.id}
        onReviewSubmitted={fetchOrder}
      />
    </div>
  );
};

export default OrderDetailPage;
