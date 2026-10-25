import React from 'react';
import { X, CheckCheck, Bell, ShieldCheck, Gift, ArrowDownCircle, AlertCircle, Trash2, ArrowUpCircle, Layers, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationDrawer: React.FC = () => {
  const {
    notificationDrawerOpen,
    setNotificationDrawerOpen,
    notifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    deleteNotification,
    clearWeekNotifications,
    clearAllNotifications,
    fetchNotifications,
    navigate,
    user,
    theme,
  } = useApp();

  if (!notificationDrawerOpen) return null;

  const isLight = theme === 'light';

  const getIcon = (type: string) => {
    switch (type) {
      case 'reward':
        return <Gift className="w-4 h-4 text-emerald-500" />;
      case 'kyc':
        return <ShieldCheck className="w-4 h-4 text-blue-500" />;
      case 'deposit':
      case 'finance':
        return <ArrowDownCircle className="w-4 h-4 text-sky-500" />;
      case 'withdrawal':
        return <ArrowUpCircle className="w-4 h-4 text-orange-500" />;
      case 'investment':
        return <Layers className="w-4 h-4 text-purple-500" />;
      case 'support':
        return <MessageSquare className="w-4 h-4 text-amber-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
    }
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id);
    }
    setNotificationDrawerOpen(false);

    // Contextual routing based on notification type and user role
    const isAdmin = user?.role === 'admin';
    if (isAdmin) {
      navigate('kkgroup');
      return;
    }

    switch (notif.type) {
      case 'deposit':
        navigate('deposit');
        break;
      case 'withdrawal':
      case 'finance':
        navigate('transactions');
        break;
      case 'investment':
        navigate('my-plans');
        break;
      case 'reward':
        navigate('rewards');
        break;
      case 'kyc':
        navigate('kyc');
        break;
      case 'support':
        navigate('support');
        break;
      default:
        navigate('dashboard');
        break;
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    await clearAllNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setNotificationDrawerOpen(false)}
      />

      {/* Drawer Panel */}
      <div
        className={`relative w-96 max-w-[92vw] ${
          isLight
            ? 'bg-white border-l border-slate-200 text-slate-900 shadow-2xl'
            : 'bg-[#071322] border-l border-white/10 text-white shadow-2xl'
        } flex flex-col h-full z-10`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-[#06121F]'
          } flex items-center justify-between`}
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-5 h-5 text-blue-600 dark:text-[#38BDF8]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse ring-2 ring-white dark:ring-[#06121F]" />
              )}
            </div>
            <div>
              <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Notifications
              </h3>
              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {notifications.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={markAllNotificationsAsRead}
                  title="Mark all as read"
                  className={`px-2 py-1 rounded-lg ${
                    isLight ? 'bg-slate-200/80 hover:bg-slate-200 text-slate-700' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  } text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer`}
                >
                  <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span className="hidden sm:inline text-[11px]">Mark read</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  title="Clear all notifications"
                  className={`px-2 py-1 rounded-lg ${
                    isLight ? 'hover:bg-rose-100 text-rose-600 bg-rose-50/80 border border-rose-200' : 'hover:bg-rose-500/20 text-rose-400 bg-rose-500/10 border border-rose-500/20'
                  } text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Clear all</span>
                </button>
              </>
            )}
            <button
              onClick={() => setNotificationDrawerOpen(false)}
              className={`p-1.5 rounded-lg ${
                isLight ? 'hover:bg-slate-200 text-slate-500' : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
              } cursor-pointer transition-colors`}
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekly Scope Indicator */}
        <div
          className={`px-4 py-2 border-b flex items-center justify-between text-xs ${
            isLight ? 'bg-slate-100/60 border-slate-200 text-slate-600' : 'bg-white/5 border-white/5 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-1.5 font-medium text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Showing past 7 days (weekly)</span>
          </div>
          <button
            type="button"
            onClick={clearWeekNotifications}
            title="Clear this week's notifications"
            className="text-[11px] text-rose-500 hover:text-rose-400 hover:underline cursor-pointer font-medium"
          >
            Clear week
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className={`w-12 h-12 rounded-2xl ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-slate-500'} flex items-center justify-center mb-3`}>
                <Bell className="w-6 h-6 stroke-[1.5]" />
              </div>
              <p className={`text-sm font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>No notifications yet</p>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-400' : 'text-slate-500'} max-w-[200px]`}>
                You will receive real-time alerts for deposits, withdrawals, rewards, and compliance updates.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none group relative ${
                  notif.isRead
                    ? isLight
                      ? 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700 opacity-80'
                      : 'bg-slate-900/30 hover:bg-slate-900/60 border-white/5 opacity-75'
                    : isLight
                    ? 'bg-blue-50 hover:bg-blue-100/70 border-blue-200 text-slate-900 shadow-xs ring-1 ring-blue-400/20'
                    : 'bg-blue-950/30 hover:bg-blue-900/40 border-blue-500/40 text-white shadow-lg shadow-blue-950/30 ring-1 ring-blue-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl ${
                      isLight ? 'bg-white border border-slate-200 shadow-2xs' : 'bg-white/5 border border-white/10'
                    } flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        )}
                        <h4
                          className={`text-xs font-bold ${
                            isLight ? 'text-slate-900' : 'text-white'
                          } tracking-tight truncate`}
                        >
                          {notif.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {notif.date}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          title="Delete notification"
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            isLight
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-100'
                              : 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/20'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'} mt-1 leading-relaxed`}>
                      {notif.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer: Link to Full Notifications Page */}
        <div
          className={`p-3.5 border-t ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-[#06121F]'
          } flex items-center justify-between gap-2 shrink-0`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
            <span>Weekly Feed</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setNotificationDrawerOpen(false);
              navigate('notifications');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <span>Open Full Page</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
};
