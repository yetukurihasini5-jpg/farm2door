import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Package,
  Clock,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  TrendingUp,
  Sprout,
  CheckCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { farmerService } from '../../services/farmerService';
import { useAuth } from '../../context/AuthContext';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await farmerService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching farmer dashboard stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return <LoadingSpinner text="Loading farm analytics..." />;
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: 'Cumulative sales earnings',
      icon: DollarSign,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      description: 'Incoming customer orders',
      icon: Package,
      color: 'bg-brand-600',
      lightColor: 'bg-brand-50 text-brand-700 border-brand-100',
    },
    {
      title: 'Pending Fulfillment',
      value: stats?.pendingOrders || 0,
      description: 'Awaiting action or dispatch',
      icon: Clock,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      title: 'Low Stock Alerts',
      value: stats?.lowStockAlertsCount || 0,
      description: 'Products requiring restock',
      icon: AlertTriangle,
      color: 'bg-rose-500',
      lightColor: 'bg-rose-50 text-rose-700 border-rose-100',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-stone-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-brand-500/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-brand-500/30 text-brand-200 text-xs font-semibold backdrop-blur-sm border border-brand-400/20">
                Farmer Workspace
              </span>
              <span className="text-xs text-stone-300">Real-time Producer Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.fullName || 'Farmer'}! 🌱
            </h1>
            <p className="mt-2 text-stone-300 text-sm max-w-xl leading-relaxed">
              Monitor incoming harvest orders, manage real-time inventory levels, and supply fresh produce directly to local households.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 flex items-center gap-2 backdrop-blur-sm"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              to="/farmer/products"
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-brand-950 font-bold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Manage Produce
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl border ${card.lightColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-stone-900 group-hover:text-brand-700 transition-colors">
                {card.value}
              </div>
              <p className="text-xs text-stone-500 mt-1">{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* Low Stock Warning Section (if any) */}
      {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900">Inventory Alert: Low Stock Produce</h3>
                <p className="text-xs text-amber-700">The following items have stock at or below 5 units.</p>
              </div>
            </div>
            <Link
              to="/farmer/products"
              className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 hover:underline"
            >
              Update Stock <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {stats.lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-amber-200/60 rounded-xl p-3 flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-3 truncate">
                  <img
                    src={p.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100'}
                    alt={p.title}
                    className="w-10 h-10 rounded-lg object-cover border border-stone-200"
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-stone-900 truncate">{p.title}</p>
                    <p className="text-[11px] text-stone-500">₹{p.pricePerUnit} / {p.unit}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-rose-100 text-rose-700 font-black text-xs rounded-lg flex-shrink-0">
                  {p.stockQuantity} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-stone-900">Recent Incoming Orders</h2>
            <p className="text-xs text-stone-500 mt-0.5">Most recent direct consumer purchases containing your produce</p>
          </div>
          <Link
            to="/farmer/orders"
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
          >
            All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/80 text-stone-500 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-100">
                <tr>
                  <th className="py-3 px-6">Order ID</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Consumer</th>
                  <th className="py-3 px-6">Items Summary</th>
                  <th className="py-3 px-6">Total (₹)</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {stats.recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-stone-900">
                      #{ord.orderNumber}
                    </td>
                    <td className="py-4 px-6 text-stone-500">
                      {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : 'Recent'}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-stone-900">{ord.consumerName || 'Consumer'}</p>
                      <p className="text-[11px] text-stone-400">{ord.shippingCity || 'City'}</p>
                    </td>
                    <td className="py-4 px-6 text-stone-600 max-w-xs truncate">
                      {ord.items && ord.items.length > 0
                        ? ord.items.map((i) => `${i.productTitle} (${i.quantity} ${i.unit || 'unit'})`).join(', ')
                        : 'Fresh produce'}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-stone-900">
                      ₹{(ord.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6">
                      <OrderStatusBadge status={ord.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to="/farmer/orders"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-stone-100 hover:bg-brand-50 hover:text-brand-700 text-stone-700 font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-stone-500">
            <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="font-bold text-stone-700 text-sm">No incoming orders yet</p>
            <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1">
              Once consumers buy your fresh harvest items, orders will appear here for fulfillment and status updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
