import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  ShieldCheck,
  Gift,
  ArrowDownCircle,
  ArrowUpCircle,
  Layers,
  MessageSquare,
  RefreshCw,
  Search,
  Calendar,
  AlertCircle,
  ChevronRight,
  User as UserIcon,
  Sparkles,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NotificationItem } from '../types';

type TimeframeType = 'week' | 'today' | 'month' | 'all';
type CategoryType = 'all' | 'finance' | 'reward' | 'kyc' | 'support' | 'general';
type AdminScope = 'all' | 'admin';

export const NotificationsView: React.FC = () => {
  const {
    user,
    theme,
    navigate,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearWeekNotifications,
    clearAllNotifications,
    showToast,
  } = useApp();

  const isLight = theme === 'light';
  const isAdmin = user?.role === 'admin';

  // State Management
  const [timeframe, setTimeframe] = useState<TimeframeType>('week');
  const [category, setCategory] = useState<CategoryType>('all');
  const [adminScope, setAdminScope] = useState<AdminScope>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState<boolean>(false);

  // Data State
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<{
    totalWeek: number;
    totalToday: number;
    totalAll: number;
    unreadCount: number;
    financeCount?: number;
    kycCount?: number;
    rewardCount?: number;
    supportCount?: number;
  }>({
    totalWeek: 0,
    totalToday: 0,
    totalAll: 0,
    unreadCount: 0,
  });

  // Fetch Notifications based on role, timeframe, category, and scope
  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      if (isAdmin && adminScope === 'all') {
        // Admin system-wide platform stream
        const params = new URLSearchParams();
        params.append('timeframe', timeframe);
        params.append('scope', 'all');
        if (category !== 'all') params.append('type', category);
        if (searchQuery.trim()) params.append('search', searchQuery.trim());

        const res = await fetch(`/api/admin/notifications?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setNotificationsList(data.notifications || []);
          if (data.stats) {
            setStats(data.stats);
          }
        }
      } else {
        // Regular user or admin personal alerts
        const params = new URLSearchParams();
        params.append('userId', user.id);
        params.append('timeframe', timeframe);
        if (category !== 'all') params.append('type', category);
        if (filterUnreadOnly) params.append('unreadOnly', 'true');

        const [notifRes, statsRes] = await Promise.all([
          fetch(`/api/notifications?${params.toString()}`),
          fetch(`/api/notifications/stats?userId=${user.id}`),
        ]);

        if (notifRes.ok) {
          const notifs: NotificationItem[] = await notifRes.json();
          setNotificationsList(notifs);
        }

        if (statsRes.ok) {
          const s = await statsRes.json();
          setStats((prev) => ({
            ...prev,
            totalWeek: s.totalWeek,
            totalToday: s.totalToday,
            totalAll: s.totalAll,
            unreadCount: s.unreadCount,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load notifications stream:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAdmin, adminScope, timeframe, category, searchQuery, filterUnreadOnly]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Client-side text filter if searching on user mode
  const filteredNotifications = useMemo(() => {
    let result = notificationsList;

    if (searchQuery.trim() && (!isAdmin || adminScope !== 'all')) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          (n.userName && n.userName.toLowerCase().includes(q)) ||
          (n.userEmail && n.userEmail.toLowerCase().includes(q))
      );
    }

    if (filterUnreadOnly) {
      result = result.filter((n) => !n.isRead);
    }

    return result;
  }, [notificationsList, searchQuery, isAdmin, adminScope, filterUnreadOnly]);

  // Type Icon helper
  const getNotificationIcon = (type: string) => {
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
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
    }
  };

  // Notification click handler (routes user to relevant module)
  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id);
      setNotificationsList((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setStats((prev) => ({ ...prev, unreadCount: Math.max(0, prev.unreadCount - 1) }));
    }

    if (isAdmin && adminScope === 'all') {
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

  // Actions
  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotificationsList((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setStats((prev) => ({ ...prev, unreadCount: 0 }));
    showToast('All Caught Up', 'All notifications marked as read', 'success');
  };

  const handleClearWeek = async () => {
    if (confirm("Clear all notifications from this past week? Older history will remain preserved.")) {
      await clearWeekNotifications();
      loadNotifications();
      showToast('Weekly Feed Cleared', "This week's notifications have been cleared.", 'info');
    }
  };

  const handleClearAll = async () => {
    if (confirm('Permanently remove all notification logs from your account?')) {
      await clearAllNotifications();
      setNotificationsList([]);
      setStats((prev) => ({ ...prev, unreadCount: 0, totalWeek: 0, totalToday: 0, totalAll: 0 }));
      showToast('Notifications Cleared', 'All notifications cleared', 'info');
    }
  };

  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteNotification(id);
    setNotificationsList((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className={`min-h-screen ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#040D18] text-white'} pb-24`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">

        {/* ── Page Header & Admin Stream Toggle ───────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-600/10 text-sky-400 border border-blue-500/20'}`}>
                <Bell className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-['Outfit',sans-serif]">
                {isAdmin && adminScope === 'all' ? 'System Updates & Activity Stream' : 'Notifications & Updates'}
              </h1>
            </div>
            <p className={`text-xs sm:text-sm mt-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {isAdmin && adminScope === 'all'
                ? 'Real-time overview of platform events, transactions, KYC approvals, and member updates.'
                : 'Stay up to date with your deposits, daily rewards, account verification, and security events.'}
            </p>
          </div>

          {/* Admin Switcher & Top Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            {isAdmin && (
              <div className={`p-1 rounded-xl flex items-center gap-1 border ${isLight ? 'bg-slate-200/60 border-slate-300' : 'bg-[#06121F] border-white/10'}`}>
                <button
                  type="button"
                  onClick={() => setAdminScope('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    adminScope === 'all'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Platform Updates
                </button>
                <button
                  type="button"
                  onClick={() => setAdminScope('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    adminScope === 'admin'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  My Admin Alerts
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => loadNotifications()}
              disabled={loading}
              title="Refresh updates"
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── KPI Metrics Cards ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Timeframe Alerts */}
          <div className={`p-4 rounded-2xl border transition-all ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#06121F] border-white/10'}`}>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {timeframe === 'week' ? 'Past 7 Days' : timeframe === 'today' ? 'Today' : timeframe === 'month' ? 'Past 30 Days' : 'Total Alerts'}
              </span>
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black font-['Outfit',sans-serif] tracking-tight">
              {timeframe === 'week' ? stats.totalWeek : timeframe === 'today' ? stats.totalToday : stats.totalAll}
            </div>
            <div className={`text-[10px] mt-1 font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Active timeframe count
            </div>
          </div>

          {/* Card 2: Unread Count */}
          <div className={`p-4 rounded-2xl border transition-all ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#06121F] border-white/10'}`}>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Unread Alerts</span>
              <Bell className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black font-['Outfit',sans-serif] tracking-tight text-rose-500">
              {stats.unreadCount}
            </div>
            <div className={`text-[10px] mt-1 font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Pending review
            </div>
          </div>

          {/* Card 3: Financial & Deposits */}
          <div className={`p-4 rounded-2xl border transition-all ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#06121F] border-white/10'}`}>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Financial Updates</span>
              <ArrowDownCircle className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-2xl font-black font-['Outfit',sans-serif] tracking-tight text-sky-500">
              {stats.financeCount ?? (notificationsList.filter((n) => n.type === 'finance' || n.type === 'deposit' || n.type === 'withdrawal').length)}
            </div>
            <div className={`text-[10px] mt-1 font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Deposits & payouts
            </div>
          </div>

          {/* Card 4: Compliance & Yield */}
          <div className={`p-4 rounded-2xl border transition-all ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#06121F] border-white/10'}`}>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">KYC & Rewards</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black font-['Outfit',sans-serif] tracking-tight text-emerald-500">
              {(stats.kycCount ?? 0) + (stats.rewardCount ?? 0) || (notificationsList.filter((n) => n.type === 'kyc' || n.type === 'reward').length)}
            </div>
            <div className={`text-[10px] mt-1 font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Verifications & returns
            </div>
          </div>
        </div>

        {/* ── Timeframe & Category Control Panel ──────────────────────── */}
        <div className={`p-4 rounded-2xl border space-y-3.5 ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#06121F] border-white/10'}`}>

          {/* Timeframe Pills (Default is This Week as requested) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className={`text-xs font-bold shrink-0 mr-1.5 flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <Clock className="w-3.5 h-3.5 text-blue-500" /> Timeframe:
              </span>
              {[
                { id: 'week', label: 'This Week (7 Days)', badge: stats.totalWeek },
                { id: 'today', label: 'Today', badge: stats.totalToday },
                { id: 'month', label: 'This Month', badge: '' },
                { id: 'all', label: 'All Time', badge: stats.totalAll },
              ].map((tf) => {
                const isActive = timeframe === tf.id;
                return (
                  <button
                    key={tf.id}
                    type="button"
                    onClick={() => setTimeframe(tf.id as TimeframeType)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-500/30'
                        : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{tf.label}</span>
                    {tf.badge !== '' && Number(tf.badge) > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-slate-300'
                      }`}>
                        {tf.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Bulk Actions */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {stats.unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>Mark All Read</span>
                </button>
              )}

              {timeframe === 'week' ? (
                <button
                  type="button"
                  onClick={handleClearWeek}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isLight
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
                      : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Week</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isLight
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
                      : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs & Search Bar */}
          <div className="pt-2 border-t flex flex-col md:flex-row md:items-center justify-between gap-3 border-slate-200 dark:border-white/10">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <span className={`text-xs font-bold shrink-0 mr-1 flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" /> Category:
              </span>
              {[
                { id: 'all', label: 'All Alerts' },
                { id: 'finance', label: 'Financial & Deposits' },
                { id: 'reward', label: 'Rewards & Yield' },
                { id: 'kyc', label: 'KYC & Verification' },
                { id: 'support', label: 'Support' },
              ].map((cat) => {
                const isActive = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as CategoryType)}
                    className={`px-3 py-1.2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? isLight
                          ? 'bg-slate-900 text-white font-bold'
                          : 'bg-white text-slate-950 font-black'
                        : isLight
                        ? 'hover:bg-slate-100 text-slate-600'
                        : 'hover:bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input & Unread Toggle */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter updates & search..."
                  className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      : 'bg-[#040D18] border-white/10 text-white placeholder:text-slate-500'
                  }`}
                />
              </div>

              <button
                type="button"
                onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  filterUnreadOnly
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/10'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${filterUnreadOnly ? 'bg-rose-500 animate-ping' : 'bg-slate-400'}`} />
                <span>Unread</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Active Notifications Feed Stream ────────────────────────── */}
        <div className="space-y-3">
          {loading ? (
            <div className={`p-16 rounded-2xl border text-center flex flex-col items-center justify-center ${isLight ? 'bg-white border-slate-200' : 'bg-[#06121F] border-white/10'}`}>
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
              <p className={`text-sm font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Loading platform stream...</p>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Synchronizing weekly notifications</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className={`p-16 rounded-2xl border text-center flex flex-col items-center justify-center ${isLight ? 'bg-white border-slate-200' : 'bg-[#06121F] border-white/10'}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-slate-500'}`}>
                <Bell className="w-7 h-7 stroke-[1.5]" />
              </div>
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>No Notifications Found</h3>
              <p className={`text-xs mt-1.5 max-w-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {searchQuery
                  ? `No alerts match "${searchQuery}". Try adjusting your search or category filters.`
                  : timeframe === 'week'
                  ? 'No notifications recorded in the past 7 days. Switch to "All Time" to view older activity.'
                  : 'You are completely caught up. All platform events and notifications will appear here in real time.'}
              </p>
              {timeframe === 'week' && (
                <button
                  type="button"
                  onClick={() => setTimeframe('all')}
                  className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-blue-600/20"
                >
                  View All-Time Notifications &rarr;
                </button>
              )}
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none group relative ${
                  notif.isRead
                    ? isLight
                      ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-2xs'
                      : 'bg-[#06121F]/80 hover:bg-[#06121F] border-white/5 text-slate-300'
                    : isLight
                    ? 'bg-blue-50/80 hover:bg-blue-50 border-blue-200 text-slate-900 shadow-xs ring-1 ring-blue-400/20'
                    : 'bg-blue-950/30 hover:bg-blue-900/40 border-blue-500/40 text-white shadow-lg shadow-blue-950/20 ring-1 ring-blue-500/30'
                }`}
              >
                <div className="flex items-start gap-3.5 sm:gap-4">
                  {/* Category Icon Badge */}
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isLight
                        ? notif.isRead
                          ? 'bg-slate-100 border border-slate-200'
                          : 'bg-white border border-blue-200 shadow-2xs'
                        : notif.isRead
                        ? 'bg-white/5 border border-white/10'
                        : 'bg-blue-600/20 border border-blue-500/30'
                    }`}
                  >
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2 min-w-0">
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 animate-pulse" />
                        )}
                        <h4
                          className={`text-sm font-bold ${
                            isLight ? 'text-slate-900' : 'text-white'
                          } tracking-tight truncate`}
                        >
                          {notif.title}
                        </h4>

                        {/* Admin badge showing which member this update belongs to */}
                        {isAdmin && adminScope === 'all' && notif.userName && (
                          <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            isLight
                              ? 'bg-slate-100 text-slate-700 border-slate-200'
                              : 'bg-white/5 text-slate-300 border-white/10'
                          }`}>
                            <UserIcon className="w-2.5 h-2.5" />
                            {notif.userName}
                          </span>
                        )}
                      </div>

                      {/* Timestamp & Actions */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className={`text-[11px] font-medium flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          <Clock className="w-3 h-3 text-slate-400" />
                          {notif.date}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteItem(e, notif.id)}
                          title="Delete alert"
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isLight
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-100'
                              : 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/20'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Member details on mobile if admin */}
                    {isAdmin && adminScope === 'all' && notif.userName && (
                      <div className="sm:hidden mt-1 text-[11px] font-medium text-blue-500 flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        <span>Member: {notif.userName} {notif.userEmail ? `(${notif.userEmail})` : ''}</span>
                      </div>
                    )}

                    {/* Message Body */}
                    <p className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {notif.message}
                    </p>

                    {/* Bottom Link indicator */}
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${
                        notif.type === 'reward' ? 'text-emerald-500' :
                        notif.type === 'kyc' ? 'text-blue-500' :
                        notif.type === 'finance' || notif.type === 'deposit' ? 'text-sky-500' :
                        notif.type === 'withdrawal' ? 'text-orange-500' : 'text-slate-400'
                      }`}>
                        {notif.type}
                      </span>

                      <div className="flex items-center gap-1 text-xs font-semibold text-blue-500 group-hover:text-blue-400 transition-colors">
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
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
