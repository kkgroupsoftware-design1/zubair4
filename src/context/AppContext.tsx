import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ASSETS } from '../assets/images';

import {
  User,
  UserBalance,
  InvestmentPlan,
  ActiveInvestment,
  DailyRewardRecord,
  UnlockRequest,
  Deposit,
  Withdrawal,
  KYCData,
  SupportTicket,
  Transaction,
  NotificationItem,
  AuditLog,
  DepositPaymentMethod,
  WithdrawalPaymentMethod,
  DistributionSettings,
  UserReferralData,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_BALANCE,
  INVESTMENT_PLANS,
  INITIAL_ACTIVE_INVESTMENTS,
  INITIAL_DAILY_REWARDS,
  INITIAL_UNLOCK_REQUESTS,
  INITIAL_DEPOSITS,
  INITIAL_WITHDRAWALS,
  INITIAL_KYC,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PAYMENT_METHODS,
} from '../data/mockData';
import { useToast } from '../components/ui/Toast';

interface AppContextType {
  user: User | null;
  balance: UserBalance;
  plans: InvestmentPlan[];
  paymentMethods: DepositPaymentMethod[];
  investments: ActiveInvestment[];
  dailyRewards: DailyRewardRecord[];
  unlockRequests: UnlockRequest[];
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  kyc: KYCData;
  supportTickets: SupportTicket[];
  transactions: Transaction[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  currentView: string;
  isBalanceHidden: boolean;
  timeRemainingSeconds: number;
  isMobileDeviceFrame: boolean;
  selectedPlanForInvest: InvestmentPlan | null;
  notificationDrawerOpen: boolean;
  sidebarOpen: boolean;
  splashSlides: SplashSlide[];

  // Lazy loading state
  txnPage: number;
  txnTotalPages: number;
  depPage: number;
  depTotalPages: number;
  wthPage: number;
  wthTotalPages: number;
  rewardsPage: number;
  rewardsTotalPages: number;
  rewardsTotal: number;
  todayRewardsSummary: { status: string; netAmount: number }[];
  loadRewards: (page?: number, append?: boolean, status?: string) => Promise<void>;
  loadingView: boolean;
  loadViewData: (view: string, page?: number, force?: boolean) => Promise<void>;
  invalidateViewData: (view?: string) => void;

  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  navigate: (view: string) => void;
  toggleBalanceHidden: () => void;
  toggleMobileDeviceFrame: () => void;
  setNotificationDrawerOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedPlanForInvest: (plan: InvestmentPlan | null) => void;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (fullName: string, email: string, phone: string, refCode?: string) => Promise<boolean>;
  logout: () => void;
  claimReward: (rewardId?: string, investmentId?: string) => Promise<boolean>;
  submitUnlockRequest: (rewardId: string, reason: string) => Promise<boolean>;
  investInPlan: (planId: string, amount: number) => Promise<boolean>;
  requestPlanCancellation: (investmentId: string, reason: string) => Promise<boolean>;
  depositFunds: (amount: number, method: any, reference?: string, proofUrl?: string, planId?: string, planName?: string) => Promise<boolean>;
  referralData: UserReferralData | null;
  fetchUserReferrals: () => Promise<void>;
  requestWithdrawal: (amount: number, method: any, destination: string, fee?: number, pin?: string) => Promise<boolean>;
  submitKycDocuments: (kycPayload: Partial<KYCData>) => Promise<boolean>;
  submitKycBasic: (data: any) => Promise<boolean>;
  submitKycAdvance: (data: any) => Promise<boolean>;
  fetchUserKyc: () => Promise<void>;
  fetchAdminKyc: () => Promise<KYCData[]>;
  createTicket: (subject: string, category: any, message: string, attachedRewardId?: string) => Promise<boolean>;
  sendTicketReply: (ticketId: string, message: string) => Promise<boolean>;
  adminInitiateTicket: (targetUserId: string, subject: string, message: string, category?: string) => Promise<boolean>;
  updateProfile: (name: string, email: string, phone: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  updateWithdrawPin: (newPin: string, currentPin?: string) => Promise<boolean>;
  markAllNotificationsAsRead: () => void;
  markNotificationAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearWeekNotifications: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  fetchNotifications: (timeframe?: string) => Promise<void>;
  fetchAdminUnlocks: () => Promise<void>;
  adminReviewUnlock: (requestId: string, action: 'approve' | 'reject', note?: string) => Promise<boolean>;
  adminReviewKYC: (action: 'approve' | 'reject', reason?: string, targetId?: string) => Promise<boolean>;
  switchUserRole: () => void;
  updateSplashSlide: (index: number, slide: Partial<SplashSlide>) => void;

  // Investment Plans Admin Management
  addInvestmentPlan: (plan: Omit<InvestmentPlan, 'id'>) => Promise<boolean>;
  updateInvestmentPlan: (id: string, plan: Partial<InvestmentPlan>) => Promise<boolean>;
  deleteInvestmentPlan: (id: string) => Promise<boolean>;

  // Deposit Wallets / Methods Admin Management
  fetchPaymentMethods: (all?: boolean) => Promise<void>;
  addPaymentMethod: (method: Omit<DepositPaymentMethod, 'id' | 'createdAt'>) => Promise<boolean>;
  updatePaymentMethod: (id: string, method: Partial<DepositPaymentMethod>) => Promise<boolean>;
  deletePaymentMethod: (id: string) => Promise<boolean>;
  togglePaymentMethodStatus: (id: string) => Promise<boolean>;

  // Withdrawal Crypto Gateways Admin Management
  withdrawalMethods: WithdrawalPaymentMethod[];
  fetchWithdrawalMethods: (all?: boolean) => Promise<void>;
  addWithdrawalMethod: (method: Omit<WithdrawalPaymentMethod, 'id' | 'createdAt'>) => Promise<boolean>;
  updateWithdrawalMethod: (id: string, method: Partial<WithdrawalPaymentMethod>) => Promise<boolean>;
  deleteWithdrawalMethod: (id: string) => Promise<boolean>;
  toggleWithdrawalMethodStatus: (id: string) => Promise<boolean>;

  // Distribution Timing & Real Schedule
  distributionSettings: DistributionSettings;
  distributionStatus: 'open' | 'upcoming' | 'closed' | 'disabled';
  distributionFormattedWindow: string;
  distributionProgress: number;
  updateDistributionSettings: (settings: Partial<DistributionSettings>) => Promise<boolean>;
  refetchDistributionSettings: () => Promise<void>;
}

export interface SplashSlide {
  imageUrl: string;
  headline: string;
  subheadline: string;
  description: string;
  badge1: string;
  badge2: string;
  dailyRewardRate?: number | string;
  category?: string;
  minInvest?: number;
  durationDays?: number;
}

// Accurate distribution window computation engine (zero random numbers)
function computeDistributionState(settings: DistributionSettings): {
  status: 'open' | 'upcoming' | 'closed' | 'disabled';
  seconds: number;
  formattedWindow: string;
  percentProgress: number;
} {
  const [startH = 12, startM = 0] = (settings.startTime || '12:00').split(':').map(Number);
  const [endH = 15, endM = 0] = (settings.endTime || '15:00').split(':').map(Number);

  const fmt12 = (h: number, m: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
  };
  const tzLabel = settings.timezone || 'Asia/Karachi';
  const tzDisplay = tzLabel === 'Asia/Karachi' ? 'PKT' : tzLabel;
  const formattedWindow = `${fmt12(startH, startM)} - ${fmt12(endH, endM)} ${tzDisplay}`;

  const now = new Date();
  let curH = now.getHours();
  let curM = now.getMinutes();
  let curS = now.getSeconds();

  if (tzLabel.toUpperCase() === 'UTC') {
    curH = now.getUTCHours();
    curM = now.getUTCMinutes();
    curS = now.getUTCSeconds();
  } else {
    try {
      const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone: tzLabel,
        hour12: false,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      });
      const parts = dtf.formatToParts(now);
      for (const p of parts) {
        if (p.type === 'hour') curH = parseInt(p.value, 10);
        if (p.type === 'minute') curM = parseInt(p.value, 10);
        if (p.type === 'second') curS = parseInt(p.value, 10);
      }
      if (curH === 24) curH = 0;
    } catch {
      // Fallback to local system time
    }
  }

  const nowSecs = curH * 3600 + curM * 60 + curS;
  const startSecs = startH * 3600 + startM * 60;
  const endSecs = endH * 3600 + endM * 60;

