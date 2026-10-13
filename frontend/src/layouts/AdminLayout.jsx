import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Sprout,
  Tags,
  ShoppingBag,
  BarChart3,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user } = useAuth();

  const links = [
    { to: '/admin/dashboard', label: 'Platform Metrics', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User & Producer Control', icon: Users },
    { to: '/admin/products', label: 'Product Moderation', icon: Sprout },
    { to: '/admin/categories', label: 'Catalog Categories', icon: Tags },
    { to: '/admin/orders', label: 'All Platform Orders', icon: ShoppingBag },
    { to: '/admin/reports', label: 'Sales & CSV Reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Admin Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-sm sticky top-28">
              {/* Admin header */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-white mb-6 shadow-md shadow-stone-900/10">
                <div className="flex items-center gap-1.5 text-brand-400 text-[10px] font-black uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Control Panel
                </div>
                <h3 className="text-sm font-bold truncate">Platform Admin</h3>
                <p className="text-[11px] text-stone-400 truncate">{user?.email}</p>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1.5">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-stone-900 text-white shadow-md shadow-stone-900/10'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{link.label}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="my-6 border-t border-stone-100" />

              <Link
                to="/products"
                className="flex items-center justify-between text-xs font-semibold text-stone-500 hover:text-brand-600 px-3 py-2 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <span>Live Marketplace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminLayout;
