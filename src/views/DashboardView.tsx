import React from 'react';
import {
  Eye,
  EyeOff,
  Plus,
  Car,
  Briefcase,
  Gift,
  Headphones,
  Clock,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Lock,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  Zap,
  Users,
  Copy,
  Check,
  Link2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import { ASSETS } from '../assets/images';
import { INVESTMENT_PLANS } from '../data/mockData';

export const DashboardView: React.FC = () => {
  const {
    user,
    balance,
    isBalanceHidden,
    toggleBalanceHidden,
    timeRemainingSeconds,
    claimReward,
    dailyRewards,
    investments,
    navigate,
    theme,
    distributionSettings,
    distributionStatus,
    distributionFormattedWindow,
    distributionProgress,
    loadViewData,
    loadingView,
    plans = [],
    referralData,
    fetchUserReferrals,
  } = useApp();

  // Lazy load dashboard data on mount (balance, investments, today's reward, referrals)
  React.useEffect(() => {
    if (user?.id) {
      loadViewData('dashboard', 1, true); // force=true so it always refreshes on user change
      fetchUserReferrals();
    }
  }, [user?.id, fetchUserReferrals]);

  const { showToast } = useToast();
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);

  const handleCopyReferral = () => {
    const code = referralData?.referralCode || user?.referralCode || '';
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      showToast('Referral code copied to clipboard!', 'success');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyInviteLink = () => {
    const code = referralData?.referralCode || user?.referralCode || '';
    if (code) {
      const inviteUrl = `${window.location.origin}/join?ref=${code}`;
      navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      showToast('Invite link copied!', inviteUrl, 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const padZero = (n: number) => n.toString().padStart(2, '0');

  // Live 1-second interval ticker for synchronous countdown precision
  const [currentNow, setCurrentNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Exact today date string in system timezone (YYYY-MM-DD)
  const todayDateStr = React.useMemo(() => {
    try {
      const dtf = new Intl.DateTimeFormat('en-CA', {
        timeZone: distributionSettings?.timezone || 'Asia/Karachi',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return dtf.format(new Date());
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }, [distributionSettings?.timezone]);

  // All active investments & active yield
  const activeInvestments = investments.filter((i) => i.status === 'Active');
  const activeDailyYield = activeInvestments.reduce((sum, inv) => sum + (inv.dailyReward || 0), 0);
  const maturedActiveInvestments = activeInvestments.filter((i) => i.isMatured !== false);
  const maturedDailySum = maturedActiveInvestments.reduce((sum, inv) => sum + (inv.dailyReward || 0), 0);
  const hasOnlyMaturingPlans = activeInvestments.length > 0 && maturedActiveInvestments.length === 0;

  // Find the user's active maturing plan with the nearest backend nextRewardTime (matches My Active Plans)
  const maturingPlan = React.useMemo(() => {
    if (!hasOnlyMaturingPlans) return null;
    const sorted = [...activeInvestments]
      .filter((i) => i.isMatured === false || (i.nextRewardTime && new Date(i.nextRewardTime).getTime() > currentNow))
      .sort((a, b) => {
        const tA = a.nextRewardTime ? new Date(a.nextRewardTime).getTime() : 0;
        const tB = b.nextRewardTime ? new Date(b.nextRewardTime).getTime() : 0;
        return tA - tB;
      });
    return sorted[0] || null;
  }, [activeInvestments, hasOnlyMaturingPlans, currentNow]);

  // Target timestamp and seconds remaining for this specific user's active plan
  const planTargetTs = maturingPlan?.nextRewardTime
    ? new Date(maturingPlan.nextRewardTime).getTime()
    : maturingPlan?.startDate
    ? new Date(maturingPlan.startDate).getTime() + 24 * 3600 * 1000
    : 0;

  const planSecondsRemaining = planTargetTs > currentNow
    ? Math.max(0, Math.floor((planTargetTs - currentNow) / 1000))
    : 0;

  // Format timestamp into 12-hour formatted time with system timezone
  const formatTimeInTz = (dateInput?: Date | string | number | null) => {
    if (!dateInput) return '';
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return '';
      const tz = distributionSettings?.timezone || 'Asia/Karachi';
      const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return dtf.format(d);
    } catch {
      const d = new Date(dateInput);
      let hh = d.getHours();
      const mm = d.getMinutes().toString().padStart(2, '0');
      const ampm = hh >= 12 ? 'PM' : 'AM';
      const hh12 = (hh % 12 || 12).toString().padStart(2, '0');
      return `${hh12}:${mm} ${ampm}`;
    }
  };

  // User-specific plan unlock time (e.g. "01:47 AM" or "02:15 PM")
  const planUnlockTimeStr = maturingPlan?.nextRewardTime ? formatTimeInTz(maturingPlan.nextRewardTime) : '';

  // Backend window open time (e.g. "02:00 PM" from distributionSettings.startTime)
  const backendWindowOpenTime = React.useMemo(() => {
    const [startH = 14, startM = 0] = (distributionSettings?.startTime || '14:00').split(':').map(Number);
    const period = startH >= 12 ? 'PM' : 'AM';
    const h12 = (startH % 12 || 12).toString().padStart(2, '0');
    return `${h12}:${startM.toString().padStart(2, '0')} ${period}`;
  }, [distributionSettings?.startTime]);

  // Display time: If user has a maturing plan, display that user's plan unlock time; otherwise backend window time!
  const displayOpenTime = (hasOnlyMaturingPlans && planUnlockTimeStr)
    ? planUnlockTimeStr
    : backendWindowOpenTime;

  // Effective seconds remaining: if user has a maturing plan, count down to that plan's unlock time!
  const effectiveSecondsRemaining = (hasOnlyMaturingPlans && maturingPlan && planSecondsRemaining > 0)
    ? planSecondsRemaining
    : timeRemainingSeconds;

  const hours = Math.floor(effectiveSecondsRemaining / 3600);
  const minutes = Math.floor((effectiveSecondsRemaining % 3600) / 60);
  const seconds = effectiveSecondsRemaining % 60;

  const windowHours = Math.floor(timeRemainingSeconds / 3600);
  const windowMinutes = Math.floor((timeRemainingSeconds % 3600) / 60);
  const windowSeconds = timeRemainingSeconds % 60;

  // Filter rewards belonging to today that strictly belong to currently ACTIVE investment cycles
  const todayActiveRewards = dailyRewards.filter((r) => {
    const rDate = (r.date || '').slice(0, 10);
    if (rDate !== todayDateStr) return false;
    const matchingInv = activeInvestments.find((inv) => inv.planName === r.planName);
    if (!matchingInv) return false;
    // If reward was claimed/created before this active investment was even started, it belongs to an old investment!
    if (matchingInv.startDate) {
      const rewardCreatedTs = r.claimedAt ? new Date(r.claimedAt).getTime() : (r.date ? new Date(r.date).getTime() : 0);
      const invStartTs = new Date(matchingInv.startDate).getTime();
      if (rewardCreatedTs && rewardCreatedTs < invStartTs) {
        return false;
      }
    }
    return true;
  });

  const todayReward = todayActiveRewards[0] || null;

  // Status flags for TODAY (strict: only true if active investments exist and are not in maturing Day-0 cycle)
  const isClaimed = !hasOnlyMaturingPlans && activeInvestments.length > 0 && todayActiveRewards.length > 0 && todayActiveRewards.every((r) => r.status === 'Claimed');
  const isLocked = !hasOnlyMaturingPlans && activeInvestments.length > 0 && todayActiveRewards.length > 0 && todayActiveRewards.some((r) => r.status === 'Locked');
  const isRequested = !hasOnlyMaturingPlans && activeInvestments.length > 0 && todayActiveRewards.length > 0 && todayActiveRewards.some((r) => r.status === 'Unlock Requested');

  // Amount available to claim (strictly $0 when no active plans or when plans are still in their 24h maturation cycle)
  const availableTodayRewards = todayActiveRewards.filter((r) => r.status === 'Available' || r.status === 'Unlocked');
  const claimableAmount = activeInvestments.length === 0 || hasOnlyMaturingPlans
    ? 0
    : availableTodayRewards.length > 0
    ? availableTodayRewards.reduce((sum, r) => sum + r.netAmount, 0)
    : (maturedActiveInvestments.length > 0 ? maturedDailySum : 0);

  const isLight = theme === 'light';

  // Exact image from Invest Plans (matches PlansView)
  const getPlanImage = (inv: { planId?: string; vehicleCategory?: string; image?: string }) => {
    if (inv.image) return inv.image;
    const plan = plans.find(
      (p) => p.id === inv.planId || p.category?.toUpperCase() === inv.vehicleCategory?.toUpperCase()
    );
    if (plan?.image) return plan.image;

    const fallbackMock = INVESTMENT_PLANS.find(
      (p) => p.id === inv.planId || p.category?.toUpperCase() === inv.vehicleCategory?.toUpperCase()
    );
    if (fallbackMock?.image) return fallbackMock.image;

    return 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop&q=80';
  };

  const handleClaimReward = async () => {
    await claimReward();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#155EEF', '#38BDF8', '#10B981', '#F59E0B'],
      });
    } catch {
      // safe fallback
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-24">
      {/* 1. ALL-IN-ONE MASTER PORTFOLIO CARD */}
      <div
        className={`relative rounded-3xl ${
          isLight
            ? 'bg-gradient-to-br from-[#113C9E] via-[#1D5EE8] to-[#0284C7] border border-blue-300/40 shadow-xl shadow-blue-600/25 text-white'
            : 'bg-gradient-to-br from-[#06182E] via-[#092240] to-[#0D2E54] border border-blue-500/30 shadow-[0_20px_50px_rgba(2,10,20,0.8)] text-white'
        } p-5 sm:p-6 overflow-hidden space-y-4 sm:space-y-5 transition-all duration-300`}
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Tier: User Greeting & Real-Time Status Badges */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Outfit',sans-serif]">
              Hi, {user?.name || 'Ali Hassan'}
            </h2>
            <span className="text-lg">👋</span>
          </div>

          {/* Quick Status Chips */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('kyc')}
              className="group flex items-center gap-1.5 text-[11px] font-bold text-sky-100 bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-xl border border-white/25 backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-200 shrink-0" />
              <span>KYC: {user?.kycStatus || 'Approved'}</span>
            </button>

            {activeInvestments.length > 0 ? (
              <button
                onClick={() => navigate('rewards')}
                className="group flex items-center gap-1.5 text-[11px] font-bold text-emerald-200 bg-emerald-950/40 hover:bg-emerald-900/60 px-2.5 py-1 rounded-xl border border-emerald-400/40 backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-xs whitespace-nowrap"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Yield Active (24h)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              </button>
            ) : (
              <button
                onClick={() => navigate('plans')}
                className="group flex items-center gap-1.5 text-[11px] font-bold text-slate-200 bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-xl border border-white/25 backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-xs whitespace-nowrap"
              >
                <TrendingUp className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span>No Active Yield</span>
              </button>
            )}
          </div>
        </div>

        {/* Middle Tier: Main Portfolio Balance */}
        <div className="relative z-10 pt-2 border-t border-white/15 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-100 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-200" />
              Portfolio Balance
            </span>
            <button
              id="toggle-balance-btn"
              onClick={toggleBalanceHidden}
              className="w-6 h-6 rounded-md bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
              aria-label="Toggle balance visibility"
            >
              {isBalanceHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="text-3xl sm:text-4xl font-black tracking-tight font-['Outfit',sans-serif] text-white drop-shadow-sm">
            {isBalanceHidden
              ? '••••••••'
              : `$${balance.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </div>
        </div>

        {/* Bottom Tier: Balance Metrics Ribbon */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-white/15">
          <div className="bg-black/15 backdrop-blur-md rounded-xl p-2.5 border border-white/15">
            <span className="text-[10px] uppercase font-semibold text-blue-100 block">
              Available Cash
            </span>
            <span className="text-sm sm:text-base font-black text-emerald-300 font-['Outfit',sans-serif]">
              {isBalanceHidden
                ? '••••••'
                : `$${balance.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </span>
          </div>

          <div className="bg-black/15 backdrop-blur-md rounded-xl p-2.5 border border-white/15">
            <span className="text-[10px] uppercase font-semibold text-blue-100 block">
              Active Leased
            </span>
            <span className="text-sm sm:text-base font-black text-white font-['Outfit',sans-serif]">
              {isBalanceHidden
                ? '••••••'
                : `$${(balance.totalInvested || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-black/15 backdrop-blur-md rounded-xl p-2.5 border border-white/15 flex items-center justify-between sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-semibold text-blue-100 block">
                Today's Earning
              </span>
            </div>
            <span className="text-sm sm:text-base font-black text-amber-300 font-['Outfit',sans-serif]">
              {isBalanceHidden
                ? '••••••'
                : `+$${(activeInvestments.length === 0 ? 0 : (balance.todayReward || 0)).toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* 4 Frosted Action Tiles Embedded DIRECTLY inside the Master Card */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-3 border-t border-white/15">
          {/* Tile 1: Daily Rewards */}
          <button
            id="action-daily-rewards"
            onClick={() => navigate('rewards')}
            className="group p-3 sm:p-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md text-left transition-all active:scale-[0.98] cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between gap-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#A855F7] via-[#8B5CF6] to-[#6366F1] flex items-center justify-center text-white shadow-md shadow-purple-900/30 border border-purple-200/50 group-hover:scale-110 transition-transform">
                <Gift className="w-5 h-5 stroke-[2.5] text-white drop-shadow" />
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-400/30 border border-purple-300/40 text-purple-100 whitespace-nowrap">
                Daily Bonus
              </span>
            </div>
            <div className="mt-2.5">
              <h4 className="text-xs sm:text-sm font-black text-white tracking-tight">
                Daily Rewards
              </h4>
              <p className="text-[10px] text-blue-100/80 font-medium mt-0.5 truncate">
                Claim daily yield
              </p>
            </div>
          </button>

          {/* Tile 2: Deposit */}
          <button
            id="action-deposit-funds"
            onClick={() => navigate('deposit')}
            className="group p-3 sm:p-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md text-left transition-all active:scale-[0.98] cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between gap-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] flex items-center justify-center text-white shadow-md shadow-emerald-900/30 border border-emerald-200/50 group-hover:scale-110 transition-transform">
                <ArrowDownCircle className="w-5 h-5 stroke-[2.5] text-white drop-shadow" />
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-400/30 border border-emerald-300/40 text-emerald-100 whitespace-nowrap">
                0% Fee
              </span>
            </div>
            <div className="mt-2.5">
              <h4 className="text-xs sm:text-sm font-black text-white tracking-tight">
                Deposit
              </h4>
              <p className="text-[10px] text-blue-100/80 font-medium mt-0.5 truncate">
                Add funds instant
              </p>
            </div>
          </button>

          {/* Tile 3: Withdraw */}
          <button
            id="action-withdraw-funds"
            onClick={() => navigate('withdraw')}
            className="group p-3 sm:p-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md text-left transition-all active:scale-[0.98] cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between gap-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0284C7] via-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white shadow-md shadow-blue-900/30 border border-sky-200/50 group-hover:scale-110 transition-transform">
                <ArrowUpCircle className="w-5 h-5 stroke-[2.5] text-white drop-shadow" />
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-sky-400/30 border border-sky-300/40 text-sky-100 whitespace-nowrap">
                Instant
              </span>
            </div>
            <div className="mt-2.5">
              <h4 className="text-xs sm:text-sm font-black text-white tracking-tight">
                Withdraw
              </h4>
              <p className="text-[10px] text-blue-100/80 font-medium mt-0.5 truncate">
                Fast payout to wallet
              </p>
            </div>
          </button>

          {/* Tile 4: Support Center */}
          <button
            id="action-support-center"
            onClick={() => navigate('support')}
            className="group p-3 sm:p-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md text-left transition-all active:scale-[0.98] cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between gap-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#EA580C] flex items-center justify-center text-white shadow-md shadow-amber-900/30 border border-amber-200/50 group-hover:scale-110 transition-transform">
                <Headphones className="w-5 h-5 stroke-[2.5] text-white drop-shadow" />
              </div>
              <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-400/30 border border-emerald-300/40 text-white whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                24/7 Live
              </span>
            </div>
            <div className="mt-2.5">
              <h4 className="text-xs sm:text-sm font-black text-white tracking-tight">
                Support Center
              </h4>
              <p className="text-[10px] text-blue-100/80 font-medium mt-0.5 truncate">
                Instant help &amp; FAQ
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. TWO SIDE-BY-SIDE CARDS: TODAY'S REWARD & CLAIM WINDOW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {/* LEFT CARD: Today's Distribution — Premium Rebuild */}
        <div className={`rounded-3xl overflow-hidden flex flex-col relative transition-colors duration-200 ${
          isLight
            ? 'bg-white border border-slate-200 shadow-lg'
            : 'bg-[#060F1C] border border-white/10 shadow-2xl'
        }`}>

          {/* ── Header band: adaptive light/dark theme ── */}
          <div
            className={`relative px-4 pt-4 pb-3 overflow-hidden shrink-0 border-b ${
              isLight ? 'border-emerald-100/80' : 'border-white/5'
            }`}
            style={{
              background: isLight
                ? 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 40%, #EFF6FF 100%)'
                : 'linear-gradient(135deg, #071528 0%, #0A1E38 60%, #0C2040 100%)',
            }}
          >
            {/* Subtle glow orb */}
            <div
              className={`absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none ${
                isLight ? 'opacity-30' : 'opacity-20'
              }`}
              style={{
                background: isLight
                  ? 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)'
                  : 'radial-gradient(circle, #10B981 0%, transparent 70%)',
                transform: 'translate(20%, -30%)',
              }}
            />

            <div className="relative flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {/* Label + status chip */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Today's Distribution
                  </span>
                  {activeInvestments.length === 0 ? (
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                        isLight
                          ? 'bg-slate-100 text-slate-600 border-slate-300'
                          : 'bg-slate-500/20 text-slate-400 border-slate-500/40'
                      }`}
                    >
                      NO ACTIVE PLAN
                    </span>
                  ) : hasOnlyMaturingPlans ? (
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                        isLight
                          ? 'bg-amber-100/90 text-amber-800 border-amber-300'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      }`}
                    >
                      <Clock className={`w-2.5 h-2.5 shrink-0 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                      UNLOCKS AT {displayOpenTime}
                    </span>
                  ) : distributionStatus === 'open' ? (
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isLight
                          ? 'bg-emerald-100/90 text-emerald-800 border-emerald-300'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full animate-ping shrink-0 ${
                          isLight ? 'bg-emerald-600' : 'bg-emerald-400'
                        }`}
                      />
                      LIVE OPEN
                    </span>
                  ) : distributionStatus === 'upcoming' ? (
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                        isLight
                          ? 'bg-sky-100/90 text-sky-800 border-sky-300'
                          : 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                      }`}
                    >
                      <Clock className={`w-2.5 h-2.5 shrink-0 ${isLight ? 'text-sky-600' : 'text-sky-400'}`} />
                      OPENS AT {displayOpenTime}
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                        isLight
                          ? 'bg-slate-100 text-slate-700 border-slate-300'
                          : 'bg-slate-500/20 text-slate-400 border-slate-500/40'
                      }`}
                    >
                      CLOSED
                    </span>
                  )}
                </div>

                {/* Amount */}
                <div
                  className={`mt-1.5 font-black font-['Outfit',sans-serif] ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                  style={{
                    fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                    lineHeight: 1.1,
                    textShadow: isLight ? 'none' : '0 0 24px rgba(16,185,129,0.35)',
                  }}
                >
                  ${(activeInvestments.length === 0
                      ? 0
                      : activeDailyYield
                    ).toFixed(2)}
                </div>
                <p
                  className={`text-[10px] font-bold mt-0.5 ${
                    activeInvestments.length === 0
                      ? (isLight ? 'text-slate-500' : 'text-slate-400')
                      : hasOnlyMaturingPlans
                      ? (isLight ? 'text-amber-700 font-extrabold' : 'text-amber-400 font-extrabold')
                      : isClaimed
                      ? (isLight ? 'text-emerald-700' : 'text-emerald-400')
                      : (isLight ? 'text-emerald-700' : 'text-emerald-400/80 font-semibold')
                  }`}
                >
                  {activeInvestments.length === 0
                    ? 'No Active Investment Plans'
                    : hasOnlyMaturingPlans
                    ? '⏳ 24H Maturation Cycle Active'
                    : isClaimed
                    ? 'Claimed for Today ✓'
                    : 'Daily Earnings Ready'}
                </p>
              </div>

              {/* Gift image container */}
              <div
                className={`relative shrink-0 overflow-hidden ${
                  isLight
                    ? 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#061426] to-[#0A2240] p-1 border border-emerald-500/30 shadow-md ring-1 ring-emerald-500/15'
                    : 'w-20 h-20 sm:w-24 sm:h-24 -mt-2'
                }`}
              >
                <img
                  src={ASSETS.giftBox}
                  alt="Daily Reward Gift"
                  className="w-full h-full object-contain drop-shadow-xl rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="px-4 pt-3 pb-4 flex flex-col gap-3 flex-1">

            {/* Countdown */}
            <div>
              <p className={`text-[9px] font-black uppercase tracking-widest mb-2 text-center ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                {activeInvestments.length === 0
                  ? `Daily Distribution Schedule (${distributionFormattedWindow || `${backendWindowOpenTime} – 06:00 PM PKT`})`
                  : hasOnlyMaturingPlans
                  ? `⏳ 24H Maturation Unlocks In (${displayOpenTime})`
                  : distributionStatus === 'open'
                  ? '⚡ Window Closes In'
                  : distributionStatus === 'upcoming'
                  ? `⏳ Window Opens In (${displayOpenTime})`
                  : `🕒 Next Window (Tomorrow ${backendWindowOpenTime})`}
              </p>
              <div className="flex items-center justify-center gap-2">
                {[{ val: padZero(hours), label: 'HRS' }, { val: padZero(minutes), label: 'MIN' }, { val: padZero(seconds), label: 'SEC' }].map(({ val, label }, i) => (
                  <React.Fragment key={label}>
                    <div className="flex flex-col items-center gap-1">
                      <span className={`w-14 h-12 rounded-2xl flex items-center justify-center text-lg font-black font-mono shadow-inner ${
                        isLight
                          ? label === 'SEC' ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'bg-slate-100 border border-slate-200 text-slate-900'
                          : label === 'SEC' ? 'bg-[#040C16] border border-blue-500/40 text-sky-400' : 'bg-[#040C16] border border-white/10 text-white'
                      }`}>{val}</span>
                      <span className={`text-[9px] font-black tracking-widest ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{label}</span>
                    </div>
                    {i < 2 && (
                      <span className={`font-black text-xl -mt-5 ${isLight ? 'text-slate-300' : 'text-slate-600'}`}>:</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className={`h-px ${isLight ? 'bg-slate-100' : 'bg-white/5'}`} />

            {/* Claim button area */}
            {activeInvestments.length === 0 ? (
              <button
                id="explore-plans-btn"
                onClick={() => navigate('plans')}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
                <span>Explore Fleet Plans to Earn Daily Yield →</span>
              </button>
            ) : hasOnlyMaturingPlans ? (
              <button
                onClick={() => navigate('my-plans')}
                className={`w-full py-3 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isLight
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-800 shadow-sm'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300 shadow-md'
                }`}
              >
                <Clock className="w-4 h-4 shrink-0 text-amber-500 animate-pulse" />
                <span>⏳ 24H Maturation Active — View Countdown in My Plans →</span>
              </button>
            ) : isClaimed ? (
              <div
                className={`w-full py-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 ${
                  isLight
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Claimed for Today</span>
              </div>
            ) : isLocked ? (
              <button
                onClick={() => navigate('claims-locked')}
                className={`w-full py-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/35 text-amber-300'
                }`}
              >
                <Lock className="w-4 h-4 shrink-0" />
                <span>Locked — Request Unlock</span>
              </button>
            ) : isRequested ? (
              <div
                className={`w-full py-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 ${
                  isLight
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-blue-500/10 border-blue-500/25 text-blue-300'
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                <span>Under Review</span>
              </div>
            ) : distributionStatus === 'open' || distributionSettings.allowImmediateClaim || maturedActiveInvestments.length > 0 ? (
              <button
                id="claim-now-btn"
                onClick={handleClaimReward}
                disabled={isClaimed || claimableAmount <= 0}
                className="w-full py-3 rounded-2xl text-white text-xs sm:text-sm font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #10B981 0%, #0D9488 50%, #059669 100%)', boxShadow: '0 4px 20px rgba(16,185,129,0.35)' }}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Claim Today's Earning (${claimableAmount.toFixed(2)}) → Cash</span>
              </button>
            ) : distributionStatus === 'upcoming' ? (
              <div
                className={`w-full py-3 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 ${
                  isLight
                    ? 'bg-sky-50 border-sky-200 text-sky-700'
                    : 'bg-sky-500/8 border-sky-500/20 text-sky-400'
                }`}
              >
                <Clock className="w-4 h-4 text-sky-500 shrink-0" />
                <span className="whitespace-nowrap">Opens {distributionFormattedWindow || `${backendWindowOpenTime} – 06:00 PM PKT`} ({padZero(hours)}h {padZero(minutes)}m {padZero(seconds)}s)</span>
              </div>
            ) : (
              <div
                className={`w-full py-3 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 ${
                  isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-600'
                    : 'bg-slate-500/8 border-slate-500/20 text-slate-400'
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Next Window — Tomorrow {backendWindowOpenTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT CARD: Claim Window */}
        <div
          className={`rounded-3xl ${
            isLight
              ? 'bg-white border border-slate-200 shadow-md'
              : 'bg-[#091A2E] border border-white/10 shadow-xl'
          } p-5 flex flex-col justify-between transition-colors duration-200`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                } uppercase tracking-wider block`}
              >
                Claim Schedule Window
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  distributionStatus === 'open'
                    ? isLight
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : distributionStatus === 'upcoming'
                    ? isLight
                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                      : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                    : isLight
                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                    : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                }`}
              >
                {distributionStatus === 'open'
                  ? 'Active Slot'
                  : distributionStatus === 'upcoming'
                  ? 'Scheduled'
                  : 'Closed Slot'}
              </span>
            </div>

            <div
              className={`text-sm font-bold ${
                isLight ? 'text-slate-800' : 'text-slate-200'
              } mt-1.5 flex items-center gap-1.5`}
            >
              <Clock className="w-4 h-4 text-[#155EEF] dark:text-sky-400" />
              <span>{distributionFormattedWindow}</span>
            </div>
          </div>

          {/* Circular Progress Gauge */}
          <div className="my-2.5 flex flex-col items-center justify-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Subtle background glow */}
              <div
                className={`absolute inset-0 rounded-full blur-md pointer-events-none transition-all ${
                  isLight
                    ? distributionStatus === 'open'
                      ? 'bg-emerald-100/60'
                      : distributionStatus === 'upcoming'
                      ? 'bg-sky-100/60'
                      : 'bg-slate-100/60'
                    : distributionStatus === 'open'
                    ? 'bg-emerald-500/20'
                    : distributionStatus === 'upcoming'
                    ? 'bg-sky-500/20'
                    : 'bg-slate-500/20'
                }`}
              />

              <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 36 36">
                <defs>
                  <linearGradient id="skyGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#0284C7" />
                  </linearGradient>
                  <linearGradient id="emeraldGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34D399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>

                {/* Track background */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={isLight ? '#E2E8F0' : '#0B1C30'}
                  strokeWidth="3.2"
                />

                {/* Animated active arc */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={
                    distributionStatus === 'open'
                      ? 'url(#emeraldGaugeGrad)'
                      : distributionStatus === 'upcoming'
                      ? 'url(#skyGaugeGrad)'
                      : '#475569'
                  }
                  strokeWidth="3.4"
                  strokeDasharray={`${
                    distributionStatus === 'open'
                      ? distributionProgress
                      : Math.max(4, Math.min(96, Math.round(((86400 - timeRemainingSeconds) / 86400) * 100)))
                  }, 100`}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Inside center content with crisp dial plate */}
              <div
                className={`absolute inset-3 rounded-full flex flex-col items-center justify-center text-center p-1 z-20 ${
                  isLight
                    ? 'bg-slate-50/90 border border-slate-200/70 shadow-xs'
                    : 'bg-[#071728]/70 border border-white/5'
                }`}
              >
                {distributionStatus === 'open' ? (
                  <>
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider mb-0.5 ${
                        isLight ? 'text-emerald-700' : 'text-emerald-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isLight ? 'bg-emerald-600' : 'bg-emerald-400 animate-ping'
                        }`}
                      />
                      Live Open
                    </span>
                    <span
                      className={`text-base sm:text-lg font-black font-mono tracking-tight leading-none ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {distributionProgress}%
                    </span>
                    <span
                      className={`text-[8px] font-bold mt-1 uppercase tracking-wider ${
                        isLight ? 'text-emerald-800' : 'text-emerald-400/90'
                      }`}
                    >
                      Active Window
                    </span>
                  </>
                ) : distributionStatus === 'upcoming' ? (
                  <>
                    <div className="flex items-center gap-1 mb-0.5">
                      <Clock className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-sky-600' : 'text-sky-400 animate-pulse'}`} />
                      <span className={`text-[9px] font-black uppercase tracking-wider ${isLight ? 'text-sky-700' : 'text-sky-400'}`}>
                        Next Slot
                      </span>
                    </div>
                    <span className={`text-xs sm:text-sm font-black font-mono tracking-tight leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {padZero(windowHours)}:{padZero(windowMinutes)}:{padZero(windowSeconds)}
                    </span>
                    <span
                      className={`text-[8px] font-extrabold uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded-full border ${
                        isLight
                          ? 'text-sky-700 bg-sky-50 border-sky-200'
                          : 'text-sky-400/90 bg-sky-500/10 border-sky-500/20'
                      }`}
                    >
                      Opens {backendWindowOpenTime}
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className={`w-3.5 h-3.5 mb-0.5 shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                    <span className={`text-xs sm:text-sm font-black font-mono tracking-tight leading-none ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>
                      {padZero(windowHours)}:{padZero(windowMinutes)}
                    </span>
                    <span className={`text-[8px] font-bold uppercase tracking-wider mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Tomorrow {backendWindowOpenTime}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div
            className={`pt-2.5 border-t flex items-center justify-between text-[11px] ${
              isLight ? 'border-slate-100 text-slate-600' : 'border-white/5 text-slate-400'
            }`}
          >
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{distributionStatus === 'open' ? 'Time Remaining:' : 'Window Countdown:'}</span>
            </span>
            <span
              className={`font-mono font-bold px-2 py-0.5 rounded-lg text-[11px] ${
                distributionStatus === 'open'
                  ? isLight
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : isLight
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
              }`}
            >
              {padZero(windowHours)}:{padZero(windowMinutes)}:{padZero(windowSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. MY ACTIVE PLAN */}
      <div
        className={`rounded-3xl ${
          isLight
            ? 'bg-white border border-slate-200 shadow-md'
            : 'bg-[#091A2E] border border-white/10 shadow-xl'
        } p-5 transition-colors duration-200`}
      >
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#155EEF] dark:text-sky-400" />
            <h3
              className={`text-sm font-black ${
                isLight ? 'text-slate-900' : 'text-white'
              } tracking-tight font-['Outfit',sans-serif]`}
            >
              Primary Active Investment
            </h3>
          </div>
          <button
            onClick={() => navigate('my-plans')}
            className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>View All ({balance.activePlansCount || 0})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeInvestments.length > 0 ? (
          <div className="space-y-3">
            {activeInvestments.map((inv) => (
              <div
                key={inv.id}
                className={`p-4 rounded-2xl ${
                  isLight
                    ? 'bg-slate-50 hover:bg-slate-100/70 border border-slate-200 shadow-2xs'
                    : 'bg-gradient-to-r from-[#0A213A] to-[#0D2A4B] border border-blue-500/20'
                } flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors`}
              >
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  <div
                    className={`w-16 h-14 rounded-2xl overflow-hidden ${
                      isLight ? 'bg-white border border-slate-200' : 'bg-[#071322] border border-white/10'
                    } shrink-0 flex items-center justify-center shadow-xs`}
                  >
                    <img
                      src={getPlanImage(inv)}
                      alt={inv.planName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-black ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {inv.planName}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        Active
                      </span>
                    </div>
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} mt-0.5`}>
                      Asset Fleet: {inv.vehicleModel}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px]">
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                        Start Date: <strong className={isLight ? 'text-slate-700' : 'text-slate-300'}>{inv.startDate ? new Date(inv.startDate).toLocaleDateString() : 'Active'}</strong>
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-sky-500 font-bold">
                        Profit Rate: {inv.investedAmount > 0 ? ((inv.dailyReward / inv.investedAmount) * 100).toFixed(1) : '2.0'}% / Day
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 ${
                    isLight ? 'border-slate-200' : 'border-white/10'
                  }`}
                >
                  <div className="text-left sm:text-right">
                    <span
                      className={`text-[10px] ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      } uppercase font-semibold block`}
                    >
                      Daily Reward
                    </span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-['Outfit',sans-serif]">
                      ${inv.dailyReward.toFixed(2)} / 24h
                    </span>
                  </div>

                  <div className="text-left sm:text-right">
                    <span
                      className={`text-[10px] ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      } uppercase font-semibold block`}
                    >
                      ROI Rate
                    </span>
                    <span className="text-sm font-black text-sky-600 dark:text-sky-400 font-['Outfit',sans-serif]">
                      {inv.investedAmount > 0
                        ? ((inv.dailyReward / inv.investedAmount) * 100).toFixed(2)
                        : '0.00'}% / Day
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      } uppercase font-semibold block`}
                    >
                      Principal
                    </span>
                    <span
                      className={`text-sm font-black ${
                        isLight ? 'text-slate-900' : 'text-white'
                      } font-['Outfit',sans-serif]`}
                    >
                      ${inv.investedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`p-6 text-center rounded-2xl ${
              isLight ? 'bg-slate-50 border border-slate-200' : 'bg-white/5 border border-white/10'
            }`}
          >
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              No active investment plans yet.
            </p>
            <button
              onClick={() => navigate('invest')}
              className="mt-2 text-xs font-bold text-[#155EEF] hover:underline"
            >
              Browse Plans &amp; Invest
            </button>
          </div>
        )}
      </div>

      {/* 4. MY REFERRAL NETWORK & COMMISSIONS (Section 13) */}
      <div
        className={`rounded-3xl ${
          isLight
            ? 'bg-white border border-slate-200 shadow-md'
            : 'bg-[#091A2E] border border-white/10 shadow-xl'
        } p-5 transition-colors duration-200 space-y-4`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'} font-['Outfit',sans-serif]`}>
                  My Referral &amp; Commissions
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  5% Direct Bonus
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                Earn automatic 5% commission on referee investments when approved by Admin.
              </p>
            </div>
          </div>

          {/* Referral Code & Copy Link Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
              isLight ? 'bg-purple-50 border-purple-200 text-purple-900' : 'bg-purple-500/10 border-purple-500/20 text-purple-200'
            }`}>
              <span className="text-[10px] uppercase font-bold text-purple-400">Code:</span>
              <span className="font-mono font-black text-xs tracking-wider">
                {referralData?.referralCode || user?.referralCode || 'RENTO-HQ'}
              </span>
              <button
                type="button"
                onClick={handleCopyReferral}
                className="cursor-pointer text-purple-500 hover:text-purple-400 transition-colors"
                title="Copy Referral Code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyInviteLink}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : isLight
                  ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-sky-400'
              }`}
              title="Copy Full Invite Link (https://rentobit.app/join?ref=CODE)"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
            </button>
          </div>
        </div>

        {/* Sponsor & Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className={`p-3 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">My Sponsor / Referrer</span>
            <div className={`text-xs font-black mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {referralData?.mySponsor?.name || 'Direct (No Sponsor)'}
            </div>
            {referralData?.mySponsor?.referralCode && (
              <span className="text-[10px] text-purple-400 font-mono">
                {referralData.mySponsor.referralCode}
              </span>
            )}
          </div>

          <div className={`p-3 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Referrals</span>
            <div className="text-base font-black text-blue-500 font-['Outfit',sans-serif] mt-1">
              {referralData?.totalReferrals || 0} Members
            </div>
            <span className="text-[10px] text-slate-400">Directly registered</span>
          </div>

          <div className={`col-span-2 sm:col-span-1 p-3 rounded-2xl border ${isLight ? 'bg-purple-50/50 border-purple-200' : 'bg-purple-500/10 border-purple-500/20'}`}>
            <span className="text-[10px] uppercase font-bold text-purple-400 block">Commission Earned</span>
            <div className="text-base font-black text-purple-400 font-['Outfit',sans-serif] mt-1">
              ${(referralData?.totalCommissionEarned || 0).toFixed(2)}
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">Credited to Wallet</span>
          </div>
        </div>

        {/* Commission Records List (Section 13) */}
        <div>
          <h4 className={`text-xs font-black uppercase tracking-wider mb-2.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Approved Referral Commissions
          </h4>

          {referralData?.commissions && referralData.commissions.length > 0 ? (
            <div className="space-y-2.5">
              {referralData.commissions.map((comm) => (
                <div
                  key={comm.id}
                  className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-black text-xs">
                      {(comm.refereeName || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {comm.refereeName}
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {comm.status || 'Credited'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Plan: <span className="font-semibold text-slate-300">{comm.planName}</span> · Approved Deposit: <span className="font-bold text-emerald-400">${comm.depositAmount.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <div className="text-left sm:text-right">
                      <span className="text-[9px] text-slate-400 uppercase font-semibold block">Commission Rate</span>
                      <span className="text-xs font-bold text-sky-400">{comm.commissionRate}%</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 uppercase font-semibold block">Commission Earned</span>
                      <span className="text-xs font-black text-purple-400 font-['Outfit',sans-serif]">
                        +${comm.commissionEarned.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-5 rounded-2xl text-center border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
            }`}>
              <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-1.5 opacity-80" />
              <p className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                No referral commissions credited yet
              </p>
              <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                When a user registers using your code <span className="font-mono text-purple-400 font-bold">{referralData?.referralCode || user?.referralCode}</span> and their deposit is approved by Admin, your 5% bonus is credited instantly!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 5. REFER & EARN VIP BANNER */}
      <div
        onClick={() => navigate('rewards')}
        className={`rounded-3xl ${
          isLight
            ? 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-xl shadow-blue-700/20 border border-blue-500/30'
            : 'bg-gradient-to-r from-[#091E36] via-[#123158] to-[#091E36] border border-blue-400/30 text-white shadow-xl'
        } p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-all group`}
      >
        <div className="flex items-center gap-3.5">
          <img
            src={ASSETS.referGift}
            alt="Refer and Earn"
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0 group-hover:scale-105 transition-transform drop-shadow"
            referrerPolicy="no-referrer"
          />

          <div>
            <h4 className="text-sm font-black text-white tracking-tight flex items-center gap-2 font-['Outfit',sans-serif]">
              <span>Refer &amp; Earn Network</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold border border-white/20">
                Tier-1 +5% Bonus
              </span>
            </h4>
            <p className="text-xs text-blue-100 mt-0.5 font-medium">
              Share your personal invite link and earn instant affiliate dividends.
            </p>
          </div>
        </div>

        <div className="w-9 h-9 rounded-2xl bg-white/15 group-hover:bg-white/25 flex items-center justify-center text-white shrink-0 transition-colors">
          <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
