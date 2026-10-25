import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, Globe, ArrowRight, Sun, Moon } from 'lucide-react';
import { RentoBitLogo } from '../components/RentoBitLogo';
import { useApp } from '../context/AppContext';

export const SplashView: React.FC = () => {
  const { navigate, splashSlides, theme, toggleTheme } = useApp();
  const [activeSlide, setActiveSlide] = useState(0);
  const [fading, setFading] = useState(false);

  // Auto-advance every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      goToSlide((prev) => (prev + 1) % splashSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [splashSlides.length]);

  const goToSlide = (indexOrUpdater: number | ((prev: number) => number)) => {
    setFading(true);
    setTimeout(() => {
      setActiveSlide((prev) => {
        const next = typeof indexOrUpdater === 'function' ? indexOrUpdater(prev) : indexOrUpdater;
        return next;
      });
      setFading(false);
    }, 300);
  };

  const slide = splashSlides[activeSlide] || splashSlides[0];
  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-screen w-full ${
        isLight ? 'bg-[#F4F7FB] text-slate-900' : 'bg-[#07121E] text-white'
      } flex flex-col items-center justify-center p-4 sm:p-6 max-w-md mx-auto relative overflow-y-auto transition-colors duration-200`}
    >
      {/* Background ambient glow */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Right Dark/Light Mode Toggle */}
      <button
        onClick={toggleTheme}
        title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        className={`absolute top-3.5 right-3.5 sm:top-5 sm:right-5 z-20 w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl shrink-0 ${
          isLight
            ? 'bg-white/90 border border-slate-200/90 text-amber-500 shadow-sm backdrop-blur-md'
            : 'bg-white/10 border border-white/15 text-sky-300 shadow-md backdrop-blur-md'
        } flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95`}
      >
        {isLight ? <Sun className="w-4.5 h-4.5 stroke-[2.2]" /> : <Moon className="w-4.5 h-4.5 stroke-[2.2]" />}
      </button>

      {/* Single Unified Stack: Perfectly balanced and centered on all mobile & desktop screens */}
      <div className="w-full relative z-10 flex flex-col items-center gap-3 sm:gap-3.5 my-auto py-1">
        {/* Top Branding Logo */}
        <div className="w-full flex items-center justify-center px-1">
          <RentoBitLogo size="2xl" theme={theme} className="scale-115 sm:scale-120" />
        </div>

        {/* Animated headline banner with enlarged, bolder text */}
        <div
          className="text-center transition-opacity duration-300 px-1"
          style={{ opacity: fading ? 0 : 1 }}
        >
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            } leading-tight font-['Outfit',sans-serif]`}
          >
            {slide.headline}
          </h1>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#155EEF] leading-tight font-['Outfit',sans-serif]">
            {slide.subheadline}
          </h2>
          <p
            className={`text-xs sm:text-sm ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            } mt-1 max-w-xs sm:max-w-sm mx-auto leading-relaxed font-medium`}
          >
            {slide.description}
          </p>
        </div>

        {/* Car Showcase Card */}
        <div
          className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border ${
            isLight
              ? 'border-slate-200/80 shadow-[0_10px_25px_rgba(15,23,42,0.08)]'
              : 'border-blue-500/20 shadow-[0_15px_35px_rgba(7,26,43,0.8)]'
          }`}
        >
          <div className="w-full h-40 sm:h-48 overflow-hidden bg-slate-900">
            <img
              key={activeSlide}
              src={slide.imageUrl}
              alt={slide.headline}
              className="w-full h-full object-cover"
              style={{
                opacity: fading ? 0 : 1,
                transition: 'opacity 0.3s ease-in-out',
                transform: fading ? 'scale(1.03)' : 'scale(1)',
              }}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#07121E]/90 via-transparent to-transparent pointer-events-none" />
          <div
            className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between transition-opacity duration-300"
            style={{ opacity: fading ? 0 : 1 }}
          >
            <span className="text-xs font-bold text-sky-300 bg-[#07121E]/85 backdrop-blur-md px-3 py-1 rounded-full border border-sky-500/30">
              {slide.badge1}
            </span>
            <span className="text-xs sm:text-sm font-black text-emerald-400 bg-emerald-950/90 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              ⚡ {slide.dailyRewardRate ? `${slide.dailyRewardRate}% Daily Earning` : slide.badge2}
            </span>
          </div>
        </div>

        {/* 3 Value Pillars with enlarged, prominent typography */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full">
          <div
            className={`flex flex-col items-center text-center p-2 sm:p-2.5 rounded-xl sm:rounded-2xl transition-colors ${
              isLight
                ? 'bg-white border border-slate-200/90 shadow-xs'
                : 'bg-white/[0.04] border border-white/10 backdrop-blur-sm'
            }`}
          >
            <div
              className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center mb-1 ${
                isLight
                  ? 'bg-blue-50 border border-blue-100 text-blue-600'
                  : 'bg-blue-500/10 border border-blue-500/20 text-sky-400'
              }`}
            >
              <Shield className="w-4 h-4" />
            </div>
            <span className={`text-xs font-bold tracking-tight ${isLight ? 'text-slate-800' : 'text-white'}`}>
              Secure Fleet
            </span>
            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} font-medium`}>
              Protected Assets
            </span>
          </div>

          <div
            className={`flex flex-col items-center text-center p-2 sm:p-2.5 rounded-xl sm:rounded-2xl transition-colors ${
              isLight
                ? 'bg-white border border-slate-200/90 shadow-xs'
                : 'bg-white/[0.04] border border-white/10 backdrop-blur-sm'
            }`}
          >
            <div
              className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center mb-1 ${
                isLight
                  ? 'bg-emerald-50 border border-emerald-100 text-emerald-600'
                  : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className={`text-xs font-black tracking-tight ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
              {slide.dailyRewardRate ? `${slide.dailyRewardRate}% Daily` : 'Daily Yields'}
            </span>
            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} font-medium`}>
              24-Hour Payouts
            </span>
          </div>

          <div
            className={`flex flex-col items-center text-center p-2 sm:p-2.5 rounded-xl sm:rounded-2xl transition-colors ${
              isLight
                ? 'bg-white border border-slate-200/90 shadow-xs'
                : 'bg-white/[0.04] border border-white/10 backdrop-blur-sm'
            }`}
          >
            <div
              className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center mb-1 ${
                isLight
                  ? 'bg-cyan-50 border border-cyan-100 text-cyan-600'
                  : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
              }`}
            >
              <Globe className="w-4 h-4" />
            </div>
            <span className={`text-xs font-bold tracking-tight ${isLight ? 'text-slate-800' : 'text-white'}`}>
              Global Access
            </span>
            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} font-medium`}>
              Instant Withdraw
            </span>
          </div>
        </div>

        {/* Carousel indicator dots */}
        <div className="flex items-center justify-center gap-1.5 py-0.5">
          {splashSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === activeSlide
                  ? isLight
                    ? 'w-5 h-1.5 bg-[#155EEF]'
                    : 'w-5 h-1.5 bg-[#38BDF8]'
                  : isLight
                  ? 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                  : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Action Buttons: Positioned directly under dots with tight spacing */}
        <div className="w-full space-y-2 pt-1 pb-1">
          <button
            id="splash-get-started-btn"
            onClick={() => navigate('register')}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#155EEF] via-[#2563EB] to-[#0EA5E9] hover:from-[#1D4ED8] hover:to-[#0284C7] text-white font-extrabold text-sm sm:text-base shadow-[0_12px_28px_rgba(21,94,239,0.45)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer border border-white/15"
          >
            <span className="tracking-wide">Get Started</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </button>

          <p
            className={`text-center text-xs sm:text-sm ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            } font-medium`}
          >
            Already have an account?{' '}
            <button
              id="splash-login-btn"
              onClick={() => navigate('login')}
              className={`${
                isLight
                  ? 'text-[#155EEF] hover:text-[#1D4ED8]'
                  : 'text-[#38BDF8] hover:text-[#7DD3FC]'
              } font-extrabold text-xs sm:text-sm hover:underline underline-offset-4 decoration-2 ml-1 cursor-pointer transition-all`}
            >
              Log In
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(1.02); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
