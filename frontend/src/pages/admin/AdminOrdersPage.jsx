import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  MapPin,
  X,
  CreditCard,
  Truck,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllOrders(page, 15);
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const filteredOrders = orders.filter((ord) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      ord.orderNumber?.toLowerCase().includes(q) ||
      ord.consumerName?.toLowerCase().includes(q) ||
      ord.shippingCity?.toLowerCase().includes(q);
    const matchesStatus = statusFilter ? ord.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          Platform Orders & Fulfillment Pipeline
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Complete log of all customer transactions across all farm producers and delivery routes.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by order #, consumer name, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="READY_FOR_DISPATCH">READY_FOR_DISPATCH</option>
            <option value="DISPATCHED">DISPATCHED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <LoadingSpinner text="Fetching platform orders..." />
      ) : filteredOrders.length > 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/80 text-stone-500 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-100">
                <tr>
                  <th className="py-3 px-6">Order ID</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Consumer</th>
                  <th className="py-3 px-6">Destination</th>
                  <th className="py-3 px-6">Amount (₹)</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-stone-900">
                      #{ord.orderNumber}
                    </td>
                    <td className="py-4 px-6 text-stone-500">
                      {ord.createdAt
                        ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Recent'}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-stone-900">{ord.consumerName || 'Consumer'}</p>
                      <p className="text-[11px] text-stone-400">{ord.consumerEmail || ''}</p>
                    </td>
                    <td className="py-4 px-6 text-stone-600">
                      {ord.shippingCity}, {ord.shippingState}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-stone-900">
                      ₹{(ord.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6">
                      <OrderStatusBadge status={ord.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-stone-100 flex items-center justify-between">
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
          <h3 className="text-base font-bold text-stone-800">No orders found</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1">
            No platform transactions match your search or filter.
          </p>
        </div>
      )}

      {/* Order Inspection Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-100 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-stone-900 font-mono">
                    #{selectedOrder.orderNumber}
                  </h3>
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  Placed on{' '}
                  {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Delivery info */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/60">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Customer & Shipping Destination
                </h4>
                <p className="text-xs font-bold text-stone-900">{selectedOrder.consumerName}</p>
                <p className="text-xs text-stone-600 mt-1">
                  {selectedOrder.shippingAddressLine1}
                  {selectedOrder.shippingAddressLine2 ? `, ${selectedOrder.shippingAddressLine2}` : ''}
                </p>
                <p className="text-xs text-stone-600">
                  {selectedOrder.shippingCity}, {selectedOrder.shippingState} - {selectedOrder.shippingPostalCode}
                </p>
                {selectedOrder.shippingPhone && (
                  <p className="text-xs text-stone-500 mt-1">Phone: {selectedOrder.shippingPhone}</p>
                )}
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Order Items Breakdown
                </h4>
                <div className="border border-stone-200/70 rounded-2xl overflow-hidden divide-y divide-stone-100">
                  {selectedOrder.items && selectedOrder.items.map((it) => (
                    <div key={it.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-stone-900">{it.productTitle}</p>
                        <p className="text-[11px] text-stone-400">
                          {it.farmerName ? `Producer: ${it.farmerName}` : ''} | ₹{it.unitPrice} × {it.quantity} {it.unit || ''}
                        </p>
                      </div>
                      <p className="font-extrabold text-stone-900">
                        ₹{(it.totalPrice || (it.unitPrice * it.quantity)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="bg-brand-50/60 rounded-2xl p-4 border border-brand-200/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-brand-900">Total Order Value</span>
                  <p className="text-[11px] text-brand-700">Cash on Delivery (COD)</p>
                </div>
                <div className="text-xl font-black text-brand-950">
                  ₹{(selectedOrder.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 mt-6 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 transition-colors"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
