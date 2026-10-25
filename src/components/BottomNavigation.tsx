import React from 'react';
import { Home, Briefcase, Gift, User as UserIcon, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNavigation: React.FC = () => {
  const { currentView, navigate, theme } = useApp();

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 ${
        theme === 'light'
          ? 'bg-white/95 border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]'
          : 'bg-[#0A1628]/95 border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]'
      } backdrop-blur-xl pb-safe transition-colors duration-200`}
    >
      <div className="max-w-md sm:max-w-lg md:max-w-xl mx-auto px-4 h-18 flex items-center justify-between relative">
        {/* Item 1: Home */}
        <button
          id="nav-home"
          onClick={() => navigate('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            currentView === 'dashboard'
              ? theme === 'light'
                ? 'text-[#155EEF] font-bold scale-105'
                : 'text-[#38BDF8] font-bold scale-105'
              : theme === 'light'
              ? 'text-slate-500 hover:text-slate-900'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform ${currentView === 'dashboard' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-1 tracking-tight">Home</span>
        </button>

        {/* Item 2: My Plans */}
        <button
          id="nav-my-plans"
          onClick={() => navigate('my-plans')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            currentView === 'my-plans'
              ? theme === 'light'
                ? 'text-[#155EEF] font-bold scale-105'
                : 'text-[#38BDF8] font-bold scale-105'
              : theme === 'light'
              ? 'text-slate-500 hover:text-slate-900'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className={`w-5 h-5 transition-transform ${currentView === 'my-plans' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-1 tracking-tight">My Plans</span>
        </button>

        {/* Center: Large Raised Circular Blue Invest Button */}
        <div className="relative -top-5 flex flex-col items-center px-2">
          <button
            id="nav-invest-center-btn"
            onClick={() => navigate('invest')}
            className={`w-14 h-14 rounded-full bg-gradient-to-b from-[#38BDF8] via-[#1D4ED8] to-[#1E40AF] p-0.5 transition-all flex items-center justify-center group ${
              currentView === 'plans' || currentView === 'invest'
                ? 'ring-4 ring-sky-400/50 scale-110 shadow-[0_0_30px_rgba(56,189,248,0.8)]'
                : 'shadow-[0_10px_25px_rgba(21,94,239,0.55)] hover:shadow-[0_12px_30px_rgba(21,94,239,0.75)] hover:scale-105 active:scale-95'
            }`}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-b from-[#155EEF] to-[#0A2540] flex items-center justify-center">
              <Zap className="w-6 h-6 text-white group-hover:scale-110 group-hover:rotate-12 transition-transform drop-shadow" />
            </div>
          </button>
          <span
            className={`text-[11px] font-bold tracking-tight mt-1 transition-colors ${
              currentView === 'plans' || currentView === 'invest'
                ? theme === 'light'
                  ? 'text-[#155EEF] font-black'
                  : 'text-[#38BDF8] font-black'
                : theme === 'light'
                ? 'text-slate-700 font-semibold'
                : 'text-white'
            }`}
          >
            Invest
          </span>
        </div>

        {/* Item 4: Rewards */}
        <button
          id="nav-rewards"
          onClick={() => navigate('rewards')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            currentView === 'rewards' || currentView === 'claims-locked'
              ? theme === 'light'
                ? 'text-[#155EEF] font-bold scale-105'
                : 'text-[#38BDF8] font-bold scale-105'
              : theme === 'light'
              ? 'text-slate-500 hover:text-slate-900'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gift className={`w-5 h-5 transition-transform ${currentView === 'rewards' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-1 tracking-tight">Rewards</span>
        </button>

        {/* Item 5: Profile */}
        <button
          id="nav-profile"
          onClick={() => navigate('profile')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            currentView === 'profile' || currentView === 'kyc'
              ? theme === 'light'
                ? 'text-[#155EEF] font-bold scale-105'
                : 'text-[#38BDF8] font-bold scale-105'
              : theme === 'light'
              ? 'text-slate-500 hover:text-slate-900'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserIcon className={`w-5 h-5 transition-transform ${currentView === 'profile' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-1 tracking-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};
