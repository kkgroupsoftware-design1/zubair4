import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Printer,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Database,
  Globe,
  Key,
  Smartphone,
  ExternalLink,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';

export const PrivacyPolicyView: React.FC = () => {
  const { theme, navigate, user } = useApp();
  const { showToast } = useToast();
  const isLight = theme === 'light';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    priv_1: true,
    priv_2: true,
    priv_3: true,
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allExp: Record<string, boolean> = {};
    sections.forEach((s) => {
      allExp[s.id] = true;
    });
    setExpandedSections(allExp);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportData = () => {
    const exportPayload = {
      platform: 'RentoBit Mobility Technologies Inc.',
      exportTimestamp: new Date().toISOString(),
      userProfile: {
        id: user?.id || 'usr_guest',
        name: user?.name || 'User Profile',
        email: user?.email || 'N/A',
        phone: user?.phone || 'N/A',
        kycStatus: user?.kycStatus || 'Not Started',
        twoFactorEnabled: user?.twoFactorEnabled || false,
        registeredSince: user?.createdAt || 'N/A',
      },
      telemetry: {
        dataProtectionStandard: 'GDPR / CCPA / ISO-27001 compliant export',
        encryptionStandard: 'AES-256 GCM at Rest',
      },
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rentobit_data_export_${user?.id || 'user'}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast(
      'Data Archive Exported',
      'Your machine-readable JSON privacy telemetry package has been downloaded.',
      'success'
    );
  };

  const handleRequestDeletion = () => {
    showToast(
      'Data Deletion Request Initiated',
      'A Data Protection ticket has been registered. Our DPO will contact you within 72 hours.',
      'info'
    );
    navigate('support');
  };

  const categories = [
    { id: 'all', label: 'All Policy' },
    { id: 'collection', label: 'Data Collection' },
    { id: 'security', label: 'Encryption & Storage' },
    { id: 'blockchain', label: 'Financial & Crypto' },
    { id: 'rights', label: 'GDPR & User Rights' },
    { id: 'sharing', label: 'Third-Party Sharing' },
  ];

  const sections = [
    {
      id: 'priv_1',
      category: 'collection',
      title: '1. Information We Collect & Sources',
      icon: Database,
      summary:
        'Detailed breakdown of personal, biometric KYC, financial transaction, and device telemetry data.',
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
          <p>
            RentoBit collects information necessary to execute fleet investment contracts, calculate daily yield claims, fulfill regulatory compliance, and prevent financial fraud.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
            <div
              className={`p-3.5 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#061424] border-white/10'
              } space-y-1`}
            >
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                Personal Identity &amp; KYC
              </span>
              <ul className="list-disc pl-4 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                <li>Legal First &amp; Last Name, Date of Birth.</li>
                <li>Email address, international telephone number.</li>
                <li>Government photo ID scans (Passport, Driver’s License).</li>
                <li>Facial biometric liveness verification vectors.</li>
              </ul>
            </div>
            <div
              className={`p-3.5 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#061424] border-white/10'
              } space-y-1`}
            >
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Financial &amp; Device Data
              </span>
              <ul className="list-disc pl-4 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                <li>Public wallet addresses (USDT TRC20, USDC).</li>
                <li>Deposit slips, wire reference numbers, transaction hashes.</li>
                <li>IP address, browser fingerprint, operating system.</li>
                <li>Login audit logs, timestamp signatures, 2FA status.</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'priv_2',
      category: 'collection',
      title: '2. How We Process & Utilize Your Data',
      icon: ShieldCheck,
      summary:
        'Operational, regulatory, and security purposes for processing user information.',
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
          <p>We process your personal information exclusively for lawful and legitimate purposes:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Fleet Pool Operations:</strong> Tracking your active investment plans, computing daily rental yields, and crediting wallet balances.</li>
            <li><strong>24-Hour Claim Protocol &amp; Auditing:</strong> Recording active claim timestamps, grace period calculations, and unlock request adjudications.</li>
            <li><strong>AML / Sanctions Screening:</strong> Complying with international anti-money laundering, OFAC sanctions, and counter-terrorist financing rules.</li>
            <li><strong>Fraud Prevention &amp; 2FA Defense:</strong> Detecting unauthorized account takeovers, SIM-swap attacks, and unusual withdrawal volume anomalies.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'priv_3',
      category: 'security',
      title: '3. Data Security, Cryptographic Enclaves & Storage',
      icon: Lock,
      summary:
        'Enterprise-grade AES-256 encryption at rest, TLS 1.3 in transit, and cold biometric isolation.',
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
          <p>
            We implement military-grade cybersecurity safeguards aligned with <strong>NIST SP 800-53</strong> and <strong>SOC 2 Type II</strong> standards:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-2">
            <div
              className={`p-3 rounded-xl border text-center ${
                isLight ? 'bg-blue-50/70 border-blue-200' : 'bg-blue-500/10 border-blue-500/20'
              }`}
            >
              <Key className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <strong className="block text-xs text-blue-700 dark:text-sky-300">AES-256 GCM</strong>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">All Database Data at Rest</span>
            </div>
            <div
              className={`p-3 rounded-xl border text-center ${
                isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/20'
              }`}
            >
              <Lock className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <strong className="block text-xs text-emerald-700 dark:text-emerald-300">TLS 1.3 Transport</strong>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Perfect Forward Secrecy</span>
            </div>
            <div
              className={`p-3 rounded-xl border text-center ${
                isLight ? 'bg-purple-50/70 border-purple-200' : 'bg-purple-500/10 border-purple-500/20'
              }`}
            >
              <Shield className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <strong className="block text-xs text-purple-700 dark:text-purple-300">Cold Enclaves</strong>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Isolated KYC Biometrics</span>
            </div>
          </div>
          <p>
            Employee access to sensitive user data is restricted via zero-trust Role-Based Access Control (RBAC) and audited in real time.
          </p>
        </div>
      ),
    },
    {
      id: 'priv_4',
      category: 'blockchain',
      title: '4. Public Blockchain & Cryptographic Transaction Data',
      icon: Globe,
      summary:
        'Clarifications on the permanent, public nature of on-chain blockchain records (TRC20, ERC20).',
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
          <p>
            When you deposit or withdraw funds via cryptocurrency networks (e.g. USDT on TRON or Ethereum), the transaction hash, sending address, recipient address, and amount are permanently recorded on public decentralized ledgers.
          </p>
          <div
            className={`p-3.5 rounded-2xl ${
              isLight ? 'bg-slate-100 text-slate-800' : 'bg-[#071322] text-slate-300'
            } text-xs flex items-start gap-2.5`}
          >
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong>Blockchain Immutability Notice:</strong> Due to the immutable nature of public blockchains, on-chain transaction records cannot be modified, deleted, or purged under GDPR "Right to be Forgotten" requests once confirmed on the blockchain network.
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'priv_5',
      category: 'sharing',
      title: '5. Third-Party Sharing & Data Processors',
      icon: ExternalLink,
      summary:
        'Strict limits on data sharing: we never sell personal information to advertising brokers.',
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
          <p>
            <strong>RentoBit does not, and will never, sell, rent, or trade your personal data to third-party marketing companies.</strong>
          </p>
          <p>We share data exclusively with trusted technical and regulatory partners under strict Data Processing Agreements (DPAs):</p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li><strong>Certified KYC Vendors:</strong> For automated document verification, OCR parsing, and facial biometric matching.</li>
            <li><strong>Cloud Infrastructure Providers:</strong> High-availability Amazon Web Services (AWS) and Google Cloud ISO/IEC 27001 certified data centers.</li>
            <li><strong>Banking &amp; Payment Rails:</strong> Commercial banking partners for ACH and international wire settlements.</li>
            <li><strong>Law Enforcement &amp; Legal Authorities:</strong> Only when compelled by valid court subpoenas or mandatory anti-terrorist investigations.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'priv_6',
      category: 'rights',
      title: '6. Your Global Privacy Rights (GDPR, CCPA/CPRA)',
      icon: ShieldCheck,
      summary:
        'Your statutory rights to access, rectify, port, restrict, or delete your personal data.',
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
          <p>Regardless of your geographic location, RentoBit provides universal privacy sovereignty:</p>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div><strong>Right to Access &amp; Portability:</strong> Request a full, machine-readable JSON extract of all personal data held about you.</div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div><strong>Right to Rectification:</strong> Update or correct outdated residential addresses, contact details, or telephone numbers.</div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request full deletion of your non-regulatory data upon complete liquidation and closure of active investment plans.</div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div><strong>Right to Restrict Processing:</strong> Opt out of non-essential telemetry and marketing communications.</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'priv_7',
      category: 'security',
      title: '7. Data Retention Schedule & Account Erasure',
      icon: Trash2,
      summary:
        'Standard retention periods and financial crime regulatory holding requirements.',
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
          <p>
            We retain personal data only for as long as necessary to maintain your active account, deliver daily fleet rewards, and satisfy statutory legal obligations.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Active Account Data:</strong> Retained continuously throughout your active participation on RentoBit.</li>
            <li><strong>Financial &amp; KYC Records:</strong> Retained for a mandatory statutory period of five (5) years following account closure in compliance with global anti-money laundering (AML) legislation.</li>
            <li><strong>Session &amp; Security Logs:</strong> Automatically rotated and purged after ninety (90) rolling days.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'priv_8',
      category: 'rights',
      title: '8. Data Protection Officer (DPO) Contact & Inquiries',
      icon: FileText,
      summary:
        'Direct channel to contact our Chief Data Protection Officer and compliance team.',
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
          <p>
            If you have any questions, concerns, or formal requests regarding this Privacy Policy or your personal data handling, our Data Protection Officer is directly reachable:
          </p>
          <div
            className={`p-3.5 rounded-2xl ${
              isLight ? 'bg-slate-100 text-slate-800' : 'bg-[#081729] text-slate-200'
            } text-xs font-mono space-y-1`}
          >
            <div>RentoBit Mobility Technologies Inc.</div>
            <div>Attn: Data Protection Officer (DPO)</div>
            <div>Email: dpo@rentobit.app / privacy@rentobit.app</div>
            <div>Response SLA: Within 48 business hours</div>
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
      {/* Top Banner & Header */}
      <div
        className={`rounded-3xl ${
          isLight
            ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-blue-950 border border-emerald-800 text-white shadow-xl'
            : 'bg-gradient-to-br from-[#061B29] via-[#092238] to-[#0D2D4A] border border-emerald-500/20 text-white shadow-xl'
        } p-6 sm:p-8 relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Print Privacy Policy"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
              GDPR &amp; CCPA Ready
            </span>
          </div>
        </div>

        {/* Title area */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Privacy &amp; Data Sovereignty
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-['Outfit',sans-serif] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Your personal privacy and financial confidentiality are core engineering principles at RentoBit. Learn how we cryptographically protect your data, handle KYC identity assets, and safeguard your rights.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
            <span><strong>Last Updated:</strong> September 1, 2026</span>
            <span>•</span>
            <span><strong>DPO Oversight:</strong> dpo@rentobit.app</span>
            <span>•</span>
            <span><strong>Standard:</strong> ISO/IEC 27001 &amp; SOC 2</span>
          </div>
        </div>
      </div>

      {/* Privacy Control Center / Quick Actions Banner */}
      <div
        className={`p-4 sm:p-5 rounded-3xl ${
          isLight
            ? 'bg-white border border-slate-200 shadow-md text-slate-900'
            : 'bg-[#091A2E] border border-white/10 shadow-xl text-white'
        } space-y-4`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-500" />
              <span>Personal Data Management &amp; Sovereignty</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Exercise your statutory rights directly from your RentoBit client dashboard
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportData}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export My Data (JSON)</span>
            </button>
            <button
              onClick={handleRequestDeletion}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                isLight
                  ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Request Deletion</span>
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 dark:border-white/10 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Zero Data Sales</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <Lock className="w-3.5 h-3.5 text-blue-500" />
            <span>AES-256 Encrypted</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <Globe className="w-3.5 h-3.5 text-sky-500" />
            <span>GDPR / CCPA Compliant</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <Shield className="w-3.5 h-3.5 text-purple-500" />
            <span>2FA Hardened</span>
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
              placeholder="Search privacy topics (e.g. KYC, blockchain, encryption, cookies, erasure)..."
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm outline-none transition-colors ${
                isLight
                  ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500'
                  : 'bg-[#061424] border border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-400'
              }`}
            />
          </div>

          {/* Controls */}
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
                    ? 'bg-emerald-600 text-white shadow-md'
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

      {/* Sections Accordion List */}
      <div className="space-y-3.5">
        {filteredSections.length === 0 ? (
          <div
            className={`p-8 rounded-3xl text-center border ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#091A2E] border-white/10'
            }`}
          >
            <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No privacy topics found</h4>
            <p className="text-xs text-slate-500 mt-1">
              Try searching with keywords like "KYC", "storage", "export", or "sharing".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="mt-3 px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
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
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
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

                {/* Accordion Body */}
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

      {/* Direct Contact DPO Box */}
      <div
        className={`p-5 sm:p-6 rounded-3xl ${
          isLight
            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-slate-900 shadow-md'
            : 'bg-gradient-to-r from-[#061C26] to-[#0A293E] border border-emerald-500/30 text-white shadow-xl'
        } flex flex-col sm:flex-row items-center justify-between gap-4`}
      >
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold">Need a Custom Privacy Evaluation?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Contact our independent Data Protection Officer (DPO) at dpo@rentobit.app
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => navigate('support')}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
          >
            Submit Privacy Ticket
          </button>
        </div>
      </div>
    </div>
  );
};
