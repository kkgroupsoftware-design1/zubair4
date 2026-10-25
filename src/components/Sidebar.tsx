import React from 'react';
import {
  X,
  LayoutDashboard,
  Car,
  Briefcase,
  Gift,
  Lock,
  ArrowDownCircle,
  ArrowUpCircle,
  ShieldCheck,
  Headphones,
  History,
  User,
  ShieldAlert,
  LogOut,
  Sparkles,
  ArrowRightLeft,
  Sun,
  Moon,
  FileText,
  Bell,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RentoBitLogo } from './RentoBitLogo';

export const Sidebar: React.FC = () => {
  const {
    sidebarOpen,
    setSidebarOpen,
    currentView,
    navigate,
    user,
    notifications,
    logout,
    switchUserRole,
    balance,
    theme,
    toggleTheme,
    setTheme,
  } = useApp();

  if (!sidebarOpen) return null;

  const menuSections = [
    {
      title: 'CORE MOBILITY',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'invest', label: 'Investment Plans', icon: Car, badge: 'High Yield' },
        { id: 'my-plans', label: 'My Active Plans', icon: Briefcase, count: balance.activePlansCount },
      ],
    },
    {
      title: 'FINANCE & REWARDS',
      items: [
        { id: 'rewards', label: 'Daily Rewards', icon: Gift },
        { id: 'claims-locked', label: 'Locked Claims & Unlock', icon: Lock },
        { id: 'deposit', label: 'Deposit Funds', icon: ArrowDownCircle },
        { id: 'withdraw', label: 'Withdraw Funds', icon: ArrowUpCircle },
        { id: 'transactions', label: 'Transaction History', icon: History },
      ],
    },
    {
      title: 'ACCOUNT & SECURITY',
      items: [
        {
          id: 'kyc',
          label: 'KYC Verification',
          icon: ShieldCheck,
          badge: user?.kycStatus === 'Approved' ? 'Verified' : user?.kycStatus,
          badgeColor:
            user?.kycStatus === 'Approved'
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30',
        },
        { id: 'support', label: 'Support Center', icon: Headphones },
        {
          id: 'notifications',
          label: 'Notifications & Alerts',
          icon: Bell,
          count: notifications.filter((n) => !n.isRead).length || '',
        },
        { id: 'profile', label: 'Profile & Settings', icon: User },
      ],
    },
    {
      title: 'LEGAL & COMPLIANCE',
      items: [
        { id: 'terms', label: 'Terms of Service', icon: FileText },
        { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Drawer panel */}
      <div
        className={`relative w-72 sm:w-76 max-w-[82vw] ${
          theme === 'light'
            ? 'bg-white border-r border-slate-200 text-slate-900 shadow-2xl'
            : 'bg-[#071322] border-r border-white/10 text-white shadow-2xl'
        } flex flex-col h-full z-10 transition-colors duration-200`}
      >
        {/* Header: Centered Logo with Balanced Side Actions */}
        <div
          className={`px-3 py-2.5 border-b ${
            theme === 'light' ? 'border-slate-200 bg-white' : 'border-white/10 bg-[#071322]'
          } flex items-center justify-between gap-2`}
        >
          {/* Left: Quick Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            className={`w-8 h-8 rounded-lg shrink-0 ${
              theme === 'light'
                ? 'bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100 shadow-xs'
                : 'bg-white/5 border border-white/10 text-sky-300 hover:bg-white/10 hover:text-white'
            } flex items-center justify-center transition-all active:scale-95 cursor-pointer`}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Sun className="w-4 h-4 stroke-[2.2]" /> : <Moon className="w-4 h-4 stroke-[2.2]" />}
          </button>

          {/* Center: Perfectly Centered Brand Logo */}
          <div className="flex-1 flex items-center justify-center min-w-0 px-1">
            <RentoBitLogo size="sm" theme={theme} className="scale-100 origin-center" />
          </div>

          {/* Right: Close Drawer */}
          <button
            onClick={() => setSidebarOpen(false)}
            className={`w-8 h-8 rounded-lg shrink-0 ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
            } flex items-center justify-center transition-colors cursor-pointer`}
            aria-label="Close Sidebar"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* User Card: Compact & Sleek */}
        <div
          className={`p-3 mx-3 my-2 rounded-xl ${
            theme === 'light'
              ? 'bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-200 shadow-xs'
              : 'bg-gradient-to-br from-blue-950/50 to-slate-900/60 border border-blue-500/20'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/50 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <h4
                className={`text-xs font-bold truncate ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
              >
                {user?.name}
              </h4>
              <p
                className={`text-[11px] truncate ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {user?.email}
              </p>
              <div className="mt-0.5 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] text-emerald-600 dark:text-emerald-300 font-semibold uppercase">
                  Active Member
                </span>
              </div>
            </div>
          </div>

          <div
            className={`mt-2 pt-2 border-t ${
              theme === 'light' ? 'border-slate-200' : 'border-white/10'
            } flex items-center justify-between text-[11px]`}
          >
            <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>
              Available:
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              ${balance.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Navigation List: Tight, Compact & High Density */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-3.5">
          {menuSections.map((sec) => (
            <div key={sec.title}>
              <p
                className={`text-[9px] font-black tracking-wider px-2 mb-1 ${
                  theme === 'light' ? 'text-slate-400' : 'text-slate-400'
                }`}
              >
                {sec.title}
              </p>
              <div className="space-y-0.5">
                {sec.items.map((item: any) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? theme === 'light'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-xs'
                            : 'bg-blue-600/30 text-[#38BDF8] border border-blue-500/40 font-semibold'
                          : theme === 'light'
                          ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-3.5 h-3.5 ${
                            isActive
                              ? theme === 'light'
                                ? 'text-blue-600'
                                : 'text-[#38BDF8]'
                              : theme === 'light'
                              ? 'text-slate-400'
                              : 'text-slate-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold ${
                            item.badgeColor ||
                            (theme === 'light'
                              ? 'bg-blue-100 text-blue-700 border-blue-200'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/30')
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {item.count !== undefined && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            theme === 'light'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-white/10 text-slate-300'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions: Compact & Sleek */}
        <div
          className={`p-3 border-t ${
            theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-[#050E18]'
          } space-y-1.5`}
        >
          {/* Theme Selector segmented pill */}
          <div
            className={`flex items-center justify-between p-0.5 rounded-lg ${
              theme === 'light' ? 'bg-slate-200/80 border border-slate-300' : 'bg-white/5 border border-white/10'
            }`}
          >
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-md text-[11px] font-bold transition-all ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3 h-3 text-amber-500" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-md text-[11px] font-bold transition-all ${
                theme === 'dark'
                  ? 'bg-[#155EEF] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Moon className="w-3 h-3 text-sky-300" />
              <span>Dark</span>
            </button>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-[11px] font-semibold text-rose-600 dark:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
