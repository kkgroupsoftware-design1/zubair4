import React, { useState } from 'react';
import {
  Gift,
  Clock,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DailyRewardRecord, RewardClaimStatus } from '../types';
import { ASSETS } from '../assets/images';

const formatClaimDateTime = (ts?: string | null): string => {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    let hh = d.getHours();
    const min = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const hh12 = pad(hh % 12 || 12);
    return `${yyyy}-${mm}-${dd} • ${hh12}:${min}:${ss} ${ampm}`;
  } catch {
    return String(ts);
  }
};

export const RewardsView: React.FC = () => {
  const {
    dailyRewards,
    claimReward,
    submitUnlockRequest,
    navigate,
    theme,
    loadViewData,
    distributionStatus,
    distributionFormattedWindow,
    timeRemainingSeconds,
    distributionSettings,
    balance,
    investments,
    rewardsPage,
    rewardsTotalPages,
    rewardsTotal,
    todayRewardsSummary,
    loadRewards,
    loadingView,
  } = useApp();
  const [selectedRewardForUnlock, setSelectedRewardForUnlock] = useState<DailyRewardRecord | null>(null);
  const [unlockReason, setUnlockReason] = useState('');
  const [filter, setFilter] = useState<string>('all');

  // Lazy load rewards on mount (page 1)
  React.useEffect(() => {
    loadRewards(1, false, 'all');
  }, []);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    loadRewards(1, false, newFilter);
  };

  const isLight = theme === 'light';

  const hours = Math.floor(timeRemainingSeconds / 3600);
  const minutes = Math.floor((timeRemainingSeconds % 3600) / 60);
  const seconds = timeRemainingSeconds % 60;
  const padZero = (n: number) => n.toString().padStart(2, '0');

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

  const activeInvs = investments.filter((i) => i.status === 'Active');
  const maturedActiveInvs = activeInvs.filter((i) => i.isMatured !== false);
  const maturedDailySum = maturedActiveInvs.reduce((sum, inv) => sum + (inv.dailyReward || 0), 0);
  const hasOnlyMaturingPlans = activeInvs.length > 0 && maturedActiveInvs.length === 0;

  // Claim is only allowed for rewards whose investment plan is still Active.
  // Cancelled / Completed / Cancellation Requested plans cannot be claimed.
  const isRewardFromActivePlan = (reward: DailyRewardRecord): boolean => {
    if (activeInvs.length === 0) return false;
    const match = activeInvs.find(
      (inv) => inv.planName === reward.planName
    );
    return !!match;
  };

  const claimableRewards = dailyRewards.filter(
    (r) => (r.status === 'Available' || r.status === 'Unlocked') && isRewardFromActivePlan(r)
  );
  const unclaimedFromSummary = todayRewardsSummary
    ?.filter((r) => r.status === 'Available' || r.status === 'Unlocked')
    .reduce((sum, r) => sum + (r.netAmount || 0), 0) || 0;

  const unclaimedTodaySum = activeInvs.length === 0
    ? 0
    : (todayRewardsSummary && todayRewardsSummary.length > 0
        ? unclaimedFromSummary
        : (claimableRewards.length > 0
            ? claimableRewards.reduce((sum, r) => sum + r.netAmount, 0)
            : (maturedActiveInvs.length > 0 ? maturedDailySum : 0)));

  const todayRewards = dailyRewards.filter((r) => (r.date || '').slice(0, 10) === todayDateStr && isRewardFromActivePlan(r));
  const isClaimedToday = activeInvs.length > 0 && (
    todayRewardsSummary && todayRewardsSummary.length > 0
      ? todayRewardsSummary.every((r) => r.status === 'Claimed')
      : (todayRewards.length > 0 && todayRewards.every((r) => r.status === 'Claimed'))
  );
  const isOpen = distributionStatus === 'open' || distributionSettings.allowImmediateClaim || maturedActiveInvs.length > 0;

  const filteredRewards = React.useMemo(() => {
    const raw = dailyRewards.filter((r) => {
      if (filter === 'all') return true;
      return r.status === filter;
    });

    // Deduplicate by planName + date so each plan's yield per distribution cycle displays strictly once
    const seen = new Map<string, DailyRewardRecord>();
    for (const r of raw) {
      const dateKey = (r.date || '').slice(0, 10);
      const key = `${r.planName || ''}_${dateKey}`;
      const existing = seen.get(key);
      if (!existing) {
        seen.set(key, r);
      } else {
        // Prioritize Claimed/Settled status over Available/Locked
        if (r.status === 'Claimed' || r.status === 'Settled') {
          seen.set(key, r);
        }
      }
    }
    return Array.from(seen.values());
  }, [dailyRewards, filter]);

  const handleOpenUnlock = (reward: DailyRewardRecord) => {
    setSelectedRewardForUnlock(reward);
    setUnlockReason('Network latency caused delay during the claim window. Please assist with unlocking.');
  };

  const handleSubmitUnlock = async () => {
    if (!selectedRewardForUnlock) return;
    await submitUnlockRequest(selectedRewardForUnlock.id, unlockReason);
    setSelectedRewardForUnlock(null);
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div
        className={`rounded-3xl ${
          isLight
            ? 'bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-blue-800 text-white shadow-xl'
            : 'bg-gradient-to-r from-[#07192C] to-[#0D2644] border border-blue-500/20 text-white shadow-xl'
        } p-5 flex items-center justify-between`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
              Distributions
            </span>
            {distributionSettings.autoClaimEnabled !== false && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Auto-Distribution Active</span>
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 font-['Outfit',sans-serif]">
            Daily Rewards Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
            {distributionSettings.autoClaimEnabled !== false
              ? 'Daily earnings are automatically calculated and credited directly to your Available Cash during the distribution window.'
              : 'Claim and manage daily fleet earnings, claim windows & unlocked balances.'}
          </p>
        </div>

        <button
          onClick={() => navigate('claims-locked')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl ${
            isLight
              ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
              : 'bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30'
          } text-xs font-bold transition-colors`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Locked Claims</span>
        </button>
      </div>

      {/* TODAY'S DISTRIBUTION WINDOW & INSTANT CLAIM BANNER */}
      <div
        className={`rounded-3xl p-5 border shadow-lg transition-all ${
          isOpen
            ? isLight
              ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-emerald-300 text-slate-900'
              : 'bg-gradient-to-br from-[#07241D] via-[#093529] to-[#071A2E] border-emerald-500/30 text-white'
            : distributionStatus === 'upcoming'
            ? isLight
              ? 'bg-gradient-to-br from-sky-50 via-blue-50 to-white border-sky-300 text-slate-900'
              : 'bg-gradient-to-br from-[#071F38] via-[#0A2D4F] to-[#071424] border-sky-500/30 text-white'
            : isLight
            ? 'bg-gradient-to-br from-amber-50 via-slate-50 to-white border-amber-200 text-slate-900'
            : 'bg-gradient-to-br from-[#1F1709] via-[#2B1F0C] to-[#0B1522] border-amber-500/30 text-white'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isOpen
                    ? 'bg-emerald-400 animate-ping'
                    : distributionStatus === 'upcoming'
                    ? 'bg-sky-400'
                    : 'bg-amber-400'
                }`}
              />
              <span
                className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  hasOnlyMaturingPlans
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
                    : isOpen
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                    : distributionStatus === 'upcoming'
                    ? 'bg-sky-500/20 text-sky-600 dark:text-sky-300 border-sky-500/30'
                    : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
                }`}
              >
                {activeInvs.length === 0
                  ? 'NO ACTIVE PLAN'
                  : hasOnlyMaturingPlans
                  ? '24H Maturation Active'
                  : isOpen
                  ? 'Distribution Window Active'
                  : distributionStatus === 'upcoming'
                  ? 'Window Opens Soon'
                  : 'Window Closed for Today'}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black font-['Outfit',sans-serif]">
              {activeInvs.length === 0
                ? 'No Active Investment Plans'
                : hasOnlyMaturingPlans
                ? '24-Hour Maturation Cycle in Progress'
                : isOpen
                ? 'Daily Fleet Earnings Auto-Credited'
                : distributionStatus === 'upcoming'
                ? `Opens in ${padZero(hours)}h ${padZero(minutes)}m ${padZero(seconds)}s`
                : 'Today’s Window Concluded'}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-300">
              {activeInvs.length === 0
                ? 'You do not have any active investment plans. Subscribe to a plan to start earning daily distribution rewards.'
                : hasOnlyMaturingPlans
                ? 'Your investment plan is in its initial 24-hour cycle. First daily reward unlocks 24 hours after activation.'
                : isOpen
                ? `Window: ${distributionFormattedWindow || '12:00 PM – 03:00 PM PKT'}. Daily earnings auto-credit directly to your Available Cash.`
                : distributionStatus === 'upcoming'
                ? `Official window: ${distributionFormattedWindow || '12:00 PM – 03:00 PM PKT'}. Daily earnings will auto-credit when window opens.`
                : 'All daily earnings for active plans are automatically credited to your Available Cash balance.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeInvs.length === 0 ? (
              <button
                onClick={() => navigate('plans')}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-500/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Explore Fleet Plans →</span>
              </button>
            ) : isClaimedToday ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Today's Earning Auto-Credited</span>
              </div>
            ) : hasOnlyMaturingPlans ? (
              <button
                onClick={() => navigate('my-plans')}
                className="px-5 py-3 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-600 dark:text-amber-300 text-xs sm:text-sm font-black shadow-lg flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>⏳ View Maturation Timer in My Plans →</span>
              </button>
            ) : isOpen ? (
              <button
                onClick={() => claimReward()}
                disabled={unclaimedTodaySum <= 0}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/30 flex items-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                <span>Claim Today's Earnings (${unclaimedTodaySum.toFixed(2)})</span>
              </button>
            ) : (
              <div className="px-4 py-2.5 rounded-2xl bg-white/10 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>${unclaimedTodaySum.toFixed(2)} Accrued</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reward Status Filter Tabs — only show statuses that exist in data */}
      {(() => {
        const existingStatuses = new Set(dailyRewards.map((r) => r.status));
        const allTabs: RewardClaimStatus[] = ['Available', 'Claimed', 'Locked', 'Unlock Requested', 'Unlocked'];
        const visibleTabs = allTabs.filter((s) => existingStatuses.has(s));
        const tabs: (RewardClaimStatus | 'all')[] = ['all', ...visibleTabs];
        if (tabs.length <= 1) return null; // only "all" — no tabs needed
        return (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {tabs.map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filter === status
                    ? 'bg-blue-600 text-white shadow-md'
                    : isLight
                    ? 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-2xs'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {status === 'all' ? 'All Rewards' : status}
              </button>
            ))}
          </div>
        );
      })()}

      {/* Rewards Ledger Table/Cards */}
      <div className="space-y-3.5">
        {filteredRewards.map((reward) => (
          <div
            key={reward.id}
            className={`rounded-2xl sm:rounded-3xl ${
              isLight
                ? 'bg-white border border-slate-200 shadow-sm hover:shadow-md'
                : 'bg-[#091A2E] border border-white/10 shadow-lg hover:border-white/20'
            } p-3.5 sm:p-4 transition-all`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              {/* Left Section: Icon + Plan Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    reward.status === 'Claimed' || reward.status === 'Settled'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500'
                      : reward.status === 'Locked'
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500'
                      : reward.status === 'Available' || reward.status === 'Unlocked'
                      ? 'bg-blue-500/10 border border-blue-500/30 text-blue-500'
                      : 'bg-purple-500/10 border border-purple-500/30 text-purple-400'
                  }`}
                >
                  {reward.status === 'Locked' ? (
                    <Lock className="w-5 h-5" />
                  ) : reward.status === 'Claimed' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Gift className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {/* Plan Name & Status Badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      className={`text-sm sm:text-base font-black truncate ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {reward.planName}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        reward.status === 'Claimed'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                          : reward.status === 'Locked'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          : reward.status === 'Available'
                          ? 'bg-blue-500/15 text-blue-700 dark:text-sky-300 border-blue-500/30 animate-pulse'
                          : reward.status === 'Unlocked'
                          ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30'
                          : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10'
                      }`}
                    >
                      {reward.status}
                    </span>
                  </div>

                  {/* Clean Metadata Line */}
                  <div
                    className={`flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs mt-1 ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    } flex-wrap`}
                  >
                    <span>Date: <strong className={isLight ? 'text-slate-700' : 'text-slate-300'}>{reward.date}</strong></span>
                    <span className="opacity-40">•</span>
                    <span>Window: {reward.claimWindowStart} - {reward.claimWindowEnd}</span>
                    {reward.transactionId && (
                      <>
                        <span className="opacity-40">•</span>
                        <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                          isLight
                            ? 'bg-slate-100 border-slate-200 text-slate-600'
                            : 'bg-white/5 border-white/10 text-slate-300'
                        }`}>
                          {reward.transactionId}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Section: Net Amount & Action/Status */}
              <div
                className={`flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pt-2.5 sm:pt-0 border-t sm:border-t-0 ${
                  isLight ? 'border-slate-100' : 'border-white/5'
                }`}
              >
                {/* Net Earning */}
                <div className="text-left sm:text-right">
                  <span
                    className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider block ${
                      isLight ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    Net Amount
                  </span>
                  <span
                    className="text-base sm:text-lg font-black font-mono text-emerald-500"
                  >
                    ${reward.netAmount.toFixed(2)}
                  </span>
                </div>

                {/* Status / Claim Action */}
                <div className="shrink-0">
                  {reward.status === 'Available' || reward.status === 'Unlocked' ? (
                    isOpen && isRewardFromActivePlan(reward) ? (
                      <button
                        onClick={() => claimReward(reward.id)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white text-xs font-black shadow-md shadow-emerald-600/20 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Claim Now</span>
                      </button>
                    ) : isOpen && !isRewardFromActivePlan(reward) ? (
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl border ${
                        isLight
                          ? 'bg-slate-100 text-slate-500 border-slate-200'
                          : 'bg-white/5 text-slate-400 border-white/10'
                      }`}>
                        Plan Inactive
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Opens {reward.claimWindowStart}</span>
                      </div>
                    )
                  ) : reward.status === 'Locked' ? (
                    <button
                      onClick={() => handleOpenUnlock(reward)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Request Unlock</span>
                    </button>
                  ) : reward.status === 'Unlock Requested' ? (
                    <span
                      className={`text-xs ${
                        isLight
                          ? 'text-blue-700 bg-blue-50 border-blue-200'
                          : 'text-blue-300 bg-blue-950/50 border-blue-500/20'
                      } font-semibold px-3 py-1.5 rounded-xl border`}
                    >
                      Review Pending
                    </span>
                  ) : (
                    /* Claimed Status */
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Claimed
                      </span>
                      {reward.claimedAt && (
                        <span className={`text-[10px] font-mono mt-0.5 ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          {formatClaimDateTime(reward.claimedAt)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredRewards.length === 0 && !loadingView && (
          <div className={`p-8 text-center rounded-3xl ${isLight ? 'bg-white border border-slate-200 shadow-sm' : 'bg-[#091A2E] border border-white/10 shadow-lg'}`}>
            <Gift className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-50" />
            <p className="font-bold text-sm text-slate-400">No rewards found in this category.</p>
          </div>
        )}

        {loadingView && filteredRewards.length === 0 && (
          <div className={`p-8 text-center rounded-3xl ${isLight ? 'bg-white border border-slate-200 shadow-sm' : 'bg-[#091A2E] border border-white/10 shadow-lg'} flex items-center justify-center gap-3`}>
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            <span className="text-sm font-semibold text-slate-400">Loading daily rewards ledger...</span>
          </div>
        )}
      </div>

      {/* Pagination & Lazy Loading Controls */}
      {rewardsTotal > 0 && (
        <div className={`rounded-3xl p-4 sm:p-5 ${
          isLight ? 'bg-white border border-slate-200 shadow-sm' : 'bg-[#091A2E] border border-white/10 shadow-lg'
        } space-y-4`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
              Showing <strong className={isLight ? 'text-slate-900' : 'text-white'}>{filteredRewards.length}</strong> of{' '}
              <strong className={isLight ? 'text-slate-900' : 'text-white'}>{rewardsTotal}</strong> total reward records
              {rewardsTotalPages > 1 && ` • Page ${rewardsPage} of ${rewardsTotalPages}`}
            </span>

            {/* Quick Page Jump Buttons (Prev / Next) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => loadRewards(rewardsPage - 1, false, filter)}
                disabled={rewardsPage <= 1 || loadingView}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev Page</span>
              </button>

              {/* Numbered Page Buttons */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(5, rewardsTotalPages) }, (_, i) => {
                  let pNum = i + 1;
                  if (rewardsTotalPages > 5) {
                    if (rewardsPage > 3) {
                      pNum = rewardsPage - 2 + i;
                      if (pNum > rewardsTotalPages) pNum = rewardsTotalPages - 4 + i;
                    }
                  }
                  return (
                    <button
                      key={pNum}
                      onClick={() => loadRewards(pNum, false, filter)}
                      disabled={loadingView}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        rewardsPage === pNum
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          : 'bg-white/5 hover:bg-white/10 text-slate-400'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => loadRewards(rewardsPage + 1, false, filter)}
                disabled={rewardsPage >= rewardsTotalPages || loadingView}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                <span>Next Page</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Load More Option Button (Appends next batch) */}
          {rewardsPage < rewardsTotalPages && (
            <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                Want to keep viewing on one page? Load more items below:
              </span>
              <button
                onClick={() => loadRewards(rewardsPage + 1, true, filter)}
                disabled={loadingView}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingView ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading Rewards...</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>Load More Rewards (+{Math.min(10, rewardsTotal - filteredRewards.length)})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Unlock Request Modal */}
      {selectedRewardForUnlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div
            className={`w-full max-w-md ${
              isLight
                ? 'bg-white border border-slate-200 shadow-2xl text-slate-900'
                : 'bg-[#091A2E] border border-white/15 shadow-2xl text-white'
            } rounded-3xl p-6 space-y-4`}
          >
            <div
              className={`flex items-center justify-between border-b ${
                isLight ? 'border-slate-200' : 'border-white/10'
              } pb-3`}
            >
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-500" />
                <h3
                  className={`text-base font-black ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Request Reward Unlock
                </h3>
              </div>
              <button
                onClick={() => setSelectedRewardForUnlock(null)}
                className={`${isLight ? 'text-slate-400 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
              >
                ✕
              </button>
            </div>

            <div
              className={`p-3.5 rounded-2xl ${
                isLight ? 'bg-slate-50 border border-slate-200' : 'bg-white/5 border border-white/10'
              } text-xs space-y-1.5`}
            >
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Plan:</span>
                <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedRewardForUnlock.planName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Locked Amount:</span>
                <span className="font-bold text-amber-600 dark:text-amber-300">
                  ${selectedRewardForUnlock.grossAmount.toFixed(2)} USD
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Claim Window:</span>
                <span className={isLight ? 'text-slate-700' : 'text-slate-200'}>
                  {selectedRewardForUnlock.claimWindowStart} - {selectedRewardForUnlock.claimWindowEnd}
                </span>
              </div>
            </div>

            <div>
              <label
                className={`block text-xs font-semibold ${
                  isLight ? 'text-slate-800' : 'text-slate-300'
                } mb-1.5`}
              >
                Reason / Explanation for Compliance Review
              </label>
              <textarea
                rows={3}
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
                placeholder="Explain reason for missing the designated window..."
                className={`w-full p-3 rounded-xl ${
                  isLight
                    ? 'bg-slate-50 border border-slate-300 text-slate-900'
                    : 'bg-[#06121F] border border-white/15 text-white'
                } text-xs outline-none focus:border-blue-500`}
              />
            </div>

            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} leading-relaxed`}>
              Upon submission, a linked Support Ticket will be created automatically. Once approved by our team, the reward becomes instantly claimable.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedRewardForUnlock(null)}
                className={`px-4 py-2 rounded-xl ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/5 text-slate-300'
                } text-xs font-semibold`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitUnlock}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20"
              >
                Submit Unlock Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
