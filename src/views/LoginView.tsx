import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Shield,
  Loader2,
  Sun,
  Moon,
} from 'lucide-react';
import { RentoBitLogo } from '../components/RentoBitLogo';
import { ASSETS } from '../assets/images';
import { useApp } from '../context/AppContext';
import { CaptchaWidget, CaptchaHandle } from '../components/ui/CaptchaWidget';

export const LoginView: React.FC = () => {
  const { login, navigate, theme, toggleTheme } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const captchaRef = useRef<CaptchaHandle>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaptchaError('');

    if (!email || !password) return;

    if (!captchaRef.current?.verify(captchaValue)) {
      setCaptchaError('Incorrect CAPTCHA code. Please try again.');
      captchaRef.current?.refresh();
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    await login(email, password);
    setIsLoading(false);
    captchaRef.current?.refresh();
  };

  return (
    <div
      className={`min-h-screen ${
        theme === 'light' ? 'bg-[#F4F7FB] text-slate-900' : 'bg-[#07121E] text-white'
      } flex items-center justify-center p-0 sm:p-6 lg:p-8 transition-colors duration-200`}
    >
      <div
        className={`w-full max-w-5xl ${
          theme === 'light'
            ? 'bg-white border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.08)]'
            : 'bg-[#09182A] border-white/10 shadow-2xl'
        } lg:rounded-3xl border overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[92vh]`}
      >
        {/* LEFT PANEL */}
        <div
          className={`hidden lg:flex lg:col-span-5 ${
            theme === 'light'
              ? 'bg-gradient-to-b from-blue-50 via-slate-50 to-blue-100/50 border-r border-slate-200'
              : 'bg-gradient-to-b from-[#05101C] via-[#07172A] to-[#0A223E] border-r border-white/10'
          } p-8 flex-col justify-between relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center">
            <div className="flex justify-center w-full">
              <RentoBitLogo size="xl" theme={theme} />
            </div>
            <div className="mt-6 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-sky-400 text-[10px] font-extrabold uppercase tracking-wider mb-2.5">
                ● Decentralized Fleet Mobility
              </span>
              <h2
                className={`text-2xl sm:text-3xl font-black ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                } font-['Outfit',sans-serif] leading-tight`}
              >
                Drive Your Future.
              </h2>
              <h3 className="text-2xl sm:text-3xl font-black text-[#155EEF] font-['Outfit',sans-serif] leading-tight">
                Earn Every Day.
              </h3>
              <p
                className={`text-xs ${
                  theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                } mt-2.5 leading-relaxed max-w-sm mx-auto`}
              >
                Turn commercial mobility and high-demand vehicle fleets into continuous daily passive revenue streams. Safe, transparent, and distributed directly to your wallet every 24 hours.
              </p>
            </div>
          </div>

          <div className="my-6 relative rounded-2xl overflow-hidden border border-blue-500/20 shadow-xl">
            <img
              src={ASSETS.carHero}
              alt="RentoBit Mobility Sports Sedan"
              className="w-full h-auto object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-bold text-sky-300">
              <span>● Real Fleet Assets</span>
              <span className="text-emerald-400">Daily Distribution</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Secure', sub: 'Bank-level', color: theme === 'light' ? 'text-slate-900' : 'text-white' },
              { label: 'Earnings', sub: 'Every Day', color: 'text-emerald-500' },
              { label: 'Global', sub: 'Worldwide', color: 'text-blue-600' },
            ].map(({ label, sub, color }) => (
              <div
                key={label}
                className={`p-2.5 rounded-xl ${
                  theme === 'light'
                    ? 'bg-white border border-slate-200 shadow-xs'
                    : 'bg-white/5 border border-white/10'
                } text-center`}
              >
                <span className={`text-[11px] font-bold block ${color}`}>{label}</span>
                <span className={`text-[9px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Login Form */}
        <div
          className={`lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between max-w-xl mx-auto w-full ${
            theme === 'light' ? 'bg-white' : 'bg-[#07121E]/60'
          } backdrop-blur-md`}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('splash')}
              className={`w-10 h-10 rounded-xl ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
              } flex items-center justify-center transition-colors`}
              aria-label="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              className={`w-10 h-10 rounded-xl ${
                theme === 'light'
                  ? 'bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100 shadow-xs'
                  : 'bg-white/5 border border-white/10 text-sky-300 hover:bg-white/10'
              } flex items-center justify-center transition-all cursor-pointer`}
            >
              {theme === 'light' ? <Sun className="w-5 h-5 stroke-[2.2]" /> : <Moon className="w-5 h-5 stroke-[2.2]" />}
            </button>
          </div>

          <div className="my-6">
            <div className="flex flex-col items-center text-center">
              <RentoBitLogo size="2xl" theme={theme} className="scale-105" />
              <h1
                className={`text-2xl sm:text-3xl font-extrabold ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                } mt-4 font-['Outfit',sans-serif]`}
              >
                Welcome Back!
              </h1>
              <p className={`text-xs sm:text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'} mt-1`}>
                Login to continue to your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Email */}
              <div>
                <label className={`block text-xs font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} mb-1.5`}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={`w-full pl-11 pr-4 py-3 rounded-2xl ${
                      theme === 'light'
                        ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#155EEF] focus:ring-1 focus:ring-[#155EEF]'
                        : 'bg-[#09192C] border border-white/10 text-white placeholder:text-slate-500 focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]'
                    } text-sm transition-colors outline-none`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className={`block text-xs font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} mb-1.5`}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`w-full pl-11 pr-11 py-3 rounded-2xl ${
                      theme === 'light'
                        ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#155EEF] focus:ring-1 focus:ring-[#155EEF]'
                        : 'bg-[#09192C] border border-white/10 text-white placeholder:text-slate-500 focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]'
                    } text-sm transition-colors outline-none`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => navigate('forgot-password')}
                    className={`text-xs ${
                      theme === 'light' ? 'text-[#155EEF] hover:text-[#1D4ED8]' : 'text-[#38BDF8] hover:text-[#7DD3FC]'
                    } hover:underline font-semibold cursor-pointer`}
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* CAPTCHA */}
              <CaptchaWidget
                ref={captchaRef}
                theme={theme}
                value={captchaValue}
                setValue={setCaptchaValue}
              />

              {captchaError && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-medium text-center ${
                    theme === 'light'
                      ? 'bg-rose-50 border border-rose-200 text-rose-700'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {captchaError}
                </div>
              )}

              <button
                id="login-submit-button"
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#155EEF] via-[#2563EB] to-[#0EA5E9] hover:from-[#1D4ED8] hover:to-[#0284C7] text-white font-bold text-sm shadow-[0_10px_25px_rgba(21,94,239,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </form>

            {/* Secure & Protected Card */}
            <div
              className={`mt-5 p-4 rounded-2xl ${
                theme === 'light'
                  ? 'bg-blue-50/80 border border-blue-200'
                  : 'bg-gradient-to-r from-blue-950/60 to-[#0A223E]/50 border border-blue-500/25'
              } flex items-center gap-3.5`}
            >
              <div
                className={`w-10 h-10 rounded-xl ${
                  theme === 'light'
                    ? 'bg-blue-100 border border-blue-200 text-blue-600'
                    : 'bg-blue-500/20 border border-blue-500/30 text-[#38BDF8]'
                } flex items-center justify-center shrink-0`}
              >
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h4 className={`text-xs font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Secure &amp; Protected
                </h4>
                <p className={`text-[11px] ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} mt-0.5 leading-snug`}>
                  Your data is encrypted and 100% secure with us.
                </p>
              </div>
            </div>

            <p className={`text-center text-sm sm:text-base ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} mt-6 font-medium`}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('register')}
                className={`${
                  theme === 'light' ? 'text-[#155EEF] hover:text-[#1D4ED8]' : 'text-[#38BDF8] hover:text-[#7DD3FC]'
                } font-extrabold text-sm sm:text-base hover:underline underline-offset-4 decoration-2 ml-1 cursor-pointer transition-all`}
              >
                Sign Up
              </button>
            </p>
          </div>

          {/* Footer */}
          <div
            className={`pt-4 border-t ${
              theme === 'light' ? 'border-slate-200 text-slate-500' : 'border-white/5 text-slate-400'
            } flex flex-col items-center gap-2.5 text-[11px] font-medium`}
          >
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>256-bit SSL Secured</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>KYC Verified</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400">
              <button type="button" onClick={() => navigate('terms')} className="hover:underline hover:text-blue-500 transition-colors cursor-pointer">
                Terms of Service
              </button>
              <span>•</span>
              <button type="button" onClick={() => navigate('privacy')} className="hover:underline hover:text-emerald-500 transition-colors cursor-pointer">
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
