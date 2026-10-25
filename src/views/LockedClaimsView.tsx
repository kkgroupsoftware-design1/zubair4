import React, { useState } from 'react';
import { Lock, ArrowRight, Clock, CheckCircle2, Headphones, AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LockedClaimsView: React.FC = () => {
  const { unlockRequests, dailyRewards, submitUnlockRequest, claimReward, navigate, theme, loadViewData } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [targetRewardId, setTargetRewardId] = useState('');
  const [reason, setReason] = useState('Missed time window due to travel. Requesting unlock for distribution.');

  // Lazy load locked rewards on mount
  React.useEffect(() => {
    loadViewData('claims-locked');
  }, []);

  const isLight = theme === 'light';
  const lockedRewards = dailyRewards.filter((r) => r.status === 'Locked');
  const [isClaimingAll, setIsClaimingAll] = useState(false);

  const handleAutoClaimAllLocked = async () => {
    setIsClaimingAll(true);
    for (const r of lockedRewards) {
      await claimReward(r.id);
    }
    setIsClaimingAll(false);
  };

  const handleCreateUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRewardId) return;
    await submitUnlockRequest(targetRewardId, reason);
    setModalOpen(false);
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Auto-Claim Protocol Banner */}
      <div
        className={`p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isLight
            ? 'bg-emerald-50 border border-emerald-200/90 shadow-sm'
            : 'bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-blue-500/10 border border-emerald-500/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
              isLight
                ? 'bg-emerald-100 border border-emerald-200 text-emerald-700'
                : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className={`text-xs sm:text-sm font-black ${isLight ? 'text-emerald-900' : 'text-emerald-400'}`}>
              ⚡ Automated Daily Distribution Protocol Active
            </h4>
            <p className={`text-[11px] ${isLight ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>
              All daily rewards for active investment plans are automatically credited to your Available Cash during the distribution window. Manual unlocks are no longer required.
            </p>
          </div>
        </div>
        {lockedRewards.length > 0 && (
          <button
            onClick={handleAutoClaimAllLocked}
            disabled={isClaimingAll}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isClaimingAll ? 'Claiming All...' : 'Auto-Claim All to Wallet'}</span>
          </button>
        )}
      </div>

      {/* Header */}
      <div
        className={`rounded-3xl ${
          isLight
            ? 'bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-blue-800 text-white shadow-xl'
            : 'bg-gradient-to-r from-[#07192C] to-[#0D2644] border border-amber-500/20 text-white shadow-xl'
        } p-5 flex items-center justify-between`}
      >
        <div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
            Resolution & Compliance
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 font-['Outfit',sans-serif]">
            Locked Claims & Unlock
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
            Recover uncollected daily distributions with automated support review.
          </p>
        </div>

        {lockedRewards.length > 0 && (
          <button
            onClick={() => {
              setTargetRewardId(lockedRewards[0].id);
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-md"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>New Request</span>
          </button>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          className={`p-4 rounded-2xl ${
            isLight ? 'bg-white border border-slate-200 shadow-sm' : 'bg-[#091A2E] border border-white/10'
          }`}
        >
          <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} uppercase font-semibold`}>
            Locked Rewards
          </span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 font-['Outfit',sans-serif]">
            {lockedRewards.length} Items
          </div>
        </div>
        <div
          className={`p-4 rounded-2xl ${
            isLight ? 'bg-white border border-slate-200 shadow-sm' : 'bg-[#091A2E] border border-white/10'
          }`}
        >
          <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} uppercase font-semibold`}>
            Under Support Review
          </span>
          <div className="text-xl font-black text-blue-600 dark:text-sky-400 mt-1 font-['Outfit',sans-serif]">
            {unlockRequests.filter((u) => u.status === 'Under Support Review').length}
          </div>
        </div>
        <div
          className={`p-4 rounded-2xl ${
            isLight ? 'bg-white border border-slate-200 shadow-sm' : 'bg-[#091A2E] border border-white/10'
          }`}
        >
          <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} uppercase font-semibold`}>
            Approved & Claimable
          </span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-['Outfit',sans-serif]">
            {dailyRewards.filter((r) => r.status === 'Unlocked').length}
          </div>
        </div>
      </div>

      {/* Unlocked / Claimable Section */}
      {dailyRewards.some((r) => r.status === 'Unlocked') && (
        <div
          className={`p-4 rounded-3xl ${
            isLight ? 'bg-emerald-50 border border-emerald-200' : 'bg-emerald-950/30 border border-emerald-500/30'
          } space-y-3`}
        >
          <h3 className="text-sm font-black text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Approved & Unlocked Rewards Ready to Claim</span>
          </h3>
          {dailyRewards
            .filter((r) => r.status === 'Unlocked')
            .map((r) => (
              <div
                key={r.id}
                className={`p-3 rounded-2xl ${
                  isLight ? 'bg-white border border-emerald-200 shadow-xs' : 'bg-[#081829] border border-emerald-500/20'
                } flex items-center justify-between`}
              >
                <div>
                  <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {r.planName}
                  </h4>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Unlocked net payout: ${(Number(r.netAmount) || 0).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => claimReward(r.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center gap-1 shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Claim Now</span>
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Unlock Requests History */}
      <div
        className={`rounded-3xl ${
          isLight
            ? 'bg-white border border-slate-200 shadow-md text-slate-900'
            : 'bg-[#091A2E] border border-white/10 shadow-xl text-white'
        } p-5 space-y-4`}
      >
        <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Unlock Requests Status Tracker
        </h3>

        {unlockRequests.length === 0 ? (
          <div className={`py-8 text-center text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            No unlock requests submitted yet.
          </div>
        ) : (
          <div className="space-y-3">
            {unlockRequests.map((req) => (
              <div
                key={req.id}
                className={`p-4 rounded-2xl ${
                  isLight ? 'bg-slate-50 border border-slate-200' : 'bg-[#06121F] border border-white/10'
                } space-y-3`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-sky-400">{req.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          req.status === 'Approved'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : req.status === 'Rejected'
                            ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                            : 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <h4 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'} mt-1`}>
                      {req.planName || (req as any).plan_name || 'Daily Plan'} (${(Number(req.grossReward ?? (req as any).gross_reward ?? 0)).toFixed(2)})
                    </h4>
                  </div>

                  <button
                    onClick={() => navigate('support')}
                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-[#38BDF8] hover:underline font-semibold"
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>View Ticket</span>
                  </button>
                </div>

                <p
                  className={`text-xs ${
                    isLight ? 'text-slate-700 bg-white border border-slate-200' : 'text-slate-300 bg-white/5 border border-white/5'
                  } p-2.5 rounded-xl`}
                >
                  <span className={`${isLight ? 'text-slate-500' : 'text-slate-400'} font-semibold`}>Reason:</span> "{req.reason}"
                </p>

                {req.adminNote && (
                  <p
                    className={`text-xs ${
                      isLight ? 'text-amber-800 bg-amber-50 border border-amber-200' : 'text-amber-300 bg-amber-500/10 border border-amber-500/20'
                    } p-2.5 rounded-xl`}
                  >
                    <span className="font-semibold">Reviewer Note:</span> {req.adminNote}
                  </p>
                )}

                <div className={`flex items-center justify-between text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} pt-1`}>
                  <span>Window: {req.claimWindow}</span>
                  <span>Submitted: {req.submittedAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {modalOpen && (
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
              <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Create Unlock Request
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className={`${isLight ? 'text-slate-400 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUnlock} className="space-y-3">
              <div>
                <label className={`block text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'} mb-1`}>
                  Select Locked Reward
                </label>
                <select
                  value={targetRewardId}
                  onChange={(e) => setTargetRewardId(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl ${
                    isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900'
                      : 'bg-[#06121F] border border-white/15 text-white'
                  } text-xs outline-none focus:border-blue-500`}
                >
                  {lockedRewards.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.planName} - ${(Number(r.grossAmount) || 0).toFixed(2)} ({r.date})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'} mb-1`}>
                  Reason for Missing Claim Window
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className={`w-full p-3 rounded-xl ${
                    isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900'
                      : 'bg-[#06121F] border border-white/15 text-white'
                  } text-xs outline-none focus:border-blue-500`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className={`px-4 py-2 rounded-xl ${
                    isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/5 text-slate-300'
                  } text-xs font-semibold`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md"
                >
                  Submit for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
