import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Clock, CheckCircle2, ArrowRight, MapPin, Sprout } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const ConsumerDashboard = () => {
  const { user } = useAuth();
  const { itemCount } = useCart();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await orderService.getMyOrders(0, 5);
        setOrders(data.content || []);
      } catch (err) {
        console.error('Failed to load consumer dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading consumer overview..." />;
  }

  const activeOrdersCount = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'REJECTED').length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const totalSpent = orders
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REJECTED')
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-800 to-brand-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-brand-900/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-200 bg-brand-900/60 px-2.5 py-1 rounded-md inline-block mb-2">
            Consumer Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hello, {user?.fullName}!
          </h1>
          <p className="text-xs text-brand-100 mt-1 max-w-lg">
            Welcome back to your direct farm-to-table command center. Savor nutrient-rich regional produce harvested fresh on demand.
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand-800 font-bold text-xs shadow-md hover:bg-brand-50 transition-colors"
        >
          <Sprout className="w-4 h-4 text-brand-600" />
          Order Fresh Produce
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mb-3">
            <Package className="w-5 h-5" />
          </div>
          <p className="text-xs text-stone-500 font-semibold">Total Orders Placed</p>
          <p className="text-2xl font-black text-stone-900 mt-0.5">{orders.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-xs text-stone-500 font-semibold">Active In-Transit</p>
          <p className="text-2xl font-black text-stone-900 mt-0.5">{activeOrdersCount}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs text-stone-500 font-semibold">Delivered Orders</p>
          <p className="text-2xl font-black text-stone-900 mt-0.5">{deliveredOrdersCount}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <p className="text-xs text-stone-500 font-semibold">Current Cart Items</p>
          <p className="text-2xl font-black text-stone-900 mt-0.5">{itemCount}</p>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-stone-900">Recent Farm Orders</h3>
            <p className="text-xs text-stone-500 mt-0.5">Track your newest purchases and delivery progress.</p>
          </div>
          <Link
            to="/consumer/orders"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10 text-stone-400 text-xs">
            No purchases yet. Start shopping to connect with local farmers!
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {orders.map((o) => (
              <div
                key={o.id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs text-stone-900">
                      #{o.orderNumber}
                    </span>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                    {o.items?.map((i) => `${i.quantity} ${i.unitSnapshot} ${i.productTitleSnapshot}`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-sm font-black text-stone-900">
                    ₹{Number(o.totalAmount).toFixed(2)}
                  </span>
                  <Link
                    to={`/consumer/orders/${o.id}`}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    Track
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumerDashboard;