  // 1. If admin explicitly allows immediate claim override OR window is full 24/7
  if (settings.allowImmediateClaim || (startSecs === 0 && endH >= 23 && endM >= 58)) {
    const secsRemaining = Math.max(1, 86400 - nowSecs);
    const percentProgress = Math.min(100, Math.max(0, Math.round((nowSecs / 86400) * 100)));
    return {
      status: 'open',
      seconds: secsRemaining,
      formattedWindow: `${formattedWindow} (Live Open)`,
      percentProgress,
    };
  }

  // 2. If distribution is disabled by admin
  if (!settings.distributionEnabled) {
    return {
      status: 'disabled',
      seconds: 0,
      formattedWindow: 'Distribution Paused',
      percentProgress: 0,
    };
  }

  // 3. Daytime window calculation (12:00 PM to 03:00 PM)
  const windowDuration = endSecs > startSecs
    ? endSecs - startSecs
    : (86400 - startSecs) + endSecs;

  let isOpen = false;
  let secondsRemaining = 0;
  let percentProgress = 0;

  if (endSecs > startSecs) {
    if (nowSecs >= startSecs && nowSecs < endSecs) {
      isOpen = true;
      secondsRemaining = endSecs - nowSecs;
      const elapsed = nowSecs - startSecs;
      percentProgress = Math.min(100, Math.max(0, Math.round((elapsed / windowDuration) * 100)));
    }
  } else {
    if (nowSecs >= startSecs || nowSecs < endSecs) {
      isOpen = true;
      const elapsed = nowSecs >= startSecs
        ? nowSecs - startSecs
        : (86400 - startSecs) + nowSecs;
      secondsRemaining = windowDuration - elapsed;
      percentProgress = Math.min(100, Math.max(0, Math.round((elapsed / windowDuration) * 100)));
    }
  }

  if (isOpen) {
    return {
      status: 'open',
      seconds: Math.max(1, secondsRemaining),
      formattedWindow,
      percentProgress,
    };
  }

  if (nowSecs < startSecs) {
    return {
      status: 'upcoming',
      seconds: Math.max(1, startSecs - nowSecs),
      formattedWindow,
      percentProgress: 0,
    };
  }

