import React, { useState, useMemo } from 'react';
import {
  FileText,
  ShieldCheck,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Lock,
  DollarSign,
  Car,
  HelpCircle,
  ExternalLink,
  Scale,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import { RentoBitLogo } from '../components/RentoBitLogo';

export const TermsOfServiceView: React.FC = () => {
  const { theme, navigate, user } = useApp();
  const { showToast } = useToast();
  const isLight = theme === 'light';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sec_1: true,
    sec_2: true,
    sec_3: true,
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    sections.forEach((s) => {
      allExpanded[s.id] = true;
    });
    setExpandedSections(allExpanded);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAcceptTerms = () => {
    showToast(
      'Terms Acknowledged',
      'You have reviewed and accepted the RentoBit Mobility Platform Terms of Service.',
      'success'
    );
  };

  const categories = [
    { id: 'all', label: 'All Terms' },
    { id: 'investment', label: 'Fleet & Investment' },
    { id: 'rewards', label: 'Rewards & Claims' },
    { id: 'finance', label: 'Deposits & Withdrawals' },
    { id: 'compliance', label: 'KYC & Legal' },
    { id: 'security', label: 'Security & Risk' },
  ];

  const sections = [
    {
      id: 'sec_1',
      category: 'compliance',
      title: '1. Agreement, Legal Capacity & Acceptance',
      icon: Scale,
      summary:
        'By accessing or registering an account with RentoBit, you enter into a legally binding contract with RentoBit Mobility Technologies Inc.',
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
          <p>
            These Terms of Service (<strong>"Terms"</strong>, <strong>"Agreement"</strong>) govern your access to and utilization of the RentoBit platform, decentralized fleet mobility investment pools, daily reward claim protocols, digital asset wallet interactions, and associated mobile/web interfaces (collectively, the <strong>"Platform"</strong>).
          </p>
          <p>
            By creating an account, connecting a digital wallet, depositing funds, or participating in vehicle fleet pools, you explicitly confirm that:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>You are at least eighteen (18) years of age or possess the legal capacity to enter into binding financial agreements in your jurisdiction.</li>
            <li>You are not a resident, citizen, or sanctioned entity under OFAC, United Nations, European Union, or UK HM Treasury sanctions lists.</li>
            <li>You will not utilize RentoBit for money laundering, terrorist financing, tax evasion, or automated platform exploitation.</li>
          </ul>
          <div
            className={`p-3.5 rounded-2xl ${
              isLight
                ? 'bg-blue-50 border border-blue-200 text-blue-900'
                : 'bg-blue-500/10 border border-blue-500/20 text-sky-200'
            } text-xs flex items-start gap-2.5`}
          >
            <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <strong>Periodic Revision Protocol:</strong> RentoBit reserves the right to amend or update these terms in accordance with evolving fleet operations and regulatory changes. Material updates will be broadcast through in-app notifications and official notification channels.
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'sec_2',
      category: 'investment',
      title: '2. Vehicle Fleet Fractionalization & Investment Pools',
      icon: Car,
      summary:
        'Overview of capital allocation across Economy, Standard, SUV, and Premium vehicle fleet tiers.',
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
          <p>
            RentoBit operates a commercial vehicle fleet monetization network. Users allocate digital and fiat capital into discrete vehicle categories (<strong>Economy, Standard, SUV, Premium</strong>).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
            <div
              className={`p-3 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#061424] border-white/10'
              }`}
            >
              <h5 className="font-bold text-xs text-blue-600 dark:text-sky-400">Capital Lock &amp; Allocation</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Invested principal remains locked for the duration of the chosen term (typically 30, 45, 60, or 90 days) to fund real fleet procurement, commercial leasing, and insurance coverage.
              </p>
            </div>
            <div
              className={`p-3 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#061424] border-white/10'
              }`}
            >
              <h5 className="font-bold text-xs text-emerald-600 dark:text-emerald-400">Asset Depreciation Reserves</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                A percentage of gross fleet revenue is routed into mechanical maintenance reserves, warranty escrow, and commercial fleet insurance pools.
              </p>
            </div>
          </div>
          <p>
            Upon plan maturity, your initial invested principal is returned to your Available Balance in full, subject to successful contract settlement and zero outstanding liability claims.
          </p>
        </div>
      ),
    },
    {
      id: 'sec_3',
      category: 'rewards',
      title: '3. Daily Rental Reward Accrual & The 24-Hour Claim Rule',
      icon: DollarSign,
      summary:
        'Crucial guidelines regarding daily reward calculation, active claim cycles, and reward lock triggers.',
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
          <p>
            Daily rewards represent proportional shares of gross commercial rental revenue generated by our active vehicle fleet. Daily reward rates range from <strong>0.30% to 0.75% daily</strong> depending on plan tier and fleet utilization index.
          </p>
          <div
            className={`p-4 rounded-2xl ${
              isLight
                ? 'bg-amber-50 border border-amber-200 text-amber-900'
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-200'
            } space-y-2`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>THE 24-HOUR ACTIVE CLAIM PROTOCOL</span>
            </div>
            <p className="text-xs leading-relaxed">
              Daily rewards are generated on a continuous 24-hour cycle. Users must log into the Platform and click <strong>"Claim Reward"</strong> within the designated 24-hour claim window. If a user fails to claim within the window:
            </p>
            <ul className="list-disc pl-5 text-xs space-y-1">
              <li>The reward status transitions from <strong>"Available"</strong> to <strong>"Locked"</strong>.</li>
              <li>Locked rewards are held in escrow to protect ongoing fleet liquidity calculations.</li>
              <li>To recover a locked reward, the user must submit a formal <strong>Unlock Request</strong>.</li>
            </ul>
          </div>
          <p>
            RentoBit applies a standard <strong>platform fee and withholding rate</strong> (displayed transparently during each claim) to cover fleet servicing, telemetry software licenses, and payment processing fees.
          </p>
        </div>
      ),
    },
    {
      id: 'sec_4',
      category: 'rewards',
      title: '4. Locked Claims, Unlock Review & Support Adjudication',
      icon: Lock,
      summary:
        'Procedures and policies governing appeals for locked or missed daily reward claims.',
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
          <p>
            Users who experience unforeseen connectivity outages, medical emergencies, or platform maintenance during their 24-hour claim window may initiate an appeal via the <strong>Locked Claims View</strong> or the <strong>Support Desk</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Submission:</strong> Each appeal requires an explanation of why the window was missed.</li>
            <li><strong>Review Period:</strong> Support and Administrative compliance officers review unlock requests within 24 to 48 business hours.</li>
            <li><strong>Resolution:</strong> Approved unlock requests automatically settle the net reward funds into the user's available balance with an official audit log entry.</li>
            <li><strong>Abuse Prevention:</strong> Frivolous, automated, or repetitive unlock claims with deliberate negligence may result in review denial or temporary claim restrictions.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'sec_5',
      category: 'finance',
      title: '5. Deposits, Withdrawals, Liquidity & Gateway Fees',
      icon: DollarSign,
      summary:
        'Rules regarding cryptocurrency funding (USDT/USDC), fiat bank transfers, limits, and payout velocity.',
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
          <p>
            RentoBit supports multi-rail capital deposits and withdrawals, including <strong>USDT (TRC20 / ERC20)</strong>, <strong>USDC</strong>, Direct Bank Transfers (ACH / SEPA), and International Wires.
          </p>
          <div className="space-y-2">
            <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">Key Financial Rules:</h5>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li><strong>Minimum Deposit:</strong> $50.00 USD equivalent.</li>
              <li><strong>Minimum Withdrawal:</strong> $20.00 USD equivalent.</li>
              <li><strong>Withdrawal Security:</strong> All withdrawals require active Two-Factor Authentication (2FA) and KYC approval.</li>
              <li><strong>Processing Time:</strong> Crypto payouts are automatically batched and verified within 15 to 60 minutes. Fiat wire payouts require 1 to 3 standard banking days.</li>
              <li><strong>Chargebacks &amp; Clawbacks:</strong> Any fraudulent chargeback, payment reversal, or double-spend attempt will result in immediate permanent account termination and forfeiture of balances.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'sec_6',
      category: 'compliance',
      title: '6. Identity Verification (KYC) & Anti-Money Laundering (AML)',
      icon: ShieldCheck,
      summary:
        'Mandatory compliance standards, document verification tiers, and global AML requirements.',
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
          <p>
            In accordance with Financial Action Task Force (FATF) guidelines, EU 5th/6th AML Directives, and international banking partner mandates, RentoBit enforces rigorous <strong>Know Your Customer (KYC)</strong> protocols.
          </p>
          <p>
            To unlock higher investment limits, tier progression, and withdrawal clearances, users must submit:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>A valid government-issued photographic ID (Passport, National Identity Card, or Driver’s License).</li>
            <li>Real-time biometric facial liveness capture to prevent synthetic identity fraud.</li>
            <li>Proof of address (utility statement or bank statement issued within the last 90 days) upon escalated review.</li>
          </ul>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            RentoBit strictly reserves the right to freeze accounts and notify international regulatory authorities if illicit transaction flows, darknet mixing services, or fraud patterns are detected.
          </p>
        </div>
      ),
    },
    {
      id: 'sec_7',
      category: 'security',
      title: '7. Risk Disclosures & Capital Preservation',
      icon: AlertTriangle,
      summary:
        'Comprehensive acknowledgment of fleet mobility risks, market dynamics, and operational factors.',
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
          <p>
            While RentoBit structures capital allocations with insurance reserves and vehicle asset collateral, participation in fleet mobility pools carries operational and market risks:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li><strong>Fleet Utilization Dynamics:</strong> Extreme weather events, regional mobility disruptions, or tourism downturns may impact daily yield rates.</li>
            <li><strong>Digital Asset Volatility:</strong> Cryptocurrency exchange rate variations (for non-stablecoin conversions) are the sole responsibility of the user.</li>
            <li><strong>No Bank Deposit Insurance:</strong> RentoBit accounts are mobility asset participations and are not insured by FDIC, FSCS, or state central banking authorities.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'sec_8',
      category: 'security',
      title: '8. Account Security & Two-Factor Authentication',
      icon: Lock,
      summary:
        'User duties regarding password protection, 2FA credentials, and defense against unauthorized access.',
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
          <p>
            You are exclusively responsible for safeguarding your login credentials, email inbox, 2FA authentication app keys, and personal hardware devices.
          </p>
          <p>
            RentoBit representatives will <strong>NEVER</strong> ask for your password, 2FA backup codes, or private cryptographic keys. Any loss stemming from phishing websites, SIM swapping, or device theft is strictly the user's responsibility.
          </p>
        </div>
      ),
    },
    {
      id: 'sec_9',
      category: 'compliance',
      title: '9. Prohibited Conduct & Account Termination',
      icon: AlertTriangle,
      summary:
        'Zero-tolerance violations, botting restrictions, referral manipulation, and termination triggers.',
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
          <p>The following activities are strictly prohibited on RentoBit:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>Creating multiple accounts to exploit welcome rewards or referral structures.</li>
            <li>Deploying automated scrapers, bots, or scripts to manipulate daily reward claim windows.</li>
            <li>Reverse-engineering, decompiling, or probing Platform endpoints for security vulnerabilities.</li>
            <li>Submitting forged, altered, or stolen identity documents.</li>
          </ul>
          <p>
            Violations will trigger instantaneous account suspension, confiscation of unearned yields, and potential referral to civil or criminal law enforcement.
          </p>
        </div>
      ),
    },
    {
      id: 'sec_10',
      category: 'compliance',
      title: '10. Governing Law, Arbitration & Legal Notices',
      icon: Scale,
      summary:
        'Dispute resolution process, binding individual arbitration, and formal legal contact address.',
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
          <p>
            These Terms are governed by and construed in accordance with the laws of Delaware, United States, without regard to conflict of law principles.
          </p>
          <p>
            Any dispute arising out of or relating to this Agreement shall be resolved through binding individual arbitration conducted by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. You expressly waive any right to participate in class actions or consolidated arbitrations.
          </p>
          <div
            className={`p-3.5 rounded-2xl ${
              isLight ? 'bg-slate-100 text-slate-800' : 'bg-[#081729] text-slate-200'
            } text-xs font-mono`}
          >
            <div>RentoBit Mobility Technologies Inc.</div>
            <div>Attn: Legal &amp; Regulatory Compliance Office</div>
            <div>Email: legal@rentobit.app</div>
            <div>Official Support Desk: In-App Help Center</div>
          </div>
        </div>
      ),
    },
  ];

  const filteredSections = useMemo(() => {
    return sections.filter((s) => {
      const matchCategory = activeCategory === 'all' || s.category === activeCategory;
      const matchQuery =
        searchQuery.trim() === '' ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [sections, activeCategory, searchQuery]);

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Top Banner & Navigation Header */}
      <div
        className={`rounded-3xl ${
          isLight
            ? 'bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 border border-blue-800 text-white shadow-xl'
            : 'bg-gradient-to-br from-[#07192C] via-[#0A223E] to-[#0E2E52] border border-blue-500/20 text-white shadow-xl'
        } p-6 sm:p-8 relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top bar with back button & print */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                navigate(user ? 'dashboard' : 'login');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-sky-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Print Terms"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
              v2.8 Active
            </span>
          </div>
        </div>

        {/* Title area */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 text-sky-300 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
              Legal &amp; Operating Agreement
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-['Outfit',sans-serif] tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Please read these terms carefully before investing in RentoBit mobility pools or claiming daily rental yields. These rules safeguard your capital, ensure fair fleet revenue distribution, and establish platform operating standards.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
            <span><strong>Effective Date:</strong> September 1, 2026</span>
            <span>•</span>
            <span><strong>Jurisdiction:</strong> Global &amp; US Delaware</span>
            <span>•</span>
            <span><strong>Revision:</strong> Q3 Sentinel Release</span>
          </div>
        </div>
      </div>

      {/* Quick Search & Filtering Toolbar */}
      <div
        className={`p-4 rounded-2xl ${
          isLight
            ? 'bg-white border border-slate-200 shadow-sm text-slate-900'
            : 'bg-[#091A2E] border border-white/10 shadow-lg text-white'
        } space-y-3.5`}
      >
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clauses (e.g., 24-hour claim, withdrawal fee, KYC, lock)..."
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm outline-none transition-colors ${
                isLight
                  ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500'
                  : 'bg-[#061424] border border-white/10 text-white placeholder:text-slate-500 focus:border-sky-400'
              }`}
            />
          </div>

          {/* Expand / Collapse All Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 text-xs">
            <button
              onClick={expandAll}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : isLight
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Terms Sections List */}
      <div className="space-y-3.5">
        {filteredSections.length === 0 ? (
          <div
            className={`p-8 rounded-3xl text-center border ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#091A2E] border-white/10'
            }`}
          >
            <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching sections found</h4>
            <p className="text-xs text-slate-500 mt-1">
              Try searching with different keywords like "claim", "deposit", "risk", or clear your filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="mt-3 px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredSections.map((sec) => {
            const isExpanded = !!expandedSections[sec.id];
            const Icon = sec.icon;
            return (
              <div
                key={sec.id}
                id={sec.id}
                className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                    : 'bg-[#091A2E] border-white/10 shadow-lg hover:border-white/20'
                }`}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleSection(sec.id)}
                  className={`w-full p-4 sm:p-5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                    isExpanded
                      ? isLight
                        ? 'bg-slate-50/80 border-b border-slate-200'
                        : 'bg-[#061424]/80 border-b border-white/10'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 pr-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isLight
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-blue-500/15 text-sky-400 border border-blue-500/30'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3
                        className={`text-sm sm:text-base font-bold ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {sec.title}
                      </h3>
                      {!isExpanded && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {sec.summary}
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Accordion Content Body */}
                {isExpanded && (
                  <div
                    className={`p-4 sm:p-6 ${
                      isLight ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    {sec.content}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Acknowledgment Action Box */}
      <div
        className={`p-5 sm:p-6 rounded-3xl ${
          isLight
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-slate-900 shadow-md'
            : 'bg-gradient-to-r from-[#07192C] to-[#0A223E] border border-blue-500/30 text-white shadow-xl'
        } flex flex-col sm:flex-row items-center justify-between gap-4`}
      >
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold">Have Questions on These Terms?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Our 24/7 Compliance &amp; Legal Desk is ready to clarify any clause or fleet mechanism.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => navigate('support')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                : 'bg-white/10 border-white/15 text-white hover:bg-white/20'
            }`}
          >
            Contact Support Desk
          </button>
          <button
            onClick={handleAcceptTerms}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#155EEF] to-[#0EA5E9] hover:from-[#1D4ED8] hover:to-[#0284C7] text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
          >
            I Acknowledge &amp; Accept
          </button>
        </div>
      </div>
    </div>
  );
};
