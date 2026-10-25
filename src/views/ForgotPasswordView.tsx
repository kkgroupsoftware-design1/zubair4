import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Sun,
  Moon,
  Loader2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RentoBitLogo } from '../components/RentoBitLogo';
import { ASSETS } from '../assets/images';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';

export const ForgotPasswordView: React.FC = () => {
  const { navigate, theme, toggleTheme } = useApp();
  const { showToast } = useToast();

  // Step state: 1 = Email submission, 2 = OTP & New Password, 3 = Success confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // Stores the dev OTP returned by server (remove when real email is wired)
  const [serverOtp, setServerOtp] = useState('');

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Handle OTP input changes across 6 boxes
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // If pasted multiple characters
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      pasted.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextInput = document.getElementById(`otp-input-${Math.min(pasted.length, 5)}`);
      nextInput?.focus();
      return;
    }

    const cleanVal = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    // Auto-focus next input
    if (cleanVal && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Helper: call forgot-password API (used for both initial request & resend)
  const requestOtpFromServer = async (emailAddr: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAddr }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        setErrorMessage(data?.error || 'Failed to send verification code. Please try again.');
        return false;
      }
      // _devOtp is returned by server for testing — remove once real email is live
      if (data?._devOtp) {
        setServerOtp(data._devOtp);
        showToast(`Dev OTP: ${data._devOtp} — check server console logs`, 'info');
      } else {
        showToast('Verification code has been sent to your email.', 'success');
      }
      return true;
    } catch {
      setErrorMessage('Network error. Please check your connection.');
      return false;
    }
  };

  // Step 1 Submission: Verify email exists on server, then issue OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid registered email address.');
      return;
    }

    setIsLoading(true);
    const ok = await requestOtpFromServer(email);
    setIsLoading(false);

    if (ok) {
      setStep(2);
      setResendTimer(60);
      setCanResend(false);
    }
  };

  // Resend OTP Token
  const handleResendOtp = async () => {
    if (!canResend) return;
    setIsLoading(true);
    const ok = await requestOtpFromServer(email);
    setIsLoading(false);
    if (ok) {
      setResendTimer(60);
      setCanResend(false);
    }
  };

  // Password Strength Calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passwordScore = getPasswordStrength(newPassword);

  // Step 2 Submission: Validate OTP on server & update password in DB
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      setErrorMessage('Please enter the complete verification code.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: enteredOtp, newPassword }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || data?.error) {
        setErrorMessage(data?.error || 'Password reset failed. Please try again.');
        return;
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Network error. Please check your connection.');
      return;
    }

    // Server confirmed password update — celebrate
    setServerOtp('');
    setStep(3);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // graceful fallback
    }
    showToast('Password updated successfully! You can now log in.', 'success');
  };

  return (
    <div
      className={`min-h-screen ${
        theme === 'light' ? 'bg-[#F4F7FB] text-slate-900' : 'bg-[#07121E] text-white'
      } flex items-center justify-center p-0 sm:p-6 lg:p-8 transition-colors duration-200`}
    >
      {/* Container: Two-panel on desktop, clean single on mobile */}
      <div
        className={`w-full max-w-5xl ${
          theme === 'light'
            ? 'bg-white border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.08)]'
            : 'bg-[#09182A] border-white/10 shadow-2xl'
        } lg:rounded-3xl border overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[92vh]`}
      >
        {/* LEFT PANEL: Branding & 3D Car Visual (Visible on Desktop) */}
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
                ● Account Security & Recovery
              </span>
              <h2
                className={`text-2xl sm:text-3xl font-black ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                } font-['Outfit',sans-serif] leading-tight`}
              >
                Secure Access.
              </h2>
              <h3 className="text-2xl sm:text-3xl font-black text-[#155EEF] font-['Outfit',sans-serif] leading-tight">
                Protected Assets.
              </h3>
              <p
                className={`text-xs ${
                  theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                } mt-2.5 leading-relaxed max-w-sm mx-auto`}
              >
                Zero-knowledge encrypted key recovery. Re-establish control of your investment portfolio and daily fleet revenue streams securely.
              </p>
            </div>
          </div>

          {/* 3D Car Graphic */}
          <div className="my-6 relative rounded-2xl overflow-hidden border border-blue-500/20 shadow-xl">
            <img
              src={ASSETS.carHero}
              alt="RentoBit Mobility Security Fleet"
              className="w-full h-auto object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-bold text-sky-300">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                256-Bit Cryptographic Auth
              </span>
              <span className="text-blue-300">Fleet ID Safe</span>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-3 gap-2">
            <div
              className={`p-2.5 rounded-xl ${
                theme === 'light'
                  ? 'bg-white border border-slate-200 shadow-xs'
                  : 'bg-white/5 border border-white/10'
              } text-center`}
            >
              <span
                className={`text-[11px] font-bold block ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
              >
                Instant OTP
              </span>
              <span
                className={`text-[9px] ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Fast Delivery
              </span>
            </div>
            <div
              className={`p-2.5 rounded-xl ${
                theme === 'light'
                  ? 'bg-white border border-slate-200 shadow-xs'
                  : 'bg-white/5 border border-white/10'
              } text-center`}
            >
              <span className="text-[11px] font-bold text-emerald-500 block">Encrypted</span>
              <span
                className={`text-[9px] ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                End-to-End
              </span>
            </div>
            <div
              className={`p-2.5 rounded-xl ${
                theme === 'light'
                  ? 'bg-white border border-slate-200 shadow-xs'
                  : 'bg-white/5 border border-white/10'
              } text-center`}
            >
              <span className="text-[11px] font-bold text-blue-600 block">24/7 Support</span>
              <span
                className={`text-[9px] ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Assisted Desk
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Multi-step Reset Form */}
        <div
          className={`lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between max-w-xl mx-auto w-full ${
            theme === 'light' ? 'bg-white' : 'bg-[#07121E]/60'
          } backdrop-blur-md overflow-y-auto`}
        >
          {/* Top Bar: Back, Theme Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (step === 2) setStep(1);
                else navigate('login');
              }}
              className={`w-10 h-10 rounded-xl ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
              } flex items-center justify-center transition-colors cursor-pointer`}
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>



            <div className="flex items-center gap-2">
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

          {/* Main Content Area */}
          <div className="my-6">
            {/* Logo & Headings */}
            <div className="flex flex-col items-center text-center">
              <RentoBitLogo size="2xl" theme={theme} className="scale-105" />

              <h1
                className={`text-2xl sm:text-3xl font-extrabold ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                } mt-4 font-['Outfit',sans-serif]`}
              >
                {step === 1 && 'Forgot Password?'}
                {step === 2 && 'Verify & Reset Password'}
                {step === 3 && 'Password Reset Complete!'}
              </h1>
              <p
                className={`text-xs sm:text-sm ${
                  theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                } mt-1.5 max-w-sm`}
              >
                {step === 1 &&
                  'Enter your registered email address below to reset your password.'}
                {step === 2 && (
                  <>
                    Code sent to <span className="font-semibold text-[#155EEF] dark:text-sky-400">{email}</span>. Enter the code and set your new password.
                  </>
                )}
                {step === 3 &&
                  'Your security credentials have been successfully updated. You can now login to your RentoBit account.'}
              </p>
            </div>

            {/* Error Message Toast */}
            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs text-center font-medium">
                {errorMessage}
              </div>
            )}

            {/* STEP 1: Enter Email Form */}
            {step === 1 && (
              <form onSubmit={handleRequestOtp} className="mt-6 space-y-4">
                <div>
                  <label
                    className={`block text-xs font-semibold ${
                      theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                    } mb-1.5`}
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      id="forgot-email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. yourname@example.com"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-2xl ${
                        theme === 'light'
                          ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#155EEF] focus:ring-4 focus:ring-blue-500/10'
                          : 'bg-[#07121E] border border-white/10 text-white placeholder:text-slate-500 focus:border-[#38BDF8] focus:ring-4 focus:ring-sky-500/10'
                      } text-sm font-medium outline-none transition-all`}
                    />
                  </div>
                </div>

                <button
                  id="forgot-request-otp-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#155EEF] via-[#2563EB] to-[#0EA5E9] hover:from-[#1D4ED8] hover:to-[#0284C7] text-white font-bold text-sm shadow-[0_10px_25px_rgba(21,94,239,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: Enter OTP & New Password */}
            {step === 2 && (
              <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                {/* OTP Box */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      className={`text-xs font-semibold ${
                        theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                      }`}
                    >
                      Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={!canResend || isLoading}
                      className={`text-xs font-bold ${
                        canResend
                          ? 'text-[#155EEF] dark:text-[#38BDF8] hover:underline cursor-pointer'
                          : 'text-slate-400 cursor-not-allowed'
                      } flex items-center gap-1`}
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                      {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                    </button>
                  </div>

                  <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className={`w-full h-12 text-center text-lg font-black rounded-xl sm:rounded-2xl ${
                          digit
                            ? theme === 'light'
                              ? 'bg-blue-50/80 border-2 border-[#155EEF] text-[#155EEF]'
                              : 'bg-blue-500/10 border-2 border-[#38BDF8] text-[#38BDF8]'
                            : theme === 'light'
                            ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#155EEF]'
                            : 'bg-[#07121E] border border-white/10 text-white focus:border-[#38BDF8]'
                        } outline-none transition-all`}
                      />
                    ))}
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label
                    className={`block text-xs font-semibold ${
                      theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                    } mb-1.5`}
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      id="forgot-new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className={`w-full pl-11 pr-11 py-3 rounded-2xl ${
                        theme === 'light'
                          ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#155EEF] focus:ring-4 focus:ring-blue-500/10'
                          : 'bg-[#07121E] border border-white/10 text-white placeholder:text-slate-500 focus:border-[#38BDF8] focus:ring-4 focus:ring-sky-500/10'
                      } text-sm font-medium outline-none transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1 h-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              passwordScore >= step
                                ? passwordScore <= 2
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-500'
                                : theme === 'light'
                                ? 'bg-slate-200'
                                : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500">Security strength:</span>
                        <span
                          className={`font-bold ${
                            passwordScore >= 3
                              ? 'text-emerald-500'
                              : passwordScore >= 2
                              ? 'text-amber-500'
                              : 'text-rose-500'
                          }`}
                        >
                          {passwordScore >= 4
                            ? 'Very Strong'
                            : passwordScore >= 3
                            ? 'Strong'
                            : passwordScore >= 2
                            ? 'Moderate'
                            : 'Weak'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    className={`block text-xs font-semibold ${
                      theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                    } mb-1.5`}
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      id="forgot-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      className={`w-full pl-11 pr-11 py-3 rounded-2xl ${
                        theme === 'light'
                          ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#155EEF] focus:ring-4 focus:ring-blue-500/10'
                          : 'bg-[#07121E] border border-white/10 text-white placeholder:text-slate-500 focus:border-[#38BDF8] focus:ring-4 focus:ring-sky-500/10'
                      } text-sm font-medium outline-none transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  id="forgot-submit-new-password"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#155EEF] via-[#2563EB] to-[#0EA5E9] hover:from-[#1D4ED8] hover:to-[#0284C7] text-white font-bold text-sm shadow-[0_10px_25px_rgba(21,94,239,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Updating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password & Secure Account</span>
                      <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 3: Success Screen */}
            {step === 3 && (
              <div className="mt-6 space-y-4">
                <div
                  className={`p-6 rounded-3xl ${
                    theme === 'light'
                      ? 'bg-emerald-50/70 border border-emerald-200 text-emerald-900'
                      : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                  } text-center space-y-3`}
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">Password Reset Successful</h3>
                    <p className="text-xs mt-1 text-slate-600 dark:text-slate-300">
                      Your password has been encrypted and updated across all devices.
                    </p>
                  </div>
                </div>

                <button
                  id="forgot-success-login-btn"
                  onClick={() => navigate('login')}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#155EEF] via-[#2563EB] to-[#0EA5E9] hover:from-[#1D4ED8] hover:to-[#0284C7] text-white font-bold text-sm shadow-[0_10px_25px_rgba(21,94,239,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Trust Banner */}
            <div
              className={`mt-6 p-3.5 rounded-2xl ${
                theme === 'light' ? 'bg-blue-50/60 border border-blue-100' : 'bg-blue-950/20 border border-blue-500/20'
              } flex items-center gap-3`}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p
                className={`text-[11px] ${
                  theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                } leading-relaxed`}
              >
                Zero-knowledge encrypted key protocol. Your private passkeys and wallets remain safe.
              </p>
            </div>
          </div>

          {/* Bottom Links & Badges */}
          <div>
            <p
              className={`text-center text-sm sm:text-base ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-300'
              } font-medium`}
            >
              Remember your password?{' '}
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

            <div
              className={`mt-4 pt-4 border-t ${
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
    </div>
  );
};