  const secsToTomorrow = (86400 - nowSecs) + startSecs;
  return {
    status: 'closed',
    seconds: Math.max(1, secsToTomorrow),
    formattedWindow,
    percentProgress: 0,
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('rentobit_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Error parsing stored user', e);
      }
    }
    return null;
  });
  const [balance, setBalance] = useState<UserBalance>(INITIAL_BALANCE);
  // Clear any stale localStorage caches from previous mock-data era
  React.useEffect(() => {
    localStorage.removeItem('rentobit_plans');
    localStorage.removeItem('rentobit_payment_methods');
  }, []);

  const [plans, setPlans] = useState<InvestmentPlan[]>(INVESTMENT_PLANS);

  const [paymentMethods, setPaymentMethods] = useState<DepositPaymentMethod[]>(INITIAL_PAYMENT_METHODS);

  const [withdrawalMethods, setWithdrawalMethods] = useState<WithdrawalPaymentMethod[]>([
    {
      id: 'wth_usdt_trc20',
      name: 'USDT TRC20',
      symbol: 'USDT',
      network: 'TRC20 (Tron Network)',
      iconType: 'usdt',
      iconUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
      minWithdrawal: 20.00,
      maxWithdrawal: 50000.00,
      feeFixed: 1.00,
      feePercent: 0.00,
      instructions: 'Provide your TRC20 address (begins with T). Transferred via Tron blockchain with $1.00 fixed network fee.',
      isActive: true,
    },
    {
      id: 'wth_usdt_erc20',
      name: 'USDT ERC20',
      symbol: 'USDT',
      network: 'ERC20 (Ethereum Network)',
      iconType: 'usdt',
      iconUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
      minWithdrawal: 30.00,
      maxWithdrawal: 50000.00,
      feeFixed: 5.00,
      feePercent: 0.00,
      instructions: 'Provide your ERC20 address (begins with 0x). Transferred via Ethereum network with $5.00 gas fee.',
      isActive: true,
    },
    {
      id: 'wth_eth',
      name: 'ETH (Ethereum)',
      symbol: 'ETH',
      network: 'Ethereum Mainnet',
      iconType: 'eth',
      iconUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      minWithdrawal: 30.00,
      maxWithdrawal: 50000.00,
      feeFixed: 3.00,
      feePercent: 0.00,
      instructions: 'Provide your native Ethereum address (begins with 0x). Instant payout upon administrative broadcast.',
      isActive: true,
    },
    {
      id: 'wth_btc',
      name: 'BTC (Bitcoin)',
      symbol: 'BTC',
      network: 'Bitcoin Network',
      iconType: 'btc',
      iconUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
      minWithdrawal: 50.00,
      maxWithdrawal: 50000.00,
      feeFixed: 4.00,
      feePercent: 0.00,
      instructions: 'Provide your native Bitcoin address (begins with 1, 3, or bc1). Settles across Bitcoin blockchain.',
      isActive: true,
    },
  ]);

  const [investments, setInvestments] = useState<ActiveInvestment[]>(INITIAL_ACTIVE_INVESTMENTS);

  // Deduplicate investments by id — prevents display of duplicate plan cards if state is ever
  // populated by concurrent fetches or optimistic + server data arriving out of order.
  const dedupeById = (arr: ActiveInvestment[]): ActiveInvestment[] => {
    const seen = new Set<string>();
    return arr.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };
  const [dailyRewards, setDailyRewards] = useState<DailyRewardRecord[]>(INITIAL_DAILY_REWARDS);
  const [unlockRequests, setUnlockRequests] = useState<UnlockRequest[]>(INITIAL_UNLOCK_REQUESTS);
  const [deposits, setDeposits] = useState<Deposit[]>(INITIAL_DEPOSITS);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(INITIAL_WITHDRAWALS);
  const [kyc, setKyc] = useState<KYCData>(INITIAL_KYC);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [referralData, setReferralData] = useState<UserReferralData | null>(null);

  // Lazy loading state
  const [loadingView, setLoadingView] = useState<boolean>(false);
  const [txnPage, setTxnPage] = useState(1);
  const [txnTotalPages, setTxnTotalPages] = useState(1);
  const [depPage, setDepPage] = useState(1);
  const [depTotalPages, setDepTotalPages] = useState(1);
  const [wthPage, setWthPage] = useState(1);
  const [wthTotalPages, setWthTotalPages] = useState(1);
  const [rewardsPage, setRewardsPage] = useState(1);
  const [rewardsTotalPages, setRewardsTotalPages] = useState(1);
  const [rewardsTotal, setRewardsTotal] = useState(0);
  const [todayRewardsSummary, setTodayRewardsSummary] = useState<{ status: string; netAmount: number }[]>([]);
  // Track which views have already been loaded to prevent duplicate fetches
  const loadedViews = React.useRef<Set<string>>(new Set());

  // Derive initial view from URL path so direct links & refresh work
  const getViewFromPath = (pathname: string): string => {
    const seg = pathname.replace(/^\//, '').split('/')[0] || 'splash';
    if (seg === 'join' || seg === 'signup' || seg === 'invite') {
      return 'register';
    }
    const validViews = [
      'splash', 'login', 'register', 'forgot-password', 'forgot', 'dashboard', 'plans', 'invest',
      'my-plans', 'rewards', 'claims-locked', 'deposit', 'withdraw',
      'kyc', 'support', 'transactions', 'profile', 'kkgroup',
      'terms', 'terms-of-service', 'privacy', 'privacy-policy',
    ];
    return validViews.includes(seg) ? seg : 'splash';
  };

  const [currentView, setCurrentView] = useState<string>(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const ref = searchParams.get('ref') || searchParams.get('referral') || searchParams.get('code') || searchParams.get('sponsor');
      if (ref && ref.trim()) {
        const cleanRef = ref.trim().toUpperCase();
        sessionStorage.setItem('rentobit_ref_code', cleanRef);
        localStorage.setItem('rentobit_ref_code', cleanRef);
        const seg = window.location.pathname.replace(/^\//, '').split('/')[0];
        if (!seg || seg === 'splash' || seg === 'join' || seg === 'signup' || seg === 'invite' || seg === 'register') {
          return 'register';
        }
      }
    } catch {
      // safe fallback
    }
    return getViewFromPath(window.location.pathname);
  });

  // Theme Management: Light or Dark Mode (Defaulting to light mode with persistent storage)
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('rentobit_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'light'; // Default to pristine light mode as requested
  });

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem('rentobit_theme', newTheme);
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    root.setAttribute('data-theme', newTheme);
    document.body.className = newTheme === 'light' ? 'bg-[#F4F7FB] text-slate-900' : 'bg-[#07121E] text-slate-100';

    showToast(
      newTheme === 'light' ? '☀️ Light Mode Enabled' : '🌙 Dark Mode Enabled',
      newTheme === 'light' ? 'Switched to clean daytime contrast' : 'Switched to dark night theme',
      'info'
    );
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  // Sync theme class and data-theme to HTML root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
    document.body.className = theme === 'light' ? 'bg-[#F4F7FB] text-slate-900' : 'bg-[#07121E] text-slate-100';

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'light' ? '#F4F7FB' : '#07121E');
    }
  }, [theme]);

  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(false);
  const [isMobileDeviceFrame, setIsMobileDeviceFrame] = useState<boolean>(false);
  const [selectedPlanForInvest, setSelectedPlanForInvest] = useState<InvestmentPlan | null>(null);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Splash slides derived from investment plans — always in sync
  const splashSlides: SplashSlide[] = plans.map((plan) => ({
    imageUrl: plan.image,
    headline: plan.name,
    subheadline: `${plan.dailyRewardRate}% Daily Earning`,
    description: plan.description,
    badge1: `🚗 ${plan.category}`,
    badge2: `⚡ ${plan.dailyRewardRate}% Daily Earning`,
    dailyRewardRate: plan.dailyRewardRate,
    category: plan.category,
    minInvest: plan.minInvest,
    durationDays: plan.durationDays,
  }));

  const updateSplashSlide = (_index: number, _slide: Partial<SplashSlide>) => {
    // Slides are derived from plans — edit plans to update slides
  };

  // Live Distribution Schedule State (Real-time, server-backed, not random)
  const [distributionSettings, setDistributionSettings] = useState<DistributionSettings>({
    startTime: '12:00',
    endTime: '15:00',
    timezone: 'Asia/Karachi',
    distributionEnabled: true,
    allowImmediateClaim: false,
    autoClaimEnabled: true,
    label: 'Daily Distribution Window (12:00 PM - 03:00 PM)',
  });

  const [distributionStatus, setDistributionStatus] = useState<'open' | 'upcoming' | 'closed' | 'disabled'>('upcoming');
  const [distributionFormattedWindow, setDistributionFormattedWindow] = useState<string>('12:00 PM - 03:00 PM PKT');
  const [distributionProgress, setDistributionProgress] = useState<number>(0);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);

  const refetchDistributionSettings = async () => {
    try {
      const res = await fetch('/api/settings/distribution');
      if (res.ok) {
        const data = await res.json();
        setDistributionSettings({
          startTime: data.startTime || '12:00',
          endTime: data.endTime || '15:00',
          timezone: data.timezone || 'Asia/Karachi',
          distributionEnabled: data.distributionEnabled ?? true,
          allowImmediateClaim: Boolean(data.allowImmediateClaim),
          autoClaimEnabled: data.autoClaimEnabled ?? true,
          label: data.label || 'Daily Distribution Window (12:00 PM - 03:00 PM)',
          serverTime: data.serverTime,
          serverEpoch: data.serverEpoch,
        });
      }
    } catch {
      // safe fallback
    }
  };

  const updateDistributionSettings = async (settings: Partial<DistributionSettings>): Promise<boolean> => {
    try {
      const updated = { ...distributionSettings, ...settings };
      const res = await fetch('/api/settings/distribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setDistributionSettings(updated);
        showToast('Distribution Schedule Updated', 'Working hours and distribution window successfully synced.');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update distribution schedule', 'error');
      return false;
    }
  };

  // Fetch distribution settings and live active gateways on mount
  useEffect(() => {
    refetchDistributionSettings();
    fetch('/api/payment-methods')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && Array.isArray(d) && d.length > 0 && setPaymentMethods(d))
      .catch(() => {});
    fetch('/api/withdrawal-methods')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && Array.isArray(d) && d.length > 0 && setWithdrawalMethods(d))
      .catch(() => {});
  }, []);

  // Real-time tick: Calculate exact countdown every second from distributionSettings
  useEffect(() => {
    const tick = () => {
      const computed = computeDistributionState(distributionSettings);
      setTimeRemainingSeconds(computed.seconds);
      setDistributionStatus(computed.status);
      setDistributionFormattedWindow(computed.formattedWindow);
      setDistributionProgress(computed.percentProgress);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [distributionSettings]);

  // Sync URL ↔ view state & preserve referral link params
  useEffect(() => {
    const handlePopState = () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const ref = searchParams.get('ref') || searchParams.get('referral') || searchParams.get('code') || searchParams.get('sponsor');
        if (ref && ref.trim()) {
          const cleanRef = ref.trim().toUpperCase();
          sessionStorage.setItem('rentobit_ref_code', cleanRef);
          localStorage.setItem('rentobit_ref_code', cleanRef);
        }
      } catch {}
      setCurrentView(getViewFromPath(window.location.pathname));
      setSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ─── View Cache Management ────────────────────────────────────────────────
  const invalidateViewData = (view?: string) => {
    if (!view) {
      loadedViews.current.clear();
    } else {
      loadedViews.current.delete(view);
      loadedViews.current.delete(`${view}_p1`);
    }
  };

  // ─── Rewards Lazy Loader ──────────────────────────────────────────────────
  const loadRewards = async (page: number = 1, append: boolean = false, status: string = 'all') => {
    const uid = user?.id;
    if (!uid) return;
    setLoadingView(true);
    try {
      const statusParam = status && status !== 'all' ? `&status=${encodeURIComponent(status)}` : '';
      const res = await fetch(`/api/rewards?userId=${uid}&page=${page}&limit=10${statusParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setDailyRewards((prev) => (append ? [...prev, ...data.data] : data.data));
        }
        setRewardsPage(data.page || page);
        setRewardsTotalPages(data.totalPages || 1);
        setRewardsTotal(data.total || 0);
        if (data.todayRewards && Array.isArray(data.todayRewards)) {
          setTodayRewardsSummary(data.todayRewards);
        }
      }
    } catch (err) {
      console.error('Error loading rewards:', err);
    } finally {
      setLoadingView(false);
    }
  };

  // ─── True Lazy Data Loader ────────────────────────────────────────────────
  // loadViewData is called by each view component only when it mounts.
  // Only the data that view actually needs is fetched from the server.
  // Responses are cached in loadedViews so navigation back & forth never overloads the server or web app.
  const loadViewData = async (view: string, page: number = 1, force: boolean = false) => {
    const cacheKey = page > 1 ? `${view}_p${page}` : view;

    // Cache hit: avoid re-fetching unless force reload is requested
    if (!force && page === 1 && loadedViews.current.has(cacheKey)) return;

    setLoadingView(true);
    try {
      const uid = user?.id;

      switch (view) {
        case 'dashboard': {
          const promises: Promise<any>[] = [];
          if (uid) {
            promises.push(
              fetch(`/api/user/balance?userId=${uid}`).then((r) => (r.ok ? r.json() : null)).then((b) => b && setBalance(b)),
              fetch(`/api/investments?userId=${uid}`).then((r) => (r.ok ? r.json() : null)).then((invs) => invs && Array.isArray(invs) && setInvestments(dedupeById(invs))),
              // Fetch today's daily reward so the distribution card shows correct data on first load
              fetch(`/api/rewards?userId=${uid}&page=1&limit=5`).then((r) => (r.ok ? r.json() : null)).then((r) => r && r.data && setDailyRewards(r.data))
            );
          }
          promises.push(
            fetch('/api/plans').then((r) => (r.ok ? r.json() : null)).then((pls) => pls && Array.isArray(pls) && pls.length > 0 && setPlans(pls))
          );
          await Promise.all(promises);
          break;
        }

        case 'my-plans': {
          if (uid) {
            const invRes = await fetch(`/api/investments?userId=${uid}`).then((r) => (r.ok ? r.json() : null));
            if (invRes && Array.isArray(invRes)) setInvestments(dedupeById(invRes));
          }
          break;
        }

        case 'plans':
        case 'invest':
        case 'investment': {
          // Always fetch from DB — mockData is fallback only, DB is source of truth
          const plansRes = await fetch('/api/plans').then((r) => (r.ok ? r.json() : null));
          if (plansRes && Array.isArray(plansRes) && plansRes.length > 0) setPlans(plansRes);
          break;
        }

        case 'rewards': {
          if (uid) {
            await loadRewards(page, page > 1, 'all');
          }
          break;
        }

        case 'claims-locked': {
          if (uid) {
            const [r, unlRes] = await Promise.all([
              fetch(`/api/rewards?userId=${uid}&page=1&limit=50`).then((res) => (res.ok ? res.json() : null)),
              fetch(`/api/rewards/unlock-requests?userId=${uid}`).then((res) => (res.ok ? res.json() : null)),
            ]);
            if (r && r.data) {
              setDailyRewards(r.data);
            }
            if (unlRes && Array.isArray(unlRes)) {
              const mapped = unlRes.map((u: any) => ({
                id: u.id,
                userId: u.userId || u.user_id,
                userName: u.userName || u.user_name || 'Member',
                userEmail: u.userEmail || u.user_email || '',
                rewardId: u.rewardId || u.reward_id,
                planName: u.planName || u.plan_name || 'Daily Plan',
                grossReward: Number(u.grossReward ?? u.gross_reward ?? 0),
                claimWindow: u.claimWindow || u.claim_window || '12:00 PM - 3:00 PM',
                lockTime: u.lockTime || u.lock_time || '',
                reason: u.reason || '',
                status: u.status || 'Under Support Review',
                submittedAt: u.submittedAt || u.submitted_at || 'Just now',
                reviewedAt: u.reviewedAt || u.reviewed_at,
                reviewedBy: u.reviewedBy || u.reviewed_by,
                adminNote: u.adminNote || u.admin_note,
              }));
              setUnlockRequests(mapped);
            }
          }
          break;
        }

        case 'transactions': {
          if (uid) {
            const r = await fetch(`/api/transactions?userId=${uid}&page=${page}&limit=20`).then((res) => (res.ok ? res.json() : null));
            if (r) {
              setTransactions((prev) => (page === 1 ? r.data : [...prev, ...r.data]));
              setTxnPage(r.page);
              setTxnTotalPages(r.totalPages);
            }
          }
          break;
        }

        case 'deposit': {
          if (uid) {
            const [depRes, pmRes] = await Promise.all([
              fetch(`/api/deposits?userId=${uid}&page=${page}&limit=20`).then((res) => (res.ok ? res.json() : null)),
              fetch('/api/payment-methods').then((r) => (r.ok ? r.json() : null)),
            ]);
            if (depRes) {
              setDeposits((prev) => (page === 1 ? depRes.data : [...prev, ...depRes.data]));
              setDepPage(depRes.page);
              setDepTotalPages(depRes.totalPages);
            }
            if (pmRes && Array.isArray(pmRes) && pmRes.length > 0) {
              setPaymentMethods(pmRes);
            }
          }
          break;
        }

        case 'withdraw': {
          if (uid) {
            const [wthRes, balRes, wmRes] = await Promise.all([
              fetch(`/api/withdrawals?userId=${uid}&page=${page}&limit=20`).then((res) => (res.ok ? res.json() : null)),
              fetch(`/api/user/balance?userId=${uid}`).then((r) => (r.ok ? r.json() : null)),
              fetch('/api/withdrawal-methods').then((r) => (r.ok ? r.json() : null)),
            ]);
            if (wthRes) {
              setWithdrawals((prev) => (page === 1 ? wthRes.data : [...prev, ...wthRes.data]));
              setWthPage(wthRes.page);
              setWthTotalPages(wthRes.totalPages);
            }
            if (balRes) setBalance(balRes);
            if (wmRes && Array.isArray(wmRes) && wmRes.length > 0) setWithdrawalMethods(wmRes);
          }
          break;
        }

        case 'kyc': {
          if (uid) {
            const r = await fetch(`/api/kyc/${uid}`).then((res) => (res.ok ? res.json() : null));
            if (r && r.status) setKyc(r);
          }
          break;
        }

        case 'support': {
          if (uid) {
            const r = await fetch(`/api/support/tickets?userId=${uid}`).then((res) => (res.ok ? res.json() : null));
            if (r && Array.isArray(r)) setSupportTickets(r);
          }
          break;
        }

        case 'kkgroup': {
          if (user?.role !== 'admin') break;
          const [unlockRes, audRes, pmRes, wmRes] = await Promise.all([
            fetch('/api/admin/unlock-requests').then((res) => (res.ok ? res.json() : null)),
            fetch('/api/admin/audit').then((res) => (res.ok ? res.json() : null)),
            fetch('/api/admin/payment-methods').then((res) => (res.ok ? res.json() : null)),
            fetch('/api/admin/withdrawal-methods').then((res) => (res.ok ? res.json() : null)),
          ]);
          if (unlockRes && Array.isArray(unlockRes)) {
            const mapped = unlockRes.map((u: any) => ({
              id: u.id,
              userId: u.userId || u.user_id,
              userName: u.userName || u.user_name || 'Member',
              userEmail: u.userEmail || u.user_email || '',
              rewardId: u.rewardId || u.reward_id,
              planName: u.planName || u.plan_name || 'Daily Plan',
              grossReward: Number(u.grossReward ?? u.gross_reward ?? 0),
              claimWindow: u.claimWindow || u.claim_window || '12:00 PM - 3:00 PM',
              lockTime: u.lockTime || u.lock_time || '',
              reason: u.reason || '',
              status: u.status || 'Under Support Review',
              submittedAt: u.submittedAt || u.submitted_at || 'Just now',
              reviewedAt: u.reviewedAt || u.reviewed_at,
              reviewedBy: u.reviewedBy || u.reviewed_by,
              adminNote: u.adminNote || u.admin_note,
            }));
            setUnlockRequests(mapped);
          }
          if (audRes) {
            if (Array.isArray(audRes)) setAuditLogs(audRes);
            else if (Array.isArray((audRes as any).logs)) setAuditLogs((audRes as any).logs);
          }
          if (pmRes && Array.isArray(pmRes) && pmRes.length > 0) setPaymentMethods(pmRes);
          if (wmRes && Array.isArray(wmRes) && wmRes.length > 0) setWithdrawalMethods(wmRes);
          break;
        }

        default:
          break;
      }
      loadedViews.current.add(cacheKey);
    } catch (e) {
      console.error(`Lazy load error for view [${view}]:`, e);
    } finally {
      setLoadingView(false);
    }
  };

  const hasInitializedNotifs = useRef(false);

  // Live Notifications Fetcher & Real-Time Sync (Defaults to Weekly data for client & admin)
  const fetchNotifications = useCallback(async (timeframe: string = 'week') => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/notifications?userId=${user.id}&timeframe=${timeframe}`);
      if (res.ok) {
        const data: NotificationItem[] = await res.json();
        setNotifications((prev) => {
          if (hasInitializedNotifs.current && prev.length > 0 && data.length > 0) {
            const prevIds = new Set(prev.map((n) => n.id));
            const newNotifs = data.filter((n) => !prevIds.has(n.id) && !n.isRead);
            if (newNotifs.length > 0) {
              const latest = newNotifs[0];
              showToast(latest.title, latest.message);
            }
          }
          hasInitializedNotifs.current = true;
          return data;
        });
      }
    } catch (e) {
      console.error('Notification sync error:', e);
    }
  }, [user?.id, showToast]);

  // Ultra-lightweight bootstrap: sync balance and notifications for active authenticated user session
  useEffect(() => {
    async function loadBootstrapData() {
      if (!user) return;
      try {
        const balRes = await fetch(`/api/user/balance?userId=${user.id}`).then((r) => (r.ok ? r.json() : null));
        if (balRes) setBalance(balRes);
      } catch (e) {
        console.error('Bootstrap balance error:', e);
      }
    }
    loadedViews.current = new Set();
    loadBootstrapData();
    fetchNotifications();

    // Fast polling interval (every 5 seconds) to ensure real-time notification alerts
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [user?.id, fetchNotifications]);

  const navigate = (view: string) => {
    const path = view === 'splash' ? '/' : `/${view}`;
    if (window.location.pathname !== path) {
      window.history.pushState({ view }, '', path);
    }
    setCurrentView(view);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const toggleBalanceHidden = () => {
    setIsBalanceHidden((prev) => !prev);
  };

  const toggleMobileDeviceFrame = () => {
    setIsMobileDeviceFrame((prev) => !prev);
  };

  // Auth: Login (Strict Database Verification)
  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || 'Invalid email or password.';
        showToast('Login Failed', errorMsg, 'error');
        return false;
      }

      setUser(data.user);
      localStorage.setItem('rentobit_user', JSON.stringify(data.user));
      if (data.token) localStorage.setItem('rentobit_token', data.token);
      if (data.balance) setBalance(data.balance);
      showToast('Welcome Back!', `Signed in successfully as ${data.user.name}`);
      navigate(data.user.role === 'admin' ? 'kkgroup' : 'dashboard');
      return true;
    } catch (err: any) {
      showToast('Authentication Error', err.message || 'Unable to connect to database server.', 'error');
      return false;
    }
  };

  // Auth: Register (Strict Database Registration)
  const register = async (
    fullName: string,
    email: string,
    phone: string,
    refCode?: string
  ): Promise<boolean> => {
    try {
      const cleanRef = refCode && refCode.trim() ? refCode.trim().toUpperCase() : undefined;
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, referralCode: cleanRef }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || 'Registration failed.';
        showToast('Registration Error', errorMsg, 'error');
        return false;
      }

      setUser(data.user);
      localStorage.setItem('rentobit_user', JSON.stringify(data.user));
      if (data.token) localStorage.setItem('rentobit_token', data.token);
      try {
        sessionStorage.removeItem('rentobit_ref_code');
        localStorage.removeItem('rentobit_ref_code');
      } catch {}
      showToast('Account Created!', 'Welcome to RentoBit! Explore plans and start earning.');
      navigate('dashboard');
      return true;
    } catch (err: any) {
      showToast('Registration Error', err.message || 'Unable to create account.', 'error');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rentobit_user');
    localStorage.removeItem('rentobit_token');
    showToast('Logged Out', 'You have been safely signed out.', 'info');
    navigate('login');
  };

  // Switch between User & Admin views (Only allowed for verified Admin users)
  const switchUserRole = () => {
    if (!user) {
      showToast('Authentication Required', 'Please log in with admin credentials.', 'error');
      navigate('login');
      return;
    }
    if (user.role !== 'admin') {
      showToast('Access Denied', 'Admin privileges required to access Admin Panel.', 'error');
      return;
    }
    navigate(currentView === 'kkgroup' ? 'dashboard' : 'kkgroup');
  };

  // Claim Reward — Credits directly into Available Cash
  const claimReward = async (rewardId?: string, investmentId?: string): Promise<boolean> => {
    // 1. Calculate active daily yield from investments
    const activeInvs = investments.filter((i) => i.status === 'Active');
    const activeDailySum = activeInvs.reduce((sum, inv) => sum + (inv.dailyReward || 0), 0);
    const fallbackRewardAmount = activeInvs.length > 0 ? Number(activeDailySum.toFixed(2)) : 0;

    let target = rewardId
      ? dailyRewards.find((r) => r.id === rewardId)
      : (!investmentId ? dailyRewards.find((r) => r.status === 'Available' || r.status === 'Unlocked') : undefined);

    // If no target reward exists and user has 0 active plans and no investmentId
    if (!investmentId && !target && activeInvs.length === 0) {
      showToast('No Active Plans', 'You currently do not have any active investment plans. Please activate a plan to start earning daily rewards.', 'info');
      return false;
    }

    // If target exists and not claimable
    if (target && target.status !== 'Available' && target.status !== 'Unlocked') {
      showToast('Reward Notice', `This reward is currently ${target.status}.`, 'info');
      return false;
    }

    try {
      const res = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId: target?.id, investmentId, userId: user?.id || 'usr_admin_001' }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        showToast('Claim Notice', data.error || 'Failed to claim daily reward', 'info');
        return false;
      }

      if (data.balance) {
        setBalance(data.balance);
      }
      if (data.investments && Array.isArray(data.investments)) {
        setInvestments(dedupeById(data.investments));
      } else if (investmentId) {
        setInvestments((prev) =>
          prev.map((i) =>
            i.id === investmentId
              ? {
                  ...i,
                  isMatured: false,
                  nextRewardTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                  totalEarned: (i.totalEarned || 0) + (i.dailyReward || 0),
                }
              : i
          )
        );
      }
      if (data.rewards && Array.isArray(data.rewards)) {
        setDailyRewards(data.rewards);
      } else {
        if (target) {
          setDailyRewards((prev) =>
            prev.map((r) =>
              r.id === target!.id
                ? {
                    ...r,
                    status: 'Claimed',
                    claimedAt: 'Just now',
                    transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
                  }
                : r
            )
          );
        } else {
          setDailyRewards((prev) =>
            prev.map((r) =>
              r.status === 'Available' || r.status === 'Unlocked'
                ? { ...r, status: 'Claimed', claimedAt: 'Just now' }
                : r
            )
          );
        }
      }

      setTodayRewardsSummary((prev) => prev.map((r) => ({ ...r, status: 'Claimed' })));

      const creditedAmount = data.claimedAmount || (target ? target.netAmount : fallbackRewardAmount);

      invalidateViewData('my-plans');
      invalidateViewData('dashboard');
      invalidateViewData('rewards');
      invalidateViewData('transactions');

      setTransactions((prev) => [
        {
          id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
          userId: user?.id || 'usr_admin_001',
          type: 'Daily Reward',
          amount: creditedAmount,
          fee: 0,
          status: 'Completed',
          date: 'Just now',
          reference: `CLAIM-${Date.now().toString().slice(-6)}`,
          details: `Today's Fleet Earning credited to Available Cash`,
        },
        ...prev,
      ]);

      setNotifications((prev) => [
        {
          id: `notif_${Date.now()}`,
          userId: user?.id || 'usr_admin_001',
          title: 'Claim Successful',
          message: `$${creditedAmount.toFixed(2)} credited directly to Available Cash.`,
          type: 'reward',
          isRead: false,
          date: 'Just now',
        },
        ...prev,
      ]);

      try {
        confetti({
          particleCount: 80,
          spread: 65,
          origin: { y: 0.6 },
          colors: ['#38BDF8', '#155EEF', '#10B981', '#8B5CF6'],
        });
      } catch {
        // safe fallback
      }

      showToast('Earnings Credited!', `$${creditedAmount.toFixed(2)} credited directly to Available Cash.`);
      return true;
    } catch (err: any) {
      showToast('Claim Notice', err.message || 'Error communicating with server', 'info');
      return false;
    }
  };

  // Submit Unlock Request
  const submitUnlockRequest = async (rewardId: string, reason: string): Promise<boolean> => {
    const reward = dailyRewards.find((r) => r.id === rewardId);
    if (!reward) return false;

    const newReqId = `UNL-${Math.floor(10000 + Math.random() * 90000)}`;
    const newReq: UnlockRequest = {
      id: newReqId,
      userId: user?.id || 'usr_789421',
      userName: user?.name || 'Ali Hassan',
      userEmail: user?.email || 'ali.hassan@example.com',
      rewardId: reward.id,
      planName: reward.planName,
      grossReward: reward.grossAmount,
      claimWindow: `${reward.claimWindowStart} - ${reward.claimWindowEnd}`,
      lockTime: reward.lockTime || '3:00 PM',
      reason,
      status: 'Under Support Review',
      submittedAt: 'Just now',
    };

    setUnlockRequests((prev) => [newReq, ...prev]);

    setDailyRewards((prev) =>
      prev.map((r) => (r.id === rewardId ? { ...r, status: 'Unlock Requested', unlockRequestId: newReqId } : r))
    );

    try {
      await fetch('/api/rewards/unlock-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId, reason, userId: user?.id || 'usr_admin_001' }),
      });
    } catch {
      // safe fallback
    }

    setSupportTickets((prev) => [
      {
        id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: user?.id || 'usr_789421',
        userName: user?.name || 'Ali Hassan',
        userEmail: user?.email || 'ali.hassan@example.com',
        subject: `Unlock Request for ${reward.planName} ($${reward.grossAmount})`,
        category: 'Unlock Request',
        status: 'Open',
        priority: 'Medium',
        attachedRewardId: reward.id,
        createdDate: 'Just now',
        lastUpdate: 'Just now',
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: 'user',
            senderName: user?.name || 'Ali Hassan',
            message: `Unlock request submitted: "${reason}"`,
            timestamp: 'Just now',
          },
        ],
      },
      ...prev,
    ]);

    showToast('Unlock Request Submitted', 'Under Support Review. Ticket generated.');
    return true;
  };

  // Invest in a plan — DB-backed, persists across refreshes
  const investInPlan = async (planId: string, amount: number): Promise<boolean> => {
    if (!user) {
      showToast('Error', 'You must be logged in to invest.', 'error');
      return false;
    }

    const plan = plans.find((p) => p.id === planId);
    if (!plan) {
      showToast('Error', 'Selected plan could not be found.', 'error');
      return false;
    }

    const isUnlimited = plan.id === 'plan_premium' || plan.maxInvest >= 99999999;
    if (amount < plan.minInvest || (!isUnlimited && amount > plan.maxInvest)) {
      showToast(
        'Invalid Amount',
        isUnlimited
          ? `Investment must be at least $${plan.minInvest.toLocaleString()}.`
          : `Investment must be between $${plan.minInvest.toLocaleString()} and $${plan.maxInvest.toLocaleString()}.`,
        'error'
      );
      return false;
    }

    if (amount > balance.availableBalance) {
      showToast('Insufficient Balance', 'Please deposit funds first.', 'error');
      return false;
    }

    try {
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, amount, userId: user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast('Investment Failed', data.error || 'Unable to process investment.', 'error');
        return false;
      }

      // Update balance from server response (authoritative)
      if (data.balance) setBalance(data.balance);

      // Map the returned DB row to ActiveInvestment shape
      const inv = data.investment;
      const newInv: ActiveInvestment = {
        id: inv.id,
        userId: inv.user_id,
        planId: inv.plan_id,
        planName: inv.plan_name,
        vehicleCategory: inv.vehicle_category,
        vehicleModel: inv.vehicle_model || plan.vehicleExamples?.[0] || '',
        investedAmount: parseFloat(inv.invested_amount),
        dailyReward: parseFloat(inv.daily_reward),
        startDate: inv.start_date ? new Date(inv.start_date).toISOString() : new Date().toISOString(),
        endDate: inv.end_date ? new Date(inv.end_date).toISOString().split('T')[0] : 'Unlimited',
        nextRewardTime: 'Tomorrow, 12:00 PM',
        totalEarned: parseFloat(inv.total_earned) || 0,
        progress: inv.progress || 1,
        status: inv.status || 'Active',
        agreementUrl: inv.agreement_url || '#',
        image: inv.image || plan.image,
      };

      setInvestments((prev) => [newInv, ...prev]);
      invalidateViewData('dashboard');
      invalidateViewData('my-plans');
      invalidateViewData('transactions');

      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      } catch {
        // safe
      }

      showToast('Plan Activated!', `$${amount.toLocaleString()} invested in ${plan.name}`);
      setSelectedPlanForInvest(null);
      navigate('my-plans');
      return true;
    } catch (err: any) {
      showToast('Investment Error', err.message || 'Unable to connect to server.', 'error');
      return false;
    }
  };

  // Request Plan Cancellation — sends to Admin for refund review
  const requestPlanCancellation = async (investmentId: string, reason: string): Promise<boolean> => {
    if (!user) {
      showToast('Error', 'You must be logged in.', 'error');
      return false;
    }
    try {
      const res = await fetch(`/api/investments/${investmentId}/cancel-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, reason }),
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = { error: `Server returned unexpected response (${res.status})` };
      }
      if (!res.ok) {
        showToast('Cancellation Failed', data.error || 'Unable to submit cancellation request.', 'error');
        return false;
      }

      setInvestments((prev) =>
        prev.map((inv) =>
          inv.id === investmentId ? { ...inv, status: 'Cancellation Requested' } : inv
        )
      );
      invalidateViewData('my-plans');
      invalidateViewData('dashboard');

      showToast('Cancellation Requested', 'Submitted for Admin approval. Refund will credit to Available Cash once approved.');
      return true;
    } catch (err: any) {
      showToast('Error', err.message || 'Unable to connect to server.', 'error');
      return false;
    }
  };

  // Submit Deposit — DB-backed, persists across refreshes
  const depositFunds = async (
    amount: number,
    method: any,
    reference?: string,
    proofUrl?: string,
    planId?: string,
    planName?: string
  ): Promise<boolean> => {
    if (!user) { showToast('Error', 'You must be logged in.', 'error'); return false; }
    if (amount <= 0) { showToast('Error', 'Enter a valid deposit amount', 'error'); return false; }

    try {
      const res = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount,
          paymentMethod: typeof method === 'string' ? method : method?.name || 'Manual',
          reference: reference || `REF-${Date.now().toString().slice(-6)}`,
          proofUrl: proofUrl || null,
          planId: planId || null,
          planName: planName || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast('Deposit Failed', data.error || 'Unable to submit deposit.', 'error');
        return false;
      }

      const dep = data.deposit;
      const newDep: Deposit = {
        id: dep.id,
        userId: dep.user_id,
        planId: dep.plan_id || planId,
        planName: dep.plan_name || planName,
        investmentId: dep.investment_id,
        amount: parseFloat(dep.amount),
        paymentMethod: dep.payment_method,
        reference: dep.reference,
        proofUrl: dep.proof_url || proofUrl,
        fee: 0,
        totalAmount: parseFloat(dep.amount),
        status: dep.status || 'Pending',
        createdAt: dep.created_at || 'Just now',
      };

      setDeposits((prev) => [newDep, ...prev]);

      // If a plan was selected, reload investments so the pending record appears
      if (planId) {
        loadViewData('investments', 1, true).catch(() => {});
        loadViewData('dashboard', 1, true).catch(() => {});
      }

      // NOTE: Balance & profit are NOT credited here — admin must approve deposit first.
      // When admin approves, the server activates investment & credits referral commission.
      showToast('Deposit Submitted!', `$${amount.toLocaleString()} deposit for ${newDep.planName || 'Fleet'} submitted. Pending admin approval.`);
      return true;
    } catch (err: any) {
      showToast('Deposit Error', err.message || 'Unable to connect to server.', 'error');
      return false;
    }
  };


  // Request Withdrawal — DB-backed, persists across refreshes
  const requestWithdrawal = async (amount: number, method: any, destination: string, fee?: number, pin?: string): Promise<boolean> => {
    if (!user) { showToast('Error', 'You must be logged in.', 'error'); return false; }
    if (amount <= 0) { showToast('Error', 'Enter a valid withdrawal amount', 'error'); return false; }
    if (amount > balance.availableBalance) { showToast('Error', 'Insufficient available balance', 'error'); return false; }

    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount,
          paymentMethod: typeof method === 'string' ? method : method?.name || 'USDT TRC20',
          destinationDetails: destination,
          fee: fee !== undefined ? fee : (method?.feeFixed ?? 1.0),
          pin: pin ? String(pin).trim() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast('Withdrawal Failed', data.error || 'Unable to process withdrawal.', 'error');
        return false;
      }

      const wth = data.withdrawal;
      const newWth: Withdrawal = {
        id: wth.id,
        userId: wth.user_id,
        amount: parseFloat(wth.amount),
        paymentMethod: wth.payment_method,
        destinationDetails: wth.destination_details,
        fee: parseFloat(wth.fee) || 0,
        netAmount: parseFloat(wth.net_amount),
        status: wth.status || 'Pending',
        createdAt: wth.created_at || 'Just now',
        twoFactorVerified: true,
        rejectionReason: wth.rejection_reason || undefined,
        adminComment: wth.admin_comment || undefined,
        txHash: wth.tx_hash || undefined,
      };

      setWithdrawals((prev) => [newWth, ...prev]);

      // Balance already deducted server-side — update from server response
      if (data.balance) setBalance(data.balance);

      showToast('Withdrawal Submitted', `Processing $${amount.toLocaleString()} transfer.`);
      return true;
    } catch (err: any) {
      showToast('Withdrawal Error', err.message || 'Unable to connect to server.', 'error');
      return false;
    }
  };


  // KYC Live Sync & Submission
  const fetchUserKyc = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/kyc/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setKyc(data);
      }
    } catch (e) {
      console.error('Failed to fetch user KYC:', e);
    }
  };

  const submitKycBasic = async (data: any): Promise<boolean> => {
    if (!user?.id) {
      showToast('Error', 'Please log in to submit KYC.', 'error');
      return false;
    }
    try {
      const res = await fetch('/api/kyc/basic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId: user.id }),
      });
      if (res.ok) {
        const updated = await res.json();
        setKyc(updated);
        setUser((prev) => (prev ? { ...prev, kycStatus: updated.status } : prev));
        showToast('Basic Details Saved!', 'Basic KYC details submitted successfully.');
        return true;
      } else {
        const err = await res.json();
        showToast('Submission Failed', err.error || 'Failed to submit basic KYC', 'error');
        return false;
      }
    } catch (e: any) {
      showToast('Error', e.message || 'Network error', 'error');
      return false;
    }
  };

  const submitKycAdvance = async (data: any): Promise<boolean> => {
    if (!user?.id) {
      showToast('Error', 'Please log in to submit documents.', 'error');
      return false;
    }
    try {
      const res = await fetch('/api/kyc/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId: user.id }),
      });
      if (res.ok) {
        const updated = await res.json();
        setKyc(updated);
        setUser((prev) => (prev ? { ...prev, kycStatus: 'Under Review' } : prev));
        showToast('Documents Uploaded!', 'Advanced KYC documents submitted and under review.');
        return true;
      } else {
        const err = await res.json();
        showToast('Upload Failed', err.error || 'Failed to upload documents', 'error');
        return false;
      }
    } catch (e: any) {
      showToast('Error', e.message || 'Network error', 'error');
      return false;
    }
  };

  const submitKycDocuments = async (payload: Partial<KYCData>): Promise<boolean> => {
    if (payload.documentFrontUrl) {
      return await submitKycAdvance(payload);
    }
    return await submitKycBasic(payload);
  };

  const fetchAdminKyc = async (): Promise<KYCData[]> => {
    try {
      const res = await fetch('/api/admin/kyc');
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (e) {
      console.error('Failed to fetch admin KYC list:', e);
      return [];
    }
  };

  // Support
  const createTicket = async (
    subject: string,
    category: any,
    message: string,
    attachedRewardId?: string
  ): Promise<boolean> => {
    const newTck: SupportTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: user?.id || 'usr_789421',
      userName: user?.name || 'Ali Hassan',
      userEmail: user?.email || 'ali.hassan@example.com',
      subject,
      category,
      status: 'Open',
      priority: 'Medium',
      attachedRewardId,
      createdDate: 'Just now',
      lastUpdate: 'Just now',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'user',
          senderName: user?.name || 'Ali Hassan',
          message,
          timestamp: 'Just now',
        },
      ],
    };

    setSupportTickets((prev) => [newTck, ...prev]);
    showToast('Ticket Created', `Support Ticket ${newTck.id} opened.`);
    return true;
  };

  const sendTicketReply = async (ticketId: string, message: string): Promise<boolean> => {
    if (!user) return false;
    const isAdmin = user.role === 'admin';
    const senderName = isAdmin ? 'RentoBit Support' : user.name || 'User';
    const endpoint = isAdmin
      ? `/api/admin/support/tickets/${ticketId}/reply`
      : `/api/support/tickets/${ticketId}/reply`;
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, userId: user.id, userName: senderName }),
      });
    } catch { /* safe fallback */ }
    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              lastUpdate: 'Just now',
              messages: [
                ...t.messages,
                {
                  id: `msg-${Date.now()}`,
                  sender: isAdmin ? ('support' as const) : ('user' as const),
                  senderName,
                  message,
                  timestamp: 'Just now',
                },
              ],
            }
          : t
      )
    );
    return true;
  };

  const adminInitiateTicket = async (
    targetUserId: string,
    subject: string,
    message: string,
    category: string = 'General'
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/support/tickets/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, subject, message, category }),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast('Error', err.error || 'Failed to send message', 'error');
        return false;
      }
      const ticket = await res.json();
      setSupportTickets((prev) => [ticket, ...prev]);
      showToast('Message Sent', `Support ticket #${ticket.id} created for user.`, 'success');
      return true;
    } catch (e) {
      showToast('Error', 'Network error', 'error');
      return false;
    }
  };

  const updateProfile = async (name: string, email: string, phone: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, name, email: user.email, phone }),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast('Error', err.error || 'Failed to update profile', 'error');
        return false;
      }
      const updated = await res.json();
      setUser(updated);
      showToast('Profile Updated', 'Your profile has been saved successfully.', 'success');
      return true;
    } catch {
      showToast('Error', 'Network error', 'error');
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch('/api/users/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, currentPassword, newPassword }),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast('Error', err.error || 'Failed to change password', 'error');
        return false;
      }
      showToast('Password Changed', 'Your password has been updated successfully.', 'success');
      return true;
    } catch {
      showToast('Error', 'Network error', 'error');
      return false;
    }
  };

  const updateWithdrawPin = async (newPin: string, currentPin?: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch('/api/users/withdraw-pin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, newPin, currentPin }),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast('Error', err.error || 'Failed to update PIN', 'error');
        return false;
      }
      showToast('PIN Updated', 'Your withdrawal PIN has been set successfully.', 'success');
      return true;
    } catch {
      showToast('Error', 'Network error', 'error');
      return false;
    }
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (user?.id) {
      try {
        await fetch(`/api/notifications/read-all?userId=${user.id}`, { method: 'PUT' });
      } catch (e) {
        console.error('Failed to mark all notifications read:', e);
      }
    }
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
    } catch (e) {
      console.error('Failed to mark notification read:', e);
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete notification:', e);
    }
  };

  const clearWeekNotifications = async () => {
    setNotifications((prev) => {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return prev.filter((n) => {
        if (!n.createdAt) return false;
        return new Date(n.createdAt).getTime() < sevenDaysAgo;
      });
    });
    if (user?.id) {
      try {
        await fetch(`/api/notifications/clear-week?userId=${user.id}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Failed to clear weekly notifications:', e);
      }
    }
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    if (user?.id) {
      try {
        await fetch(`/api/notifications/clear-all?userId=${user.id}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Failed to clear all notifications:', e);
      }
    }
  };

  const fetchAdminUnlocks = async (): Promise<void> => {
    try {
      const res = await fetch('/api/admin/unlock-requests');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped = data.map((u: any) => ({
            id: u.id,
            userId: u.userId || u.user_id,
            userName: u.userName || u.user_name || 'Member',
            userEmail: u.userEmail || u.user_email || '',
            rewardId: u.rewardId || u.reward_id,
            planName: u.planName || u.plan_name || 'Daily Plan',
            grossReward: Number(u.grossReward ?? u.gross_reward ?? 0),
            claimWindow: u.claimWindow || u.claim_window || '12:00 PM - 3:00 PM',
            lockTime: u.lockTime || u.lock_time || '',
            reason: u.reason || '',
            status: u.status || 'Under Support Review',
            submittedAt: u.submittedAt || u.submitted_at || 'Just now',
            reviewedAt: u.reviewedAt || u.reviewed_at,
            reviewedBy: u.reviewedBy || u.reviewed_by,
            adminNote: u.adminNote || u.admin_note,
          }));
          setUnlockRequests(mapped);
        }
      }
    } catch (e) {
      console.error('Error fetching admin unlocks:', e);
    }
  };

  const fetchUserReferrals = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/user/referrals?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setReferralData(data);
      }
    } catch (e) {
      console.error('Error fetching user referrals:', e);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchUserReferrals();
    }
  }, [user?.id, fetchUserReferrals]);

  // Admin Actions
  const adminReviewUnlock = async (
    requestId: string,
    action: 'approve' | 'reject',
    note?: string
  ): Promise<boolean> => {
    const req = unlockRequests.find((u) => u.id === requestId);
    if (!req) return false;

    setUnlockRequests((prev) =>
      prev.map((u) =>
        u.id === requestId
          ? {
              ...u,
              status: action === 'approve' ? 'Approved' : 'Rejected',
              adminNote: note || (action === 'approve' ? 'Approved by supervisor' : 'Rejected per policy'),
              reviewedAt: 'Just now',
              reviewedBy: 'Admin Supervisor',
            }
          : u
      )
    );

    if (action === 'approve') {
      setDailyRewards((prev) =>
        prev.map((r) => (r.id === req.rewardId ? { ...r, status: 'Unlocked' } : r))
      );
      showToast('Unlock Approved', `Reward is now unlocked and claimable by user.`);
    } else {
      showToast('Unlock Rejected', 'Request rejected per compliance guidelines.', 'info');
    }

    try {
      await fetch('/api/admin/unlocks/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action, note, adminEmail: user?.email || 'SuperAdmin' }),
      });
      await fetchAdminUnlocks();
    } catch {
      // safe fallback
    }

    return true;
  };

  const adminReviewKYC = async (action: 'approve' | 'reject', reason?: string, targetId?: string): Promise<boolean> => {
    const kycTargetId = targetId || kyc.id || user?.id || 'usr_admin_001';
    try {
      const res = await fetch(`/api/admin/kyc/${kycTargetId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      if (res.ok) {
        const updated = await res.json();
        if (updated.userId === user?.id) {
          setKyc(updated);
          setUser((prev) => (prev ? { ...prev, kycStatus: updated.status } : prev));
        }
        showToast(
          action === 'approve' ? 'KYC Approved! 🎉' : 'KYC Rejected',
          action === 'approve' ? 'User is now verified.' : `Reason: ${reason || 'Document unreadable'}`
        );
        return true;
      }
      const errData = await res.json().catch(() => ({}));
      showToast('Review Failed', errData.error || 'Failed to update KYC status', 'error');
      return false;
    } catch (e: any) {
      showToast('Review Error', e.message || 'Error updating KYC', 'error');
      return false;
    }
  };

  // Investment Plans Admin Management
  const addInvestmentPlan = async (planData: Omit<InvestmentPlan, 'id'>): Promise<boolean> => {
    const newId = `plan_${Date.now()}`;
    const newPlan: InvestmentPlan = {
      ...planData,
      id: newId,
    };
    setPlans((prev) => {
      const updated = [...prev, newPlan];
      localStorage.setItem('rentobit_plans', JSON.stringify(updated));
      return updated;
    });
    showToast('Investment Plan Created', `${newPlan.name} is now live and available for investment.`);
    return true;
  };

  const updateInvestmentPlan = async (id: string, planData: Partial<InvestmentPlan>): Promise<boolean> => {
    setPlans((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...planData } : p));
      localStorage.setItem('rentobit_plans', JSON.stringify(updated));
      return updated;
    });
    showToast('Plan Updated', 'Investment plan parameters successfully saved.');
    return true;
  };

  const deleteInvestmentPlan = async (id: string): Promise<boolean> => {
    setPlans((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem('rentobit_plans', JSON.stringify(updated));
      return updated;
    });
    showToast('Plan Removed', 'Investment plan has been removed.', 'info');
    return true;
  };

  // Deposit Wallets / Payment Methods Admin Management (PostgreSQL Connected)
  const fetchPaymentMethods = async (all = false) => {
    try {
      const url = all ? '/api/admin/payment-methods' : '/api/payment-methods';
      const r = await fetch(url);
      if (r.ok) {
        const d = await r.json();
        if (Array.isArray(d)) setPaymentMethods(d);
      }
    } catch (e) {
      console.error('Failed to fetch payment methods', e);
    }
  };

  const addPaymentMethod = async (methodData: Omit<DepositPaymentMethod, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(methodData),
      });
      if (res.ok) {
        const newMethod = await res.json();
        setPaymentMethods((prev) => [...prev, newMethod]);
        showToast('Payment Method Added', `${newMethod.name} is now available on deposit screen.`);
        return true;
      } else {
        const err = await res.json();
        showToast('Error', err.error || 'Failed to add payment method', 'error');
        return false;
      }
    } catch (e: any) {
      showToast('Error', e.message || 'Failed to add payment method', 'error');
      return false;
    }
  };

  const updatePaymentMethod = async (id: string, methodData: Partial<DepositPaymentMethod>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/payment-methods/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(methodData),
      });
      if (res.ok) {
        const updated = await res.json();
        setPaymentMethods((prev) => prev.map((m) => (m.id === id ? updated : m)));
        showToast('Wallet Updated', 'Deposit payment method updated successfully.');
        return true;
      } else {
        const err = await res.json();
        showToast('Error', err.error || 'Failed to update payment method', 'error');
        return false;
      }
    } catch (e: any) {
      showToast('Error', e.message || 'Failed to update payment method', 'error');
      return false;
    }
  };

  const deletePaymentMethod = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/payment-methods/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
        showToast('Method Removed', 'Deposit payment method has been removed.', 'info');
        return true;
      } else {
        const err = await res.json();
        showToast('Error', err.error || 'Failed to delete payment method', 'error');
        return false;
      }
    } catch (e: any) {
      showToast('Error', e.message || 'Failed to delete payment method', 'error');
      return false;
    }
  };

  const togglePaymentMethodStatus = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/payment-methods/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        const updated = await res.json();
        setPaymentMethods((prev) => prev.map((m) => (m.id === id ? updated : m)));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Withdrawal Crypto Gateways Admin Management
  const fetchWithdrawalMethods = async (all = false) => {
    try {
      const url = all ? '/api/admin/withdrawal-methods' : '/api/withdrawal-methods';
      const r = await fetch(url);
      if (r.ok) {
        const d = await r.json();
        if (Array.isArray(d)) setWithdrawalMethods(d);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addWithdrawalMethod = async (methodData: Omit<WithdrawalPaymentMethod, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/withdrawal-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(methodData),
      });
      if (res.ok) {
        const newM = await res.json();
        setWithdrawalMethods((prev) => [...prev, newM]);
        showToast('Gateway Added', `${newM.name} is now enabled for withdrawals.`);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateWithdrawalMethod = async (id: string, updates: Partial<WithdrawalPaymentMethod>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/withdrawal-methods/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updatedM = await res.json();
        setWithdrawalMethods((prev) => prev.map((m) => (m.id === id ? updatedM : m)));
        showToast('Gateway Updated', `${updatedM.name} parameters saved.`);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteWithdrawalMethod = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/withdrawal-methods/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWithdrawalMethods((prev) => prev.filter((m) => m.id !== id));
        showToast('Gateway Removed', 'Withdrawal crypto gateway has been deleted.', 'info');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const toggleWithdrawalMethodStatus = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/withdrawal-methods/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        const updatedM = await res.json();
        setWithdrawalMethods((prev) => prev.map((m) => (m.id === id ? updatedM : m)));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        balance,
        plans,
        paymentMethods,
        withdrawalMethods,
        investments,
        dailyRewards,
        unlockRequests,
        deposits,
        withdrawals,
        kyc,
        supportTickets,
        transactions,
        notifications,
        auditLogs,
        currentView,
        isBalanceHidden,
        timeRemainingSeconds,
        isMobileDeviceFrame,
        selectedPlanForInvest,
        notificationDrawerOpen,
        sidebarOpen,
        navigate,
        toggleBalanceHidden,
        toggleMobileDeviceFrame,
        setNotificationDrawerOpen,
        setSidebarOpen,
        setSelectedPlanForInvest,
        login,
        register,
        logout,
        claimReward,
        submitUnlockRequest,
        investInPlan,
        requestPlanCancellation,
        depositFunds,
        requestWithdrawal,
        submitKycDocuments,
        submitKycBasic,
        submitKycAdvance,
        fetchUserKyc,
        fetchAdminKyc,
        createTicket,
        sendTicketReply,
        adminInitiateTicket,
        updateProfile,
        changePassword,
        updateWithdrawPin,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        deleteNotification,
        clearWeekNotifications,
        clearAllNotifications,
        fetchNotifications,
        fetchAdminUnlocks,
        adminReviewUnlock,
        adminReviewKYC,
        switchUserRole,
        splashSlides,
        updateSplashSlide,
        theme,
        toggleTheme,
        setTheme,
        addInvestmentPlan,
        updateInvestmentPlan,
        deleteInvestmentPlan,
        fetchPaymentMethods,
        addPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,
        togglePaymentMethodStatus,
        fetchWithdrawalMethods,
        addWithdrawalMethod,
        updateWithdrawalMethod,
        deleteWithdrawalMethod,
        toggleWithdrawalMethodStatus,
        // Distribution Settings & Real Schedule
        distributionSettings,
        distributionStatus,
        distributionFormattedWindow,
        distributionProgress,
        updateDistributionSettings,
        refetchDistributionSettings,
        // Lazy loading
        loadViewData,
        invalidateViewData,
        loadingView,
        txnPage,
        txnTotalPages,
        depPage,
        depTotalPages,
        wthPage,
        wthTotalPages,
        rewardsPage,
        rewardsTotalPages,
        rewardsTotal,
        todayRewardsSummary,
        loadRewards,
        referralData,
        fetchUserReferrals,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
