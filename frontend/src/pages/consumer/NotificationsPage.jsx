import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Clock, Package, AlertCircle } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';

const NotificationsPage = () => {
  const { success, error } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' or 'UNREAD'

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [list, count] = await Promise.all([
        notificationService.getNotifications(0, 30),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(list.content || []);
      setUnreadCount(count);
    } catch (err) {
      console.error(err);
      error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkOne = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      success('Marked as read');
    } catch (err) {
      error(err.message || 'Failed to mark as read');
    }
  };

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      success('All notifications marked as read');
    } catch (err) {
      error(err.message || 'Failed to mark all as read');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving in-app notifications..." />;
  }

  const displayedList =
    filter === 'UNREAD' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Notifications Center
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time updates regarding order state changes, dispatch confirmations, and inventory warnings.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAll} icon={CheckCheck}>
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filter === 'ALL'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filter === 'UNREAD'
              ? 'bg-brand-600 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* List */}
      {displayedList.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === 'UNREAD' ? 'No Unread Notifications' : 'No Notifications'}
          description="You're all caught up! Order status updates will appear here automatically."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200/80 divide-y divide-stone-100 overflow-hidden shadow-sm">
          {displayedList.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                !item.isRead ? 'bg-brand-50/40' : 'hover:bg-stone-50'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    !item.isRead
                      ? 'bg-brand-600 text-white'
                      : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  <Package className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-stone-900 truncate">
                      {item.title}
                    </h4>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-stone-400 mt-2 block">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {!item.isRead && (
                <button
                  type="button"
                  onClick={() => handleMarkOne(item.id)}
                  className="p-1.5 text-stone-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors flex-shrink-0"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
