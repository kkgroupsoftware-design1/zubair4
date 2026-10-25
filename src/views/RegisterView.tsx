import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Gift,
  ShieldCheck,
  Shield,
  Loader2,
  ChevronDown,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { RentoBitLogo } from '../components/RentoBitLogo';
import { ASSETS } from '../assets/images';
import { COUNTRIES } from '../data/countries';
import { useApp } from '../context/AppContext';
import { CaptchaWidget, CaptchaHandle } from '../components/ui/CaptchaWidget';

export const RegisterView: React.FC = () => {
  const { register, navigate, theme, toggleTheme } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+92');
  const [countryFlag, setCountryFlag] = useState('🇵🇰');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [agreed, setAgreed] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const captchaRef = useRef<CaptchaHandle>(null);

  const [countrySearch, setCountrySearch] = useState('');

  const [countryDropdown, setCountryDropdown] = useState(false);

  const countries = COUNTRIES;

  const filteredCountries = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.includes(countrySearch)
  );

  const [isFromInviteLink, setIsFromInviteLink] = useState(false);
  const [sponsorStatus, setSponsorStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [sponsorInfo, setSponsorInfo] = useState<{ name: string; code: string } | null>(null);
  const [sponsorError, setSponsorError] = useState<string>('');

  // Auto-populate referral code if user arrived via invite link (?ref=CODE, ?referral=CODE, etc.) or saved in session
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref') || params.get('referral') || params.get('code') || params.get('sponsor');
      const savedRef = ref || sessionStorage.getItem('rentobit_ref_code') || localStorage.getItem('rentobit_ref_code');
      if (savedRef && savedRef.trim()) {
        const clean = savedRef.trim().toUpperCase();
        setReferralCode(clean);
        setIsFromInviteLink(true);
        sessionStorage.setItem('rentobit_ref_code', clean);
        localStorage.setItem('rentobit_ref_code', clean);
      }
    } catch {
      // fallback
    }
  }, []);

  // Real-time debounced verification:
  // If user entered a code or arrived from link, verify with backend that the sponsor genuinely exists.
  // Random or non-existent codes are immediately flagged.
  useEffect(() => {
    const clean = referralCode.trim().toUpperCase();
    if (!clean) {
      setSponsorStatus('idle');
      setSponsorInfo(null);
      setSponsorError('');
      return;
    }

    setSponsorStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/referrals/verify/${encodeURIComponent(clean)}`);
        const data = await res.json();
        if (data.valid) {
          setSponsorStatus('valid');
          setSponsorInfo({ name: data.sponsorName, code: data.referralCode });
          setSponsorError('');
        } else {
          setSponsorStatus('invalid');
          setSponsorInfo(null);
          setSponsorError(data.error || `Sponsor code "${clean}" does not exist in our system.`);
        }
      } catch {
        setSponsorStatus('invalid');
        setSponsorInfo(null);
        setSponsorError('Unable to verify sponsor code at this moment.');
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [referralCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Referral code validation:
    // If a referral code was entered or provided via URL, it MUST be valid.
    // Random / fake / non-existent sponsor codes cannot be used.
    if (referralCode.trim()) {
      if (sponsorStatus === 'invalid') {
        setError(`Invalid Sponsor Code "${referralCode.trim().toUpperCase()}": Only valid registered sponsor codes are accepted. Please enter a valid sponsor code or clear the field to register directly.`);
        return;
      }
      if (sponsorStatus === 'checking') {
        setError('Please wait a moment while your sponsor code is being verified...');
        return;
      }
    }

    // Referral code is optional: if left empty, account is created as a direct user without sponsor
    if (!captchaRef.current?.verify(captchaValue)) {
      setError('Incorrect CAPTCHA code. Please try again.');
      captchaRef.current?.refresh();
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const cleanRef = referralCode.trim() && sponsorStatus === 'valid' ? referralCode.trim().toUpperCase() : undefined;
    const success = await register(fullName, email, `${countryCode} ${phone}`, cleanRef);
    setIsLoading(false);
    if (!success) {
      captchaRef.current?.refresh();
    }
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
        {/* LEFT PANEL: Branding + 3D Car Visual + Gift Box (Visible on Desktop) */}
        <div
          className={`hidden lg:flex lg:col-span-5 ${
            theme === 'light'
              ? 'bg-gradient-to-b from-blue-50 via-slate-50 to-blue-100/50 border-r border-slate-200'
              : 'bg-gradient-to-b from-[#05101C] via-[#07172A] to-[#0A223E] border-r border-white/10'
          } p-8 flex-col justify-between relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Logo & Headlines */}
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
                Invest in real-world tokenized vehicle fleets, ride-share operations, and luxury mobility assets. Collect automated daily payouts with institutional-grade capital security.
              </p>
            </div>
          </div>

          {/* 3D Car Graphic */}
          <div className="my-4 relative rounded-2xl overflow-hidden border border-blue-500/20 shadow-xl">
            <img
              src={ASSETS.carHero}
              alt="RentoBit Fleet"
              className="w-full h-auto object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-bold text-sky-300">
              <span>● Decentralized Mobility</span>
              <span className="text-emerald-400">Institutional Yield</span>
            </div>
          </div>

          {/* Join RentoBit Today! Gift Card */}
          <div
            className={`p-4 rounded-2xl ${
              theme === 'light'
                ? 'bg-blue-50 border border-blue-200'
                : 'bg-gradient-to-r from-blue-950/70 to-[#0B2544]/60 border border-blue-500/25'
            } flex items-center gap-3.5`}
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Gift className="w-7 h-7 text-[#155EEF]" />
            </div>
            <div>
              <h4
                className={`text-xs font-bold ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
              >
                Join RentoBit Today!
              </h4>
              <p
                className={`text-[11px] ${
                  theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                } mt-0.5 leading-snug`}
              >
                Create your account and start your journey towards smart investments.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Register Form (Matches screenshot 2) */}
        <div
          className={`lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between max-w-xl mx-auto w-full ${
            theme === 'light' ? 'bg-white' : 'bg-[#07121E]/60'
          } backdrop-blur-md overflow-y-auto`}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('login')}
              className={`w-10 h-10 rounded-xl ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
              } flex items-center justify-center transition-colors`}
              aria-label="Go to login"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              {/* Theme Toggle Button */}
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
          </div>

          {/* Form Content */}
          <div className="my-5">
            <div className="flex flex-col items-center text-center">
              <RentoBitLogo size="2xl" theme={theme} className="scale-105" />
              <h1
                className={`text-2xl sm:text-3xl font-extrabold ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                } mt-3 font-['Outfit',sans-serif]`}
              >
                Create Account
              </h1>
              <p
                className={`text-xs sm:text-sm ${
                  theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                } mt-1`}
              >
                Register to get started with RentoBit
              </p>
            </div>

            {error && (
              <div
                className={`mt-4 p-3 rounded-xl ${
                  theme === 'light'
                    ? 'bg-rose-50 border border-rose-200 text-rose-700'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                } text-xs text-center font-medium`}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              {/* Full Name */}
              <div>
                <label
                  className={`block text-xs font-semibold ${
                    theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                  } mb-1`}
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    id="register-name-input"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full pl-11 pr-4 py-2.5 rounded-2xl ${
                      theme === 'light'
                        ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#155EEF] focus:ring-1 focus:ring-[#155EEF]'
                        : 'bg-[#09192C] border border-white/10 text-white placeholder:text-slate-500 focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]'
                    } text-sm outline-none transition-colors`}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label
                  className={`block text-xs font-semibold ${
                    theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                  } mb-1`}
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="register-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className={`w-full pl-11 pr-4 py-2.5 rounded-2xl ${
                      theme === 'light'
                        ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#155EEF] focus:ring-1 focus:ring-[#155EEF]'
                        : 'bg-[#09192C] border border-white/10 text-white placeholder:text-slate-500 focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]'
                    } text-sm outline-none transition-colors`}
                  />
                </div>
              </div>

              {/* Phone Number with Country Flag Picker */}
              <div>
                <label
                  className={`block text-xs font-semibold ${
                    theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                  } mb-1`}
                >
                  Phone Number
                </label>
                <div className="flex gap-2 min-w-0">
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setCountryDropdown(!countryDropdown)}
                      className={`h-full px-3 py-2.5 rounded-2xl ${
                        theme === 'light'
                          ? 'bg-slate-50 border border-slate-300 text-slate-900 hover:bg-slate-100'
                          : 'bg-[#09192C] border border-white/10 text-white hover:border-white/20'
                      } flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors`}
                    >
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{countryFlag}</span>
                      <span>{countryCode}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {countryDropdown && (
                      <div
                        className={`absolute left-0 mt-2 w-56 rounded-xl ${
                          theme === 'light'
                            ? 'bg-white border border-slate-200 shadow-xl'
                            : 'bg-[#0F2238] border border-white/15 shadow-xl'
                        } z-30 overflow-hidden`}
                      >
                        {/* Search box */}
                        <div
                          className={`p-2 border-b ${
                            theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-[#0A1A2C]'
                          }`}
                        >
                          <input
                            type="text"
                            autoFocus
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder="Search country or code..."
                            className={`w-full px-3 py-1.5 rounded-lg ${
                              theme === 'light'
                                ? 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#155EEF]'
                                : 'bg-[#07121E] border border-white/10 text-white placeholder:text-slate-500 focus:border-[#38BDF8]'
                            } text-xs outline-none`}
                          />
                        </div>
                        {/* Scrollable list */}
                        <div className="max-h-52 overflow-y-auto p-1 space-y-0.5">
                          {filteredCountries.length === 0 ? (
                            <p
                              className={`text-xs ${
                                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                              } text-center py-3`}
                            >
                              No results
                            </p>
                          ) : (
                            filteredCountries.map((c, idx) => (
                              <button
                                key={`${c.code}-${idx}`}
                                type="button"
                                onClick={() => {
                                  setCountryCode(c.code);
                                  setCountryFlag(c.flag);
                                  setCountryDropdown(false);
                                  setCountrySearch('');
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs ${
                                  theme === 'light'
                                    ? 'hover:bg-blue-50 text-slate-800'
                                    : 'hover:bg-blue-600 text-slate-200 hover:text-white'
                                } flex items-center gap-2 transition-colors cursor-pointer`}
                              >
                                <span>{c.flag}</span>
                                <span className="font-medium">{c.code}</span>
                                <span
                                  className={`text-[10px] ${
                                    theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                                  } truncate`}
                                >
                                  {c.name}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    id="register-phone-input"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className={`flex-1 min-w-0 w-full px-4 py-2.5 rounded-2xl ${
                      theme === 'light'
                        ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#155EEF] focus:ring-1 focus:ring-[#155EEF]'
                        : 'bg-[#09192C] border border-white/10 text-white placeholder:text-slate-500 focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]'
                    } text-sm outline-none transition-colors`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  className={`block text-xs font-semibold ${
                    theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                  } mb-1`}
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="register-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className={`w-full pl-11 pr-11 py-2.5 rounded-2xl ${
                      theme === 'light'
                        ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#155EEF] focus:ring-1 focus:ring-[#155EEF]'
                        : 'bg-[#09192C] border border-white/10 text-white placeholder:text-slate-500 focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]'
                    } text-sm outline-none transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p
                  className={`text-[11px] ${
                    theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                  } mt-1`}
                >
                  Min. 8 characters with letters and numbers
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  className={`block text-xs font-semibold ${
                    theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                  } mb-1`}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="register-confirm-password-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className={`w-full pl-11 pr-11 py-2.5 rounded-2xl ${
                      theme === 'light'
                        ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#155EEF] focus:ring-1 focus:ring-[#155EEF]'
                        : 'bg-[#09192C] border border-white/10 text-white placeholder:text-slate-500 focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]'
                    } text-sm outline-none transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Referral / Sponsor Code (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="register-referral-input"
                    className={`block text-xs font-bold ${
                      theme === 'light' ? 'text-slate-800' : 'text-slate-200'
                    }`}
                  >
                    Referral / Sponsor Code <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                  </label>
                  {sponsorStatus === 'checking' && (
                    <span className="text-[10px] font-bold text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Verifying...
                    </span>
                  )}
                  {sponsorStatus === 'valid' && (
                    <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified Sponsor
                    </span>
                  )}
                  {sponsorStatus === 'invalid' && (
                    <span className="text-[10px] font-extrabold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Invalid Sponsor Code
                    </span>
                  )}
                  {sponsorStatus === 'idle' && (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-400/10 px-2 py-0.5 rounded-full border border-slate-400/20">
                      Optional
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Gift
                      className={`w-5 h-5 ${
                        sponsorStatus === 'valid'
                          ? 'text-emerald-500'
                          : sponsorStatus === 'invalid'
                          ? 'text-rose-500'
                          : 'text-amber-500'
                      }`}
                    />
                  </div>
                  <input
                    id="register-referral-input"
                    type="text"
                    value={referralCode}
                    onChange={(e) => {
                      setReferralCode(e.target.value);
                      if (!e.target.value.trim()) setIsFromInviteLink(false);
                    }}
                    placeholder="Enter sponsor code or leave empty (Optional, e.g. RENTO-2533)"
                    className={`w-full pl-11 pr-10 py-2.5 rounded-2xl ${
                      theme === 'light'
                        ? 'bg-slate-50 text-slate-900 placeholder:text-slate-400'
                        : 'bg-[#09192C] text-white placeholder:text-slate-500'
                    } ${
                      sponsorStatus === 'valid'
                        ? 'border-2 border-emerald-500 bg-emerald-500/5 focus:border-emerald-500'
                        : sponsorStatus === 'invalid'
                        ? 'border-2 border-rose-500 bg-rose-500/5 focus:border-rose-500'
                        : theme === 'light'
                        ? 'border border-slate-300 focus:bg-white focus:border-[#155EEF] focus:ring-1 focus:ring-[#155EEF]'
                        : 'border border-white/10 focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]'
                    } text-sm font-semibold uppercase tracking-wider outline-none transition-colors`}
                  />
                  {referralCode && (
                    <button
                      type="button"
                      onClick={() => {
                        setReferralCode('');
                        setIsFromInviteLink(false);
                        setSponsorStatus('idle');
                        setSponsorInfo(null);
                        setSponsorError('');
                        try {
                          sessionStorage.removeItem('rentobit_ref_code');
                          localStorage.removeItem('rentobit_ref_code');
                        } catch {}
                      }}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="Clear sponsor code"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Status Callouts */}
                {sponsorStatus === 'valid' && sponsorInfo && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 mt-2 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          Verified Sponsor: {sponsorInfo.name}
                        </p>
                        <p className="text-[10px] text-emerald-500/90 font-mono">
                          Sponsor Code: {sponsorInfo.code}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-wider bg-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                      Verified
                    </span>
                  </div>
                )}

                {sponsorStatus === 'invalid' && (
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 mt-2 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        Invalid Sponsor Code: "{referralCode.trim().toUpperCase()}"
                      </p>
                      <p className="text-[11px] text-rose-500/90 mt-0.5 leading-snug">
                        {sponsorError || 'This sponsor code was not found in our database. Random or non-existent codes are rejected. Please enter a valid registered code (e.g. RENTO-2533) or clear the field to register directly.'}
                      </p>
                    </div>
                  </div>
                )}

                {sponsorStatus === 'idle' && (
                  <p
                    className={`text-[11px] ${
                      theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                    } mt-1`}
                  >
                    Optional: Leave empty to register directly without a sponsor.
                  </p>
                )}
              </div>

              {/* CAPTCHA */}
              <CaptchaWidget
                ref={captchaRef}
                theme={theme}
                value={captchaValue}
                setValue={setCaptchaValue}
              />

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  id="register-agree-checkbox"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className={`w-4 h-4 rounded ${
                    theme === 'light'
                      ? 'border-slate-300 bg-white text-blue-600'
                      : 'border-white/20 bg-[#09192C] text-blue-600'
                  } focus:ring-0 mt-0.5 cursor-pointer`}
                />
                <div
                  className={`text-xs ${
                    theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                  } leading-snug`}
                >
                  <label htmlFor="register-agree-checkbox" className="cursor-pointer">
                    I agree to the{' '}
                  </label>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('terms');
                    }}
                    className={`${
                      theme === 'light' ? 'text-[#155EEF]' : 'text-[#38BDF8]'
                    } font-semibold hover:underline cursor-pointer inline`}
                  >
                    Terms of Service
                  </button>{' '}
                  <span>and</span>{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('privacy');
                    }}
                    className={`${
                      theme === 'light' ? 'text-[#155EEF]' : 'text-[#38BDF8]'
                    } font-semibold hover:underline cursor-pointer inline`}
                  >
                    Privacy Policy
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="register-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#155EEF] via-[#2563EB] to-[#0EA5E9] hover:from-[#1D4ED8] hover:to-[#0284C7] text-white font-bold text-sm shadow-[0_10px_25px_rgba(21,94,239,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            {/* Bottom Link */}
            <p
              className={`text-center text-sm sm:text-base ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-300'
              } mt-5 font-medium`}
            >
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('login')}
                className={`${
                  theme === 'light'
                    ? 'text-[#155EEF] hover:text-[#1D4ED8]'
                    : 'text-[#38BDF8] hover:text-[#7DD3FC]'
                } font-extrabold text-sm sm:text-base hover:underline underline-offset-4 decoration-2 ml-1 cursor-pointer transition-all`}
              >
                Login
              </button>
            </p>
          </div>

          {/* Footer Badges */}
          <div
            className={`pt-3 border-t ${
              theme === 'light' ? 'border-slate-200 text-slate-500' : 'border-white/5 text-slate-400'
            } flex items-center justify-center gap-6 text-[11px] font-medium`}
          >
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>256-bit SSL Secured</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>KYC Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
