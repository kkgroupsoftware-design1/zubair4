import React, { useState } from 'react';
import { Briefcase, Calendar, CheckCircle2, Clock, FileText, ArrowRight, Car, XCircle, AlertTriangle, Sparkles, X, DollarSign, TrendingUp, ShieldCheck, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveInvestment } from '../types';
import { ASSETS } from '../assets/images';
import { INVESTMENT_PLANS } from '../data/mockData';

// Formats investment start timestamp to clean readable Date and Time (e.g. 2026-09-09 • 08:51 PM)
export const formatStartedDateTime = (dateStr?: string, invId?: string): string => {
  if (!dateStr) return '—';
  try {
    let d = new Date(dateStr);
    // If dateStr was just YYYY-MM-DD (length <= 10) and invId has timestamp, extract the real creation time!
    if (dateStr.length <= 10 && invId && invId.startsWith('inv_')) {
      const ts = parseInt(invId.replace('inv_', ''), 10);
      if (!isNaN(ts) && ts > 1600000000000) {
        d = new Date(ts);
      }
    }
    if (isNaN(d.getTime())) return dateStr;

    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    let hh = d.getHours();
    const min = pad(d.getMinutes());
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const hh12 = pad(hh % 12 || 12);

    return `${yyyy}-${mm}-${dd} • ${hh12}:${min} ${ampm}`;
  } catch {
    return dateStr;
  }
};

