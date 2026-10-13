import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Clock, MapPin, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { orderService } from '../../services/orderService';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getMyOrders(page, 10);
        setOrders(data.content || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error('Failed to load consumer orders:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [page]);

  if (loading) {
    return <LoadingSpinner text="Retrieving your orders..." />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No Orders Placed Yet"
        description="You have not placed any orders yet. Browse our farm catalog to order fresh crops directly from local farmers."
        action={
          <Link
            to="/products"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20"
          >
            Start Shopping
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          My Farm Orders
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Review previous purchases, inspect tracking timelines, and rate delivered produce.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm hover:border-brand-200 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono font-bold text-sm text-stone-900">
                  #{order.orderNumber}
                </span>
                <OrderStatusBadge status={order.status} />
                <span className="text-xs text-stone-400">
                  {new Date(order.createdAt).toLocaleDateString([], {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {/* Items Snapshot Preview */}
              <div className="text-xs text-stone-600 line-clamp-1">
                {order.items?.map((i) => `${i.quantity} ${i.unitSnapshot} of ${i.productTitleSnapshot} (${i.farmName})`).join(' • ')}
              </div>

              <p className="text-xs text-stone-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span className="truncate max-w-md">{order.deliveryAddressText}</span>
              </p>
            </div>

            {/* Total and actions */}
            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-stone-100">
              <div className="text-left md:text-right">
                <span className="text-[11px] text-stone-400 block font-medium">Total Amount</span>
                <span className="text-base font-black text-stone-900">
                  ₹{Number(order.totalAmount).toFixed(2)}
                </span>
                <span className="text-[10px] text-stone-500 block uppercase font-bold">
                  {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' : order.paymentMethod}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/consumer/orders/${order.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Details & Track
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold border border-stone-300 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-xs font-bold text-stone-600">
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold border border-stone-300 disabled:opacity-40"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
