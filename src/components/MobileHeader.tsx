import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RentoBitLogo } from './RentoBitLogo';

export const MobileHeader: React.FC = () => {
  const {
    user,
    notifications,
    setNotificationDrawerOpen,
    setSidebarOpen,
    navigate,
    theme,
  } = useApp();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header
      className={`sticky top-0 z-40 w-full ${
        theme === 'light'
          ? 'bg-white/90 border-b border-slate-200 shadow-sm'
          : 'bg-[#07121E]/90 border-b border-white/5'
      } backdrop-blur-md px-4 py-3 transition-colors duration-200`}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Left: Hamburger menu toggle */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-button"
            onClick={() => setSidebarOpen(true)}
            className={`w-10 h-10 rounded-xl ${
              theme === 'light'
                ? 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                : 'bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:bg-white/10'
            } flex items-center justify-center transition-colors active:scale-95 cursor-pointer`}
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick role tag if admin */}
          {user?.role === 'admin' && (
            <span className="hidden sm:inline-flex px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
              ADMIN
            </span>
          )}
        </div>

        {/* Center: Brand Logo */}
        <button
          onClick={() => navigate('dashboard')}
          className="focus:outline-none transform active:scale-95 transition-transform cursor-pointer flex items-center justify-center py-0.5"
          aria-label="RentoBit Home"
        >
          <RentoBitLogo size="md" theme={theme} className="scale-108 sm:scale-115 origin-center" />
        </button>

        {/* Right: Notifications & Profile Avatar */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Notification Bell */}
          <button
            id="notification-bell-button"
            onClick={() => setNotificationDrawerOpen(true)}
            className={`relative w-10 h-10 rounded-xl ${
              theme === 'light'
                ? 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                : 'bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:bg-white/10'
            } flex items-center justify-center transition-colors active:scale-95 cursor-pointer`}
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar */}
          <button
            id="user-avatar-button"
            onClick={() => navigate('profile')}
            className="relative focus:outline-none active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-full ring-2 ring-blue-500/40 p-0.5 overflow-hidden bg-slate-200">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user?.name || 'User Avatar'}
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Green online badge */}
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 ${
                theme === 'light' ? 'border-white' : 'border-[#07121E]'
              } rounded-full shadow-sm`}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