const PlanMaturationBanner: React.FC<{
  inv: ActiveInvestment;
  isLight: boolean;
  onGoToRewards: () => void;
}> = ({ inv, isLight, onGoToRewards }) => {
  const [now, setNow] = useState(() => Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const targetTime = inv.nextRewardTime
    ? new Date(inv.nextRewardTime).getTime()
    : new Date(inv.startDate).getTime() + 24 * 3600 * 1000;

  // The daily reward cycle runs strictly on a 24-hour daily basis
  const CYCLE_DURATION_MS = 24 * 3600 * 1000;
  const cycleStartTime = targetTime - CYCLE_DURATION_MS;

  const diffMs = targetTime - now;
  const isMatured = diffMs <= 0 || inv.isMatured === true;

  // Real-time daily cycle progress (0% to 100% per 24h cycle)
  const elapsedMs = Math.max(0, Math.min(CYCLE_DURATION_MS, now - cycleStartTime));
  const progressPct = Math.min(100, Math.max(0, Math.round((elapsedMs / CYCLE_DURATION_MS) * 100)));

  // Determine if this is the very first 24h maturation cycle (Day 1) or a recurring daily cycle
  const isFirstCycle = !inv.totalEarned || inv.totalEarned <= 0;

  if (isMatured) {
    return (
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
          isLight
            ? 'bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50/40 border-emerald-300 shadow-sm'
            : 'bg-gradient-to-r from-[#07241D] via-[#093529]/70 to-[#071F1B] border-emerald-500/40 shadow-lg'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/35 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                24H Daily Cycle Complete
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                Ready to Claim
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
              Daily earnings of <strong className="text-emerald-600 dark:text-emerald-400">${inv.dailyReward.toFixed(2)}</strong> are ready to claim in Rewards Hub.
            </p>
          </div>
        </div>

        <button
          onClick={onGoToRewards}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" />
          <span>Claim ${inv.dailyReward.toFixed(2)} in Rewards →</span>
        </button>
      </div>
    );
  }

  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col gap-3 transition-all relative overflow-hidden ${
        isLight
          ? 'bg-gradient-to-br from-white via-slate-50 to-blue-50/30 border-blue-200/70 shadow-sm'
          : 'bg-gradient-to-br from-[#061222] via-[#091B33] to-[#0A1828] border-blue-500/25 shadow-xl'
      }`}
    >
      {/* Background ambient glow */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-2xl pointer-events-none opacity-20"
        style={{ background: isLight ? 'rgba(59,130,246,0.3)' : 'rgba(14,165,233,0.3)' }}
      />

      {/* Header Row: Cycle Phase Badge & Digital Countdown */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 shadow-inner">
            <TrendingUp className="w-4 h-4 text-cyan-400 dark:text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black font-['Outfit',sans-serif] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {isFirstCycle ? 'Initial 24-Hour Maturation Cycle' : 'Daily 24-Hour Yield Cycle'}
              </span>
              <span
                className={`text-[9px] font-black px-2 py-0.5 rounded-full border tracking-wider uppercase ${
                  isLight
                    ? 'bg-sky-100 text-sky-800 border-sky-300'
                    : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                }`}
              >
                {isFirstCycle ? 'Day 1 Cycle' : 'Daily 24H'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isFirstCycle
                ? 'First daily reward unlocks exactly 24 hours after plan activation.'
                : 'Accumulating daily vehicle lease yield. Cycle resets every 24 hours upon reward release.'}
            </p>
          </div>
        </div>

        {/* Live Timer Counter */}
        <div
          className={`self-start sm:self-auto px-3 py-1.5 rounded-xl border flex items-center gap-2 shrink-0 ${
            isLight
              ? 'bg-white border-blue-200 text-blue-950 shadow-2xs'
              : 'bg-[#040C16] border-blue-500/30 text-white shadow-inner'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-sky-400 animate-spin-slow shrink-0" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Unlocks In:
          </span>
          <span className="font-mono font-black text-xs sm:text-sm tracking-wider text-sky-600 dark:text-sky-300">
            {pad(hours)}h : {pad(minutes)}m : {pad(seconds)}s
          </span>
        </div>
      </div>

      {/* Cycle Progress Tracker */}
      <div className="relative z-10 space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <div className="flex items-center gap-1.5">
            <span className={isLight ? 'text-slate-600' : 'text-slate-300'}>Daily Cycle Progress:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[11px] font-black bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              {progressPct}%
            </span>
            <span className="hidden xs:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span>{isFirstCycle ? 'First Claim Unlocks:' : 'Next Claim Unlocks:'}</span>
            <strong className="font-mono font-bold text-slate-700 dark:text-slate-200">
              {formatStartedDateTime(inv.nextRewardTime, inv.id)}
            </strong>
          </div>
        </div>

        {/* Dynamic Multi-Stop Gradient Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-300/40 dark:border-white/5 shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-1000 relative"
            style={{
              width: `${Math.max(3, progressPct)}%`,
              background: 'linear-gradient(90deg, #3B82F6 0%, #06B6D4 50%, #10B981 100%)',
              boxShadow: '0 0 10px rgba(16,185,129,0.4)',
            }}
          >
            {/* Glowing tip light */}
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/70 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Bottom Sub-row */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
          <span>Cycle Start: {formatStartedDateTime(new Date(cycleStartTime).toISOString())}</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            Daily Yield: +${inv.dailyReward.toFixed(2)} / 24h
          </span>
        </div>
      </div>
    </div>
  );
};

export const MyPlansView: React.FC = () => {
  const {
    investments,
    navigate,
    theme,
    loadViewData,
    loadingView,
    requestPlanCancellation,
    plans = [],
    invalidateViewData,
  } = useApp();
  const [filter, setFilter] = useState<'all' | 'Active' | 'Cancellation Requested' | 'Completed' | 'Cancelled'>('all');
  const [viewAgreement, setViewAgreement] = useState<ActiveInvestment | null>(null);
  const [cancelModalInv, setCancelModalInv] = useState<ActiveInvestment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);


  // Pagination & Lazy Loading State
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const listTopRef = React.useRef<HTMLDivElement>(null);

  const handleFilterChange = (tab: typeof filter) => {
    setFilter(tab);
    setCurrentPage(1);
  };

  // Exact image from Invest Plans (matches PlansView)
  const getPlanImage = (inv: ActiveInvestment) => {
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

  // Lazy load active investments on mount
  React.useEffect(() => {
    loadViewData('my-plans');
  }, []);

  const handleOpenCancelModal = (inv: ActiveInvestment) => {
    setCancelModalInv(inv);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalInv) return;
    setIsCancelling(true);
    const success = await requestPlanCancellation(cancelModalInv.id, cancelReason);
    setIsCancelling(false);
    if (success) {
      setCancelModalInv(null);
    }
  };

  const isLight = theme === 'light';
  const filtered = investments.filter((i) => (filter === 'all' ? true : i.status === filter));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, filtered.length);
  const visible = filtered.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage === validPage || newPage < 1 || newPage > totalPages) return;
    setIsPageLoading(true);
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      setCurrentPage(newPage);
      setIsPageLoading(false);
    }, 280);
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div
        className={`rounded-2xl sm:rounded-3xl ${isLight
            ? 'bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-blue-800 text-white shadow-xl'
            : 'bg-gradient-to-r from-[#07192C] to-[#0D2644] border border-blue-500/20 text-white shadow-xl'
          } p-4 sm:p-5 flex items-center justify-between gap-3`}
      >
        <div className="min-w-0">
          <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-sky-300 border border-blue-500/30 uppercase tracking-wider">
            Portfolio
          </span>
          <h2 className="text-lg sm:text-2xl font-black text-white mt-1 font-['Outfit',sans-serif]">
            My Active Plans
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-0.5 truncate">
            Monitor real-time mobility fleets and daily distributions.
          </p>
        </div>

        <button
          onClick={() => navigate('invest')}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shrink-0 shadow-md active:scale-95"
        >
          <span>Explore Plans</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['all', 'Active', 'Cancellation Requested', 'Cancelled', 'Completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => handleFilterChange(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${filter === tab
                ? 'bg-blue-600 text-white shadow-md'
                : isLight
                  ? 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-2xs'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
          >
            {tab === 'all'
              ? 'All Investments'
              : tab === 'Cancellation Requested'
                ? 'Under Review'
                : tab}
          </button>
        ))}
      </div>

      {/* Anchor for smooth scroll on page change */}
      <div ref={listTopRef} className="-mt-2" />

      {/* List */}
      <div className="space-y-4">
        {(loadingView && investments.length === 0) || isPageLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((k) => (
              <div
                key={k}
                className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl ${isLight ? 'bg-white border border-slate-200' : 'bg-[#091A2E] border border-white/10'
                  } animate-pulse space-y-4`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-200 dark:bg-white/10 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/3 bg-slate-200 dark:bg-white/10 rounded-md" />
                    <div className="h-3 w-1/4 bg-slate-200 dark:bg-white/10 rounded-md" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div className="h-10 bg-slate-200 dark:bg-white/10 rounded-xl" />
                  <div className="h-10 bg-slate-200 dark:bg-white/10 rounded-xl" />
                  <div className="h-10 bg-slate-200 dark:bg-white/10 rounded-xl" />
                  <div className="h-10 bg-slate-200 dark:bg-white/10 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className={`p-12 text-center rounded-3xl ${isLight ? 'bg-white border border-slate-200' : 'bg-[#091A2E] border border-white/10'
              }`}
          >
            <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              No plans found
            </h4>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-1`}>
              Start by allocating into a vehicle fleet plan.
            </p>
            <button
              onClick={() => navigate('invest')}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
            >
              Browse Plans
            </button>
          </div>
        ) : (
          visible.map((inv) => (
            <div
              key={inv.id}
              className={`rounded-2xl sm:rounded-3xl ${isLight
                  ? 'bg-white border border-slate-200 shadow-sm hover:shadow-md'
                  : 'bg-[#091A2E] border border-white/10 shadow-xl'
                } p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 transition-all`}
            >
              {/* Card Header & Financial Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                {/* Vehicle Thumbnail & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-[#06121F] border border-white/10'
                      } flex items-center justify-center shrink-0 overflow-hidden shadow-xs`}
                  >
                    <img
                      src={getPlanImage(inv)}
                      alt={inv.planName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h3
                        className={`text-sm sm:text-base font-black truncate max-w-[170px] xs:max-w-[220px] sm:max-w-none ${isLight ? 'text-slate-900' : 'text-white'
                          }`}
                      >
                        {inv.planName}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${inv.status === 'Active'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : inv.status === 'Cancellation Requested'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                              : inv.status === 'Cancelled'
                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                                : isLight
                                  ? 'bg-slate-100 text-slate-600 border-slate-200'
                                  : 'bg-slate-700/50 text-slate-300 border-white/10'
                          }`}
                      >
                        {inv.status === 'Cancellation Requested'
                          ? '⏳ Cancellation Review'
                          : inv.status === 'Cancelled'
                            ? '🚫 Cancelled & Refunded'
                            : inv.status}
                      </span>
                    </div>
                    <p className={`text-[11px] sm:text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5 truncate`}>
                      Asset: {inv.vehicleModel || 'Fleet Mobility Asset'}
                    </p>
                    {/* Contract ID */}
                    <div className={`mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg ${isLight ? 'bg-slate-100 border border-slate-200' : 'bg-white/[0.04] border border-white/[0.08]'
                      }`}>
                      <FileText className="w-2.5 h-2.5 text-sky-400 shrink-0" />
                      <span className={`text-[9px] font-black font-mono tracking-wider truncate max-w-[180px] ${isLight ? 'text-slate-500' : 'text-sky-400'}`}>
                        RNT-AGR-{inv.id.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Metrics Strip */}
                <div
                  className={`grid grid-cols-2 gap-2 p-2.5 sm:p-0 rounded-2xl ${isLight ? 'bg-slate-50 border border-slate-100 sm:border-0' : 'bg-[#06121F]/70 border border-white/5 sm:border-0'
                    } sm:bg-transparent w-full sm:w-auto sm:flex sm:items-center sm:gap-6 sm:justify-end`}
                >
                  <div className="text-left sm:text-right">
                    <span
                      className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'
                        } uppercase font-semibold block tracking-wide`}
                    >
                      Daily Payout
                    </span>
                    <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 font-['Outfit',sans-serif]">
                      +${inv.dailyReward.toFixed(2)} <span className="text-[10px] font-bold opacity-80">/ day</span>
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'
                        } uppercase font-semibold block tracking-wide`}
                    >
                      Principal
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'
                        } font-['Outfit',sans-serif]`}
                    >
                      ${inv.investedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Notice Banner */}
              {inv.status === 'Cancellation Requested' ? (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 min-w-0">
                    <strong className="block font-bold text-[11px] sm:text-xs">Cancellation Request Under Review</strong>
                    <span className="text-[11px] leading-relaxed block">
                      Admin review in progress. Once approved, the full principal (${inv.investedAmount.toFixed(2)}) and today's earning (${inv.dailyReward.toFixed(2)}) will be credited to your <strong>Available Cash</strong>.
                    </span>
                  </div>
                </div>
              ) : inv.status === 'Cancelled' ? (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
                  <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="text-[11px] sm:text-xs">Contract Cancelled — Full refund credited to your Available Cash balance.</span>
                </div>
              ) : inv.status === 'Active' ? (
                <PlanMaturationBanner
                  inv={inv}
                  isLight={isLight}
                  onGoToRewards={() => navigate('rewards')}
                />
              ) : inv.status === 'Completed' ? (
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-[11px] sm:text-xs">Plan Completed — All rewards have been distributed. Thank you for investing.</span>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-slate-500/10 border border-slate-500/20 flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span className="text-[11px] sm:text-xs">Pending activation — your plan will go live shortly.</span>
                </div>
              )}

              {/* Footer info & Action buttons */}
              <div
                className={`pt-3 border-t ${isLight ? 'border-slate-100' : 'border-white/5'
                  } flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs`}
              >
                {/* Timestamps */}
                <div
                  className={`p-2.5 sm:p-0 rounded-2xl ${isLight ? 'bg-slate-50 border border-slate-100 sm:border-0' : 'bg-[#06121F]/70 border border-white/5 sm:border-0'
                    } sm:bg-transparent flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'
                    }`}
                >
                  <div className="flex items-center justify-between sm:justify-start gap-2">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0" />
                      <span className="text-[11px]">Started:</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      {formatStartedDateTime(inv.startDate, inv.id)}
                    </span>
                  </div>

                  <div className="hidden sm:block text-slate-300 dark:text-slate-700">•</div>

                  {(inv.status === 'Active' || inv.status === 'Cancellation Requested') && (
                  <div className="flex items-center justify-between sm:justify-start gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-white/5">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-[11px]">{inv.isMatured === false ? 'Claim Opens:' : 'Next Cycle:'}</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {formatStartedDateTime(inv.nextRewardTime, inv.id)}
                    </span>
                  </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto">

                  {inv.status === 'Active' && (
                    <button
                      onClick={() => handleOpenCancelModal(inv)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95"
                    >
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Cancel Plan</span>
                    </button>
                  )}

                  <button
                    onClick={() => setViewAgreement(inv)}
                    className="flex-1 sm:flex-initial relative flex items-center justify-center gap-2 px-4 py-2 sm:py-1.5 rounded-xl overflow-hidden group/agr cursor-pointer active:scale-95 transition-all duration-200"
                    style={isLight ? {
                      background: '#ffffff',
                      border: '1.5px solid #c7d2fe',
                      boxShadow: '0 1px 4px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
                    } : {
                      background: 'linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(99,102,241,0.10) 100%)',
                      border: '1px solid transparent',
                      backgroundClip: 'padding-box',
                      boxShadow: '0 0 0 1px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
                    }}
                  >
                    {/* Shimmer sweep on hover */}
                    <span className="absolute inset-0 opacity-0 group-hover/agr:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: isLight
                          ? 'linear-gradient(105deg, transparent 30%, rgba(99,102,241,0.05) 50%, transparent 70%)'
                          : 'linear-gradient(105deg, transparent 30%, rgba(147,197,253,0.08) 50%, transparent 70%)'
                      }}
                    />
                    <span className="relative flex items-center justify-center w-5 h-5 rounded-md shrink-0"
                      style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)', boxShadow: isLight ? '0 0 6px rgba(99,102,241,0.25)' : '0 0 8px rgba(99,102,241,0.4)' }}
                    >
                      <FileText className="w-3 h-3 text-white" />
                    </span>
                    <span className={`relative text-[11px] font-black uppercase tracking-widest whitespace-nowrap ${isLight ? 'text-indigo-600' : 'text-sky-300'
                      }`}>
                      Fleet Agreement
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination & Next Option (appears when items exceed PAGE_SIZE = 10) */}
      {filtered.length > PAGE_SIZE && (
        <div
          className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl ${isLight
              ? 'bg-white border border-slate-200 shadow-sm'
              : 'bg-[#091A2E] border border-white/10 shadow-xl'
            } flex flex-col sm:flex-row items-center justify-between gap-4`}
        >
          {/* Status info */}
          <div className="flex items-center gap-2 text-xs flex-wrap justify-center sm:justify-start">
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
              Showing
            </span>
            <span
              className={`font-black px-2.5 py-0.5 rounded-lg ${isLight ? 'bg-slate-100 text-slate-800' : 'bg-white/10 text-white font-mono'
                }`}
            >
              {startIndex + 1}–{endIndex}
            </span>
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
              of <strong className={isLight ? 'text-slate-900' : 'text-white'}>{filtered.length}</strong> active plans
            </span>
            <span
              className={`text-[10px] uppercase tracking-wider font-black px-2.5 py-0.5 rounded-full ${isLight
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'bg-blue-500/15 text-sky-400 border border-blue-500/20'
                }`}
            >
              Page {validPage} of {totalPages}
            </span>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Previous Button */}
            <button
              type="button"
              onClick={() => handlePageChange(validPage - 1)}
              disabled={validPage === 1 || isPageLoading}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${validPage === 1
                  ? 'opacity-40 cursor-not-allowed text-slate-400'
                  : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 cursor-pointer shadow-xs'
                    : 'bg-white/5 hover:bg-white/10 text-slate-200 active:scale-95 cursor-pointer'
                }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Page Number Buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const isActive = validPage === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePageChange(p)}
                    disabled={isPageLoading}
                    className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer ${isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105'
                        : isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95'
                          : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white active:scale-95'
                      }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {/* Next Option Button */}
            <button
              type="button"
              onClick={() => handlePageChange(validPage + 1)}
              disabled={validPage >= totalPages || isPageLoading}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md ${validPage >= totalPages
                  ? 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-white/5 dark:text-slate-500 shadow-none'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 active:scale-95 hover:shadow-lg'
                }`}
            >
              {isPageLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalInv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div
            className={`w-full max-w-md ${isLight
                ? 'bg-white border border-slate-200 shadow-2xl text-slate-900'
                : 'bg-[#091A2E] border border-blue-500/30 shadow-2xl text-white'
              } rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-black font-['Outfit',sans-serif]">
                  Request Plan Cancellation
                </h3>
              </div>
              <button
                onClick={() => setCancelModalInv(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to cancel your active allocation for <strong>{cancelModalInv.planName}</strong>?
            </p>

            {/* Refund Calculation Summary Box */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Principal Investment:</span>
                <strong className="text-slate-900 dark:text-white font-bold">
                  ${cancelModalInv.investedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-emerald-500/20 font-black">
                <span className="text-emerald-700 dark:text-emerald-300">Total Refund to Available Cash:</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-['Outfit',sans-serif]">
                  ${cancelModalInv.investedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
              ⏳ <strong>Daily Earning Note:</strong> Today's accrued earning will remain in your Daily Rewards and can be claimed separately after the 24h distribution window (12:00 PM - 3:00 PM).
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-700 dark:text-sky-300 leading-relaxed">
              💡 <strong>Instant Settlement:</strong> Upon Admin approval, your principal will be credited to your <strong>Available Cash</strong> so you can withdraw or reinvest immediately.
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-slate-700 dark:text-slate-300">
                Reason for cancellation (optional):
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for early cancellation..."
                className={`w-full p-3 rounded-2xl text-xs outline-none border ${isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                    : 'bg-[#06121F] border-white/10 text-white focus:border-blue-500'
                  }`}
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalInv(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
              >
                Keep Plan
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isCancelling ? 'Submitting...' : 'Confirm Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agreement Modal — Premium Digital Certificate */}
      {viewAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col ${isLight ? 'bg-white border border-slate-200' : 'bg-[#060F1C] border border-white/10'
            }`}>

            {/* ── Header: gradient certificate banner ── */}
            <div className="relative px-5 pt-5 pb-4 overflow-hidden shrink-0"
              style={{
                background: isLight
                  ? 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #EDE9FE 100%)'
                  : 'linear-gradient(135deg, #0C1F3A 0%, #0A1628 50%, #0D1E35 100%)'
              }}
            >
              {/* Glow orbs */}
              <div className="absolute top-0 left-0 w-40 h-40 rounded-full pointer-events-none"
                style={{
                  background: isLight
                    ? 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)'
                    : 'radial-gradient(circle, #0EA5E9 0%, transparent 70%)',
                  opacity: isLight ? 1 : 0.2,
                  transform: 'translate(-30%, -30%)'
                }} />
              <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full pointer-events-none"
                style={{
                  background: isLight
                    ? 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)'
                    : 'radial-gradient(circle, #6366F1 0%, transparent 70%)',
                  opacity: isLight ? 1 : 0.15,
                  transform: 'translate(30%, 30%)'
                }} />

              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Seal icon */}
                  <div className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)',
                      boxShadow: isLight ? '0 0 14px rgba(99,102,241,0.3)' : '0 0 18px rgba(99,102,241,0.45)'
                    }}
                  >
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${isLight ? 'text-indigo-500' : 'text-sky-400'
                      }`}>Digital Contract</p>
                    <h3 className={`text-base font-black leading-tight font-['Outfit',sans-serif] ${isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                      Commercial Mobility<br />Agreement
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setViewAgreement(null)}
                  className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isLight
                      ? 'bg-slate-200/80 hover:bg-slate-300 text-slate-600 hover:text-slate-900'
                      : 'bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white'
                    }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Contract ID pill */}
              <div className="relative mt-3.5 flex items-center gap-2 px-3 py-2 rounded-xl"
                style={isLight
                  ? { background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)' }
                  : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                <span className={`text-[9px] font-black uppercase tracking-widest shrink-0 ${isLight ? 'text-indigo-400' : 'text-slate-500'
                  }`}>Contract ID</span>
                <span className={`text-[11px] font-black font-mono tracking-wider truncate ${isLight ? 'text-indigo-700' : 'text-sky-300'
                  }`}>
                  RNT-AGR-{viewAgreement.id.toUpperCase()}
                </span>
              </div>
            </div>

            {/* ── Body: data rows ── */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-2">

              {/* Row helper — reused inline */}
              {[
                {
                  icon: <Car className="w-3.5 h-3.5 text-sky-400" />,
                  label: 'Asset Category',
                  value: `${viewAgreement.vehicleCategory} — ${viewAgreement.vehicleModel}`,
                },
                {
                  icon: <DollarSign className="w-3.5 h-3.5 text-emerald-400" />,
                  label: 'Allocated Principal',
                  value: `$${viewAgreement.investedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`,
                  valueClass: 'text-emerald-500 dark:text-emerald-400',
                },
                {
                  icon: <TrendingUp className="w-3.5 h-3.5 text-blue-400" />,
                  label: 'Daily Reward Rate',
                  value: `$${viewAgreement.dailyReward.toFixed(2)} USD / 24h`,
                  valueClass: 'text-blue-500 dark:text-sky-300',
                },
                {
                  icon: <Clock className="w-3.5 h-3.5 text-indigo-400" />,
                  label: 'Term Commencement',
                  value: formatStartedDateTime(viewAgreement.startDate, viewAgreement.id),
                },
                {
                  icon: <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />,
                  label: 'Maturity Term',
                  value: 'No Expiration — Lifetime Yield',
                  valueClass: 'text-amber-500 dark:text-amber-400',
                },
              ].map(({ icon, label, value, valueClass }, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl ${isLight
                      ? 'bg-slate-50 border border-slate-100'
                      : 'bg-white/[0.03] border border-white/[0.06]'
                    }`}
                >
                  <div className="flex items-center gap-2 min-w-0 shrink">
                    <span className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-white/[0.06]'
                      }`}>{icon}</span>
                    <span className={`text-[11px] font-semibold truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {label}
                    </span>
                  </div>
                  <span className={`text-[11px] font-black text-right shrink-0 font-['Outfit',sans-serif] ${valueClass || (isLight ? 'text-slate-900' : 'text-white')
                    }`}>
                    {value}
                  </span>
                </div>
              ))}

              {/* Contract Status — special chip row */}
              <div className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl ${isLight ? 'bg-slate-50 border border-slate-100' : 'bg-white/[0.03] border border-white/[0.06]'
                }`}>
                <div className="flex items-center gap-2">
                  <span className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-white/[0.06]'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </span>
                  <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Contract Status
                  </span>
                </div>
                {viewAgreement.status === 'Cancelled' ? (
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30 uppercase tracking-wide">
                    Cancelled
                  </span>
                ) : (
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
                    ● Active
                  </span>
                )}
              </div>

              {/* Legal note */}
              <div className={`px-3 py-2.5 rounded-2xl text-[10px] leading-relaxed ${isLight
                  ? 'bg-blue-50/60 border border-blue-100 text-slate-500'
                  : 'bg-blue-500/[0.06] border border-blue-500/15 text-slate-500'
                }`}>
                This digital certificate confirms asset-backed leasing allocation under RentoBit Mobility Fleet Management protocols. Principal generates continuous daily distribution rewards with unlimited contract term.
              </div>
            </div>

            {/* ── Footer: Close button ── */}
            <div className="px-5 pb-5 pt-3 shrink-0">
              <button
                onClick={() => setViewAgreement(null)}
                className="w-full py-3 rounded-2xl text-white text-sm font-black tracking-wide shadow-lg transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
