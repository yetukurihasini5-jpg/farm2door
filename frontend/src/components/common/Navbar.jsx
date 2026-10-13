import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sprout,
  ShoppingCart,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  Package,
  Menu,
  X,
  ChevronDown,
  ShieldAlert,
  Clock,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { notificationService } from '../../services/notificationService';

const Navbar = () => {
  const { user, isAuthenticated, isFarmer, isConsumer, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread notifications periodically
  useEffect(() => {
    let interval;
    if (isAuthenticated) {
      const loadNotifications = async () => {
        try {
          const count = await notificationService.getUnreadCount();
          setUnreadCount(count);
          const list = await notificationService.getNotifications(0, 5);
          setNotifications(list.content || []);
        } catch (e) {
          // silent fail
        }
      };

      loadNotifications();
      interval = setInterval(loadNotifications, 30000);
    }
    return () => clearInterval(interval);
  }, [isAuthenticated, location.pathname]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isFarmer) return '/farmer/dashboard';
    return '/consumer/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav shadow-sm border-b border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-600/25 group-hover:scale-105 transition-transform duration-200">
              <Sprout className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-stone-900 group-hover:text-brand-700 transition-colors">
                Farm<span className="text-brand-600">2</span>Door
              </span>
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest hidden sm:block">
                Direct Farm Marketplace
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                location.pathname === '/'
                  ? 'text-brand-700 bg-brand-50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                location.pathname.startsWith('/products')
                  ? 'text-brand-700 bg-brand-50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Shop Catalog
            </Link>
            <Link
              to="/about"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                location.pathname === '/about'
                  ? 'text-brand-700 bg-brand-50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                location.pathname === '/contact'
                  ? 'text-brand-700 bg-brand-50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-3">
            {/* Cart Button (Always accessible or visible for consumers) */}
            {(!isAuthenticated || isConsumer) && (
              <Link
                to="/cart"
                className="relative p-2.5 rounded-xl text-stone-600 hover:text-brand-600 hover:bg-brand-50/60 transition-all"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale-in">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notification Dropdown (Authenticated Users) */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2.5 rounded-xl text-stone-600 hover:text-brand-600 hover:bg-brand-50/60 transition-all"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-ping" />
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200/80 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-stone-100">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-800 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-bold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <Link
                        to="/notifications"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-xs text-brand-600 hover:underline font-semibold"
                      >
                        View all
                      </Link>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-stone-50">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-stone-400">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3.5 hover:bg-stone-50 flex items-start gap-3 transition-colors ${
                              !n.isRead ? 'bg-brand-50/30' : ''
                            }`}
                          >
                            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-brand-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-stone-800 truncate">{n.title}</p>
                              <p className="text-xs text-stone-500 line-clamp-2 mt-0.5 leading-relaxed">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-stone-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {!n.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(n.id)}
                                className="text-stone-400 hover:text-brand-600 p-1"
                                title="Mark read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="relative" ref={userRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl border border-stone-200 hover:border-brand-300 hover:bg-stone-50 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-stone-800 leading-tight truncate max-w-[110px]">
                      {user?.fullName}
                    </p>
                    <span className="text-[10px] text-brand-600 font-semibold tracking-wide uppercase">
                      {user?.role === 'ROLE_ADMIN' ? 'Admin' : user?.role === 'ROLE_FARMER' ? 'Farmer' : 'Consumer'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-stone-200/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-900 truncate">{user?.fullName}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to={getDashboardLink()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-brand-600" />
                      Dashboard
                    </Link>

                    {isConsumer && (
                      <Link
                        to="/consumer/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      >
                        <Package className="w-4 h-4 text-brand-600" />
                        My Orders
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                    >
                      <User className="w-4 h-4 text-stone-500" />
                      Profile & Settings
                    </Link>

                    <div className="my-1 border-t border-stone-100" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-stone-700 hover:text-brand-700 hover:bg-stone-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Join Us
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl md:hidden text-stone-600 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-stone-800" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-bold text-stone-700 hover:bg-brand-50 hover:text-brand-700"
          >
            Home
          </Link>
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-bold text-stone-700 hover:bg-brand-50 hover:text-brand-700"
          >
            Shop Catalog
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-bold text-stone-700 hover:bg-brand-50 hover:text-brand-700"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-bold text-stone-700 hover:bg-brand-50 hover:text-brand-700"
          >
            Contact
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
