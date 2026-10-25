import React, { useState, useMemo, useEffect } from 'react';
import {
  Car,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Calculator,
  Info,
  TrendingUp,
  Clock,
  DollarSign,
  X,
  AlertCircle,
  Percent,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InvestmentPlan, VehicleCategory } from '../types';

export const PlansView: React.FC = () => {
  const {
    plans = [],
    balance,
    investInPlan,
    navigate,
    selectedPlanForInvest,
    setSelectedPlanForInvest,
    theme,
    loadViewData,
  } = useApp();

  // Lazy load plans on mount
  useEffect(() => {
    loadViewData('plans');
  }, []);

  const isLight = theme === 'light';

  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [investAmount, setInvestAmount] = useState<number>(500);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [showCalculator, setShowCalculator] = useState(false);

  // Calculator specific state
  const [calcPlanId, setCalcPlanId] = useState<string>(plans[1]?.id || plans[0]?.id || 'plan_standard');
  const [calcAmount, setCalcAmount] = useState<number>(1000);

  // Sync if selectedPlanForInvest was passed from another view
  useEffect(() => {
    if (selectedPlanForInvest) {
      setSelectedPlan(selectedPlanForInvest);
      setInvestAmount(selectedPlanForInvest.minInvest || 100);
    }
  }, [selectedPlanForInvest]);

  const handleOpenInvest = (plan: InvestmentPlan) => {
    setSelectedPlan(plan);
    setInvestAmount(plan.minInvest || 100);
  };

  const handleCloseInvestModal = () => {
    setSelectedPlan(null);
    if (setSelectedPlanForInvest) {
      setSelectedPlanForInvest(null);
    }
  };

  const calculateReturn = (amount: number, rate: number, days: number) => {
    const daily = (amount * (rate || 0)) / 100;
    const totalEarnings = daily * (days || 1);
    const netRoi = amount > 0 ? ((totalEarnings / amount) * 100).toFixed(1) : '0.0';
    return {
      daily: daily.toFixed(2),
      total: totalEarnings.toFixed(2),
      netRoi,
    };
  };

  const handleConfirmInvest = async () => {
    if (!selectedPlan) return;
    setIsSubmitting(true);
    const success = await investInPlan(selectedPlan.id, investAmount);
    setIsSubmitting(false);
    if (success) {
      handleCloseInvestModal();
    }
  };

  // Filter plans safely
  const filteredPlans = useMemo(() => {
    if (!plans || !Array.isArray(plans)) return [];
    if (activeCategory === 'ALL') return plans;
    return plans.filter((p) => p.category?.toUpperCase() === activeCategory.toUpperCase());
  }, [plans, activeCategory]);

  const categories = [
    { id: 'ALL', label: 'All Fleets' },
    { id: 'ECONOMY', label: 'Economy' },
    { id: 'STANDARD', label: 'Standard' },
    { id: 'SUV', label: 'SUV Fleet' },
    { id: 'PREMIUM', label: 'Luxury VIP' },
  ];

  // Active plan for calculator
  const activeCalcPlan = useMemo(() => {
    return plans.find((p) => p.id === calcPlanId) || plans[0];
  }, [plans, calcPlanId]);

  const calcProjections = useMemo(() => {
    if (!activeCalcPlan) {
      return { daily: '0.00', weekly: '0.00', monthly: '0.00', annual: '0.00', duration: 'Unlimited' };
    }
    const rate = activeCalcPlan.dailyRewardRate || 0.44;
    const dailyNum = (calcAmount * rate) / 100;
    const weeklyNum = dailyNum * 7;
    const monthlyNum = dailyNum * 30;
    const annualNum = dailyNum * 365;
    return {
      daily: dailyNum.toFixed(2),
      weekly: weeklyNum.toFixed(2),
      monthly: monthlyNum.toFixed(2),
      annual: annualNum.toFixed(2),
      duration: 'Unlimited (Lifetime)',
    };
  }, [activeCalcPlan, calcAmount]);

  return (
    <div className="space-y-6 pb-28">
      {/* Top Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl ${
          isLight
            ? 'bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 border border-blue-800 text-white shadow-xl'
            : 'bg-gradient-to-br from-[#0A223E] via-[#081B30] to-[#040E1A] border border-blue-500/25 text-white shadow-2xl'
        } p-5 sm:p-6`}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 border border-blue-500/30 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              Verified Commercial Mobility Fleets
            </span>

            <button
              onClick={() => setShowCalculator((prev) => !prev)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 flex items-center gap-1.5 transition-colors"
            >
              <Calculator className="w-3.5 h-3.5 text-sky-300" />
              <span>{showCalculator ? 'Hide Calculator' : 'ROI Calculator'}</span>
            </button>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white mt-3 font-['Outfit',sans-serif] tracking-tight">
            Fleet Investment Plans
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1.5 max-w-xl leading-relaxed">
            Back operational ride-hailing and rental fleets with institutional-grade risk management.
            Collect verified daily rewards directly into your available balance.
          </p>

          <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-300">Available Balance:</span>
              <span className="font-bold text-emerald-400 text-sm sm:text-base font-['Outfit',sans-serif]">
                ${(balance?.availableBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('deposit')}
                className="text-xs font-bold text-sky-300 hover:underline flex items-center gap-1"
              >
                <span>Add Funds</span>
              </button>
              <button
                onClick={() => navigate('my-plans')}
                className="text-xs font-bold text-white px-2.5 py-1 rounded-lg bg-white/10 border border-white/15"
              >
                My Portfolio ({balance?.activePlansCount || 0})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive ROI Calculator Dropdown / Box */}
      {showCalculator && (
        <div
          className={`rounded-3xl ${
            isLight
              ? 'bg-white border border-slate-200 shadow-xl text-slate-900'
              : 'bg-[#091C30] border border-blue-400/30 shadow-2xl text-white'
          } p-5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300`}
        >
          <div
            className={`flex items-center justify-between border-b ${
              isLight ? 'border-slate-200' : 'border-white/10'
            } pb-3`}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-sky-400 flex items-center justify-center">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3
                  className={`text-sm font-bold ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Interactive Fleet ROI Calculator
                </h3>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Estimate potential daily yields and total payouts
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCalculator(false)}
              className={`${isLight ? 'text-slate-400 hover:text-slate-900' : 'text-slate-400 hover:text-white'} p-1`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Select Plan */}
            <div>
              <label
                className={`text-[11px] font-bold ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                } uppercase tracking-wider block mb-1.5`}
              >
                Select Fleet Tier
              </label>
              <select
                value={calcPlanId}
                onChange={(e) => {
                  setCalcPlanId(e.target.value);
                  const p = plans.find((pl) => pl.id === e.target.value);
                  if (p && calcAmount < p.minInvest) {
                    setCalcAmount(p.minInvest);
                  }
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl ${
                  isLight
                    ? 'bg-slate-50 border border-slate-300 text-slate-900'
                    : 'bg-[#061424] border border-white/15 text-white'
                } text-xs font-semibold outline-none focus:border-blue-500`}
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.dailyRewardRate}% / day • Unlimited Term)
                  </option>
                ))}
              </select>
            </div>

            {/* Investment Input */}
            <div>
              <label
                className={`text-xs font-bold ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                } uppercase tracking-wider block mb-1.5`}
              >
                Investment Amount ($)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                  $
                </span>
                <input
                  type="number"
                  min={activeCalcPlan?.minInvest || 100}
                  max={activeCalcPlan?.id === 'plan_premium' ? 100000000 : activeCalcPlan?.maxInvest || 50000}
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Math.max(0, Number(e.target.value)))}
                  className={`w-full pl-7 pr-3 py-2.5 rounded-xl ${
                    isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900'
                      : 'bg-[#061424] border border-white/15 text-white'
                  } text-xs font-bold outline-none focus:border-blue-500`}
                />
              </div>
            </div>
          </div>

          {/* Quick preset amount chips */}
          <div className="flex flex-wrap gap-1.5">
            {[50, 100, 300, 500, 980, 1500, 5000, 10000, 21450].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setCalcAmount(val)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  calcAmount === val
                    ? 'bg-blue-600 text-white shadow-md'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                ${val.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Output metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div
              className={`p-3 rounded-2xl ${
                isLight ? 'bg-slate-50 border border-slate-200' : 'bg-black/30 border border-white/5'
              } text-center`}
            >
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} block`}>
                Daily Payout
              </span>
              <strong className="text-emerald-600 dark:text-emerald-400 text-sm sm:text-base font-bold font-['Outfit',sans-serif]">
                ${calcProjections.daily}
              </strong>
            </div>
            <div
              className={`p-3 rounded-2xl ${
                isLight ? 'bg-slate-50 border border-slate-200' : 'bg-black/30 border border-white/5'
              } text-center`}
            >
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} block`}>
                Weekly Yield
              </span>
              <strong className="text-blue-600 dark:text-sky-300 text-sm sm:text-base font-bold font-['Outfit',sans-serif]">
                ${calcProjections.weekly}
              </strong>
            </div>
            <div
              className={`p-3 rounded-2xl ${
                isLight ? 'bg-slate-50 border border-slate-200' : 'bg-black/30 border border-white/5'
              } text-center`}
            >
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} block`}>
                Monthly Yield (30d)
              </span>
              <strong className="text-emerald-600 dark:text-emerald-300 text-sm sm:text-base font-bold font-['Outfit',sans-serif]">
                +${calcProjections.monthly}
              </strong>
            </div>
            <div
              className={`p-3 rounded-2xl ${
                isLight ? 'bg-slate-50 border border-slate-200' : 'bg-black/30 border border-white/5'
              } text-center`}
            >
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} block`}>
                Capital Lock
              </span>
              <strong
                className="text-emerald-500 dark:text-emerald-400 text-sm sm:text-base font-black font-['Outfit',sans-serif]"
              >
                Cancel Anytime
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-gradient-to-r from-[#155EEF] to-[#2563EB] text-white shadow-md scale-[1.02]'
                  : isLight
                  ? 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 shadow-2xs'
                  : 'bg-[#091A2E] text-slate-400 hover:text-slate-200 border border-white/10 hover:border-white/20'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <div
          className={`p-8 rounded-3xl ${
            isLight ? 'bg-white border border-slate-200' : 'bg-[#091A2E] border border-white/10'
          } text-center space-y-3`}
        >
          <Car className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            No plans found in this tier
          </h3>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Please choose another category or view all fleets.
          </p>
          <button
            onClick={() => setActiveCategory('ALL')}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
          >
            Show All Fleets
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 items-stretch">
          {filteredPlans.map((plan) => {
            const isPopular = plan.popular || plan.isPopular;
            const features = plan.features && plan.features.length > 0 ? plan.features : [
              'Weekly Automated Payouts',
              '100% Capital Principal Protection',
              'Verified Fleet Asset Escrow',
            ];
            const vehicleExamples = plan.vehicleExamples || ['Verified Fleet Asset'];
            const payoutFreq = plan.payoutFrequency || 'Weekly';
            const minDailyProfit = ((plan.minInvest * plan.dailyRewardRate) / 100).toFixed(2);

            // Tier styling definitions
            const tierTheme = {
              ECONOMY: {
                accentBadge: 'bg-sky-500/15 text-sky-500 dark:text-sky-400 border-sky-500/30',
                borderGlow: 'hover:border-sky-500/40',
                gradientBtn: 'from-[#0284C7] via-[#0369A1] to-[#075985] hover:from-[#0369A1] hover:to-[#0C4A6E]',
                accentColor: '#38BDF8',
              },
              STANDARD: {
                accentBadge: 'bg-blue-500/15 text-blue-500 dark:text-blue-400 border-blue-500/30',
                borderGlow: 'hover:border-blue-500/50',
                gradientBtn: 'from-[#155EEF] via-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF]',
                accentColor: '#155EEF',
              },
              SUV: {
                accentBadge: 'bg-purple-500/15 text-purple-500 dark:text-purple-400 border-purple-500/30',
                borderGlow: 'hover:border-purple-500/40',
                gradientBtn: 'from-[#7C3AED] via-[#6D28D9] to-[#5B21B6] hover:from-[#6D28D9] hover:to-[#4C1D95]',
                accentColor: '#8B5CF6',
              },
              PREMIUM: {
                accentBadge: 'bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/30',
                borderGlow: 'hover:border-amber-500/40',
                gradientBtn: 'from-[#D97706] via-[#B45309] to-[#92400E] hover:from-[#B45309] hover:to-[#78350F]',
                accentColor: '#F59E0B',
              },
            }[plan.category as 'ECONOMY' | 'STANDARD' | 'SUV' | 'PREMIUM'] || {
              accentBadge: 'bg-blue-500/15 text-blue-500 dark:text-blue-400 border-blue-500/30',
              borderGlow: 'hover:border-blue-500/40',
              gradientBtn: 'from-[#155EEF] via-[#2563EB] to-[#1D4ED8]',
              accentColor: '#155EEF',
            };

            return (
              <div
                key={plan.id}
                className={`rounded-3xl border flex flex-col justify-between transition-all duration-300 group ${
                  isLight
                    ? isPopular
                      ? 'bg-white border-2 border-blue-500 shadow-xl shadow-blue-500/10 relative hover:shadow-2xl'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-xl'
                    : isPopular
                    ? 'bg-gradient-to-b from-[#0C223D] via-[#08182B] to-[#050F1C] border-blue-500/40 shadow-2xl shadow-blue-950/70 relative hover:border-blue-400/60'
                    : 'bg-gradient-to-b from-[#091C30] via-[#071625] to-[#050F1A] border-white/10 hover:border-white/20 shadow-xl hover:shadow-2xl'
                } p-4 sm:p-5 hover:-translate-y-1`}
              >
                {/* Popular Ribbon if applicable */}
                {isPopular && (
                  <div className="absolute -top-3 right-6 z-20 bg-gradient-to-r from-[#155EEF] to-[#38BDF8] text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg shadow-blue-600/30 flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-current" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div className="space-y-3.5">
                  {/* Card Header: Tier Badge + Daily Rate Highlight */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border inline-flex items-center gap-1.5 ${tierTheme.accentBadge}`}>
                        <Car className="w-3 h-3" />
                        <span>{plan.category} TIER</span>
                      </span>
                      <h3 className={`text-lg sm:text-xl font-black mt-1.5 truncate ${
                        isLight ? 'text-slate-900' : 'text-white'
                      } font-['Outfit',sans-serif]`}>
                        {plan.name}
                      </h3>
                      <p className={`text-xs ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      } line-clamp-1 mt-0.5`}>
                        {plan.description}
                      </p>
                    </div>

                    {/* Daily Yield Pill */}
                    <div className="text-right shrink-0 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-2xl">
                      <span className="text-base sm:text-lg font-black text-emerald-500 dark:text-emerald-400 font-['Outfit',sans-serif] block leading-tight">
                        {plan.dailyRewardRate}%
                      </span>
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-300 uppercase tracking-tight">
                        Daily Return
                      </span>
                    </div>
                  </div>

                  {/* Vehicle Visual Showcase with Glassmorphism Model Tags */}
                  <div className="relative h-32 sm:h-36 w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner group/img">
                    <img
                      src={plan.image}
                      alt={plan.name}
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                    {/* Fleet Model Badges Floating Over Image */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex flex-wrap gap-1.5 pointer-events-none">
                      {vehicleExamples.slice(0, 3).map((v, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white border border-white/15 flex items-center gap-1 shadow-xs"
                        >
                          <span className="text-sky-400 text-[10px]">🚗</span>
                          <span className="truncate max-w-[110px]">{v}</span>
                        </span>
                      ))}
                      {vehicleExamples.length > 3 && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-slate-300 border border-white/15">
                          +{vehicleExamples.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Financial Metrics Strip: 2x2 Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div
                      className={`p-2.5 rounded-2xl ${
                        isLight ? 'bg-slate-50 border border-slate-200' : 'bg-white/[0.03] border border-white/5'
                      }`}
                    >
                      <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'} block`}>
                        Investment Tier
                      </span>
                      <strong className={`text-xs sm:text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'} font-['Outfit',sans-serif]`}>
                        ${plan.minInvest.toLocaleString()} – {plan.id === 'plan_premium' || plan.maxInvest >= 99999999 ? 'Unlimited' : `$${plan.maxInvest.toLocaleString()}`}
                      </strong>
                    </div>

                    <div
                      className={`p-2.5 rounded-2xl ${
                        isLight ? 'bg-emerald-50/70 border border-emerald-200/70' : 'bg-emerald-500/10 border border-emerald-500/20'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                        Capital Guarantee
                      </span>
                      <strong className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-['Outfit',sans-serif]">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        Cancel Anytime
                      </strong>
                    </div>

                    <div
                      className={`p-2.5 rounded-2xl ${
                        isLight ? 'bg-slate-50 border border-slate-200' : 'bg-white/[0.03] border border-white/5'
                      }`}
                    >
                      <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'} block`}>
                        Min Daily Yield
                      </span>
                      <strong className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 font-['Outfit',sans-serif]">
                        +${minDailyProfit} / day
                      </strong>
                    </div>

                    <div
                      className={`p-2.5 rounded-2xl ${
                        isLight ? 'bg-slate-50 border border-slate-200' : 'bg-white/[0.03] border border-white/5'
                      }`}
                    >
                      <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'} block`}>
                        Payout Schedule
                      </span>
                      <strong className={`text-xs sm:text-sm font-black ${isLight ? 'text-slate-800' : 'text-slate-200'} flex items-center gap-1 font-['Outfit',sans-serif]`}>
                        <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        Weekly Automated
                      </strong>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-1.5 pt-0.5">
                    {features.slice(0, 3).map((feat, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-2 text-xs ${
                          isLight ? 'text-slate-600' : 'text-slate-300'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-snug break-words">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons Footer */}
                <div className="pt-4 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenInvest(plan)}
                    className={`flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r ${tierTheme.gradientBtn} text-white text-xs font-bold shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>Select & Invest</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setCalcPlanId(plan.id);
                      setCalcAmount(plan.minInvest);
                      setShowCalculator(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    title="Calculate Returns"
                    className={`p-3 rounded-2xl ${
                      isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                    } transition-colors cursor-pointer shrink-0`}
                  >
                    <Calculator className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invest Modal Dialog */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div
            className={`w-full max-w-md ${
              isLight
                ? 'bg-white border border-slate-200 shadow-2xl text-slate-900'
                : 'bg-[#091A2E] border border-blue-500/30 shadow-2xl text-white'
            } rounded-3xl p-4 sm:p-6 space-y-3.5 sm:space-y-4 max-h-[92vh] overflow-y-auto`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between border-b ${
                isLight ? 'border-slate-200' : 'border-white/10'
              } pb-3`}
            >
              <div>
                <span className="text-[10px] font-black text-blue-600 dark:text-sky-400 uppercase tracking-wider">
                  Capital Allocation
                </span>
                <h3
                  className={`text-xl font-black ${
                    isLight ? 'text-slate-900' : 'text-white'
                  } font-['Outfit',sans-serif]`}
                >
                  {selectedPlan.name}
                </h3>
              </div>
              <button
                onClick={handleCloseInvestModal}
                className={`w-8 h-8 rounded-full ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-white/5 hover:bg-white/10 text-slate-400'
                } flex items-center justify-center transition-colors`}
              >
                ✕
              </button>
            </div>

            {/* Investment Input */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  Investment Amount ($)
                </label>
                <span className={`${isLight ? 'text-slate-500' : 'text-slate-400'} text-[11px]`}>
                  Wallet: ${(balance?.availableBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-base">
                  $
                </span>
                <input
                  type="number"
                  min={selectedPlan.minInvest}
                  max={selectedPlan.id === 'plan_premium' || selectedPlan.maxInvest >= 99999999 ? undefined : selectedPlan.maxInvest}
                  value={investAmount}
                  onChange={(e) => setInvestAmount(Math.max(0, Number(e.target.value)))}
                  className={`w-full pl-8 pr-4 py-3 rounded-2xl ${
                    isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900'
                      : 'bg-[#06121F] border border-white/15 text-white'
                  } font-bold text-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                />
              </div>

              {/* Range indicator */}
              <div className={`flex justify-between text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-1 px-1`}>
                <span>Min: ${selectedPlan.minInvest.toLocaleString()}</span>
                <span>Max: {selectedPlan.id === 'plan_premium' || selectedPlan.maxInvest >= 99999999 ? 'Unlimited' : `$${selectedPlan.maxInvest.toLocaleString()}`}</span>
              </div>

              {/* Preset Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {(selectedPlan.id === 'plan_premium' || selectedPlan.maxInvest >= 99999999
                  ? [selectedPlan.minInvest, 2500, 5000, 10000, 25000, 50000, 100000]
                  : [selectedPlan.minInvest, 50, 100, 200, 300, 500, 750, 980, 1200, 1500, 1720, selectedPlan.maxInvest]
                )
                  .filter((v, idx, arr) => arr.indexOf(v) === idx && v <= selectedPlan.maxInvest && v >= selectedPlan.minInvest)
                  .map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setInvestAmount(val)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                        investAmount === val
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          : 'bg-white/5 hover:bg-white/10 text-sky-300 border-white/10'
                      }`}
                    >
                      ${val.toLocaleString()}
                    </button>
                  ))}
              </div>
            </div>

            {/* Projected Earnings Breakdown */}
            <div
              className={`p-3.5 sm:p-4 rounded-2xl ${
                isLight
                  ? 'bg-slate-50/90 border border-slate-200/80 shadow-xs'
                  : 'bg-gradient-to-br from-[#0A1E35] to-[#071322] border border-blue-500/25 shadow-xl'
              } space-y-2.5`}
            >
              {/* Header inside card: Title + Daily ROI Badge */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/10">
                <span className={`text-[11px] sm:text-xs font-black uppercase tracking-wider ${isLight ? 'text-blue-900' : 'text-sky-300'} flex items-center gap-1.5`}>
                  <TrendingUp className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  Yield Projections
                </span>
                <span className="text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                  {selectedPlan.dailyRewardRate}% / day
                </span>
              </div>

              {/* 2-Column Symmetric Metric Tiles (100% aligned on mobile & desktop) */}
              <div className="grid grid-cols-2 gap-2">
                {/* Tile 1: Daily Profit */}
                <div className={`p-2 sm:p-2.5 rounded-xl ${isLight ? 'bg-white border border-slate-200/80' : 'bg-white/[0.04] border border-white/5'}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Daily Yield
                  </span>
                  <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 font-['Outfit',sans-serif] mt-0.5">
                    +${((investAmount * selectedPlan.dailyRewardRate) / 100).toFixed(2)}
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 ml-1">/ day</span>
                  </div>
                </div>

                {/* Tile 2: Weekly Payout */}
                <div className={`p-2 sm:p-2.5 rounded-xl ${isLight ? 'bg-white border border-slate-200/80' : 'bg-white/[0.04] border border-white/5'}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Weekly Payout
                  </span>
                  <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 font-['Outfit',sans-serif] mt-0.5">
                    +${(((investAmount * selectedPlan.dailyRewardRate) / 100) * 7).toFixed(2)}
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 ml-1">/ wk</span>
                  </div>
                </div>

                {/* Tile 3: 30-Day Monthly Return */}
                <div className={`p-2 sm:p-2.5 rounded-xl ${isLight ? 'bg-white border border-slate-200/80' : 'bg-white/[0.04] border border-white/5'}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Monthly (30d)
                  </span>
                  <div className="text-sm sm:text-base font-black text-blue-600 dark:text-sky-300 font-['Outfit',sans-serif] mt-0.5">
                    +${(((investAmount * selectedPlan.dailyRewardRate) / 100) * 30).toFixed(2)}
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 ml-1">/ mo</span>
                  </div>
                </div>

                {/* Tile 4: Payout Schedule */}
                <div className={`p-2 sm:p-2.5 rounded-xl ${isLight ? 'bg-white border border-slate-200/80' : 'bg-white/[0.04] border border-white/5'}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Payout Cadence
                  </span>
                  <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1 mt-1 truncate">
                    <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Weekly Auto</span>
                  </div>
                </div>
              </div>

              {/* Bottom Guarantee Banner: Capital Lock */}
              <div className={`p-2 sm:p-2.5 rounded-xl flex items-center justify-between text-xs ${
                isLight
                  ? 'bg-emerald-50/80 border border-emerald-200/80 text-emerald-800'
                  : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              }`}>
                <div className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Capital Lock:</span>
                </div>
                <strong className="font-black text-emerald-600 dark:text-emerald-400 font-['Outfit',sans-serif]">
                  Cancel Anytime
                </strong>
              </div>
            </div>

            {/* Warning if insufficient balance */}
            {investAmount > (balance?.availableBalance || 0) && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>Insufficient available wallet balance.</span>
                </div>
                <button
                  onClick={() => {
                    handleCloseInvestModal();
                    navigate('deposit');
                  }}
                  className="font-bold underline text-rose-700 dark:text-white hover:underline ml-2 whitespace-nowrap"
                >
                  Deposit Now
                </button>
              </div>
            )}

            {/* Confirm button */}
            <button
              disabled={
                isSubmitting ||
                investAmount > (balance?.availableBalance || 0) ||
                investAmount < selectedPlan.minInvest ||
                (!(selectedPlan.id === 'plan_premium' || selectedPlan.maxInvest >= 99999999) && investAmount > selectedPlan.maxInvest)
              }
              onClick={handleConfirmInvest}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Allocating Capital...'
                  : `Confirm & Allocate $${investAmount.toLocaleString()}`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
