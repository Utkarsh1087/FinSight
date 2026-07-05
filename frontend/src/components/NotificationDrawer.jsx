import React from 'react';
import { X, CheckCircle2, AlertTriangle, Info, BellRing } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export const NotificationDrawer = () => {
  const { isOpen, setIsOpen, notifications, markAsRead, markAllAsRead } = useNotifications();

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'OVERDUE_INVOICE':
      case 'LARGE_TRANSACTION':
      case 'CONTROL_VIOLATION':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'DUPLICATE_PAYMENT':
      case 'LOW_INVENTORY':
        return <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'RECONCILIATION_COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-primary shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-midnight_text/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#edf5fc]/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-100 text-primary">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-midnight_text text-base">Notifications & Alerts</h3>
              <p className="text-xs text-black/50">Live operational financial feed</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:text-blue-700 font-bold px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
            >
              Mark all read
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full text-black/50 hover:text-midnight_text hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#edf5fc]/20">
          {notifications.length === 0 ? (
            <div className="text-center py-20 text-black/40 text-sm font-medium">
              No notifications at this time.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  notif.is_read
                    ? 'bg-white border-slate-200/60 text-black/60 opacity-80'
                    : 'bg-white border-blue-200 text-midnight_text shadow-md hover:border-primary'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getIcon(notif.notification_type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-midnight_text truncate">{notif.title}</h4>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-black/70 leading-relaxed line-clamp-2">{notif.message}</p>
                    <span className="mt-2 block text-[10px] text-black/40 font-medium">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDrawer;
