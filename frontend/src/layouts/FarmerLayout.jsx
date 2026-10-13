import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Sprout,
  Package,
  User,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';

const FarmerLayout = () => {
  const { user } = useAuth();

  const links = [
    { to: '/farmer/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { to: '/farmer/products', label: 'My Products & Inventory', icon: Sprout },
    { to: '/farmer/orders', label: 'Incoming Orders', icon: Package },
    { to: '/farmer/profile', label: 'Farm Profile & Bio', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Farmer Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-sm sticky top-28">
              {/* Farmer header badge */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100/50 border border-brand-200/60 mb-6">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 bg-brand-200/60 px-2 py-0.5 rounded-md inline-block mb-1.5">
                  Farmer Portal
                </span>
                <h3 className="text-sm font-bold text-stone-900 truncate">
                  {user?.farmName || user?.fullName + "'s Farm"}
                </h3>
                <p className="text-xs text-stone-500 truncate">{user?.email}</p>
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
                            ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
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
                <span>View Public Catalog</span>
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

export default FarmerLayout;
