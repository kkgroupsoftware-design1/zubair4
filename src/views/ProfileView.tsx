import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Lock,
  Smartphone,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Copy,
  Check,
  FileText,
  Mail,
  Phone,
  ArrowRight,
  Edit3,
  Save,
  X,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  Hash,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';

export const ProfileView: React.FC = () => {
  const { user, kyc, logout, navigate, switchUserRole, theme, updateProfile, changePassword, updateWithdrawPin } = useApp();
  const { showToast } = useToast();

  const isLight = theme === 'light';

  /* ── Edit Profile State ── */
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  /* ── Change Password State ── */
  const [pwSection, setPwSection] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  /* ── Withdraw PIN State ── */
  const [pinSection, setPinSection] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [savingPin, setSavingPin] = useState(false);

  /* ── Misc ── */
  const [copiedRef, setCopiedRef] = useState(false);

  const referralLink = `https://rentobit.app/join?ref=${user?.referralCode || 'RENTO'}`;

  const handleCopyReferral = () => {
    navigator.clipboard?.writeText(referralLink);
    setCopiedRef(true);
    showToast('Copied', referralLink);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleOpenEdit = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditPhone(user?.phone || '');
    setEditMode(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) { showToast('Error', 'Name is required', 'error'); return; }
    setSavingProfile(true);
    const ok = await updateProfile(editName.trim(), user?.email || '', editPhone.trim());
    setSavingProfile(false);
    if (ok) setEditMode(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) { showToast('Error', 'New passwords do not match', 'error'); return; }
    if (newPw.length < 6) { showToast('Error', 'Password must be at least 6 characters', 'error'); return; }
    setSavingPw(true);
    const ok = await changePassword(currentPw, newPw);
    setSavingPw(false);
    if (ok) { setCurrentPw(''); setNewPw(''); setConfirmPw(''); setPwSection(false); }
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(newPin)) { showToast('Error', 'PIN must be 4-6 digits', 'error'); return; }
    if (newPin !== confirmPin) { showToast('Error', 'PINs do not match', 'error'); return; }
    setSavingPin(true);
    const ok = await updateWithdrawPin(newPin, currentPin || undefined);
    setSavingPin(false);
    if (ok) { setCurrentPin(''); setNewPin(''); setConfirmPin(''); setPinSection(false); }
  };

  /* ── Reusable field style ── */
  const fieldCls = `w-full px-3.5 py-2.5 rounded-xl text-xs outline-none transition-colors ${
    isLight
      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-500 placeholder:text-slate-400'
      : 'bg-[#06121F] border border-white/15 text-white focus:border-sky-500 placeholder:text-slate-500'
  }`;

  const labelCls = `block text-[11px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`;

  return (
    <div className="space-y-4 sm:space-y-5 pb-24">

      {/* ═══════════════════════════════════════════════
          1. VIP IDENTITY CARD
      ═══════════════════════════════════════════════ */}
      <div
        className={`rounded-3xl ${
          isLight
            ? 'bg-gradient-to-br from-[#061C36] via-[#0A2A50] to-[#041122] border border-blue-400/30 shadow-xl'
            : 'bg-gradient-to-br from-[#06182E] via-[#092240] to-[#040E1B] border border-blue-500/25 shadow-2xl'
        } text-white p-5 sm:p-6 relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 w-60 h-60 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Avatar row */}
          <div className="flex items-start sm:items-center justify-between gap-3.5">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                  alt={user?.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-sky-400/50 shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#06182E] rounded-full" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight font-['Outfit',sans-serif] truncate">
                    {user?.name || 'User'}
                  </h2>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      user?.kycStatus === 'Approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    KYC: {user?.kycStatus || 'Pending'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 truncate mt-0.5 font-medium flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-sky-400 shrink-0" />
                  <span className="truncate">{user?.email || '—'}</span>
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{user?.phone || '—'}</span>
                </p>
              </div>
            </div>

            {/* Edit / KYC buttons */}
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={handleOpenEdit}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sky-200 hover:text-white text-xs font-bold border border-white/15 transition-all active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={() => navigate('kyc')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#155EEF] to-[#0EA5E9] hover:from-blue-600 hover:to-sky-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <span>{user?.kycStatus === 'Approved' ? 'View KYC' : 'Verify'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mobile KYC button */}
          <button
            onClick={() => navigate('kyc')}
            className="sm:hidden w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#155EEF] to-[#0EA5E9] text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{user?.kycStatus === 'Approved' ? 'Identity Verified (View Details)' : 'Complete Verification'}</span>
          </button>

          {/* Referral */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 text-[11px]">Invite Code:</span>
              <span className="text-sky-300 font-mono font-black bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                {user?.referralCode || 'RENTO'}
              </span>
            </div>
            <button
              onClick={handleCopyReferral}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-sky-200 hover:text-white text-xs font-semibold border border-white/10 active:scale-95 transition-all"
            >
              {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-sky-300" />}
              <span>{copiedRef ? 'Copied to Clipboard' : 'Copy Referral Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          EDIT PROFILE PANEL (inline, expands on demand)
      ═══════════════════════════════════════════════ */}
      {editMode && (
        <div
          className={`rounded-3xl ${
            isLight
              ? 'bg-white border border-blue-200 shadow-lg'
              : 'bg-[#091A2E] border border-sky-500/30 shadow-xl'
          } p-5 space-y-4`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-sky-500" />
              <h3 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'} font-['Outfit',sans-serif]`}>
                Edit Profile
              </h3>
            </div>
            <button
              onClick={() => setEditMode(false)}
              className={`p-1.5 rounded-xl ${isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-white/10'} transition-colors`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Ali Hassan"
                className={fieldCls}
              />
            </div>
            <div>
              <label className={labelCls}>Phone Number</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className={fieldCls}
              />
            </div>
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className={labelCls}>Email Address</label>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  <Lock className="w-2.5 h-2.5" /> Permanently Locked
                </span>
              </div>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || editEmail}
                  readOnly
                  disabled
                  tabIndex={-1}
                  className={`${fieldCls} opacity-60 cursor-not-allowed select-none bg-slate-100 dark:bg-white/5 border-dashed pr-10`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className={`text-[10px] mt-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Account email is permanently registered and cannot be modified.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setEditMode(false)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/5 text-slate-300 hover:bg-white/10'
              } transition-colors`}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-colors"
            >
              {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{savingProfile ? 'Saving…' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          2. SECURITY CARD — Password + PIN
      ═══════════════════════════════════════════════ */}
      <div
        className={`rounded-3xl ${
          isLight
            ? 'bg-white border border-slate-200/90 shadow-md'
            : 'bg-[#091A2E] border border-white/10 shadow-xl'
        } p-4 sm:p-5 space-y-3`}
      >
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#155EEF] dark:text-sky-400" />
          <h3 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'} font-['Outfit',sans-serif]`}>
            Security &amp; Authentication
          </h3>
        </div>

        {/* ── Change Password Row ── */}
        <div
          className={`rounded-2xl ${
            isLight ? 'bg-slate-50 border border-slate-200/80' : 'bg-[#06121F] border border-white/10'
          } overflow-hidden`}
        >
          <button
            onClick={() => { setPwSection(!pwSection); setPinSection(false); }}
            className="w-full p-3.5 flex items-center justify-between gap-3 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-[#155EEF] dark:text-sky-400 flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Change Password</h4>
                <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Update your account login password</p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${pwSection ? 'rotate-90' : ''}`} />
          </button>

          {pwSection && (
            <form onSubmit={handleChangePassword} className={`px-4 pb-4 pt-1 border-t ${isLight ? 'border-slate-200' : 'border-white/10'} space-y-3`}>
              {/* Current Password */}
              <div>
                <label className={labelCls}>Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="Your current password"
                    required
                    className={`${fieldCls} pr-10`}
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {/* New Password */}
              <div>
                <label className={labelCls}>New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    className={`${fieldCls} pr-10`}
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {/* Confirm Password */}
              <div>
                <label className={labelCls}>Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className={`${fieldCls} pr-10`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPw && confirmPw && newPw !== confirmPw && (
                  <p className="text-[10px] text-rose-500 mt-1">Passwords do not match</p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setPwSection(false)} className={`px-3.5 py-2 rounded-xl text-xs font-semibold ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-white/5 text-slate-300'}`}>Cancel</button>
                <button
                  type="submit"
                  disabled={savingPw || !currentPw || !newPw || !confirmPw}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  {savingPw ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {savingPw ? 'Saving…' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Withdraw PIN Row ── */}
        <div
          className={`rounded-2xl ${
            isLight ? 'bg-slate-50 border border-slate-200/80' : 'bg-[#06121F] border border-white/10'
          } overflow-hidden`}
        >
          <button
            onClick={() => { setPinSection(!pinSection); setPwSection(false); }}
            className="w-full p-3.5 flex items-center justify-between gap-3 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Hash className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Withdrawal PIN</h4>
                <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>4–6 digit PIN required when withdrawing funds</p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${pinSection ? 'rotate-90' : ''}`} />
          </button>

          {pinSection && (
            <form onSubmit={handleUpdatePin} className={`px-4 pb-4 pt-1 border-t ${isLight ? 'border-slate-200' : 'border-white/10'} space-y-3`}>
              <div>
                <label className={labelCls}>Current PIN <span className="font-normal opacity-70">(leave blank if not set yet)</span></label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Current 4-6 digit PIN"
                  className={fieldCls}
                />
              </div>
              <div>
                <label className={labelCls}>New PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="New 4-6 digit PIN"
                  required
                  className={fieldCls}
                />
              </div>
              <div>
                <label className={labelCls}>Confirm New PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Repeat new PIN"
                  required
                  className={fieldCls}
                />
                {newPin && confirmPin && newPin !== confirmPin && (
                  <p className="text-[10px] text-rose-500 mt-1">PINs do not match</p>
                )}
              </div>
              <div
                className={`p-3 rounded-xl text-[10px] flex items-start gap-2 ${
                  isLight ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>This PIN will be required each time you request a withdrawal. Keep it confidential.</span>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setPinSection(false)} className={`px-3.5 py-2 rounded-xl text-xs font-semibold ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-white/5 text-slate-300'}`}>Cancel</button>
                <button
                  type="submit"
                  disabled={savingPin || !newPin || !confirmPin}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  {savingPin ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {savingPin ? 'Saving…' : 'Set PIN'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── 2FA Toggle (visual, UI preference) ── */}
        <div
          className={`p-3.5 rounded-2xl ${
            isLight ? 'bg-slate-50 border border-slate-200/80' : 'bg-[#06121F] border border-white/10'
          } flex items-center justify-between gap-3`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Two-Factor Auth (2FA)</h4>
              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Adds an extra layer of security on payouts</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            Active
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          3. APPLICATION OPTIONS
      ═══════════════════════════════════════════════ */}
      <div
        className={`rounded-3xl ${
          isLight
            ? 'bg-white border border-slate-200/90 shadow-md'
            : 'bg-[#091A2E] border border-white/10 shadow-xl'
        } p-4 sm:p-5 space-y-3`}
      >
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-[#155EEF] dark:text-sky-400" />
          <h3 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'} font-['Outfit',sans-serif]`}>
            Application Options
          </h3>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          {[
            { label: 'Identity Verification Status', icon: <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />, onClick: () => navigate('kyc') },
            { label: 'Help Desk & 24/7 Support', icon: <User className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />, onClick: () => navigate('support') },
            { label: 'Terms of Service', icon: <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />, onClick: () => navigate('terms') },
            { label: 'Privacy Policy', icon: <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />, onClick: () => navigate('privacy') },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`w-full p-3 sm:p-3.5 rounded-2xl ${
                isLight
                  ? 'bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-800'
                  : 'bg-[#06121F] hover:bg-[#07172B] border border-white/10 text-white'
              } flex items-center justify-between text-xs transition-colors cursor-pointer active:scale-[0.99]`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span className="font-semibold">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          ))}
        </div>

        {/* Sign Out */}
        <div className={`pt-3 border-t ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
          <button
            onClick={logout}
            className="w-full py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
