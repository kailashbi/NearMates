import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  CheckCircle2,
  Calendar,
  Users,
  MessageSquare,
  AlertTriangle,
  XCircle,
  Sparkles,
  Check
} from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'join_request':
        return <Users className="w-4 h-4 text-primary" />;
      case 'request_approved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'request_rejected':
        return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'match':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'activity_cancelled':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-navy tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Stay updated on join requests, activity approvals, and teammate messages.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-navy rounded-btn text-xs font-bold transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-card border border-slate-border shadow-card divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">You're all caught up! No notifications right now.</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const isRead = Boolean(notif.readAt);
            const time = new Date(notif.createdAt).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={notif.notificationId}
                onClick={() => !isRead && markAsRead(notif.notificationId)}
                className={`p-4 flex items-start space-x-3 transition-colors ${
                  isRead ? 'bg-white' : 'bg-primary-light/40 hover:bg-primary-light/60 cursor-pointer'
                }`}
              >
                <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs flex-shrink-0">
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-navy truncate">{notif.title}</h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{time}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>

                  {notif.activityId && (
                    <div className="mt-2">
                      <Link
                        to={`/activities/${notif.activityId}`}
                        className="text-[11px] font-bold text-primary hover:underline inline-flex items-center space-x-1"
                      >
                        <span>View Activity Details</span>
                      </Link>
                    </div>
                  )}
                </div>

                {!isRead && (
                  <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

