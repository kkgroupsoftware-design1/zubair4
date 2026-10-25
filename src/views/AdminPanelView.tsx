import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Car,
  Users,
  Lock,
  Database,
  UploadCloud,
  HardDrive,
  ArrowDownCircle,
  ArrowUpCircle,
  FileCheck,
  FileText,
  Search,
  Check,
  ImageIcon,
  Type,
  Plus,
  Edit3,
  Trash2,
  Wallet,
  Smartphone,
  Coins,
  Building2,
  Sparkles,
  Layers,
  X,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Bell,
  Copy,
  Eye,
  ShieldCheck,
  MessageSquare,
  Send,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  PieChart,
  Download,
  Printer,
  Calendar,
  DollarSign,
  Award,
  Activity,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Scale,
  AlertTriangle,
  Zap,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { SplashSlide } from '../context/AppContext';
import { InvestmentPlan, DepositPaymentMethod, WithdrawalPaymentMethod, VehicleCategory, PaymentMethodCategory } from '../types';
import { PaymentBrandIcon } from '../components/ui/PaymentBrandIcon';
import { useToast } from '../components/ui/Toast';

export const AdminPanelView: React.FC = () => {
  const { showToast } = useToast();
  const {
    plans,
    addInvestmentPlan,
    updateInvestmentPlan,
    deleteInvestmentPlan,
    paymentMethods,
    fetchPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    togglePaymentMethodStatus,
    withdrawalMethods,
    fetchWithdrawalMethods,
    addWithdrawalMethod,
    updateWithdrawalMethod,
    deleteWithdrawalMethod,
    toggleWithdrawalMethodStatus,
    unlockRequests,
    fetchAdminUnlocks,
    adminReviewUnlock,
    kyc,
    adminReviewKYC,
    fetchAdminKyc,
    deposits,
    withdrawals,
    auditLogs,
    navigate,
    splashSlides,
    updateSplashSlide,
    theme,
    loadViewData,
    distributionSettings,
    distributionStatus,
    distributionFormattedWindow,
    timeRemainingSeconds,
    updateDistributionSettings,
    notifications,
    setNotificationDrawerOpen,
    fetchNotifications,
    adminInitiateTicket,
  } = useApp();

  // Lazy load: fetch admin-specific data on mount
  useEffect(() => {
    loadViewData('kkgroup');
    fetchDashboardData();
    fetchReportsData('all', '30days');
    fetchPaymentMethods(true);
    fetchWithdrawalMethods(true);
    fetchLiveAdminKyc();
    fetchAdminUnlocks();
    fetchAllUsers();
    fetchAdminDeposits();
    fetchAdminWithdrawals();
  }, []);

  const isLight = theme === 'light';
  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  const [activeTab, setActiveTab] = useState<
    'overview' | 'reports' | 'plans' | 'wallets' | 'distribution' | 'unlocks' | 'kyc' | 'deposits' | 'withdrawals' | 'audit' | 'splash'
    | 'users' | 'alldeposits' | 'allwithdrawals' | 'support' | 'cancellations' | 'backup'
  >('overview');

  // ── Executive Dashboard State ──────────────────────────────────
  const [dashboardData, setDashboardData] = React.useState<any | null>(null);
  const [dashboardLoading, setDashboardLoading] = React.useState(false);

  // ── Reports Tab State ──────────────────────────────────────────
  const [reportsData, setReportsData] = React.useState<any | null>(null);
  const [reportsLoading, setReportsLoading] = React.useState(false);
  const [reportCategory, setReportCategory] = React.useState<string>('all');
  const [reportRange, setReportRange] = React.useState<string>('30days');
  const [reportCustomStart, setReportCustomStart] = React.useState<string>('');
  const [reportCustomEnd, setReportCustomEnd] = React.useState<string>('');
  const [reportSearchQuery, setReportSearchQuery] = React.useState<string>('');
  const [reportPage, setReportPage] = React.useState<number>(1);
  const [reportPageSize, setReportPageSize] = React.useState<number>(10);

  // ── Users Management State ──────────────────────────────────
  const [allUsers, setAllUsers] = React.useState<any[]>([]);
  const [userSearch, setUserSearch] = React.useState('');
  const [usersLoading, setUsersLoading] = React.useState(false);
  const [usersPage, setUsersPage] = React.useState<number>(1);
  const [usersPageSize, setUsersPageSize] = React.useState<number>(10);
  const [selectedUser, setSelectedUser] = React.useState<any | null>(null);
  const [userModalLoading, setUserModalLoading] = React.useState(false);
  const [userDeposits, setUserDeposits] = React.useState<any[]>([]);
  const [userWithdrawals, setUserWithdrawals] = React.useState<any[]>([]);
  const [userInvestments, setUserInvestments] = React.useState<any[]>([]);
  const [userRewards, setUserRewards] = React.useState<any[]>([]);
  const [userModalTab, setUserModalTab] = React.useState<'overview' | 'deposits' | 'withdrawals' | 'investments' | 'claims'>('overview');
  const [newPassword, setNewPassword] = React.useState('');
  const [balAdjAmount, setBalAdjAmount] = React.useState('');
  const [balAdjType, setBalAdjType] = React.useState<'credit' | 'debit'>('credit');
  const [balAdjNote, setBalAdjNote] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState(false);
  const [togglingAdvanceKycId, setTogglingAdvanceKycId] = React.useState<string | null>(null);

  // ── All Deposits Admin State ──────────────────────────────────
  const [adminAllDeposits, setAdminAllDeposits] = React.useState<any[]>([]);
  const [adminDepositsLoading, setAdminDepositsLoading] = React.useState(false);
  const [adminDepFilter, setAdminDepFilter] = React.useState('all');
  const [depRejectReason, setDepRejectReason] = React.useState('');
  const [selectedDepositItem, setSelectedDepositItem] = React.useState<any | null>(null);
  const [approveConfirmDep, setApproveConfirmDep] = React.useState<any | null>(null);
  const [rejectDepItem, setRejectDepItem] = React.useState<any | null>(null);
  const [depSearchQuery, setDepSearchQuery] = React.useState('');
  // Screenshot lightbox & on-demand proof loader
  const [screenshotPreviewUrl, setScreenshotPreviewUrl] = React.useState<string | null>(null);
  const [loadingProofId, setLoadingProofId] = React.useState<string | null>(null);
  const [cachedProofs, setCachedProofs] = React.useState<Record<string, string>>({});

  const handleViewDepositProof = async (depositId: string, directUrl?: string | null) => {
    if (directUrl && (directUrl.startsWith('http') || directUrl.startsWith('data:'))) {
      setScreenshotPreviewUrl(directUrl);
      return;
    }
    if (cachedProofs[depositId]) {
      setScreenshotPreviewUrl(cachedProofs[depositId]);
      return;
    }
    setLoadingProofId(depositId);
    try {
      const res = await fetch(`/api/admin/deposits/${depositId}/proof`, {
        headers: { 'X-Admin-Key': 'Admin@rentobit2026' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.proofUrl) {
          setCachedProofs(prev => ({ ...prev, [depositId]: data.proofUrl }));
          setScreenshotPreviewUrl(data.proofUrl);
        } else {
          showToast('No Screenshot Attached', 'This deposit does not have a proof screenshot attached.', 'info');
        }
      } else {
        showToast('Receipt Unavailable', 'Could not retrieve proof screenshot.', 'error');
      }
    } catch (err: any) {
      showToast('Network Error', err.message || 'Failed to load receipt screenshot.', 'error');
    } finally {
      setLoadingProofId(null);
    }
  };

  // ── All Withdrawals Admin State ───────────────────────────────
  const [adminAllWithdrawals, setAdminAllWithdrawals] = React.useState<any[]>([]);
  const [adminWithdrawalsLoading, setAdminWithdrawalsLoading] = React.useState(false);
  const [adminWthFilter, setAdminWthFilter] = React.useState('all');
  const [wthRejectModalItem, setWthRejectModalItem] = React.useState<any | null>(null);
  const [wthRejectReason, setWthRejectReason] = React.useState('');
  const [wthApproveModalItem, setWthApproveModalItem] = React.useState<any | null>(null);
  const [wthApproveTxHash, setWthApproveTxHash] = React.useState('');
  const [wthApproveNote, setWthApproveNote] = React.useState('');

  // ── Gateways Sub-tab & Withdrawal Gateways Admin State ────────
  const [gatewaysSubTab, setGatewaysSubTab] = React.useState<'deposits' | 'withdrawals'>('deposits');
  const [wthGatewayModalMode, setWthGatewayModalMode] = React.useState<'create' | 'edit' | null>(null);
  const [editingWthGatewayId, setEditingWthGatewayId] = React.useState<string | null>(null);
  const [wthGatewayForm, setWthGatewayForm] = React.useState({
    name: '',
    currency: 'USDT',
    network: 'TRC20',
    iconType: 'usdt' as string,
    iconUrl: '',
    fee: 1.0,
    minWithdrawal: 20,
    maxWithdrawal: 50000,
    instructions: 'Enter your valid USDT TRC20 wallet address. Transfers will be processed directly to this destination.',
    isActive: true,
  });

  // ── Unlock Requests Admin State (Live PostgreSQL Connected) ───
  const [adminUnlocksFilter, setAdminUnlocksFilter] = React.useState<string>('all');
  const [adminUnlocksSearch, setAdminUnlocksSearch] = React.useState<string>('');
  const [adminUnlocksLoading, setAdminUnlocksLoading] = React.useState(false);
  const [unlockActionLoading, setUnlockActionLoading] = React.useState<string | null>(null);
  const [unlockModalItem, setUnlockModalItem] = React.useState<any | null>(null);
  const [unlockModalAction, setUnlockModalAction] = React.useState<'approve' | 'reject' | null>(null);
  const [unlockActionNote, setUnlockActionNote] = React.useState<string>('');

  const handleRefreshUnlocks = React.useCallback(async () => {
    setAdminUnlocksLoading(true);
    try {
      await fetchAdminUnlocks();
    } finally {
      setAdminUnlocksLoading(false);
    }
  }, [fetchAdminUnlocks]);

  // ── KYC Queue Admin State (Live PostgreSQL Connected) ─────────
  const [adminKycList, setAdminKycList] = React.useState<any[]>([]);
  const [adminKycLoading, setAdminKycLoading] = React.useState(false);
  const [adminKycFilter, setAdminKycFilter] = React.useState<string>('all');
  const [adminKycSearch, setAdminKycSearch] = React.useState<string>('');
  const [kycRejectModalItem, setKycRejectModalItem] = React.useState<any | null>(null);
  const [kycRejectReason, setKycRejectReason] = React.useState('');
  const [kycLightboxImg, setKycLightboxImg] = React.useState<string | null>(null);
  const [expandedKycId, setExpandedKycId] = React.useState<string | null>(null);
  const [kycSubTab, setKycSubTab] = React.useState<Record<string, 'basic' | 'advance'>>({});
  const [loadedKycDocs, setLoadedKycDocs] = React.useState<Record<string, { front?: string | null; back?: string | null; selfie?: string | null; loading?: boolean; error?: string | null }>>({});

  const loadMemberKycDocs = React.useCallback(async (targetId: string) => {
    if (!targetId) return;
    const existing = loadedKycDocs[targetId];
    if (existing && (existing.front || existing.selfie || existing.loading)) return;

    setLoadedKycDocs(prev => ({
      ...prev,
      [targetId]: { ...prev[targetId], loading: true, error: null }
    }));

    try {
      const res = await fetch(`/api/admin/kyc/${targetId}/documents`);
      if (!res.ok) throw new Error('Failed to load documents');
      const data = await res.json();
      setLoadedKycDocs(prev => ({
        ...prev,
        [targetId]: {
          front: data.documentFrontUrl || data.frontDocUrl || null,
          back: data.documentBackUrl || data.backDocUrl || null,
          selfie: data.selfieUrl || null,
          loading: false,
          error: null
        }
      }));
    } catch (err: any) {
      setLoadedKycDocs(prev => ({
        ...prev,
        [targetId]: { ...prev[targetId], loading: false, error: err.message || 'Error loading documents' }
      }));
    }
  }, [loadedKycDocs]);

  React.useEffect(() => {
    if (expandedKycId) {
      const activeSub = kycSubTab[expandedKycId] || 'basic';
      if (activeSub === 'advance') {
        const target = adminKycList.find(x => (x.id || x.userId) === expandedKycId);
        if (target && (target.hasFrontDoc || target.hasSelfie || target.documentFrontUrl)) {
          loadMemberKycDocs(target.userId || target.id);
        }
      }
    }
  }, [expandedKycId, kycSubTab, adminKycList, loadMemberKycDocs]);

  const fetchLiveAdminKyc = React.useCallback(async () => {
    setAdminKycLoading(true);
    try {
      const data = await fetchAdminKyc();
      setAdminKycList(data);
    } finally {
      setAdminKycLoading(false);
    }
  }, [fetchAdminKyc]);

  const handleApproveKycItem = async (k: any) => {
    if (!window.confirm(`Approve KYC verification for ${k.fullName || k.userName || 'this member'}?`)) return;
    const ok = await adminReviewKYC('approve', undefined, k.userId || k.id);
    if (ok) {
      fetchLiveAdminKyc();
      fetchAllUsers();
    }
  };

  const handleRejectKycItem = async () => {
    if (!kycRejectModalItem) return;
    const ok = await adminReviewKYC('reject', kycRejectReason || 'Identification document unreadable or mismatched', kycRejectModalItem.userId || kycRejectModalItem.id);
    if (ok) {
      setKycRejectModalItem(null);
      setKycRejectReason('');
      fetchLiveAdminKyc();
      fetchAllUsers();
    }
  };

  // Memoized KYC search and category filtering with fallback unsubmitted member matching
  const filteredKycList = React.useMemo(() => {
    const list = adminKycList.filter((k) => {
      if (adminKycFilter !== 'all' && k.status !== adminKycFilter) {
        return false;
      }
      if (adminKycSearch.trim()) {
        const q = adminKycSearch.trim().toLowerCase();
        const fullName = (k.fullName || '').toLowerCase();
        const userName = (k.userName || '').toLowerCase();
        const firstName = (k.firstName || '').toLowerCase();
        const lastName = (k.lastName || '').toLowerCase();
        const userEmail = (k.userEmail || '').toLowerCase();
        const userPhone = (k.userPhone || '').toLowerCase();
        const userId = (k.userId || k.id || '').toLowerCase();
        const docNumber = (k.docNumber || k.documentNumber || '').toLowerCase();
        const docType = (k.docType || k.documentType || '').toLowerCase();
        const country = (k.country || '').toLowerCase();
        const city = (k.city || '').toLowerCase();
        const address = (k.address || '').toLowerCase();

        const match =
          fullName.includes(q) ||
          userName.includes(q) ||
          firstName.includes(q) ||
          lastName.includes(q) ||
          userEmail.includes(q) ||
          userPhone.includes(q) ||
          userId.includes(q) ||
          docNumber.includes(q) ||
          docType.includes(q) ||
          country.includes(q) ||
          city.includes(q) ||
          address.includes(q);

        if (!match) return false;
      }
      return true;
    });

    if (adminKycSearch.trim() && (adminKycFilter === 'all' || adminKycFilter === 'Not Started')) {
      const q = adminKycSearch.trim().toLowerCase();
      const existingUserIds = new Set(adminKycList.map((k) => k.userId || k.id));
      const unsubmittedUsers = allUsers
        .filter((u) => {
          if (existingUserIds.has(u.id)) return false;
          const name = (u.name || `${u.firstName || ''} ${u.lastName || ''}`).toLowerCase();
          const email = (u.email || '').toLowerCase();
          const phone = (u.phone || '').toLowerCase();
          const uid = (u.id || '').toLowerCase();
          const ref = (u.referralCode || '').toLowerCase();
          return name.includes(q) || email.includes(q) || phone.includes(q) || uid.includes(q) || ref.includes(q);
        })
        .map((u) => ({
          id: `unsubmitted_${u.id}`,
          userId: u.id,
          fullName: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'User',
          userName: u.name,
          userEmail: u.email,
          userPhone: u.phone,
          userAvatar: u.avatar,
          status: u.kycStatus || 'Not Started',
          basicStatus: u.kycStatus === 'Approved' ? 'Approved' : 'Not Started',
          advanceStatus: 'Not Started',
          advanceKycAllowed: !!u.advanceKycAllowed,
          docType: 'Not Submitted',
          documentType: 'Not Submitted',
          docNumber: '—',
          documentNumber: '—',
          country: 'Unspecified',
          city: '—',
          unsubmitted: true,
          createdAt: u.createdAt,
        }));
      return [...list, ...unsubmittedUsers];
    }

    return list;
  }, [adminKycList, adminKycFilter, adminKycSearch, allUsers]);

  // ── Audit Logs State (Server Lazy Loaded & Paginated) ─────────
  const [auditList, setAuditList] = React.useState<any[]>([]);
  const [auditLoading, setAuditLoading] = React.useState<boolean>(false);
  const [auditPage, setAuditPage] = React.useState<number>(1);
  const [auditPageSize, setAuditPageSize] = React.useState<number>(10);
  const [auditTotalPages, setAuditTotalPages] = React.useState<number>(1);
  const [auditTotalCount, setAuditTotalCount] = React.useState<number>(0);
  const [auditSearch, setAuditSearch] = React.useState<string>('');
  const [auditLoadedOnce, setAuditLoadedOnce] = React.useState<boolean>(false);

  const fetchAuditLogs = React.useCallback(async (page = 1, limit = auditPageSize, search = auditSearch) => {
    setAuditLoading(true);
    try {
      const q = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search.trim()) q.set('search', search.trim());
      const res = await fetch(`/api/admin/audit?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.logs)) {
          setAuditList(data.logs);
          setAuditTotalCount(data.total || 0);
          setAuditTotalPages(data.totalPages || 1);
          setAuditPage(data.page || page);
        } else if (Array.isArray(data)) {
          setAuditList(data);
          setAuditTotalCount(data.length);
          setAuditTotalPages(Math.max(1, Math.ceil(data.length / limit)));
          setAuditPage(page);
        }
      }
    } catch (e) {
      console.error('Failed to fetch audit logs', e);
    } finally {
      setAuditLoading(false);
      setAuditLoadedOnce(true);
    }
  }, [auditPageSize, auditSearch]);

  React.useEffect(() => {
    if (activeTab === 'audit' && !auditLoadedOnce) {
      fetchAuditLogs(1, auditPageSize, auditSearch);
    }
  }, [activeTab, auditLoadedOnce, fetchAuditLogs, auditPageSize, auditSearch]);

  // ── Database Backup & Disaster Recovery State ─────────────────
  const [dbInfo, setDbInfo] = React.useState<any | null>(null);
  const [dbInfoLoading, setDbInfoLoading] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [isRestoring, setIsRestoring] = React.useState(false);
  const [restoreProgress, setRestoreProgress] = React.useState('');
  const [restoreFile, setRestoreFile] = React.useState<File | null>(null);
  const [restoreConfirm, setRestoreConfirm] = React.useState(false);

  const fetchDatabaseInfo = React.useCallback(async () => {
    setDbInfoLoading(true);
    try {
      const res = await fetch('/api/admin/database/info', {
        headers: { 'x-admin-key': 'Admin@rentobit2026' },
      });
      if (res.ok) {
        const data = await res.json();
        setDbInfo(data);
      }
    } catch (e) {
      console.error('Failed to fetch database info', e);
    } finally {
      setDbInfoLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (activeTab === 'backup') {
      fetchDatabaseInfo();
    }
  }, [activeTab, fetchDatabaseInfo]);

  const handleDownloadBackup = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/admin/database/backup', {
        headers: {
          'x-admin-key': 'Admin@rentobit2026',
        },
      });
      if (!res.ok) {
        throw new Error('Database backup export failed on server.');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.download = `rentobit_postgres_backup_${timestamp}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Backup Downloaded', 'PostgreSQL database snapshot saved successfully.', 'success');
      fetchDatabaseInfo();
    } catch (err: any) {
      showToast('Export Failed', err.message || 'Could not download database backup.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExecuteRestore = async () => {
    if (!restoreFile) {
      showToast('No File Selected', 'Please select an SQL backup file to restore.', 'error');
      return;
    }
    setIsRestoring(true);
    setRestoreProgress('Reading SQL backup payload...');
    try {
      const sqlContent = await restoreFile.text();
      if (!sqlContent || sqlContent.trim().length === 0) {
        throw new Error('The selected SQL file is empty.');
      }
      setRestoreProgress('Executing restoration on PostgreSQL engine...');
      const res = await fetch('/api/admin/database/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'Admin@rentobit2026',
        },
        body: JSON.stringify({
          sql: sqlContent,
          fileName: restoreFile.name,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Restore failed');
      }
      showToast('Database Restored', data.message || 'Database successfully restored.', 'success');
      setRestoreFile(null);
      setRestoreConfirm(false);
      fetchDatabaseInfo();
    } catch (err: any) {
      showToast('Restore Failed', err.message || 'Could not restore database.', 'error');
    } finally {
      setIsRestoring(false);
      setRestoreProgress('');
    }
  };

  // ── Support Tickets Admin State ───────────────────────────────
  const [adminTickets, setAdminTickets] = React.useState<any[]>([]);
  const [adminTicketsLoading, setAdminTicketsLoading] = React.useState(false);
  const [adminTicketFilter, setAdminTicketFilter] = React.useState('all');
  const [selectedTicket, setSelectedTicket] = React.useState<any | null>(null);
  const [ticketReply, setTicketReply] = React.useState('');
  const [reopeningTicketId, setReopeningTicketId] = React.useState<string | null>(null);
  const [completingTicketId, setCompletingTicketId] = React.useState<string | null>(null);

  // ── Contact User Modal State ──────────────────────────────────
  const [contactUserModal, setContactUserModal] = React.useState(false);
  const [contactUserId, setContactUserId] = React.useState('');
  const [contactSubject, setContactSubject] = React.useState('');
  const [contactMessage, setContactMessage] = React.useState('');
  const [contactCategory, setContactCategory] = React.useState('General');
  const [contactSending, setContactSending] = React.useState(false);

  const handleSendContactUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactUserId || !contactSubject || !contactMessage) return;
    setContactSending(true);
    const ok = await adminInitiateTicket(contactUserId, contactSubject, contactMessage, contactCategory);
    setContactSending(false);
    if (ok) {
      setContactUserModal(false);
      setContactUserId('');
      setContactSubject('');
      setContactMessage('');
      fetchAdminTickets(adminTicketFilter);
    }
  };

  // ── Plan Cancellations Admin State ────────────────────────────
  const [adminCancellations, setAdminCancellations] = React.useState<any[]>([]);
  const [adminCancellationsLoading, setAdminCancellationsLoading] = React.useState(false);
  const [adminCancelFilter, setAdminCancelFilter] = React.useState('all');
  const [cancelRejectModalReq, setCancelRejectModalReq] = React.useState<any | null>(null);
  const [cancelRejectReason, setCancelRejectReason] = React.useState('');

  const fetchAdminCancellations = React.useCallback(async (filter = 'all') => {
    setAdminCancellationsLoading(true);
    try {
      const r = await fetch(`/api/admin/cancellations?status=${filter}`);
      if (r.ok) {
        const data = await r.json();
        setAdminCancellations(data);
      }
    } finally {
      setAdminCancellationsLoading(false);
    }
  }, []);

  // ── Daily Claims & Distributions Admin State ──────────────────
  const [adminClaims, setAdminClaims] = React.useState<any[]>([]);
  const [adminClaimsLoading, setAdminClaimsLoading] = React.useState(false);
  const [adminClaimsFilter, setAdminClaimsFilter] = React.useState('all');
  const [adminClaimsSearch, setAdminClaimsSearch] = React.useState('');
  const [adminClaimsTotal, setAdminClaimsTotal] = React.useState(0);
  const [adminClaimsPage, setAdminClaimsPage] = React.useState(1);

  const fetchAdminClaims = React.useCallback(async (filter = 'all', search = '', page = 1) => {
    setAdminClaimsLoading(true);
    try {
      const q = new URLSearchParams({
        status: filter,
        search: search.trim(),
        page: String(page),
        limit: '50',
      });
      const r = await fetch(`/api/admin/claims?${q.toString()}`);
      if (r.ok) {
        const d = await r.json();
        setAdminClaims(d.data || []);
        setAdminClaimsTotal(d.total || 0);
        setAdminClaimsPage(d.page || 1);
      }
    } finally {
      setAdminClaimsLoading(false);
    }
  }, []);

  const handleApproveCancellation = async (reqId: string) => {
    if (!window.confirm("Approve this plan cancellation? The principal and today's earning will be refunded directly to the user's Available Cash.")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/cancellations/${reqId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: 'Approved by Admin' }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Plan cancellation approved! $${data.creditedAmount} refunded to Available Cash.`);
        fetchAdminCancellations(adminCancelFilter);
        fetchAllUsers(userSearch);
      } else {
        alert(data.error || 'Approval failed');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCancellation = async () => {
    if (!cancelRejectModalReq) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/cancellations/${cancelRejectModalReq.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelRejectReason }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Plan cancellation request rejected.');
        setCancelRejectModalReq(null);
        setCancelRejectReason('');
        fetchAdminCancellations(adminCancelFilter);
      } else {
        alert(data.error || 'Rejection failed');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const fetchAllUsers = React.useCallback(async (search = '') => {
    setUsersLoading(true);
    try {
      const r = await fetch(`/api/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      if (r.ok) setAllUsers(await r.json());
    } finally { setUsersLoading(false); }
  }, []);

  const openUserDetail = async (user: any) => {
    setSelectedUser(user);
    setUserModalTab('overview');
    setNewPassword('');
    setBalAdjAmount('');
    setBalAdjNote('');
    setUserModalLoading(true);
    try {
      const [dep, wth, inv, rew] = await Promise.all([
        fetch(`/api/admin/users/${user.id}/deposits`).then(r => r.ok ? r.json() : []),
        fetch(`/api/admin/users/${user.id}/withdrawals`).then(r => r.ok ? r.json() : []),
        fetch(`/api/admin/users/${user.id}/investments`).then(r => r.ok ? r.json() : []),
        fetch(`/api/admin/users/${user.id}/rewards`).then(r => r.ok ? r.json() : []),
      ]);
      setUserDeposits(dep);
      setUserWithdrawals(wth);
      setUserInvestments(inv);
      setUserRewards(rew);
      // refresh balance
      const detailRes = await fetch(`/api/admin/users/${user.id}`);
      if (detailRes.ok) { const d = await detailRes.json(); setSelectedUser(d); }
    } finally { setUserModalLoading(false); }
  };

  const handleChangePassword = async () => {
    if (!selectedUser || !newPassword || newPassword.length < 6) return;
    setActionLoading(true);
    try {
      const r = await fetch(`/api/admin/users/${selectedUser.id}/password`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      if (r.ok) { setNewPassword(''); alert('Password changed successfully.'); }
      else { const e = await r.json(); alert(e.error || 'Failed'); }
    } finally { setActionLoading(false); }
  };

  const handleToggleFreeze = async (status: string) => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const r = await fetch(`/api/admin/users/${selectedUser.id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (r.ok) {
        setSelectedUser((prev: any) => ({ ...prev, status }));
        setAllUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, status } : u));
      }
    } finally { setActionLoading(false); }
  };

  const handleToggleAdvanceKyc = async (userId: string, currentAllowed: boolean) => {
    if (!userId) return;
    setTogglingAdvanceKycId(userId);
    const newVal = !currentAllowed;
    try {
      // Optimistic update for allUsers
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, advanceKycAllowed: newVal } : u))
      );
      // Optimistic update for selectedUser
      if (selectedUser?.id === userId) {
        setSelectedUser((prev: any) => (prev ? { ...prev, advanceKycAllowed: newVal } : prev));
      }

      const headers = {
        'Content-Type': 'application/json',
        'X-Admin-Key': 'Admin@rentobit2026',
      };

      let res = await fetch(`/api/admin/users/${userId}/allow-advance`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ allow: newVal }),
      });

      if (!res.ok) {
        // Fallback with kyc route
        res = await fetch(`/api/admin/kyc/${userId}/allow-advance`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ allow: newVal }),
        });
      }

      showToast(
        newVal ? 'Advance KYC Authorized' : 'Advance KYC Revoked',
        `User ${userId} ${newVal ? 'can now submit Tier 2 ID & Selfie uploads.' : 'is restricted to Tier 1 Basic ID.'}`,
        newVal ? 'success' : 'info'
      );
      fetchLiveAdminKyc();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update Advance KYC permission', 'error');
    } finally {
      setTogglingAdvanceKycId(null);
    }
  };

  const handleBalanceAdjust = async () => {
    if (!selectedUser || !balAdjAmount) return;
    setActionLoading(true);
    try {
      const r = await fetch(`/api/admin/users/${selectedUser.id}/balance`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: balAdjAmount, type: balAdjType, note: balAdjNote }),
      });
      const d = await r.json();
      if (r.ok) {
        setSelectedUser((prev: any) => ({ ...prev, balance: d.balance }));
        setBalAdjAmount(''); setBalAdjNote('');
        alert(`Balance ${balAdjType === 'credit' ? 'credited' : 'debited'} successfully.`);
      } else { alert(d.error || 'Failed'); }
    } finally { setActionLoading(false); }
  };

  const handleDepAction = async (depId: string, action: 'approve' | 'reject', reason = '') => {
    setActionLoading(true);
    try {
      const r = await fetch(`/api/admin/deposits/${depId}/${action}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action === 'reject' ? { reason } : { note: 'Approved via Verification Cockpit' }),
      });
      const d = await r.json();
      if (r.ok) {
        setUserDeposits(prev => prev.map(dep => dep.id === depId ? {
          ...dep,
          status: action === 'approve' ? 'Approved' : 'Rejected',
          approvedAt: action === 'approve' ? new Date().toISOString() : dep.approvedAt,
          rejectionReason: action === 'reject' ? reason : dep.rejectionReason,
        } : dep));
        setAdminAllDeposits(prev => prev.map(dep => dep.id === depId ? {
          ...dep,
          status: action === 'approve' ? 'Approved' : 'Rejected',
          approvedAt: action === 'approve' ? new Date().toISOString() : dep.approvedAt,
          rejectionReason: action === 'reject' ? reason : dep.rejectionReason,
          commissionCredited: action === 'approve' ? true : dep.commissionCredited,
        } : dep));
        setSelectedDepositItem((prev: any) => {
          if (prev && prev.id === depId) {
            return {
              ...prev,
              status: action === 'approve' ? 'Approved' : 'Rejected',
              approvedAt: action === 'approve' ? new Date().toISOString() : prev.approvedAt,
              rejectionReason: action === 'reject' ? reason : prev.rejectionReason,
              commissionCredited: action === 'approve' ? true : prev.commissionCredited,
            };
          }
          return prev;
        });
        if (selectedUser) {
          const balRes = await fetch(`/api/admin/users/${selectedUser.id}`);
          if (balRes.ok) { const updated = await balRes.json(); setSelectedUser(updated); }
        }
        return true;
      } else {
        alert(d.error || 'Action failed');
        return false;
      }
    } finally { setActionLoading(false); }
  };

  const handleWthAction = async (
    wthId: string,
    action: 'approve' | 'reject',
    reasonOrPayload: string | { reason?: string; note?: string; txHash?: string } = ''
  ) => {
    setActionLoading(true);
    try {
      const payload = typeof reasonOrPayload === 'string'
        ? (action === 'reject' ? { reason: reasonOrPayload } : { note: reasonOrPayload, txHash: '' })
        : reasonOrPayload;

      const body = action === 'reject'
        ? { reason: payload.reason || 'Withdrawal rejected by administrator' }
        : { note: payload.note || 'Processed via Blockchain Network', txHash: payload.txHash || '' };

      const r = await fetch(`/api/admin/withdrawals/${wthId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (r.ok) {
        setUserWithdrawals(prev => prev.map(w => w.id === wthId ? {
          ...w,
          status: action === 'approve' ? 'Completed' : 'Rejected',
          rejectionReason: action === 'reject' ? (payload.reason || 'Withdrawal rejected by administrator') : w.rejectionReason,
          adminComment: action === 'reject' ? payload.reason : payload.note,
          txHash: action === 'approve' ? payload.txHash : w.txHash,
        } : w));
        setAdminAllWithdrawals(prev => prev.map(w => w.id === wthId ? {
          ...w,
          status: action === 'approve' ? 'Completed' : 'Rejected',
          rejectionReason: action === 'reject' ? (payload.reason || 'Withdrawal rejected by administrator') : w.rejectionReason,
          adminComment: action === 'reject' ? payload.reason : payload.note,
          txHash: action === 'approve' ? payload.txHash : w.txHash,
        } : w));
        if (selectedUser) {
          const balRes = await fetch(`/api/admin/users/${selectedUser.id}`);
          if (balRes.ok) {
            const updated = await balRes.json();
            setSelectedUser(updated);
          }
        }
        return true;
      } else {
        alert(d.error || 'Action failed');
        return false;
      }
    } finally {
      setActionLoading(false);
    }
  };

  // ── Executive Dashboard & Reports Data Fetchers ─────────────
  const fetchDashboardData = React.useCallback(async () => {
    setDashboardLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  const fetchReportsData = React.useCallback(async (category = reportCategory, range = reportRange, customStart = reportCustomStart, customEnd = reportCustomEnd) => {
    setReportsLoading(true);
    try {
      let url = `/api/admin/reports?category=${encodeURIComponent(category)}&range=${encodeURIComponent(range)}`;
      if (range === 'custom' && customStart && customEnd) {
        url += `&startDate=${encodeURIComponent(customStart)}&endDate=${encodeURIComponent(customEnd)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReportsData(data);
      }
    } catch (err) {
      console.error('Failed to fetch reports data:', err);
    } finally {
      setReportsLoading(false);
    }
  }, [reportCategory, reportRange, reportCustomStart, reportCustomEnd]);

  const handleExportReportCSV = () => {
    if (!reportsData || !reportsData.records || reportsData.records.length === 0) {
      showToast('No records available in current report filter', 'error');
      return;
    }
    const headers = ['Date', 'Category', 'User Name', 'Email', 'Type / Method', 'Amount ($)', 'Fee ($)', 'Net ($)', 'Reference', 'Status', 'Details'];
    const rows = reportsData.records.map((r: any) => [
      `"${new Date(r.date).toLocaleString().replace(/"/g, '""')}"`,
      `"${(r.category || '').replace(/"/g, '""')}"`,
      `"${(r.user || '').replace(/"/g, '""')}"`,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      `"${(r.type || '').replace(/"/g, '""')}"`,
      Number(r.amount || 0).toFixed(2),
      Number(r.fee || 0).toFixed(2),
      Number(r.net || 0).toFixed(2),
      `"${(r.reference || '').replace(/"/g, '""')}"`,
      `"${(r.status || '').replace(/"/g, '""')}"`,
      `"${(r.details || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((row: string[]) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rentobit_admin_report_${reportCategory}_${reportRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report CSV exported successfully!', 'success');
  };

  const fetchAdminDeposits = React.useCallback(async (filter = 'all') => {
    setAdminDepositsLoading(true);
    try {
      const r = await fetch(`/api/admin/deposits?status=${filter}&limit=50`);
      if (r.ok) { const d = await r.json(); setAdminAllDeposits(d.data || []); }
    } finally { setAdminDepositsLoading(false); }
  }, []);

  const fetchAdminWithdrawals = React.useCallback(async (filter = 'all') => {
    setAdminWithdrawalsLoading(true);
    try {
      const r = await fetch(`/api/admin/withdrawals?status=${filter}&limit=50`);
      if (r.ok) { const d = await r.json(); setAdminAllWithdrawals(d.data || []); }
    } finally { setAdminWithdrawalsLoading(false); }
  }, []);

  const fetchAdminTickets = React.useCallback(async (filter = 'all') => {
    setAdminTicketsLoading(true);
    try {
      const r = await fetch(`/api/admin/support/tickets?status=${filter}`);
      if (r.ok) setAdminTickets(await r.json());
    } finally { setAdminTicketsLoading(false); }
  }, []);

  const handleTicketReply = async () => {
    if (!selectedTicket || !ticketReply.trim()) return;
    setActionLoading(true);
    try {
      const r = await fetch(`/api/admin/support/tickets/${selectedTicket.id}/reply`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: ticketReply }),
      });
      if (r.ok) {
        const newMsg = { id: `msg_${Date.now()}`, sender: 'admin', senderName: 'RentoBit Support', message: ticketReply, timestamp: new Date().toISOString() };
        setSelectedTicket((prev: any) => ({ ...prev, messages: [...(prev?.messages || []), newMsg], status: 'In Progress' }));
        setAdminTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: 'In Progress' } : t));
        setTicketReply('');
      }
    } finally { setActionLoading(false); }
  };

  const handleCompleteTicket = async (ticketId: string) => {
    if (!ticketId) return;
    setCompletingTicketId(ticketId);
    try {
      // Optimistic update
      setAdminTickets(prev => prev.map(t => (t.id === ticketId || t.id.toLowerCase() === ticketId.toLowerCase()) ? { ...t, status: 'Completed' } : t));
      if (selectedTicket?.id === ticketId || selectedTicket?.id?.toLowerCase() === ticketId.toLowerCase()) {
        setSelectedTicket((prev: any) => prev ? { ...prev, status: 'Completed' } : null);
      }

      const headers = {
        'Content-Type': 'application/json',
        'X-Admin-Key': 'Admin@rentobit2026',
      };

      let r = await fetch(`/api/admin/support/tickets/${encodeURIComponent(ticketId)}/complete`, {
        method: 'POST',
        headers,
      });

      if (!r.ok) {
        r = await fetch(`/api/admin/support/tickets/${encodeURIComponent(ticketId)}/complete`, {
          method: 'PATCH',
          headers,
        });
      }

      if (!r.ok) {
        // Fallback to /status endpoint
        r = await fetch(`/api/admin/support/tickets/${encodeURIComponent(ticketId)}/status`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ status: 'Completed' }),
        });
      }

      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        showToast('Failed to Complete', err.error || 'Could not complete ticket', 'error');
        return;
      }

      await fetchAdminTickets(adminTicketFilter);
      showToast('Ticket Completed', `Ticket #${ticketId} marked as Completed.`, 'success');
    } catch (e: any) {
      console.error('[CompleteTicket Exception]', e);
      showToast('Error', e.message || 'Error completing ticket', 'error');
    } finally {
      setCompletingTicketId(null);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    if (!ticketId) return;
    try {
      // Optimistic update
      setAdminTickets(prev => prev.map(t => (t.id === ticketId || t.id.toLowerCase() === ticketId.toLowerCase()) ? { ...t, status: 'Closed' } : t));
      if (selectedTicket?.id === ticketId || selectedTicket?.id?.toLowerCase() === ticketId.toLowerCase()) {
        setSelectedTicket((prev: any) => prev ? { ...prev, status: 'Closed' } : null);
      }

      const headers = {
        'Content-Type': 'application/json',
        'X-Admin-Key': 'Admin@rentobit2026',
      };

      let r = await fetch(`/api/admin/support/tickets/${encodeURIComponent(ticketId)}/close`, {
        method: 'POST',
        headers,
      });

      if (!r.ok) {
        r = await fetch(`/api/admin/support/tickets/${encodeURIComponent(ticketId)}/close`, {
          method: 'PATCH',
          headers,
        });
      }

      if (!r.ok) {
        r = await fetch(`/api/admin/support/tickets/${encodeURIComponent(ticketId)}/status`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ status: 'Closed' }),
        });
      }

      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        showToast('Failed to Close', err.error || 'Could not close ticket', 'error');
        return;
      }

      await fetchAdminTickets(adminTicketFilter);
      showToast('Ticket Closed', `Ticket #${ticketId} has been closed.`, 'info');
    } catch (e: any) {
      console.error('[CloseTicket Exception]', e);
      showToast('Error', e.message || 'Error closing ticket', 'error');
    }
  };

  const handleReopenTicket = async (ticketId: string) => {
    if (!ticketId) return;
    setReopeningTicketId(ticketId);
    try {
      // Immediate optimistic update so UI reacts instantly
      setAdminTickets(prev => prev.map(t => (t.id === ticketId || t.id.toLowerCase() === ticketId.toLowerCase()) ? { ...t, status: 'Open' } : t));
      setSelectedTicket((prev: any) => (prev && (prev.id === ticketId || prev.id.toLowerCase() === ticketId.toLowerCase())) ? { ...prev, status: 'Open' } : prev);

      const headers = {
        'Content-Type': 'application/json',
        'X-Admin-Key': 'Admin@rentobit2026',
      };

      let r = await fetch(`/api/admin/support/tickets/${encodeURIComponent(ticketId)}/reopen`, {
        method: 'POST',
        headers,
      });

      if (!r.ok) {
        r = await fetch(`/api/admin/support/tickets/${encodeURIComponent(ticketId)}/reopen`, {
          method: 'PATCH',
          headers,
        });
      }

      if (!r.ok) {
        r = await fetch(`/api/admin/support/tickets/${encodeURIComponent(ticketId)}/status`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ status: 'Open' }),
        });
      }

      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        // Revert optimistic update
        setAdminTickets(prev => prev.map(t => (t.id === ticketId || t.id.toLowerCase() === ticketId.toLowerCase()) ? { ...t, status: 'Closed' } : t));
        setSelectedTicket((prev: any) => (prev && (prev.id === ticketId || prev.id.toLowerCase() === ticketId.toLowerCase())) ? { ...prev, status: 'Closed' } : prev);
        showToast('Failed to Reopen', err.error || 'Server error reopening ticket', 'error');
        return;
      }

      // Switch filter to 'all' so reopened ticket stays visible
      setAdminTicketFilter('all');
      await fetchAdminTickets('all');
      showToast('Ticket Reopened', `Ticket #${ticketId} is now Open. You can reply now.`, 'success');
    } catch (e: any) {
      console.error('[ReopenTicket Exception]', e);
      showToast('Error', e.message || 'Network error reopening ticket', 'error');
    } finally {
      setReopeningTicketId(null);
    }
  };

  // Load data on tab switch
  React.useEffect(() => {
    if (activeTab === 'users') fetchAllUsers(userSearch);
    if (activeTab === 'alldeposits') fetchAdminDeposits(adminDepFilter);
    if (activeTab === 'allwithdrawals') fetchAdminWithdrawals(adminWthFilter);
    if (activeTab === 'support') fetchAdminTickets(adminTicketFilter);
    if (activeTab === 'cancellations') fetchAdminCancellations(adminCancelFilter);
    if (activeTab === 'distribution') fetchAdminClaims(adminClaimsFilter, adminClaimsSearch, 1);
    if (activeTab === 'unlocks') handleRefreshUnlocks();
  }, [activeTab]);

  const formatClaimDateTime = (isoStr: string | null | undefined) => {
    if (!isoStr) return null;
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return String(isoStr);
      return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return String(isoStr);
    }
  };

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      'Pending': 'bg-amber-100 text-amber-700 border border-amber-300',
      'Approved': 'bg-emerald-100 text-emerald-700 border border-emerald-300',
      'Completed': 'bg-emerald-100 text-emerald-700 border border-emerald-300',
      'Rejected': 'bg-red-100 text-red-700 border border-red-300',
      'Active': 'bg-blue-100 text-blue-700 border border-blue-300',
      'Suspended': 'bg-red-100 text-red-700 border border-red-300',
      'Frozen': 'bg-slate-200 text-slate-600 border border-slate-400',
      'Open': 'bg-sky-100 text-sky-700 border border-sky-300',
      'In Progress': 'bg-purple-100 text-purple-700 border border-purple-300',
      'Closed': 'bg-slate-100 text-slate-500 border border-slate-300',
      'Under Review': 'bg-amber-100 text-amber-700 border border-amber-300',
      'Approved (KYC)': 'bg-emerald-100 text-emerald-700 border border-emerald-300',
      'Claimed': 'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-500/30',
      'Credited': 'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-500/30',
      'Available': 'bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-500/30',
      'Locked': 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-950/40 dark:text-red-400 dark:border-red-500/30',
      'Unlocked': 'bg-teal-100 text-teal-700 border border-teal-300 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-500/30',
      'Unlock Requested': 'bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-500/30',
    };
    return `inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${colors[s] || 'bg-slate-100 text-slate-500'}`;
  };

  // Distribution Form State
  const [distForm, setDistForm] = useState({
    startTime: distributionSettings?.startTime || '12:00',
    endTime: distributionSettings?.endTime || '15:00',
    timezone: distributionSettings?.timezone || 'UTC',
    distributionEnabled: distributionSettings?.distributionEnabled ?? true,
    allowImmediateClaim: !!distributionSettings?.allowImmediateClaim,
    autoClaimEnabled: distributionSettings?.autoClaimEnabled ?? true,
    label: distributionSettings?.label || 'Daily Distribution Window',
  });
  const [isSavingDist, setIsSavingDist] = useState(false);
  const [isRunningAutoClaim, setIsRunningAutoClaim] = useState(false);
  const [autoClaimSweepMessage, setAutoClaimSweepMessage] = useState<string | null>(null);

  useEffect(() => {
    if (distributionSettings) {
      setDistForm({
        startTime: distributionSettings.startTime || '12:00',
        endTime: distributionSettings.endTime || '15:00',
        timezone: distributionSettings.timezone || 'UTC',
        distributionEnabled: distributionSettings.distributionEnabled ?? true,
        allowImmediateClaim: !!distributionSettings.allowImmediateClaim,
        autoClaimEnabled: distributionSettings.autoClaimEnabled ?? true,
        label: distributionSettings.label || 'Daily Distribution Window',
      });
    }
  }, [distributionSettings]);

  const handleSaveDistribution = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingDist(true);
    await updateDistributionSettings(distForm);
    setIsSavingDist(false);
  };

  const handleToggleImmediateClaim = async () => {
    const nextVal = !distForm.allowImmediateClaim;
    setDistForm((prev) => ({ ...prev, allowImmediateClaim: nextVal }));
    await updateDistributionSettings({ ...distForm, allowImmediateClaim: nextVal });
  };

  const handleTriggerAutoClaimSweep = async () => {
    setIsRunningAutoClaim(true);
    setAutoClaimSweepMessage(null);
    try {
      const res = await fetch('/api/admin/distribution/run-auto-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: 'admin@rentobit.com' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAutoClaimSweepMessage(
          `Success: Processed ${data.claimsCount} claims. $${Number(data.totalAmount || 0).toFixed(2)} credited directly to client wallets!`
        );
      } else {
        setAutoClaimSweepMessage(`Notice: ${data.details?.[0] || 'Auto-claim executed with notices.'}`);
      }
    } catch (err: any) {
      setAutoClaimSweepMessage(`Error: ${err.message || 'Failed to trigger auto-claim sweep'}`);
    } finally {
      setIsRunningAutoClaim(false);
    }
  };

  const [adminNote, setAdminNote] = useState('Reviewed and approved per policy');
  const [rejectionReason, setRejectionReason] = useState('Missing verifiable proof of document or timing discrepancy');

  // Plan Modal State
  const [planModalMode, setPlanModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    category: 'STANDARD' as VehicleCategory,
    minInvest: 100,
    maxInvest: 2000,
    dailyRewardRate: 1.8,
    durationDays: 60,
    vehicleExamples: 'Toyota Camry, Honda Accord',
    image: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800&auto=format&fit=crop&q=80',
    description: 'Fleet vehicle with continuous automated rental yields.',
    popular: false,
    accentColor: '#155EEF',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  });

  // Wallet / Payment Method Modal State
  const [walletModalMode, setWalletModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [walletForm, setWalletForm] = useState({
    name: '',
    category: 'mobile_wallet' as PaymentMethodCategory,
    iconType: 'jazzcash' as 'jazzcash' | 'easypaisa' | 'usdt' | 'btc' | 'eth' | 'bank',
    iconUrl: '',
    accountTitle: '',
    accountNumber: '',
    tillId: '',
    networkOrBank: '',
    instructions: '',
    minDeposit: 10,
    maxDeposit: 500000,
    feePercent: 0,
    isActive: true,
  });

  const handleOpenCreatePlan = () => {
    setEditingPlanId(null);
    setPlanForm({
      name: '',
      category: 'STANDARD',
      minInvest: 100,
      maxInvest: 2500,
      dailyRewardRate: 2.0,
      durationDays: 45,
      vehicleExamples: 'Toyota Crown, Honda Civic Turbo',
      image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop&q=80',
      description: 'Verified mobility fleet allocation with guaranteed daily returns.',
      popular: false,
      accentColor: '#155EEF',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    });
    setPlanModalMode('create');
  };

  const handleOpenEditPlan = (p: InvestmentPlan) => {
    setEditingPlanId(p.id);
    setPlanForm({
      name: p.name,
      category: p.category,
      minInvest: p.minInvest,
      maxInvest: p.maxInvest,
      dailyRewardRate: p.dailyRewardRate,
      durationDays: p.durationDays,
      vehicleExamples: Array.isArray(p.vehicleExamples) ? p.vehicleExamples.join(', ') : '',
      image: p.image || '',
      description: p.description || '',
      popular: !!p.popular || !!p.isPopular,
      accentColor: p.accentColor || '#155EEF',
      badgeColor: p.badgeColor || 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    });
    setPlanModalMode('edit');
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: planForm.name,
      category: planForm.category,
      minInvest: Number(planForm.minInvest),
      maxInvest: Number(planForm.maxInvest),
      dailyRewardRate: Number(planForm.dailyRewardRate),
      durationDays: Number(planForm.durationDays),
      vehicleExamples: planForm.vehicleExamples.split(',').map((s) => s.trim()).filter(Boolean),
      image: planForm.image,
      description: planForm.description,
      popular: planForm.popular,
      isPopular: planForm.popular,
      accentColor: planForm.accentColor,
      badgeColor: planForm.badgeColor,
    };

    if (planModalMode === 'create') {
      await addInvestmentPlan(payload);
    } else if (planModalMode === 'edit' && editingPlanId) {
      await updateInvestmentPlan(editingPlanId, payload);
    }
    setPlanModalMode(null);
  };

  // Wallet Modal Handlers
  const handleOpenCreateWallet = () => {
    setEditingWalletId(null);
    setWalletForm({
      name: '',
      category: 'mobile_wallet',
      iconType: 'jazzcash',
      iconUrl: '',
      accountTitle: 'RentoBit Official',
      accountNumber: '',
      tillId: '',
      networkOrBank: 'JazzCash Mobile Account',
      instructions: 'Send deposit funds to the account above and enter your Transaction ID (TID).',
      minDeposit: 10,
      maxDeposit: 500000,
      feePercent: 0,
      isActive: true,
    });
    setWalletModalMode('create');
  };

  const handleOpenEditWallet = (w: DepositPaymentMethod) => {
    setEditingWalletId(w.id);
    setWalletForm({
      name: w.name,
      category: w.category,
      iconType: w.iconType,
      iconUrl: w.iconUrl || '',
      accountTitle: w.accountTitle || '',
      accountNumber: w.accountNumber || '',
      tillId: w.tillId || '',
      networkOrBank: w.networkOrBank || '',
      instructions: w.instructions || '',
      minDeposit: w.minDeposit,
      maxDeposit: w.maxDeposit,
      feePercent: w.feePercent || 0,
      isActive: w.isActive,
    });
    setWalletModalMode('edit');
  };

  const handleSaveWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: walletForm.name,
      category: walletForm.category,
      iconType: walletForm.iconType,
      iconUrl: walletForm.iconUrl ? walletForm.iconUrl.trim() : undefined,
      accountTitle: walletForm.accountTitle,
      accountNumber: walletForm.accountNumber,
      tillId: walletForm.tillId ? walletForm.tillId.trim() : undefined,
      networkOrBank: walletForm.networkOrBank,
      instructions: walletForm.instructions,
      minDeposit: Number(walletForm.minDeposit),
      maxDeposit: Number(walletForm.maxDeposit),
      feePercent: Number(walletForm.feePercent),
      isActive: walletForm.isActive,
    };

    if (walletModalMode === 'create') {
      await addPaymentMethod(payload);
    } else if (walletModalMode === 'edit' && editingWalletId) {
      await updatePaymentMethod(editingWalletId, payload);
    }
    setWalletModalMode(null);
  };

  // Withdrawal Gateway Modal Handlers
  const handleOpenCreateWthGateway = () => {
    setEditingWthGatewayId(null);
    setWthGatewayForm({
      name: '',
      currency: 'USDT',
      network: 'TRC20',
      iconType: 'usdt',
      iconUrl: '',
      fee: 1.0,
      minWithdrawal: 20,
      maxWithdrawal: 50000,
      instructions: 'Enter your valid wallet address. Payout will be sent directly to this address via blockchain.',
      isActive: true,
    });
    setWthGatewayModalMode('create');
  };

  const handleOpenEditWthGateway = (w: WithdrawalPaymentMethod) => {
    setEditingWthGatewayId(w.id);
    setWthGatewayForm({
      name: w.name,
      currency: w.currency || w.symbol || 'USDT',
      network: w.network,
      iconType: (w.iconType || 'usdt') as string,
      iconUrl: w.iconUrl || '',
      fee: w.fee ?? w.feeFixed ?? 1,
      minWithdrawal: w.minWithdrawal,
      maxWithdrawal: w.maxWithdrawal,
      instructions: w.instructions || '',
      isActive: w.isActive,
    });
    setWthGatewayModalMode('edit');
  };

  const handleSaveWthGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    const feeVal = Number(wthGatewayForm.fee) || 0;
    const currVal = wthGatewayForm.currency.trim().toUpperCase() || 'USDT';
    const payload = {
      name: wthGatewayForm.name.trim(),
      symbol: currVal,
      currency: currVal,
      network: wthGatewayForm.network.trim(),
      iconType: wthGatewayForm.iconType,
      iconUrl: wthGatewayForm.iconUrl ? wthGatewayForm.iconUrl.trim() : undefined,
      feeFixed: feeVal,
      fee: feeVal,
      feePercent: 0,
      minWithdrawal: Number(wthGatewayForm.minWithdrawal),
      maxWithdrawal: Number(wthGatewayForm.maxWithdrawal),
      instructions: wthGatewayForm.instructions.trim(),
      isActive: wthGatewayForm.isActive,
    };

    if (wthGatewayModalMode === 'create') {
      await addWithdrawalMethod(payload);
    } else if (wthGatewayModalMode === 'edit' && editingWthGatewayId) {
      await updateWithdrawalMethod(editingWthGatewayId, payload);
    }
    setWthGatewayModalMode(null);
  };

  // ── Reports Tab Pagination Computations ──
  const filteredReportRecords = React.useMemo(() => {
    if (!reportsData?.records) return [];
    if (!reportSearchQuery) return reportsData.records;
    const q = reportSearchQuery.toLowerCase();
    return reportsData.records.filter((r: any) =>
      (r.user || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.reference || '').toLowerCase().includes(q) ||
      (r.type || '').toLowerCase().includes(q) ||
      (r.category || '').toLowerCase().includes(q) ||
      (r.status || '').toLowerCase().includes(q)
    );
  }, [reportsData?.records, reportSearchQuery]);

  const totalReportPages = Math.max(1, Math.ceil(filteredReportRecords.length / reportPageSize));
  const safeReportPage = Math.min(Math.max(1, reportPage), totalReportPages);
  const paginatedReportRecords = React.useMemo(() => {
    const start = (safeReportPage - 1) * reportPageSize;
    return filteredReportRecords.slice(start, start + reportPageSize);
  }, [filteredReportRecords, safeReportPage, reportPageSize]);

  // ── All Users Tab Pagination Computations ──
  const totalUsersPages = Math.max(1, Math.ceil(allUsers.length / usersPageSize));
  const safeUsersPage = Math.min(Math.max(1, usersPage), totalUsersPages);
  const paginatedUsers = React.useMemo(() => {
    const start = (safeUsersPage - 1) * usersPageSize;
    return allUsers.slice(start, start + usersPageSize);
  }, [allUsers, safeUsersPage, usersPageSize]);

  return (
    <div className={`min-h-screen ${isLight ? 'bg-slate-50' : 'bg-[#040C16]'}`}>
      {/* ═══ DESKTOP LAYOUT: SIDEBAR + CONTENT ══════════════════════ */}
      <div className="flex min-h-screen">

        {/* ─── LEFT SIDEBAR (desktop only) ─────────────────────────── */}
        <aside className={`hidden lg:flex flex-col w-64 min-h-screen shrink-0 sticky top-0 h-screen overflow-y-auto ${isLight
            ? 'bg-white border-r border-slate-200 shadow-lg'
            : 'bg-[#07121E] border-r border-white/10'
          }`}>

          {/* Brand */}
          <div className={`px-5 py-5 border-b ${isLight ? 'border-slate-100' : 'border-white/10'}`}>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-sm">
                <ShieldAlert className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'} font-['Outfit',sans-serif]`}>
                  RentoBit
                </div>
                <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Admin Console</div>
              </div>
            </div>
          </div>

          {/* KPI Mini Stats */}
          <div className={`px-4 py-3 border-b ${isLight ? 'border-slate-100' : 'border-white/10'}`}>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: 'P&L Status',
                  value: dashboardData?.profitLoss?.status || 'PROFIT',
                  color: dashboardData?.profitLoss?.isProfitable === false ? 'text-rose-500' : 'text-emerald-500'
                },
                { label: 'Users', value: dashboardData?.users?.total || allUsers.length || '—', color: 'text-blue-500' },
                { label: 'Pending Dep', value: dashboardData?.deposits?.pendingCount ?? adminAllDeposits.filter(d => d.status === 'Pending').length, color: 'text-amber-500' },
                { label: 'KYC Review', value: dashboardData?.kyc?.pending ?? (kyc.status === 'Under Review' ? '1' : 0), color: 'text-purple-500' },
              ].map(stat => (
                <div key={stat.label} className={`p-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-100' : 'bg-white/5 border border-white/5'}`}>
                  <div className={`text-base font-black ${stat.color} font-['Outfit',sans-serif] truncate`}>{stat.value}</div>
                  <div className={`text-[9px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
            {[
              { id: 'overview', icon: BarChart3, label: 'Executive Dashboard', count: dashboardData?.profitLoss?.status || '' },
              { id: 'reports', icon: FileCheck, label: 'Audit & Reports', count: '' },
              { id: 'users', icon: Users, label: 'All Users', count: allUsers.length },
              { id: 'alldeposits', icon: ArrowDownCircle, label: 'Deposit Verification', count: adminAllDeposits.filter(d => d.status === 'Pending').length || '' },
              { id: 'allwithdrawals', icon: ArrowUpCircle, label: 'Withdrawals', count: adminAllWithdrawals.filter(w => w.status === 'Pending').length || '' },
              { id: 'cancellations', icon: XCircle, label: 'Cancellations', count: adminCancellations.filter(c => c.status === 'Pending').length || '' },
              { id: 'support', icon: MessageSquare, label: 'Support Tickets', count: adminTickets.filter(t => t.status === 'Open').length || '' },
              { id: 'plans', icon: Car, label: 'Plans', count: plans.length },
              { id: 'wallets', icon: Wallet, label: 'Wallets', count: paymentMethods.length },
              { id: 'distribution', icon: Clock, label: 'Distribution', count: distributionStatus === 'open' ? 'LIVE' : '' },
              { id: 'unlocks', icon: Lock, label: 'Unlocks', count: unlockRequests.filter(u => u.status === 'Under Support Review').length || '' },
              { id: 'kyc', icon: ShieldAlert, label: 'KYC', count: dashboardData?.kyc?.pending || (kyc.status === 'Under Review' ? 1 : '') },
              { id: 'audit', icon: Search, label: 'Audit Log', count: '' },
              { id: 'splash', icon: ImageIcon, label: 'Splash Slides', count: '' },
              { id: 'backup', icon: Database, label: 'Database Backup', count: '' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${isActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : isLight
                        ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-900' : ''}`} />
                  <span className="flex-1 truncate text-xs">{tab.label}</span>
                  {tab.count !== '' && tab.count !== 0 && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black shrink-0 ${isActive ? 'bg-slate-900/20 text-slate-900' : 'bg-amber-500/20 text-amber-500'
                      }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className={`px-4 py-4 border-t ${isLight ? 'border-slate-100' : 'border-white/10'} space-y-2`}>
            <button
              onClick={() => setNotificationDrawerOpen(true)}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${unreadNotifCount > 0
                  ? isLight
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
            >
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span>Notifications</span>
              </div>
              {unreadNotifCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                  {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('notifications')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
            >
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              <span>Platform Updates Page</span>
            </button>
            <button
              onClick={() => navigate('dashboard')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Return to Dashboard
            </button>
            <div className={`text-center text-[9px] ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>
              RentoBit Admin v2 · Secured
            </div>
          </div>
        </aside>

        {/* ─── MAIN CONTENT AREA ───────────────────────────────────── */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="p-4 lg:p-6 xl:p-8 space-y-5 pb-24 lg:pb-8">

            {/* ─── MOBILE Header (hidden on desktop) ─────────────────── */}
            <div className={`lg:hidden rounded-3xl ${isLight
                ? 'bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-blue-800 text-white shadow-xl'
                : 'bg-gradient-to-r from-[#141E28] via-[#1F2C3A] to-[#121A24] border border-amber-500/30 text-white shadow-xl'
              } p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                    Supervisor
                  </span>
                </div>
                <h2 className="text-xl font-black text-white mt-1 font-['Outfit',sans-serif]">Admin Console</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNotificationDrawerOpen(true)}
                  className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors cursor-pointer flex items-center justify-center"
                  title="View Notifications"
                  aria-label="View notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm animate-pulse">
                      {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate('dashboard')}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs self-start sm:self-auto transition-colors cursor-pointer"
                >
                  ← Dashboard
                </button>
              </div>
            </div>

            {/* ─── DESKTOP Page Header (hidden on mobile) ────────────── */}
            <div className={`hidden lg:flex items-center justify-between rounded-2xl ${isLight ? 'bg-white border border-slate-200 shadow-sm' : 'bg-[#091A2E] border border-white/10'
              } px-6 py-4`}>
              <div>
                <h1 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'} font-['Outfit',sans-serif]`}>
                  {{
                    overview: '📊 Executive Dashboard & P&L',
                    reports: '📑 Analytical & Audit Reports',
                    users: '👥 All Users',
                    alldeposits: '💰 Deposit Verification',
                    allwithdrawals: '📤 Withdrawal Queue',
                    cancellations: '🛑 Plan Cancellations',
                    support: '🎫 Support Tickets',
                    plans: '🚗 Investment Plans',
                    wallets: '💳 Payment Wallets',
                    distribution: '⏰ Distribution Settings',
                    unlocks: '🔓 Unlock Requests',
                    kyc: '🪪 KYC Review',
                    audit: '📋 Audit Log',
                    splash: '🖼 Splash Slides',
                    backup: '💾 Database Backup & Disaster Recovery',
                  }[activeTab] || 'Admin Console'}
                </h1>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  RentoBit Operations & Compliance Desk
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Notification Bell Button with live unread counter */}
                <button
                  onClick={() => setNotificationDrawerOpen(true)}
                  className={`relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                    }`}
                  title="View Notifications"
                  aria-label="View notifications"
                >
                  <Bell className="w-4 h-4 text-amber-500" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm animate-pulse ring-2 ring-[#091A2E]">
                      {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => navigate('dashboard')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                    }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Exit to User App
                </button>
                <div className={`text-xs px-3.5 py-2 rounded-xl font-bold ${isLight ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                  }`}>
                  🛡 Supervisor Access
                </div>
              </div>
            </div>

            {/* ─── MOBILE Navigation Tabs ────────────────────────────── */}
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'overview', label: '📊 Dashboard' },
                { id: 'reports', label: '📑 Reports' },
                { id: 'users', label: '👥 Users' },
                { id: 'alldeposits', label: '💰 Verification' },
                { id: 'allwithdrawals', label: '📤 Withdrawals' },
                { id: 'cancellations', label: '🛑 Cancellations' },
                { id: 'support', label: '🎫 Support' },
                { id: 'plans', label: '🚗 Plans' },
                { id: 'wallets', label: '💳 Wallets' },
                { id: 'distribution', label: '⏰ Distribution' },
                { id: 'unlocks', label: 'Unlocks' },
                { id: 'kyc', label: 'KYC' },
                { id: 'audit', label: 'Audit' },
                { id: 'splash', label: '🖼 Splash' },
                { id: 'backup', label: '💾 Backup' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === tab.id
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : isLight
                        ? 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
                        : 'bg-[#091A2E] border border-white/10 text-slate-300 hover:text-white'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB: EXECUTIVE DASHBOARD (OVERVIEW & P&L)                    */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
              <div className="space-y-7">
                {/* ── 1. LUXURY EXECUTIVE COMMAND HEADER ── */}
                <div className={`p-6 sm:p-7 rounded-3xl border-2 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all relative overflow-hidden ${isLight
                    ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-indigo-900/50 shadow-[0_16px_40px_rgba(15,23,42,0.18)]'
                    : 'bg-gradient-to-r from-[#06121E] via-[#0B1E34] to-[#071322] text-white border-amber-500/25 shadow-[0_16px_45px_rgba(0,0,0,0.7)]'
                  }`}>
                  {/* Background Decorative Ambient Radial Glow */}
                  <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        Live PostgreSQL Pipeline
                      </span>
                      <span className="text-xs text-slate-300 font-mono flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Telemetry Synced: {dashboardData?.generatedAt ? new Date(dashboardData.generatedAt).toLocaleTimeString() : 'Real-time'}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black font-['Outfit',sans-serif] tracking-tight text-white flex items-center gap-2.5">
                      Executive Command & Profit/Loss Center
                      <Sparkles className="w-6 h-6 text-amber-400 shrink-0 hidden sm:inline" />
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                      Comprehensive platform telemetry: Real-time cashflow, deposit & withdrawal reconciliation, affiliate commission yields, KYC compliance status, and net corporate profitability.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start md:self-auto relative z-10">
                    <button
                      onClick={() => {
                        fetchDashboardData();
                        showToast('Dashboard metrics refreshed from database', 'info');
                      }}
                      disabled={dashboardLoading}
                      className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50 shadow-sm"
                    >
                      <RefreshCw className={`w-4 h-4 ${dashboardLoading ? 'animate-spin text-amber-400' : ''}`} />
                      {dashboardLoading ? 'Syncing...' : 'Sync Telemetry'}
                    </button>
                    <button
                      onClick={() => setActiveTab('reports')}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-[0_8px_25px_rgba(245,158,11,0.35)] cursor-pointer active:scale-95"
                    >
                      <FileCheck className="w-4 h-4 text-slate-950" />
                      Audit & Reports
                    </button>
                  </div>
                </div>

                {/* ── 2. MASTER HERO: COMPANY PROFIT & LOSS (P&L) STATUS TERMINAL ── */}
                {(() => {
                  const pl = dashboardData?.profitLoss || {
                    grossInflow: 0,
                    grossOutflow: 0,
                    netCashflow: 0,
                    userLiabilities: 0,
                    netPlatformLiquidity: 0,
                    isProfitable: true,
                    profitMargin: 0,
                    status: 'PROFIT',
                    feeIncome: 0,
                  };
                  const isProfitable = pl.isProfitable !== false;
                  const inflow = Number(pl.grossInflow || 0);
                  const outflow = Number(pl.grossOutflow || 0);
                  const totalTurnover = inflow + outflow;
                  const inflowPct = totalTurnover > 0 ? Math.round((inflow / totalTurnover) * 100) : 100;
                  const outflowPct = totalTurnover > 0 ? 100 - inflowPct : 0;

                  return (
                    <div className={`p-6 sm:p-8 rounded-3xl border-2 transition-all relative overflow-hidden ${isProfitable
                        ? isLight
                          ? 'bg-gradient-to-br from-emerald-500/[0.08] via-white to-teal-500/[0.04] border-emerald-400 shadow-[0_20px_50px_-10px_rgba(16,185,129,0.18),0_4px_16px_rgba(0,0,0,0.03)]'
                          : 'bg-gradient-to-br from-[#061e17]/95 via-[#081f2f]/95 to-[#06101c]/95 border-emerald-500/45 shadow-[0_20px_60px_-10px_rgba(16,185,129,0.28),0_0_35px_rgba(16,185,129,0.1)] backdrop-blur-2xl'
                        : isLight
                          ? 'bg-gradient-to-br from-rose-500/[0.08] via-white to-amber-500/[0.04] border-rose-400 shadow-[0_20px_50px_-10px_rgba(244,63,94,0.18),0_4px_16px_rgba(0,0,0,0.03)]'
                          : 'bg-gradient-to-br from-[#270b13]/95 via-[#1d1122]/95 to-[#06101c]/95 border-rose-500/45 shadow-[0_20px_60px_-10px_rgba(244,63,94,0.28),0_0_35px_rgba(244,63,94,0.1)] backdrop-blur-2xl'
                      }`}>
                      {/* Ambient Dual Atmosphere Glows */}
                      <div className={`absolute -top-10 -right-10 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-25 ${isProfitable ? 'bg-emerald-400' : 'bg-rose-400'
                        }`} />
                      <div className={`absolute -bottom-10 -left-10 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-15 ${isProfitable ? 'bg-teal-400' : 'bg-amber-400'
                        }`} />

                      <div className="relative z-10 space-y-6">
                        {/* Top Bar: Verdict + Key Numbers */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200/80 dark:border-white/10">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3.5">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl shrink-0 transition-transform hover:scale-105 ${isProfitable
                                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/40'
                                  : 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/40'
                                }`}>
                                {isProfitable ? <TrendingUp className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <span className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isProfitable
                                      ? isLight
                                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs'
                                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                      : isLight
                                        ? 'bg-rose-100 text-rose-900 border border-rose-300 shadow-xs'
                                        : 'bg-rose-500/20 text-rose-300 border border-rose-400/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                                    }`}>
                                    <span className={`w-2 h-2 rounded-full ${isProfitable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`} />
                                    COMPANY STATUS: {isProfitable ? 'NET OPERATING PROFIT' : 'NET OPERATING DEFICIT'}
                                  </span>
                                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-white/10 text-slate-300 border-white/10'
                                    }`}>
                                    Institutional Ledger Audit
                                  </span>
                                </div>

                                <div className="flex items-baseline gap-3.5 mt-2 flex-wrap">
                                  <h3 className={`text-4xl sm:text-5xl lg:text-6xl font-black font-['Outfit',sans-serif] tracking-tight ${isProfitable
                                      ? isLight ? 'text-emerald-950' : 'text-emerald-300 drop-shadow-[0_0_20px_rgba(52,211,153,0.35)]'
                                      : isLight ? 'text-rose-950' : 'text-rose-300 drop-shadow-[0_0_20px_rgba(251,113,133,0.35)]'
                                    }`}>
                                    {isProfitable ? '+' : '-'}${Math.abs(pl.netCashflow).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </h3>
                                  <span className={`text-sm font-extrabold px-3 py-1 rounded-xl border flex items-center gap-1.5 shadow-xs ${isProfitable
                                      ? isLight ? 'bg-emerald-100/80 text-emerald-800 border-emerald-300' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                      : isLight ? 'bg-rose-100/80 text-rose-800 border-rose-300' : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                    }`}>
                                    {isProfitable ? <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                                    {pl.profitMargin > 0 ? `+${pl.profitMargin}%` : `${pl.profitMargin}%`} Operating Margin
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-slate-300'} max-w-xl leading-relaxed`}>
                              Calculated from real approved inflows (Deposits + Gateway fees) minus settled capital outgress (Completed Withdrawals + Referral Affiliate Commissions).
                            </p>
                          </div>

                          {/* Quick Financial Snapshot Tiles */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full lg:w-auto">
                            {/* Total Inflow Tile */}
                            <div className={`p-4 sm:p-5 rounded-2xl border-2 transition-all hover:scale-[1.02] ${isLight
                                ? 'bg-white/95 border-emerald-200/90 shadow-[0_8px_20px_rgba(16,185,129,0.08)]'
                                : 'bg-[#061824]/90 border-emerald-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md'
                              }`}>
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-[11px] font-black uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Total Cash Inflow</span>
                                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                                  <ArrowDownCircle className="w-4 h-4 text-emerald-500" />
                                </div>
                              </div>
                              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-['Outfit',sans-serif] mt-1.5 tracking-tight">
                                ${Number(pl.grossInflow || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </div>
                              <div className={`text-[10px] font-semibold mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                Approved Deposits + Fees
                              </div>
                            </div>

                            {/* Total Outflow Tile */}
                            <div className={`p-4 sm:p-5 rounded-2xl border-2 transition-all hover:scale-[1.02] ${isLight
                                ? 'bg-white/95 border-rose-200/90 shadow-[0_8px_20px_rgba(244,63,94,0.08)]'
                                : 'bg-[#180d19]/90 border-rose-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md'
                              }`}>
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-[11px] font-black uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Total Cash Outflow</span>
                                <div className="w-6 h-6 rounded-lg bg-rose-500/15 flex items-center justify-center">
                                  <ArrowUpCircle className="w-4 h-4 text-rose-500" />
                                </div>
                              </div>
                              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-['Outfit',sans-serif] mt-1.5 tracking-tight">
                                ${Number(pl.grossOutflow || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </div>
                              <div className={`text-[10px] font-semibold mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                Withdrawals + Commissions
                              </div>
                            </div>

                            {/* Client Liabilities Tile */}
                            <div className={`p-4 sm:p-5 rounded-2xl border-2 transition-all hover:scale-[1.02] ${isLight
                                ? 'bg-white/95 border-amber-200/90 shadow-[0_8px_20px_rgba(245,158,11,0.08)]'
                                : 'bg-[#18150d]/90 border-amber-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md'
                              }`}>
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-[11px] font-black uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Client Liabilities</span>
                                <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center">
                                  <Wallet className="w-4 h-4 text-amber-500" />
                                </div>
                              </div>
                              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-['Outfit',sans-serif] mt-1.5 tracking-tight">
                                ${Number(pl.userLiabilities || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </div>
                              <div className={`text-[10px] font-semibold mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                Available Liquid Balances
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Cash Flow Distribution Meter (Visual Ratio Bar) */}
                        <div className="space-y-2 pt-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold">
                            <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                              <ArrowDownCircle className="w-4 h-4" />
                              Cash Ingress Ratio: {inflowPct}% (${Number(pl.grossInflow).toLocaleString('en-US', { minimumFractionDigits: 2 })})
                            </span>
                            <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                              <ArrowUpCircle className="w-4 h-4" />
                              Cash Outgress Ratio: {outflowPct}% (${Number(pl.grossOutflow).toLocaleString('en-US', { minimumFractionDigits: 2 })})
                            </span>
                          </div>
                          <div className={`h-4 w-full rounded-full overflow-hidden flex p-0.5 border-2 shadow-inner ${isLight ? 'bg-slate-200/90 border-slate-300' : 'bg-black/40 border-white/10'
                            }`}>
                            <div
                              style={{ width: `${Math.max(4, Math.min(96, inflowPct))}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-all duration-700 shadow-md"
                            />
                            <div
                              style={{ width: `${Math.max(4, Math.min(96, outflowPct))}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-rose-500 via-red-400 to-rose-400 transition-all duration-700 shadow-md"
                            />
                          </div>
                        </div>

                        {/* Secondary P&L Health Indicators */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
                          <div className={`p-3.5 rounded-2xl border transition-all ${isLight ? 'bg-white/80 border-slate-200 shadow-xs' : 'bg-white/5 border-white/10'
                            }`}>
                            <div className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                              Gross Platform Treasury
                            </div>
                            <div className={`text-lg font-black mt-1 font-['Outfit',sans-serif] ${pl.netCashflow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              ${Number(pl.netCashflow || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                          </div>

                          <div className={`p-3.5 rounded-2xl border transition-all ${isLight ? 'bg-white/80 border-slate-200 shadow-xs' : 'bg-white/5 border-white/10'
                            }`}>
                            <div className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                              Net Company Position
                            </div>
                            <div className={`text-lg font-black mt-1 font-['Outfit',sans-serif] ${pl.netPlatformLiquidity >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                              ${Number(pl.netPlatformLiquidity || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                          </div>

                          <div className={`p-3.5 rounded-2xl border transition-all ${isLight ? 'bg-white/80 border-slate-200 shadow-xs' : 'bg-white/5 border-white/10'
                            }`}>
                            <div className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                              Gateway Fee Revenues
                            </div>
                            <div className="text-lg font-black text-blue-600 dark:text-blue-400 mt-1 font-['Outfit',sans-serif]">
                              ${Number(pl.feeIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                          </div>

                          <div className={`p-3.5 rounded-2xl border transition-all ${isLight ? 'bg-white/80 border-slate-200 shadow-xs' : 'bg-white/5 border-white/10'
                            }`}>
                            <div className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                              Solvency Rating
                            </div>
                            <div className="text-base font-black text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0" />
                              <span className="truncate">{pl.netCashflow >= pl.userLiabilities ? 'AAA Fully Backed' : 'Operational Escrow'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ── 3. SIX LUXURY KPI METRIC CARDS (DUAL-MODE CERAMIC / OBSIDIAN) ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                  {/* ── CARD 1: DEPOSITS METRICS (EMERALD / MINT THEME) ── */}
                  <div className={`rounded-3xl border-2 flex flex-col justify-between transition-all duration-300 overflow-hidden group hover:scale-[1.01] ${isLight
                      ? 'bg-white border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] hover:border-emerald-300'
                      : 'bg-gradient-to-b from-[#091C2E]/95 via-[#081726]/95 to-[#06111D]/95 border-white/10 hover:border-emerald-500/40 shadow-[0_14px_45px_rgba(0,0,0,0.65)] hover:shadow-[0_20px_55px_rgba(0,0,0,0.75)] backdrop-blur-xl'
                    }`}>
                    {/* Top Vibrant Accent Bar */}
                    <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                            <ArrowDownCircle className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Deposit Liquidity</h4>
                            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Approved Capital Inflow</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('alldeposits')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border shadow-xs ${(dashboardData?.deposits?.pendingCount || 0) > 0
                              ? 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 font-black animate-pulse'
                              : isLight
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                            }`}
                        >
                          Verify ({dashboardData?.deposits?.pendingCount || 0}) <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <div className={`text-3xl sm:text-4xl font-black font-['Outfit',sans-serif] tracking-tight ${isLight ? 'text-emerald-700' : 'text-emerald-400'
                          }`}>
                          ${Number(dashboardData?.deposits?.totalVolume || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-lg border font-bold ${isLight ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-white/5 text-slate-200 border-white/10'
                            }`}>
                            Approved: <strong className="text-emerald-600 dark:text-emerald-400 font-black">{dashboardData?.deposits?.approvedCount || 0}</strong>
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-lg border font-bold ${(dashboardData?.deposits?.pendingCount || 0) > 0
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                              : isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-white/5 text-slate-400 border-white/10'
                            }`}>
                            Pending: ${Number(dashboardData?.deposits?.pendingVolume || 0).toFixed(2)} ({dashboardData?.deposits?.pendingCount || 0})
                          </span>
                        </div>
                      </div>

                      {/* Gateway Pills */}
                      <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2">
                        <div className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          Gateway Allocation:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(dashboardData?.deposits?.methods || []).slice(0, 4).map((m: any) => (
                            <span key={m.method} className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                              }`}>
                              {m.method}: <strong className="text-emerald-600 dark:text-emerald-400 font-black">${Number(m.volume).toFixed(0)}</strong>
                            </span>
                          ))}
                          {(!dashboardData?.deposits?.methods || dashboardData.deposits.methods.length === 0) && (
                            <span className="text-[10px] text-slate-400">No deposit records yet</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={`px-6 py-3.5 border-t text-xs flex items-center justify-between font-bold ${isLight ? 'bg-slate-50/90 border-slate-200/80 text-slate-600' : 'bg-[#040C16]/90 border-white/5 text-slate-300'
                      }`}>
                      <span>Today Inflow: <strong className="text-emerald-600 dark:text-emerald-400 font-black">${Number(dashboardData?.deposits?.todayVolume || 0).toFixed(2)}</strong></span>
                      <span>Fees Revenue: ${Number(dashboardData?.deposits?.feeRevenue || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* ── CARD 2: WITHDRAWALS METRICS (ROSE / RED THEME) ── */}
                  <div className={`rounded-3xl border-2 flex flex-col justify-between transition-all duration-300 overflow-hidden group hover:scale-[1.01] ${isLight
                      ? 'bg-white border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] hover:border-rose-300'
                      : 'bg-gradient-to-b from-[#091C2E]/95 via-[#081726]/95 to-[#06111D]/95 border-white/10 hover:border-rose-500/40 shadow-[0_14px_45px_rgba(0,0,0,0.65)] hover:shadow-[0_20px_55px_rgba(0,0,0,0.75)] backdrop-blur-xl'
                    }`}>
                    {/* Top Vibrant Accent Bar */}
                    <div className="h-2 w-full bg-gradient-to-r from-rose-500 via-red-400 to-rose-600" />

                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-105 transition-transform">
                            <ArrowUpCircle className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Withdrawals Outgress</h4>
                            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Settled Member Payouts</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('allwithdrawals')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border shadow-xs ${(dashboardData?.withdrawals?.pendingCount || 0) > 0
                              ? 'bg-rose-500 text-white border-rose-400 hover:bg-rose-400 font-black animate-pulse'
                              : isLight
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                            }`}
                        >
                          Queue ({dashboardData?.withdrawals?.pendingCount || 0}) <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <div className={`text-3xl sm:text-4xl font-black font-['Outfit',sans-serif] tracking-tight ${isLight ? 'text-rose-700' : 'text-rose-400'
                          }`}>
                          ${Number(dashboardData?.withdrawals?.totalVolume || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-lg border font-bold ${isLight ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-white/5 text-slate-200 border-white/10'
                            }`}>
                            Settled: <strong className="text-rose-600 dark:text-rose-400 font-black">{dashboardData?.withdrawals?.completedCount || 0}</strong>
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-lg border font-bold ${(dashboardData?.withdrawals?.pendingCount || 0) > 0
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                              : isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-white/5 text-slate-400 border-white/10'
                            }`}>
                            Pending: ${Number(dashboardData?.withdrawals?.pendingVolume || 0).toFixed(2)} ({dashboardData?.withdrawals?.pendingCount || 0})
                          </span>
                        </div>
                      </div>

                      {/* Network Pills */}
                      <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2">
                        <div className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          Settlement Networks:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(dashboardData?.withdrawals?.methods || []).slice(0, 4).map((m: any) => (
                            <span key={m.method} className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                              }`}>
                              {m.method}: <strong className="text-rose-600 dark:text-rose-400 font-black">${Number(m.volume).toFixed(0)}</strong>
                            </span>
                          ))}
                          {(!dashboardData?.withdrawals?.methods || dashboardData.withdrawals.methods.length === 0) && (
                            <span className="text-[10px] text-slate-400">No withdrawal records yet</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={`px-6 py-3.5 border-t text-xs flex items-center justify-between font-bold ${isLight ? 'bg-slate-50/90 border-slate-200/80 text-slate-600' : 'bg-[#040C16]/90 border-white/5 text-slate-300'
                      }`}>
                      <span>Today Outflow: <strong className="text-rose-600 dark:text-rose-400 font-black">${Number(dashboardData?.withdrawals?.todayVolume || 0).toFixed(2)}</strong></span>
                      <span>Payout Fees Kept: ${Number(dashboardData?.withdrawals?.feeRevenue || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* ── CARD 3: REFERRAL & AFFILIATE FLOW (INDIGO / VIOLET THEME) ── */}
                  <div className={`rounded-3xl border-2 flex flex-col justify-between transition-all duration-300 overflow-hidden group hover:scale-[1.01] ${isLight
                      ? 'bg-white border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] hover:border-indigo-300'
                      : 'bg-gradient-to-b from-[#091C2E]/95 via-[#081726]/95 to-[#06111D]/95 border-white/10 hover:border-indigo-500/40 shadow-[0_14px_45px_rgba(0,0,0,0.65)] hover:shadow-[0_20px_55px_rgba(0,0,0,0.75)] backdrop-blur-xl'
                    }`}>
                    {/* Top Vibrant Accent Bar */}
                    <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-400 to-indigo-600" />

                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                            <Sparkles className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Referral Affiliate Flow</h4>
                            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Commission & Growth Yields</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs ${isLight ? 'bg-indigo-100 text-indigo-900 border-indigo-300' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          }`}>
                          5% Direct Rate
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className={`text-3xl sm:text-4xl font-black font-['Outfit',sans-serif] tracking-tight ${isLight ? 'text-indigo-700' : 'text-indigo-400'
                          }`}>
                          ${Number(dashboardData?.referrals?.totalCommissionsPaid || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          Total commissions credited to referral promoters
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Deposit Volume via Links:</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400">
                            ${Number(dashboardData?.referrals?.volumeFromReferrals || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Referred Accounts:</span>
                          <span className={`font-black ${isLight ? 'text-indigo-700' : 'text-indigo-300'}`}>
                            {dashboardData?.users?.referredUsers || 0} members
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`px-6 py-3.5 border-t text-xs flex items-center justify-between font-bold ${isLight ? 'bg-slate-50/90 border-slate-200/80 text-slate-600' : 'bg-[#040C16]/90 border-white/5 text-slate-300'
                      }`}>
                      <span>Total Payouts: {dashboardData?.referrals?.commissionsCount || 0}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-black">Auto-Credited</span>
                    </div>
                  </div>

                  {/* ── CARD 4: USER BASE & GROWTH (BLUE / CYAN THEME) ── */}
                  <div className={`rounded-3xl border-2 flex flex-col justify-between transition-all duration-300 overflow-hidden group hover:scale-[1.01] ${isLight
                      ? 'bg-white border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] hover:border-blue-300'
                      : 'bg-gradient-to-b from-[#091C2E]/95 via-[#081726]/95 to-[#06111D]/95 border-white/10 hover:border-blue-500/40 shadow-[0_14px_45px_rgba(0,0,0,0.65)] hover:shadow-[0_20px_55px_rgba(0,0,0,0.75)] backdrop-blur-xl'
                    }`}>
                    {/* Top Vibrant Accent Bar */}
                    <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-sky-400 to-blue-600" />

                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                            <Users className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Registered Users</h4>
                            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Platform Community</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('users')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer border shadow-xs ${isLight
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                            }`}
                        >
                          View All <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <div className={`text-3xl sm:text-4xl font-black font-['Outfit',sans-serif] tracking-tight ${isLight ? 'text-blue-700' : 'text-blue-400'
                          }`}>
                          {dashboardData?.users?.total || allUsers.length}
                          <span className={`text-xs font-bold ml-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Total Accounts</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          <span className="text-emerald-600 dark:text-emerald-400 font-black">Active: {dashboardData?.users?.active || allUsers.length}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-rose-600 dark:text-rose-400 font-black">Suspended: {dashboardData?.users?.suspended || 0}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>New Signups (Last 24h):</span>
                          <span className="font-black text-blue-600 dark:text-blue-400">+{dashboardData?.users?.newToday || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>New This Week (7d):</span>
                          <span className="font-black text-blue-600 dark:text-blue-400">+{dashboardData?.users?.newThisWeek || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`px-6 py-3.5 border-t text-xs flex items-center justify-between font-bold ${isLight ? 'bg-slate-50/90 border-slate-200/80 text-slate-600' : 'bg-[#040C16]/90 border-white/5 text-slate-300'
                      }`}>
                      <span>Investing Accounts: {dashboardData?.balances?.activeInvestmentsCount || 0}</span>
                      <span className="text-blue-600 dark:text-blue-400 font-black">100% Capital Shield</span>
                    </div>
                  </div>

                  {/* ── CARD 5: KYC & COMPLIANCE (PURPLE / FUCHSIA THEME) ── */}
                  <div className={`rounded-3xl border-2 flex flex-col justify-between transition-all duration-300 overflow-hidden group hover:scale-[1.01] ${isLight
                      ? 'bg-white border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] hover:border-purple-300'
                      : 'bg-gradient-to-b from-[#091C2E]/95 via-[#081726]/95 to-[#06111D]/95 border-white/10 hover:border-purple-500/40 shadow-[0_14px_45px_rgba(0,0,0,0.65)] hover:shadow-[0_20px_55px_rgba(0,0,0,0.75)] backdrop-blur-xl'
                    }`}>
                    {/* Top Vibrant Accent Bar */}
                    <div className="h-2 w-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-purple-600" />

                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
                            <ShieldCheck className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>KYC Compliance</h4>
                            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Identity Verification Desk</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('kyc')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border shadow-xs ${(dashboardData?.kyc?.pending || 0) > 0
                              ? 'bg-purple-500 text-white border-purple-400 hover:bg-purple-400 font-black animate-pulse'
                              : isLight
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                            }`}
                        >
                          Queue ({dashboardData?.kyc?.pending || 0}) <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <div className={`text-3xl sm:text-4xl font-black font-['Outfit',sans-serif] tracking-tight ${isLight ? 'text-purple-700' : 'text-purple-400'
                          }`}>
                          {dashboardData?.kyc?.approved || 0}
                          <span className={`text-xs font-bold ml-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                            Verified ({dashboardData?.kyc?.approvalRate || '100'}%)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          <span className="font-bold text-amber-600 dark:text-amber-400">Under Review: {dashboardData?.kyc?.pending || 0}</span>
                          <span className="text-slate-400">·</span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">Rejected: {dashboardData?.kyc?.rejected || 0}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Advance KYC Allowed (Tier 2):</span>
                          <span className="font-black text-teal-600 dark:text-teal-400">{dashboardData?.kyc?.advanceAllowed || 0} users</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Total Submissions:</span>
                          <span className={`font-black ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                            {dashboardData?.kyc?.total || 0} documents
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`px-6 py-3.5 border-t text-xs flex items-center justify-between font-bold ${isLight ? 'bg-slate-50/90 border-slate-200/80 text-slate-600' : 'bg-[#040C16]/90 border-white/5 text-slate-300'
                      }`}>
                      <span>Standard: RMI & AML Policy</span>
                      <span className="text-purple-600 dark:text-purple-400 font-black">Lazy Load Images</span>
                    </div>
                  </div>

                  {/* ── CARD 6: FLEET ASSETS CAPITAL (AMBER / GOLD THEME) ── */}
                  <div className={`rounded-3xl border-2 flex flex-col justify-between transition-all duration-300 overflow-hidden group hover:scale-[1.01] ${isLight
                      ? 'bg-white border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] hover:border-amber-300'
                      : 'bg-gradient-to-b from-[#091C2E]/95 via-[#081726]/95 to-[#06111D]/95 border-white/10 hover:border-amber-500/40 shadow-[0_14px_45px_rgba(0,0,0,0.65)] hover:shadow-[0_20px_55px_rgba(0,0,0,0.75)] backdrop-blur-xl'
                    }`}>
                    {/* Top Vibrant Accent Bar */}
                    <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600" />

                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform">
                            <Car className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Fleet Assets Capital</h4>
                            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Vehicle Yield Allocations</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('plans')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer border shadow-xs ${isLight
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                            }`}
                        >
                          Plans ({plans.length}) <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <div className={`text-3xl sm:text-4xl font-black font-['Outfit',sans-serif] tracking-tight ${isLight ? 'text-amber-700' : 'text-amber-400'
                          }`}>
                          ${Number(dashboardData?.balances?.totalInvestedCapital || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          Total capital active across corporate mobility fleets
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Total User Balances Held:</span>
                          <span className="font-black text-amber-600 dark:text-amber-400">
                            ${Number(dashboardData?.balances?.totalUserBalances || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Daily Yield Outflow Rate:</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400">
                            ${Number(dashboardData?.balances?.dailyRewardOutflow || 0).toFixed(2)} / day
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`px-6 py-3.5 border-t text-xs flex items-center justify-between font-bold ${isLight ? 'bg-slate-50/90 border-slate-200/80 text-slate-600' : 'bg-[#040C16]/90 border-white/5 text-slate-300'
                      }`}>
                      <span>Active Contracts: {dashboardData?.balances?.activeInvestmentsCount || 0}</span>
                      <span className="text-amber-600 dark:text-amber-400 font-black">Automated Daily Distribution</span>
                    </div>
                  </div>

                </div>

                {/* ── 4. LEADERBOARD & ACTION TILES ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">

                  {/* ── TOP REFERRERS LEADERBOARD ── */}
                  <div className={`p-6 sm:p-7 rounded-3xl border-2 transition-all ${isLight
                      ? 'bg-white border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04)]'
                      : 'bg-[#091A2E]/95 border-white/10 shadow-[0_14px_45px_rgba(0,0,0,0.6)] backdrop-blur-xl'
                    }`}>
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/80 dark:border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            Top Affiliate Growth Partners
                          </h3>
                          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Ranked by commission earnings</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full border shadow-xs uppercase tracking-wider ${isLight ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-white/5 text-slate-300 border-white/10'
                        }`}>
                        5% Referral Engine
                      </span>
                    </div>

                    {(!dashboardData?.referrals?.topReferrers || dashboardData.referrals.topReferrers.length === 0) ? (
                      <div className="p-12 text-center text-xs text-slate-400 font-medium">
                        No referral commission records generated yet. Users will appear here once deposits via referral links are approved.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dashboardData.referrals.topReferrers.map((ref: any, idx: number) => (
                          <div
                            key={ref.id}
                            className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all hover:scale-[1.01] ${isLight
                                ? 'bg-slate-50/90 border-slate-200/80 hover:bg-white hover:border-amber-300 hover:shadow-sm'
                                : 'bg-[#071322] border-white/5 hover:border-amber-500/30'
                              }`}
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm ${idx === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black ring-2 ring-amber-400/50' :
                                  idx === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 font-bold ring-2 ring-slate-300/50' :
                                    idx === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white font-bold ring-2 ring-amber-700/50' :
                                      isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-slate-300'
                                }`}>
                                #{idx + 1}
                              </div>
                              <div className="min-w-0">
                                <div className={`text-xs font-black truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                  {ref.name || 'Member'}
                                </div>
                                <div className={`text-[10px] truncate font-mono mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                  {ref.email} · {ref.rewardsCount} commission payouts
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 font-['Outfit',sans-serif]">
                                +${Number(ref.totalEarned).toFixed(2)}
                              </div>
                              <div className={`text-[10px] font-semibold mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                Vol: ${Number(ref.volumeGenerated).toFixed(0)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── QUICK ACTIONS & OPERATIONAL HUB ── */}
                  <div className={`p-6 sm:p-7 rounded-3xl border-2 flex flex-col justify-between transition-all ${isLight
                      ? 'bg-white border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04)]'
                      : 'bg-[#091A2E]/95 border-white/10 shadow-[0_14px_45px_rgba(0,0,0,0.6)] backdrop-blur-xl'
                    }`}>
                    <div>
                      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/80 dark:border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
                            <Activity className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                              Operational Action Center
                            </h3>
                            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Direct queue navigation</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 uppercase tracking-wider">
                          System Normal
                        </span>
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={() => setActiveTab('alldeposits')}
                          className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${(dashboardData?.deposits?.pendingCount || 0) > 0
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 shadow-xs'
                              : isLight ? 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                            }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                              <ArrowDownCircle className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-xs font-black">Review Pending Deposits</div>
                              <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Verify user bank/wallet transaction slips</div>
                            </div>
                          </div>
                          <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500 text-slate-950 border border-amber-400 shadow-xs">
                            {dashboardData?.deposits?.pendingCount || 0} Pending
                          </span>
                        </button>

                        <button
                          onClick={() => setActiveTab('allwithdrawals')}
                          className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${(dashboardData?.withdrawals?.pendingCount || 0) > 0
                              ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 shadow-xs'
                              : isLight ? 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                            }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                              <ArrowUpCircle className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-xs font-black">Process Withdrawal Queue</div>
                              <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Approve & settle user payout requests</div>
                            </div>
                          </div>
                          <span className="text-xs font-black px-3 py-1 rounded-full bg-rose-500 text-white border border-rose-400 shadow-xs">
                            {dashboardData?.withdrawals?.pendingCount || 0} Pending
                          </span>
                        </button>

                        <button
                          onClick={() => setActiveTab('kyc')}
                          className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${(dashboardData?.kyc?.pending || 0) > 0
                              ? 'bg-purple-500/15 border-purple-500/40 text-purple-600 dark:text-purple-400 hover:bg-purple-500/25 shadow-xs'
                              : isLight ? 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                            }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-xs font-black">KYC Identity Documents Review</div>
                              <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Lazy load photo IDs and live selfies</div>
                            </div>
                          </div>
                          <span className="text-xs font-black px-3 py-1 rounded-full bg-purple-500 text-white border border-purple-400 shadow-xs">
                            {dashboardData?.kyc?.pending || 0} In Review
                          </span>
                        </button>

                        <button
                          onClick={() => setActiveTab('support')}
                          className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                            }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
                              <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-xs font-black">Client Support Inquiries</div>
                              <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Respond to user tickets & unlock cases</div>
                            </div>
                          </div>
                          <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-500/20 text-blue-500 border border-blue-500/30">
                            {dashboardData?.system?.openTickets || 0} Open
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 mt-5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono font-bold">Admin Level: Tier-3 Master</span>
                      <button
                        onClick={() => setActiveTab('reports')}
                        className="text-xs font-black text-amber-500 hover:text-amber-400 flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        Generate Financial Audit CSV →
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB: AUDIT & ANALYTICAL REPORTS (DOWNLOADABLE CSV & PRINT)    */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'reports' && (
              <div className="space-y-5">
                {/* Reports Header & Filter Control Panel */}
                <div className={`p-5 sm:p-6 rounded-3xl border ${isLight ? 'bg-white border-slate-200 shadow-md' : 'bg-[#091A2E] border-white/10'
                  }`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                          Executive Audit
                        </span>
                        <span className="text-xs text-slate-400">Admin Clearance Only</span>
                      </div>
                      <h3 className={`text-xl font-black mt-1 font-['Outfit',sans-serif] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Analytical & Financial Reports Generator
                      </h3>
                      <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Filter platform transactions, deposits, withdrawals, affiliate payouts, KYC verifications, and fleet investments. Export clean CSVs or print official summaries.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        onClick={handleExportReportCSV}
                        disabled={!reportsData || !reportsData.records || reportsData.records.length === 0}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5 text-white" />
                        Export CSV
                      </button>
                      <button
                        onClick={() => window.print()}
                        className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                          }`}
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print
                      </button>
                      <button
                        onClick={() => fetchReportsData(reportCategory, reportRange)}
                        disabled={reportsLoading}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                          }`}
                        title="Reload report"
                      >
                        <RefreshCw className={`w-4 h-4 ${reportsLoading ? 'animate-spin text-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Filter Selectors Bar */}
                  <div className="pt-4 space-y-4">
                    {/* Category Pills */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Report Category:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'all', label: '📊 All Consolidated' },
                          { id: 'financial', label: '💵 Financial P&L' },
                          { id: 'deposits', label: '💰 Deposits' },
                          { id: 'withdrawals', label: '📤 Withdrawals' },
                          { id: 'referrals', label: '🔗 Referral Links' },
                          { id: 'users', label: '👥 User Signups' },
                          { id: 'kyc', label: '🪪 KYC Compliance' },
                          { id: 'investments', label: '🚗 Fleet Investments' },
                        ].map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setReportCategory(cat.id);
                              setReportPage(1);
                              fetchReportsData(cat.id, reportRange);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${reportCategory === cat.id
                                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm font-black'
                                : isLight
                                  ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                              }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date Range Selector */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Timeframe Filter:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { id: 'today', label: 'Today' },
                            { id: '7days', label: 'Last 7 Days' },
                            { id: '30days', label: 'Last 30 Days' },
                            { id: 'this_month', label: 'This Month' },
                            { id: 'all', label: 'All Time' },
                            { id: 'custom', label: 'Custom Range' },
                          ].map(r => (
                            <button
                              key={r.id}
                              onClick={() => {
                                setReportRange(r.id);
                                setReportPage(1);
                                if (r.id !== 'custom') {
                                  fetchReportsData(reportCategory, r.id);
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${reportRange === r.id
                                  ? 'bg-blue-600 text-white border-blue-500 font-bold'
                                  : isLight
                                    ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                                }`}
                            >
                              {r.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Date Pickers */}
                      {reportRange === 'custom' && (
                        <div className="flex items-center gap-2 pt-2 sm:pt-0">
                          <input
                            type="date"
                            value={reportCustomStart}
                            onChange={e => setReportCustomStart(e.target.value)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs border outline-none ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#071322] border-white/10 text-white'
                              }`}
                          />
                          <span className="text-xs text-slate-400">to</span>
                          <input
                            type="date"
                            value={reportCustomEnd}
                            onChange={e => setReportCustomEnd(e.target.value)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs border outline-none ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#071322] border-white/10 text-white'
                              }`}
                          />
                          <button
                            onClick={() => {
                              setReportPage(1);
                              fetchReportsData(reportCategory, 'custom', reportCustomStart, reportCustomEnd);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ─── LIVE SUMMARY BANNER FOR FILTERED TIMEFRAME ─── */}
                {reportsData?.summary && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#091A2E] border-white/10'
                      }`}>
                      <div className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Filtered Deposits</div>
                      <div className="text-xl font-black text-emerald-600 dark:text-emerald-500 font-['Outfit',sans-serif] mt-0.5">
                        ${Number(reportsData.summary.totalDeposits || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Approved capital ingress</div>
                    </div>

                    <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#091A2E] border-white/10'
                      }`}>
                      <div className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Filtered Withdrawals</div>
                      <div className="text-xl font-black text-rose-600 dark:text-rose-500 font-['Outfit',sans-serif] mt-0.5">
                        ${Number(reportsData.summary.totalWithdrawals || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Completed member payouts</div>
                    </div>

                    <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#091A2E] border-white/10'
                      }`}>
                      <div className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Net Range Cashflow</div>
                      <div className={`text-xl font-black font-['Outfit',sans-serif] mt-0.5 ${Number(reportsData.summary.netCashflow || 0) >= 0 ? isLight ? 'text-emerald-600' : 'text-emerald-400' : isLight ? 'text-rose-600' : 'text-rose-400'
                        }`}>
                        ${Number(reportsData.summary.netCashflow || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {reportsData.summary.isProfit ? 'Operating Profit' : 'Operating Deficit'}
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#091A2E] border-white/10'
                      }`}>
                      <div className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Referral Commissions</div>
                      <div className={`text-xl font-black font-['Outfit',sans-serif] mt-0.5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                        ${Number(reportsData.summary.totalCommissions || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Total affiliate payouts</div>
                    </div>
                  </div>
                )}

                {/* ─── DATA TABLE WITH CLIENT-SIDE SEARCH ─── */}
                <div className={`rounded-3xl overflow-hidden border ${isLight ? 'bg-white border-slate-200 shadow-md' : 'bg-[#091A2E] border-white/10'
                  }`}>
                  {/* Table Search Bar */}
                  <div className="p-4 border-b border-slate-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Filter records by user, email, reference, method..."
                        value={reportSearchQuery}
                        onChange={e => {
                          setReportSearchQuery(e.target.value);
                          setReportPage(1);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs border outline-none w-72 ${isLight ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400' : 'bg-[#071322] border-white/10 text-white placeholder:text-slate-500'
                          }`}
                      />
                      {reportSearchQuery && (
                        <button
                          onClick={() => {
                            setReportSearchQuery('');
                            setReportPage(1);
                          }}
                          className="text-xs text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="text-xs text-slate-400">
                      Showing <strong>{filteredReportRecords.length === 0 ? 0 : (safeReportPage - 1) * reportPageSize + 1}–{Math.min(safeReportPage * reportPageSize, filteredReportRecords.length)}</strong> of <strong>{filteredReportRecords.length}</strong> records
                      {totalReportPages > 1 && (
                        <span className="ml-1.5 font-semibold text-blue-600 dark:text-sky-400">
                          (Page {safeReportPage} of {totalReportPages})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Table Content */}
                  <div className="overflow-x-auto">
                    {reportsLoading ? (
                      <div className="p-12 text-center text-sm text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-500" />
                        Generating audit report records from PostgreSQL...
                      </div>
                    ) : (!reportsData?.records || reportsData.records.length === 0) ? (
                      <div className="p-12 text-center text-sm text-slate-400">
                        No records found for the selected category and date range.
                      </div>
                    ) : (
                      <table className="w-full min-w-[900px] text-xs">
                        <thead>
                          <tr className={isLight ? 'bg-slate-50 border-b border-slate-200' : 'bg-[#0D1F30] border-b border-white/10'}>
                            {['Date & Time', 'Category', 'User / Account', 'Type / Method', 'Gross ($)', 'Fee ($)', 'Net Amount ($)', 'Reference', 'Status', 'Audit Details'].map(h => (
                              <th key={h} className={`px-4 py-3 text-left font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'
                                }`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedReportRecords.map((r: any, idx: number) => (
                            <tr
                              key={r.id + '-' + idx}
                              className={`border-b transition-colors ${isLight
                                  ? idx % 2 === 0 ? 'bg-white hover:bg-slate-50 border-slate-100' : 'bg-slate-50/50 hover:bg-slate-100 border-slate-100'
                                  : idx % 2 === 0 ? 'bg-[#091A2E] hover:bg-[#0D1F30] border-white/5' : 'bg-[#0A1929] hover:bg-[#0D1F30] border-white/5'
                                }`}
                            >
                              <td className={`px-4 py-3 font-mono text-[11px] whitespace-nowrap ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                {new Date(r.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </td>

                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                  r.category === 'Deposit'
                                    ? isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : r.category === 'Withdrawal'
                                    ? isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    : r.category === 'Referral'
                                    ? isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                    : r.category === 'KYC Verification'
                                    ? isLight ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                    : r.category === 'Fleet Investment'
                                    ? isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                }`}>
                                  {r.category}
                                </span>
                              </td>

                              <td className="px-4 py-3">
                                <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{r.user}</div>
                                <div className={`text-[10px] font-mono truncate max-w-[160px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{r.email}</div>
                              </td>

                              <td className={`px-4 py-3 font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                                {r.type}
                              </td>

                              <td className={`px-4 py-3 font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                {r.amount > 0 ? `$${Number(r.amount).toFixed(2)}` : '—'}
                              </td>

                              <td className={`px-4 py-3 font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                {r.fee > 0 ? `$${Number(r.fee).toFixed(2)}` : '$0.00'}
                              </td>

                              <td className={`px-4 py-3 font-mono font-black ${
                                r.category === 'Deposit'
                                  ? isLight ? 'text-emerald-700' : 'text-emerald-400'
                                  : r.category === 'Withdrawal'
                                  ? isLight ? 'text-rose-700' : 'text-rose-400'
                                  : r.category === 'Referral'
                                  ? isLight ? 'text-indigo-700' : 'text-indigo-400'
                                  : isLight ? 'text-slate-900' : 'text-slate-200'
                              }`}>
                                {r.net > 0 ? `$${Number(r.net).toFixed(2)}` : '—'}
                              </td>

                              <td className={`px-4 py-3 font-mono text-[10px] truncate max-w-[120px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                {r.reference}
                              </td>

                              <td className="px-4 py-3">
                                <span className={statusBadge(r.status || 'Completed')}>
                                  {r.status || 'Completed'}
                                </span>
                              </td>

                              <td className={`px-4 py-3 text-[11px] max-w-[200px] truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`} title={r.details}>
                                {r.details || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Table Pagination Controls */}
                  <div className={`p-3.5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#091A2E] border-white/10'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Per page:
                      </span>
                      <div className="flex items-center gap-1">
                        {[10, 25, 50].map((size) => (
                          <button
                            key={size}
                            onClick={() => {
                              setReportPageSize(size);
                              setReportPage(1);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              reportPageSize === size
                                ? 'bg-blue-600 text-white shadow-xs'
                                : isLight
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                : 'bg-white/5 hover:bg-white/10 text-slate-300'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      <span className={`text-[11px] ml-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {filteredReportRecords.length === 0 ? '0 records' : `Showing ${(safeReportPage - 1) * reportPageSize + 1}–${Math.min(safeReportPage * reportPageSize, filteredReportRecords.length)} of ${filteredReportRecords.length}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={safeReportPage <= 1}
                        onClick={() => setReportPage((p) => Math.max(1, p - 1))}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                          isLight
                            ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                        }`}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>

                      <div className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-700'
                          : 'bg-[#06121E] border-white/10 text-slate-300'
                      }`}>
                        Page {safeReportPage} of {totalReportPages}
                      </div>

                      <button
                        disabled={safeReportPage >= totalReportPages}
                        onClick={() => setReportPage((p) => Math.min(totalReportPages, p + 1))}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                          isLight
                            ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                        }`}
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Table Footer */}
                  <div className="p-3 border-t border-slate-100 dark:border-white/5 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Report Generated: {reportsData?.generatedAt ? new Date(reportsData.generatedAt).toLocaleString() : 'Live'}</span>
                    <span>RentoBit Financial Audit Desk · AES-256 Secured</span>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB: ALL USERS MANAGEMENT                                    */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                {/* Header + Search */}
                <div className={`p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isLight ? 'bg-white border border-slate-200 shadow-md' : 'bg-[#091A2E] border border-white/10'
                  }`}>
                  <div>
                    <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>All Registered Users</h3>
                    <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {allUsers.length} users in system · Showing page {safeUsersPage} of {totalUsersPages}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search name, email, phone..."
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          setUsersPage(1);
                          fetchAllUsers(userSearch);
                        }
                      }}
                      className={`px-3 py-2 rounded-xl text-xs border outline-none w-56 ${isLight ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400' : 'bg-[#07121E] border-white/10 text-white placeholder:text-slate-500'
                        }`}
                    />
                    <button
                      onClick={() => {
                        setUsersPage(1);
                        fetchAllUsers(userSearch);
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                    >
                      Search
                    </button>
                    <button
                      onClick={() => {
                        setUserSearch('');
                        setUsersPage(1);
                        fetchAllUsers('');
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-[#0D1F30] border-white/10 text-slate-300'
                        }`}
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Users Table */}
                <div className={`rounded-2xl overflow-hidden border ${isLight ? 'border-slate-200 shadow-md' : 'border-white/10'
                  }`}>
                  <div className="overflow-x-auto">
                    {usersLoading ? (
                      <div className={`p-8 text-center text-sm ${isLight ? 'text-slate-500 bg-white' : 'text-slate-400 bg-[#091A2E]'}`}>Loading users...</div>
                    ) : allUsers.length === 0 ? (
                      <div className={`p-8 text-center text-sm ${isLight ? 'text-slate-400 bg-white' : 'text-slate-500 bg-[#091A2E]'}`}>
                        No users found. Register some accounts first.
                      </div>
                    ) : (
                      <table className="w-full min-w-[800px] text-xs">
                        <thead>
                          <tr className={isLight ? 'bg-slate-50 border-b border-slate-200' : 'bg-[#0D1F30] border-b border-white/10'}>
                            {['User', 'Email', 'Phone', 'KYC', 'Advance KYC', 'Status', 'Balance', 'Invested', 'Registered', 'Actions'].map(h => (
                              <th key={h} className={`px-4 py-3 text-left font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'
                                }`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedUsers.map((u, i) => (
                            <tr
                              key={u.id}
                              className={`border-b transition-colors ${isLight
                                  ? i % 2 === 0 ? 'bg-white hover:bg-slate-50 border-slate-100' : 'bg-slate-50/50 hover:bg-slate-100 border-slate-100'
                                  : i % 2 === 0 ? 'bg-[#091A2E] hover:bg-[#0D1F30] border-white/5' : 'bg-[#0A1929] hover:bg-[#0D1F30] border-white/5'
                                }`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-[11px] flex-shrink-0">
                                    {(u.name || 'U')[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{u.name}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">{u.id?.slice(-8)}</div>
                                  </div>
                                </div>
                              </td>
                              <td className={`px-4 py-3 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{u.email}</td>
                              <td className={`px-4 py-3 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{u.phone || '—'}</td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAdminKycSearch(u.email || u.id);
                                    setActiveTab('kyc');
                                    setExpandedKycId(u.id);
                                  }}
                                  className="cursor-pointer group inline-flex items-center gap-1 text-left"
                                  title="Click to search and review this user's KYC"
                                >
                                  <span className={`${statusBadge(u.kycStatus || 'Not Started')} group-hover:ring-2 group-hover:ring-blue-500/30 transition-all`}>
                                    {u.kycStatus || 'Not Started'}
                                  </span>
                                  <Search className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  disabled={togglingAdvanceKycId === u.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleAdvanceKyc(u.id, !!u.advanceKycAllowed);
                                  }}
                                  className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 cursor-pointer border ${u.advanceKycAllowed
                                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                                      : isLight
                                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                                        : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/10'
                                    }`}
                                  title={u.advanceKycAllowed ? 'Advance KYC Authorized (Click to Revoke)' : 'Click to Authorize Advance KYC (ID & Selfie)'}
                                >
                                  {u.advanceKycAllowed ? (
                                    <>
                                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                      <span>Allowed</span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="w-3 h-3 text-slate-400" />
                                      <span>Locked</span>
                                    </>
                                  )}
                                </button>
                              </td>
                              <td className="px-4 py-3"><span className={statusBadge(u.status || 'Active')}>{u.status || 'Active'}</span></td>
                              <td className={`px-4 py-3 font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                                ${(u.balance?.totalBalance || 0).toFixed(2)}
                              </td>
                              <td className={`px-4 py-3 font-bold ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>
                                ${(u.balance?.totalInvested || 0).toFixed(2)}
                              </td>
                              <td className={`px-4 py-3 text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => openUserDetail(u)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] cursor-pointer transition-colors"
                                >
                                  Manage
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Users Table Pagination Bar */}
                  <div className={`p-3.5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#091A2E] border-white/10'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Per page:
                      </span>
                      <div className="flex items-center gap-1">
                        {[10, 25, 50].map((size) => (
                          <button
                            key={size}
                            onClick={() => {
                              setUsersPageSize(size);
                              setUsersPage(1);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              usersPageSize === size
                                ? 'bg-blue-600 text-white shadow-xs'
                                : isLight
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                : 'bg-white/5 hover:bg-white/10 text-slate-300'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      <span className={`text-[11px] ml-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {allUsers.length === 0 ? '0 users' : `Showing ${(safeUsersPage - 1) * usersPageSize + 1}–${Math.min(safeUsersPage * usersPageSize, allUsers.length)} of ${allUsers.length} users`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={safeUsersPage <= 1}
                        onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                          isLight
                            ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                        }`}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>

                      <div className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-700'
                          : 'bg-[#06121E] border-white/10 text-slate-300'
                      }`}>
                        Page {safeUsersPage} of {totalUsersPages}
                      </div>

                      <button
                        disabled={safeUsersPage >= totalUsersPages}
                        onClick={() => setUsersPage((p) => Math.min(totalUsersPages, p + 1))}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                          isLight
                            ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                        }`}
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── User Detail Modal ────────────────────────────────── */}
                {selectedUser && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.6)' }}>
                    <div className={`w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl ${isLight ? 'bg-white border border-slate-200' : 'bg-[#0D1A26] border border-white/10'
                      }`}>
                      {/* Modal Header */}
                      <div className={`sticky top-0 z-10 p-5 border-b flex items-center justify-between ${isLight ? 'bg-white border-slate-200' : 'bg-[#0D1A26] border-white/10'
                        }`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black">
                            {(selectedUser.name || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <h3 className={`font-black text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedUser.name}</h3>
                            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{selectedUser.email} · {selectedUser.id}</p>
                          </div>
                        </div>
                        <button onClick={() => setSelectedUser(null)} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center cursor-pointer hover:bg-slate-300">
                          <X size={14} className={isLight ? 'text-slate-600' : 'text-white'} />
                        </button>
                      </div>

                      {userModalLoading ? (
                        <div className="p-10 text-center text-sm text-slate-400">Loading user data...</div>
                      ) : (
                        <div className="p-5 space-y-5">
                          {/* Sub-tabs */}
                          <div className="flex gap-2 overflow-x-auto">
                            {(['overview', 'deposits', 'withdrawals', 'investments', 'claims'] as const).map(t => (
                              <button key={t} onClick={() => setUserModalTab(t)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap cursor-pointer transition-colors ${userModalTab === t ? 'bg-blue-600 text-white' : isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                                  }`}>
                                {t === 'claims' ? 'Daily Claims' : t} {t === 'deposits' ? `(${userDeposits.length})` : t === 'withdrawals' ? `(${userWithdrawals.length})` : t === 'investments' ? `(${userInvestments.length})` : t === 'claims' ? `(${userRewards.length})` : ''}
                              </button>
                            ))}
                          </div>

                          {/* OVERVIEW TAB */}
                          {userModalTab === 'overview' && (
                            <div className="space-y-4">
                              {/* Balance Cards */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                  { label: 'Total Balance', val: selectedUser.balance?.totalBalance, color: 'text-emerald-600' },
                                  { label: 'Available', val: selectedUser.balance?.availableBalance, color: 'text-blue-600' },
                                  { label: 'Invested', val: selectedUser.balance?.totalInvested, color: 'text-purple-600' },
                                  { label: 'Today Reward', val: selectedUser.balance?.todayReward, color: 'text-amber-600' },
                                ].map(c => (
                                  <div key={c.label} className={`p-3 rounded-2xl ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-white/5 border border-white/10'
                                    }`}>
                                    <p className={`text-[10px] font-semibold uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{c.label}</p>
                                    <p className={`text-lg font-black mt-0.5 ${c.color}`}>${(c.val || 0).toFixed(2)}</p>
                                  </div>
                                ))}
                              </div>

                              {/* User Info */}
                              <div className={`p-4 rounded-2xl space-y-2 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-white/5 border border-white/10'
                                }`}>
                                <h4 className={`text-xs font-black uppercase ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Profile Info</h4>
                                {[
                                  ['Name', selectedUser.name],
                                  ['Email', selectedUser.email],
                                  ['Phone', selectedUser.phone || '—'],
                                  ['Role', selectedUser.role],
                                  ['Referral Code', selectedUser.referralCode || '—'],
                                  ['Registered', selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : '—'],
                                ].map(([k, v]) => (
                                  <div key={k} className="flex items-center justify-between py-1 border-b border-slate-200/40">
                                    <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{k}</span>
                                    <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{v}</span>
                                  </div>
                                ))}
                                <div className="flex items-center justify-between py-1 border-b border-slate-200/40">
                                  <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>KYC Status</span>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{selectedUser.kycStatus || 'Not Started'}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setAdminKycSearch(selectedUser.email || selectedUser.id);
                                        setActiveTab('kyc');
                                        setExpandedKycId(selectedUser.id);
                                        setSelectedUser(null);
                                      }}
                                      className="text-[10px] text-blue-500 hover:text-blue-600 underline font-bold cursor-pointer"
                                    >
                                      View KYC 🪪
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Account Controls */}
                              <div className={`p-4 rounded-2xl space-y-4 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-white/5 border border-white/10'
                                }`}>
                                <h4 className={`text-xs font-black uppercase ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Account Controls</h4>

                                {/* Freeze/Unfreeze */}
                                <div className="flex flex-wrap gap-2">
                                  <span className={`text-xs font-semibold self-center ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Account Status:</span>
                                  <span className={statusBadge(selectedUser.status || 'Active')}>{selectedUser.status || 'Active'}</span>
                                  {selectedUser.status === 'Active' ? (
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleToggleFreeze('Suspended')}
                                      className="px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                                    >
                                      🔒 Freeze Account
                                    </button>
                                  ) : (
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleToggleFreeze('Active')}
                                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                                    >
                                      🔓 Unfreeze Account
                                    </button>
                                  )}
                                </div>

                                {/* Advance KYC Authorization Toggle */}
                                <div className={`p-3.5 rounded-2xl border space-y-2.5 ${isLight ? 'bg-white border-slate-200' : 'bg-black/20 border-white/5'
                                  }`}>
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className={`text-xs font-black uppercase ${isLight ? 'text-slate-800' : 'text-slate-200'} flex items-center gap-1.5`}>
                                        <ShieldCheck className="w-4 h-4 text-blue-500" />
                                        <span>Advance KYC (ID &amp; Selfie Uploads)</span>
                                      </span>
                                      <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} block mt-0.5`}>
                                        Authorize user to submit Tier 2 identity documents and live face verification.
                                      </span>
                                    </div>
                                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${selectedUser.advanceKycAllowed
                                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                      }`}>
                                      {selectedUser.advanceKycAllowed ? '✓ Authorized' : '🔒 Locked (Tier 1 Only)'}
                                    </span>
                                  </div>

                                  <div>
                                    {selectedUser.advanceKycAllowed ? (
                                      <button
                                        type="button"
                                        disabled={togglingAdvanceKycId === selectedUser.id}
                                        onClick={() => handleToggleAdvanceKyc(selectedUser.id, true)}
                                        className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                                      >
                                        <Lock className="w-3.5 h-3.5" />
                                        <span>{togglingAdvanceKycId === selectedUser.id ? 'Updating...' : 'Revoke Advance KYC Access'}</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        disabled={togglingAdvanceKycId === selectedUser.id}
                                        onClick={() => handleToggleAdvanceKyc(selectedUser.id, false)}
                                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                                      >
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>{togglingAdvanceKycId === selectedUser.id ? 'Updating...' : 'Allow Advance KYC (ID & Selfie)'}</span>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Change Password */}
                                <div className="space-y-2">
                                  <p className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Change Password</p>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="New password (min 6 chars)"
                                      value={newPassword}
                                      onChange={e => setNewPassword(e.target.value)}
                                      className={`flex-1 px-3 py-2 rounded-xl text-xs border outline-none ${isLight ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400' : 'bg-[#07121E] border-white/10 text-white placeholder:text-slate-500'
                                        }`}
                                    />
                                    <button
                                      disabled={actionLoading || newPassword.length < 6}
                                      onClick={handleChangePassword}
                                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>

                                {/* Balance Adjust */}
                                <div className="space-y-2">
                                  <p className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Manual Balance Adjustment</p>
                                  <div className="flex gap-2 flex-wrap">
                                    <select
                                      value={balAdjType}
                                      onChange={e => setBalAdjType(e.target.value as 'credit' | 'debit')}
                                      className={`px-3 py-2 rounded-xl text-xs border outline-none cursor-pointer ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#07121E] border-white/10 text-white'
                                        }`}
                                    >
                                      <option value="credit">💚 Credit (Add)</option>
                                      <option value="debit">🔴 Debit (Deduct)</option>
                                    </select>
                                    <input
                                      type="number"
                                      placeholder="Amount ($)"
                                      value={balAdjAmount}
                                      onChange={e => setBalAdjAmount(e.target.value)}
                                      className={`w-28 px-3 py-2 rounded-xl text-xs border outline-none ${isLight ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400' : 'bg-[#07121E] border-white/10 text-white placeholder:text-slate-500'
                                        }`}
                                    />
                                    <input
                                      type="text"
                                      placeholder="Note (optional)"
                                      value={balAdjNote}
                                      onChange={e => setBalAdjNote(e.target.value)}
                                      className={`flex-1 min-w-[120px] px-3 py-2 rounded-xl text-xs border outline-none ${isLight ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400' : 'bg-[#07121E] border-white/10 text-white placeholder:text-slate-500'
                                        }`}
                                    />
                                    <button
                                      disabled={actionLoading || !balAdjAmount}
                                      onClick={handleBalanceAdjust}
                                      className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer disabled:opacity-50 text-white ${balAdjType === 'credit' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'
                                        }`}
                                    >
                                      {balAdjType === 'credit' ? 'Credit' : 'Debit'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* DEPOSITS TAB */}
                          {userModalTab === 'deposits' && (
                            <div className="space-y-2">
                              <h4 className={`text-xs font-black uppercase ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Deposit History ({userDeposits.length})</h4>
                              {userDeposits.length === 0 ? (
                                <p className={`text-xs py-6 text-center ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>No deposits found</p>
                              ) : userDeposits.map(dep => (
                                <div key={dep.id} className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center gap-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
                                  }`}>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className={`font-black text-sm ${dep.status === 'Pending' ? (isLight ? 'text-red-600' : 'text-red-400') : (isLight ? 'text-slate-900' : 'text-white')}`}>${dep.amount?.toFixed(2)}</span>
                                      <span className={statusBadge(dep.status)}>{dep.status}</span>
                                    </div>
                                    <div className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                      {dep.paymentMethod} · Ref: {dep.reference} · {dep.createdAt ? new Date(dep.createdAt).toLocaleString() : ''}
                                    </div>
                                    {dep.rejectionReason && <div className="text-[10px] text-red-500 mt-0.5">Reason: {dep.rejectionReason}</div>}
                                    {(dep.hasProof || dep.proofUrl) && (
                                      <button
                                        type="button"
                                        disabled={loadingProofId === dep.id}
                                        onClick={() => handleViewDepositProof(dep.id, dep.proofUrl)}
                                        className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/25 transition-all text-[11px] font-bold cursor-pointer group"
                                        title="Click to load and inspect payment screenshot"
                                      >
                                        {loadingProofId === dep.id ? (
                                          <>
                                            <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
                                            <span>Loading Slip...</span>
                                          </>
                                        ) : (
                                          <>
                                            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                                            <span>📸 View Payment Screenshot</span>
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                  {dep.status === 'Pending' && (
                                    <div className="flex gap-2">
                                      <button
                                        disabled={actionLoading}
                                        onClick={() => handleDepAction(dep.id, 'approve')}
                                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] cursor-pointer disabled:opacity-50"
                                      >
                                        ✓ Approve
                                      </button>
                                      <button
                                        disabled={actionLoading}
                                        onClick={() => { const r = prompt('Rejection reason:'); if (r !== null) handleDepAction(dep.id, 'reject', r); }}
                                        className="px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] cursor-pointer disabled:opacity-50"
                                      >
                                        ✗ Reject
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* WITHDRAWALS TAB */}
                          {userModalTab === 'withdrawals' && (
                            <div className="space-y-2">
                              <h4 className={`text-xs font-black uppercase ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Withdrawal History ({userWithdrawals.length})</h4>
                              {userWithdrawals.length === 0 ? (
                                <p className={`text-xs py-6 text-center ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>No withdrawals found</p>
                              ) : userWithdrawals.map(wth => (
                                <div key={wth.id} className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center gap-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
                                  }`}>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`font-black text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>${wth.amount?.toFixed(2)}</span>
                                      <span className="text-[10px] font-bold text-slate-400">
                                        (Fee: ${(wth.fee ?? 1).toFixed(2)} · Net: ${(wth.netAmount ?? (wth.amount - (wth.fee ?? 1))).toFixed(2)})
                                      </span>
                                      <span className={statusBadge(wth.status)}>{wth.status}</span>
                                    </div>
                                    <div className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'} break-all`}>
                                      <span className="font-semibold text-blue-500">{wth.paymentMethod}</span> · To: <span className="font-mono">{wth.destinationDetails}</span> · {wth.createdAt ? new Date(wth.createdAt).toLocaleString() : ''}
                                    </div>
                                    {wth.status === 'Rejected' && (wth.rejectionReason || wth.adminComment) && (
                                      <div className="mt-1 text-[11px] font-semibold text-rose-500 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20">
                                        Rejection Reason: "{wth.rejectionReason || wth.adminComment}" (Refunded to Available Cash)
                                      </div>
                                    )}
                                    {wth.status === 'Completed' && wth.txHash && (
                                      <div className="mt-1 text-[10px] font-mono text-emerald-500 flex items-center gap-1">
                                        <span>TXID: {wth.txHash}</span>
                                      </div>
                                    )}
                                  </div>
                                  {wth.status === 'Pending' && (
                                    <div className="flex gap-2 shrink-0">
                                      <button
                                        disabled={actionLoading}
                                        onClick={() => {
                                          setWthApproveModalItem(wth);
                                          setWthApproveTxHash('');
                                          setWthApproveNote('Approved and processed via Blockchain');
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] cursor-pointer disabled:opacity-50"
                                      >
                                        ✓ Process
                                      </button>
                                      <button
                                        disabled={actionLoading}
                                        onClick={() => {
                                          setWthRejectModalItem(wth);
                                          setWthRejectReason('');
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] cursor-pointer disabled:opacity-50"
                                      >
                                        ✗ Reject
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* INVESTMENTS TAB */}
                          {userModalTab === 'investments' && (
                            <div className="space-y-2">
                              <h4 className={`text-xs font-black uppercase ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Active Investments ({userInvestments.length})</h4>
                              {userInvestments.length === 0 ? (
                                <p className={`text-xs py-6 text-center ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>No investments found</p>
                              ) : userInvestments.map(inv => (
                                <div key={inv.id} className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
                                  }`}>
                                  <div className="flex items-center justify-between">
                                    <span className={`font-black text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{inv.planName}</span>
                                    <span className={statusBadge(inv.status)}>{inv.status}</span>
                                  </div>
                                  <div className={`text-[10px] mt-1 grid grid-cols-3 gap-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                    <span>Invested: <strong className={isLight ? 'text-slate-800' : 'text-white'}>${inv.investedAmount?.toFixed(2)}</strong></span>
                                    <span>Daily: <strong className="text-emerald-500">${inv.dailyReward?.toFixed(2)}</strong></span>
                                    <span>Earned: <strong className="text-blue-500">${inv.totalEarned?.toFixed(2)}</strong></span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* CLAIMS & DAILY REWARDS TAB */}
                          {userModalTab === 'claims' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className={`text-xs font-black uppercase ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Daily Reward &amp; Claim History ({userRewards.length})</h4>
                                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Exact timestamp of user claims &amp; dispute tracking</span>
                              </div>
                              {userRewards.length === 0 ? (
                                <p className={`text-xs py-6 text-center ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>No daily rewards or claim records found</p>
                              ) : userRewards.map(rew => (
                                <div key={rew.id} className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
                                  }`}>
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className={`font-black text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{rew.planName}</span>
                                        <span className={statusBadge(rew.status)}>{rew.status}</span>
                                        <span className="text-xs font-mono font-bold text-emerald-500">${rew.netAmount?.toFixed(2)}</span>
                                      </div>
                                      <div className={`text-[10px] mt-1 flex flex-wrap items-center gap-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                        <span>Reward Date: <strong className={isLight ? 'text-slate-800' : 'text-white'}>{rew.date}</strong></span>
                                        <span>Window: {rew.claimWindowStart} - {rew.claimWindowEnd}</span>
                                      </div>
                                    </div>

                                    <div className="text-right sm:self-center">
                                      {rew.status === 'Claimed' ? (
                                        <div className="inline-flex flex-col items-start sm:items-end">
                                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                            Claimed on: {formatClaimDateTime(rew.claimedAt) || 'Yes'}
                                          </span>
                                          {rew.transactionId && (
                                            <span className="text-[10px] font-mono text-slate-400 mt-0.5">Ref: {rew.transactionId}</span>
                                          )}
                                        </div>
                                      ) : rew.status === 'Locked' ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-lg">
                                          <Lock className="w-3 h-3 text-red-500" />
                                          Window Missed (Locked)
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                                          <Clock className="w-3 h-3 text-amber-500" />
                                          Not Yet Claimed (Available)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB: DEPOSIT VERIFICATION (Admin Approval Central Trigger)    */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'alldeposits' && (
              <div className="space-y-5">
                {/* Header & Controls */}
                <div className={`p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isLight ? 'bg-white border border-slate-200 shadow-md' : 'bg-[#091A2E] border border-white/10'
                  }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                      <h3 className={`text-base sm:text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'} font-['Outfit',sans-serif]`}>
                        Deposit Verification Desk
                      </h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                        Authoritative Trigger
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Review user deposits, verify receipts, and credit funds directly to user Available Balance (+ 5% referral commission).
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                      <input
                        type="text"
                        placeholder="Search user, ID, ref..."
                        value={depSearchQuery}
                        onChange={(e) => setDepSearchQuery(e.target.value)}
                        className={`pl-8 pr-3 py-1.5 rounded-xl text-xs font-medium border outline-none w-44 sm:w-56 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500' : 'bg-white/5 border-white/10 text-white focus:border-blue-500'
                          }`}
                      />
                    </div>

                    <div className="flex gap-1">
                      {[
                        { id: 'all', label: 'All', count: adminAllDeposits.length },
                        { id: 'Pending', label: 'Pending', count: adminAllDeposits.filter(d => d.status === 'Pending').length },
                        { id: 'Approved', label: 'Approved', count: adminAllDeposits.filter(d => d.status === 'Approved').length },
                        { id: 'Rejected', label: 'Rejected', count: adminAllDeposits.filter(d => d.status === 'Rejected').length },
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => { setAdminDepFilter(f.id); fetchAdminDeposits(f.id); }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${adminDepFilter === f.id
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : isLight
                                ? 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600'
                                : 'bg-white/10 hover:bg-white/15 text-slate-300'
                            }`}
                        >
                          <span>{f.label}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">
                            {f.count}
                          </span>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => fetchAdminDeposits(adminDepFilter)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {/* Quick Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-amber-500/10 border-amber-500/20'}`}>
                    <div className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Pending Review</div>
                    <div className="text-xl font-black text-amber-700 dark:text-amber-300 font-['Outfit',sans-serif] mt-0.5">
                      {adminAllDeposits.filter(d => d.status === 'Pending').length}
                    </div>
                    <div className="text-[10px] text-amber-600/80 mt-0.5 font-medium">Awaiting admin verification</div>
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-blue-50/70 border-blue-200' : 'bg-blue-500/10 border-blue-500/20'}`}>
                    <div className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Pending Volume</div>
                    <div className="text-xl font-black text-blue-700 dark:text-blue-300 font-['Outfit',sans-serif] mt-0.5">
                      ${adminAllDeposits.filter(d => d.status === 'Pending').reduce((acc, d) => acc + (parseFloat(d.amount) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-blue-600/80 mt-0.5 font-medium">Uncredited capital</div>
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                    <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Approved Volume</div>
                    <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 font-['Outfit',sans-serif] mt-0.5">
                      ${adminAllDeposits.filter(d => d.status === 'Approved').reduce((acc, d) => acc + (parseFloat(d.amount) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-emerald-600/80 mt-0.5 font-medium">Active fleet capital</div>
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-purple-50/70 border-purple-200' : 'bg-purple-500/10 border-purple-500/20'}`}>
                    <div className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">Referral Commissions (5%)</div>
                    <div className="text-xl font-black text-purple-700 dark:text-purple-300 font-['Outfit',sans-serif] mt-0.5">
                      ${adminAllDeposits.filter(d => d.status === 'Approved').reduce((acc, d) => acc + ((parseFloat(d.amount) || 0) * 0.05), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-purple-600/80 mt-0.5 font-medium">Auto-credited upon approval</div>
                  </div>
                </div>

                {/* Verification Table */}
                <div className={`rounded-3xl overflow-hidden border shadow-sm ${isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-[#091A2E]'
                  }`}>
                  {adminDepositsLoading ? (
                    <div className="p-12 text-center text-sm text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                      Loading deposits for verification...
                    </div>
                  ) : adminAllDeposits.length === 0 ? (
                    <div className={`p-12 text-center text-sm ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                      No deposits found matching current filter.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[950px] text-xs">
                        <thead>
                          <tr className={isLight ? 'bg-slate-50 border-b border-slate-200 text-slate-500' : 'bg-[#0D1F30] border-b border-white/10 text-slate-400'}>
                            {['Deposit ID', 'User & Referrer', 'Deposit Destination', 'Amount', 'Method & Proof', 'Ref / TxID', 'Status', 'Submitted Date', 'Verification Action'].map(h => (
                              <th key={h} className="px-4 py-3.5 text-left font-bold uppercase tracking-wider text-[10px]">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {adminAllDeposits
                            .filter((dep) => {
                              if (!depSearchQuery.trim()) return true;
                              const q = depSearchQuery.toLowerCase();
                              return (
                                dep.id?.toLowerCase().includes(q) ||
                                dep.userName?.toLowerCase().includes(q) ||
                                dep.userEmail?.toLowerCase().includes(q) ||
                                dep.planName?.toLowerCase().includes(q) ||
                                dep.reference?.toLowerCase().includes(q) ||
                                dep.referrerName?.toLowerCase().includes(q)
                              );
                            })
                            .map((dep, i) => (
                              <tr
                                key={dep.id}
                                className={`transition-colors ${isLight
                                    ? i % 2 === 0 ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/40 hover:bg-slate-50/80'
                                    : i % 2 === 0 ? 'bg-[#091A2E] hover:bg-white/[0.03]' : 'bg-[#0A1929] hover:bg-white/[0.03]'
                                  }`}
                              >
                                {/* Deposit ID */}
                                <td className="px-4 py-3.5">
                                  <span className={`font-mono font-bold text-[11px] ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
                                    {dep.id}
                                  </span>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    UID: {dep.userId?.substring(0, 10)}...
                                  </div>
                                </td>

                                {/* User & Referrer */}
                                <td className="px-4 py-3.5">
                                  <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                    {dep.userName || 'Member'}
                                  </div>
                                  <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {dep.userEmail}
                                  </div>
                                  {dep.referrerId ? (
                                    <div className="mt-1 flex items-center gap-1 text-[10px] text-purple-500 dark:text-purple-400 font-semibold">
                                      <span>Ref: {dep.referrerName}</span>
                                      {dep.referrerCode && (
                                        <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-purple-500/10 border border-purple-500/20">
                                          {dep.referrerCode}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="mt-1 text-[10px] text-slate-400 italic">
                                      Direct Account (No Sponsor)
                                    </div>
                                  )}
                                </td>

                                {/* Destination */}
                                <td className="px-4 py-3.5">
                                  <div className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                                    Available Cash Balance
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold uppercase">
                                      WALLET CREDIT
                                    </span>
                                    <span className="text-[10px] text-sky-400 font-medium">
                                      User Chooses Plan
                                    </span>
                                  </div>
                                </td>

                                {/* Amount */}
                                <td className="px-4 py-3.5">
                                  <div className={`text-sm font-black font-['Outfit',sans-serif] ${dep.status === 'Pending'
                                      ? isLight ? 'text-amber-600' : 'text-amber-400'
                                      : isLight ? 'text-emerald-700' : 'text-emerald-400'
                                    }`}>
                                    ${dep.amount?.toFixed(2)}
                                  </div>
                                  {dep.referrerId ? (
                                    <div className="text-[10px] text-purple-400 font-semibold">
                                      +5% Comm: ${(dep.expectedCommission ?? (dep.amount * 0.05)).toFixed(2)}
                                    </div>
                                  ) : (
                                    <div className="text-[10px] text-slate-400 italic">
                                      Direct User (No Comm)
                                    </div>
                                  )}
                                </td>

                                {/* Method & Proof */}
                                <td className="px-4 py-3.5">
                                  <div className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                                    {dep.paymentMethod}
                                  </div>
                                  {(dep.hasProof || dep.proofUrl) ? (
                                    <button
                                      type="button"
                                      disabled={loadingProofId === dep.id}
                                      onClick={() => handleViewDepositProof(dep.id, dep.proofUrl)}
                                      className="mt-1 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-sky-500 hover:text-sky-400 border border-blue-500/20 transition-all text-[10px] font-bold cursor-pointer group"
                                      title="Click to load receipt screenshot"
                                    >
                                      {loadingProofId === dep.id ? (
                                        <>
                                          <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
                                          <span>Loading...</span>
                                        </>
                                      ) : (
                                        <>
                                          <ImageIcon className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                                          <span>View Receipt 📸</span>
                                        </>
                                      )}
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-slate-500 italic">No receipt attached</span>
                                  )}
                                </td>

                                {/* Ref / TxID */}
                                <td className="px-4 py-3.5">
                                  <div className="font-mono text-[10px] text-slate-400 break-all max-w-[130px]">
                                    {dep.reference || '—'}
                                  </div>
                                </td>

                                {/* Status */}
                                <td className="px-4 py-3.5">
                                  <span className={statusBadge(dep.status)}>
                                    {dep.status}
                                  </span>
                                  {dep.status === 'Approved' && (
                                    <div className="text-[9px] text-emerald-500 font-bold mt-1">
                                      ✓ Investment Active
                                    </div>
                                  )}
                                  {dep.status === 'Rejected' && dep.rejectionReason && (
                                    <div className="text-[9px] text-red-400 mt-1 max-w-[120px] truncate" title={dep.rejectionReason}>
                                      {dep.rejectionReason}
                                    </div>
                                  )}
                                </td>

                                {/* Date */}
                                <td className="px-4 py-3.5 text-[10px] text-slate-400 whitespace-nowrap">
                                  <div>{dep.createdAt ? new Date(dep.createdAt).toLocaleDateString() : '—'}</div>
                                  <div className="text-[9px] text-slate-500">
                                    {dep.createdAt ? new Date(dep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                  </div>
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3.5">
                                  <div className="flex flex-col gap-1.5">
                                    <button
                                      onClick={() => setSelectedDepositItem(dep)}
                                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors flex items-center justify-center gap-1 cursor-pointer ${isLight
                                          ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                                          : 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
                                        }`}
                                    >
                                      <Eye className="w-3 h-3 text-sky-400" />
                                      <span>Verify Details</span>
                                    </button>

                                    {dep.status === 'Pending' && (
                                      <div className="flex items-center gap-1">
                                        <button
                                          disabled={actionLoading}
                                          onClick={() => setApproveConfirmDep(dep)}
                                          className="flex-1 px-2 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] cursor-pointer shadow-sm disabled:opacity-50 transition-colors"
                                        >
                                          ✓ Approve
                                        </button>
                                        <button
                                          disabled={actionLoading}
                                          onClick={() => { setRejectDepItem(dep); setDepRejectReason(''); }}
                                          className="flex-1 px-2 py-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] cursor-pointer shadow-sm disabled:opacity-50 transition-colors"
                                        >
                                          ✗ Reject
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* ══════════════════════════════════════════════════════════════ */}
                {/* MODAL 1: DETAILED DEPOSIT VERIFICATION COCKPIT (Section 9)     */}
                {/* ══════════════════════════════════════════════════════════════ */}
                {selectedDepositItem && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.7)' }}>
                    <div className={`w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl ${isLight ? 'bg-white border border-slate-200' : 'bg-[#0D1A26] border border-white/10'
                      }`}>
                      {/* Modal Header */}
                      <div className={`sticky top-0 z-10 p-5 border-b flex items-center justify-between ${isLight ? 'bg-white/95 backdrop-blur border-slate-200' : 'bg-[#0D1A26]/95 backdrop-blur border-white/10'
                        }`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center font-black">
                            <FileCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className={`font-black text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                Deposit Verification Details
                              </h3>
                              <span className={statusBadge(selectedDepositItem.status)}>
                                {selectedDepositItem.status}
                              </span>
                            </div>
                            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              Deposit ID: <span className="font-mono text-sky-500">{selectedDepositItem.id}</span>
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedDepositItem(null)}
                          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                        >
                          <X size={14} className={isLight ? 'text-slate-600' : 'text-white'} />
                        </button>
                      </div>

                      <div className="p-5 space-y-4">
                        {/* 4 Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* CARD 1: USER INFORMATION */}
                                       {/* CARD 2: DEPOSIT INFORMATION */}
                          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                            <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-white/10">
                              <ArrowDownCircle className="w-4 h-4 text-amber-400" />
                              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                                Deposit Information
                              </h4>
                            </div>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Deposit ID:</span>
                                <span className="font-mono text-[11px] text-amber-500">{selectedDepositItem.id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Deposit Purpose:</span>
                                <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Available Balance Top-Up</span>
                              </div>
                              <div className="flex justify-between">
                                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Amount:</span>
                                <span className="font-black text-sm text-emerald-500 font-['Outfit',sans-serif]">${selectedDepositItem.amount?.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Payment Method:</span>
                                <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedDepositItem.paymentMethod}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Transaction ID / Ref:</span>
                                <span className="font-mono text-[11px] text-slate-300 break-all max-w-[150px] text-right">{selectedDepositItem.reference || '—'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Submitted Date:</span>
                                <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                                  {selectedDepositItem.createdAt ? new Date(selectedDepositItem.createdAt).toLocaleString() : '—'}
                                </span>
                              </div>
                              {(selectedDepositItem.hasProof || selectedDepositItem.proofUrl) && (
                                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                  <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Receipt Proof:</span>
                                  <button
                                    type="button"
                                    disabled={loadingProofId === selectedDepositItem.id}
                                    onClick={() => handleViewDepositProof(selectedDepositItem.id, selectedDepositItem.proofUrl)}
                                    className="text-xs font-bold text-sky-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                                  >
                                    {loadingProofId === selectedDepositItem.id ? (
                                      <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        <span>Loading Slip...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>View Receipt Image 📸</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* CARD 3: REFERRAL INFORMATION */}
                          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                            <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-white/10">
                              <Sparkles className="w-4 h-4 text-purple-400" />
                              <h4 className="text-xs font-black uppercase tracking-wider text-purple-400">
                                Referral Information
                              </h4>
                            </div>
                            {selectedDepositItem.referrerId ? (
                              <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between">
                                  <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Referrer Name:</span>
                                  <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedDepositItem.referrerName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Referral Code:</span>
                                  <span className="font-mono text-purple-400 font-bold">{selectedDepositItem.referrerCode || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Commission Rate:</span>
                                  <span className="font-bold text-emerald-400">5.0% Standard</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Expected Commission:</span>
                                  <span className="font-black text-sm text-purple-400 font-['Outfit',sans-serif]">
                                    ${((selectedDepositItem.amount * 5) / 100).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between pt-1 border-t border-white/5">
                                  <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Commission Status:</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedDepositItem.commissionCredited || selectedDepositItem.status === 'Approved'
                                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                    }`}>
                                    {selectedDepositItem.commissionCredited || selectedDepositItem.status === 'Approved'
                                      ? 'Credited to Referrer'
                                      : 'Pending Approval (Triggered Upon Admin Approve)'}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                  <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Account Type:</span>
                                  <span className="font-bold text-slate-400">Direct Account (No Sponsor)</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Referral Code:</span>
                                  <span className="font-mono text-slate-400">None</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Referral Commission:</span>
                                  <span className="font-bold text-slate-400">$0.00 (No Commission)</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-500/10 border border-slate-500/20 text-[11px] text-slate-400">
                                  ℹ️ User registered without a sponsor code. Direct accounts generate 0 commission on all deposits.
                                </div>
                              </div>
                            )}
                          </div>

                          {/* CARD 4: WALLET ALLOCATION */}
                          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                            <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-white/10">
                              <Wallet className="w-4 h-4 text-emerald-400" />
                              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                                Wallet Allocation
                              </h4>
                            </div>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Target Destination:</span>
                                <span className="font-bold text-emerald-400">User Available Balance</span>
                              </div>
                              <div className="flex justify-between">
                                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Credit Amount:</span>
                                <span className="font-black text-sm text-emerald-500 font-['Outfit',sans-serif]">${selectedDepositItem.amount?.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Auto-Invest Status:</span>
                                <span className="font-bold text-sky-400">Disabled (Self-Selection)</span>
                              </div>
                              <div className="flex justify-between">
                                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Plan Allocation:</span>
                                <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>User selects plan in portal</span>
                              </div>
                              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-medium">
                                ✓ On approval, full amount credits directly to user's wallet so they can choose their own plan.
                              </div>
                              <div className="flex justify-between pt-1 border-t border-white/5">
                                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Wallet Status:</span>
                                <span className="text-[10px] font-bold text-emerald-400">
                                  {selectedDepositItem.status === 'Approved' ? 'Credited to Available Cash' : 'Pending Admin Verification'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status Banner */}
                        {selectedDepositItem.status === 'Approved' && (
                          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-400">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>
                              Deposit Approved and Credited to Available Balance by {selectedDepositItem.approvedBy || 'Admin'} on {selectedDepositItem.approvedAt ? new Date(selectedDepositItem.approvedAt).toLocaleString() : 'System'}.
                            </span>
                          </div>
                        )}

                        {selectedDepositItem.status === 'Rejected' && (
                          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-400">
                            <XCircle className="w-4 h-4 shrink-0" />
                            <span>
                              Deposit Rejected. Reason: {selectedDepositItem.rejectionReason || 'Transaction could not be verified'}.
                            </span>
                          </div>
                        )}

                        {/* Modal Action Buttons */}
                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                          {selectedDepositItem.status === 'Pending' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => { setRejectDepItem(selectedDepositItem); setDepRejectReason(''); }}
                                className="px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer shadow-md transition-all active:scale-95"
                              >
                                [ ✗ REJECT DEPOSIT ]
                              </button>
                              <button
                                type="button"
                                onClick={() => setApproveConfirmDep(selectedDepositItem)}
                                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs cursor-pointer shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                              >
                                [ ✓ APPROVE DEPOSIT ]
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedDepositItem(null)}
                              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-bold text-xs cursor-pointer"
                            >
                              Close
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ══════════════════════════════════════════════════════════════ */}
                {/* MODAL 2: APPROVAL CONFIRMATION DIALOG (Section 10)            */}
                {/* ══════════════════════════════════════════════════════════════ */}
                {approveConfirmDep && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.75)' }}>
                    <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl ${isLight ? 'bg-white border border-slate-200' : 'bg-[#0D1A26] border border-white/10'
                      }`}>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3.5">
                        <ShieldCheck className="w-6 h-6" />
                      </div>

                      <h3 className={`text-base font-black text-center ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Confirm Deposit Approval
                      </h3>
                      <p className={`text-xs text-center mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Are you sure you want to approve this deposit? This is the authoritative trigger that atomically starts yield and credits commission.
                      </p>

                      <div className={`my-4 p-4 rounded-2xl border space-y-2 text-xs ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
                        }`}>
                        <div className="flex justify-between">
                          <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>User:</span>
                          <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{approveConfirmDep.userName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Investment Amount:</span>
                          <span className="font-black text-emerald-500 font-['Outfit',sans-serif]">${approveConfirmDep.amount?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Plan:</span>
                          <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{approveConfirmDep.planName}</span>
                        </div>
                        {approveConfirmDep.referrerId ? (
                          <div className="flex justify-between">
                            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Referral Commission (5%):</span>
                            <span className="font-bold text-purple-400">
                              ${((approveConfirmDep.amount * 5) / 100).toFixed(2)} → {approveConfirmDep.referrerName}
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-between">
                            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Referral Commission:</span>
                            <span className="font-bold text-slate-400">
                              None ($0.00) — Direct Registration
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between pt-1 border-t border-white/5">
                          <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Investment Status:</span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ACTIVE (Yield starts)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          disabled={actionLoading}
                          onClick={() => setApproveConfirmDep(null)}
                          className="flex-1 py-2.5 rounded-2xl border text-xs font-bold cursor-pointer transition-colors bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={async () => {
                            const ok = await handleDepAction(approveConfirmDep.id, 'approve');
                            if (ok) {
                              setApproveConfirmDep(null);
                              fetchAdminDeposits(adminDepFilter);
                            }
                          }}
                          className="flex-1 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black cursor-pointer shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
                        >
                          {actionLoading ? 'Processing...' : 'Confirm Approval'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ══════════════════════════════════════════════════════════════ */}
                {/* MODAL 3: REJECTION REASON DIALOG (Section 11)                 */}
                {/* ══════════════════════════════════════════════════════════════ */}
                {rejectDepItem && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.75)' }}>
                    <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl ${isLight ? 'bg-white border border-slate-200' : 'bg-[#0D1A26] border border-white/10'
                      }`}>
                      <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-3.5">
                        <XCircle className="w-6 h-6" />
                      </div>

                      <h3 className={`text-base font-black text-center ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Reject Deposit Request
                      </h3>
                      <p className={`text-xs text-center mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        User: <span className="font-bold text-white">{rejectDepItem.userName}</span> (${rejectDepItem.amount?.toFixed(2)} - {rejectDepItem.planName})
                      </p>

                      <div className="my-3.5">
                        <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                          Rejection Reason (Visible to user):
                        </label>
                        <textarea
                          rows={3}
                          value={depRejectReason}
                          onChange={(e) => setDepRejectReason(e.target.value)}
                          placeholder="e.g. Transaction could not be verified on the blockchain explorer."
                          className={`w-full p-3 rounded-2xl text-xs border outline-none resize-none transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-rose-500' : 'bg-white/5 border-white/10 text-white focus:border-rose-500'
                            }`}
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 mb-4">
                        ⚠️ Note: Deposit will be marked REJECTED. Investment will remain NOT ACTIVE, no profit will be generated, and no referral commission will be paid.
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          disabled={actionLoading}
                          onClick={() => { setRejectDepItem(null); setDepRejectReason(''); }}
                          className="flex-1 py-2.5 rounded-2xl border text-xs font-bold cursor-pointer transition-colors bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={async () => {
                            const reason = depRejectReason.trim() || 'Transaction could not be verified.';
                            const ok = await handleDepAction(rejectDepItem.id, 'reject', reason);
                            if (ok) {
                              setRejectDepItem(null);
                              setDepRejectReason('');
                              fetchAdminDeposits(adminDepFilter);
                            }
                          }}
                          className="flex-1 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black cursor-pointer shadow-lg shadow-rose-500/25 transition-all disabled:opacity-50"
                        >
                          {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB: ALL WITHDRAWALS (Admin)                                  */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'allwithdrawals' && (
              <div className="space-y-4">
                <div className={`p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isLight ? 'bg-white border border-slate-200 shadow-md' : 'bg-[#091A2E] border border-white/10'
                  }`}>
                  <div>
                    <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>All Withdrawals</h3>
                    <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{adminAllWithdrawals.length} records</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {['all', 'Pending', 'Completed', 'Rejected'].map(f => (
                      <button key={f}
                        onClick={() => { setAdminWthFilter(f); fetchAdminWithdrawals(f); }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${adminWthFilter === f ? 'bg-amber-500 text-slate-950' : isLight ? 'bg-slate-100 border border-slate-200 text-slate-600' : 'bg-white/10 text-slate-300'
                          }`}>{f === 'all' ? 'All' : f}</button>
                    ))}
                    <button onClick={() => fetchAdminWithdrawals(adminWthFilter)} className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer">↻ Refresh</button>
                  </div>
                </div>

                <div className={`rounded-2xl overflow-hidden border ${isLight ? 'border-slate-200 shadow-md' : 'border-white/10'
                  }`}>
                  {adminWithdrawalsLoading ? (
                    <div className={`p-8 text-center text-sm ${isLight ? 'text-slate-500 bg-white' : 'text-slate-400 bg-[#091A2E]'}`}>Loading...</div>
                  ) : adminAllWithdrawals.length === 0 ? (
                    <div className={`p-8 text-center text-sm ${isLight ? 'text-slate-400 bg-white' : 'text-slate-500 bg-[#091A2E]'}`}>No withdrawals found.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[780px] text-xs">
                        <thead>
                          <tr className={isLight ? 'bg-slate-50 border-b border-slate-200' : 'bg-[#0D1F30] border-b border-white/10'}>
                            {['Withdrawal ID', 'User', 'Amount', 'Fee', 'Net Payout', 'Crypto Method & Destination', 'Status / Reason', 'Date', 'Action'].map(h => (
                              <th key={h} className={`px-4 py-3 text-left font-bold uppercase tracking-wider text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'
                                }`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {adminAllWithdrawals.map((wth, i) => (
                            <tr key={wth.id} className={`border-b transition-colors ${isLight ? i % 2 === 0 ? 'bg-white border-slate-100 hover:bg-slate-50/70' : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50/70'
                                : i % 2 === 0 ? 'bg-[#091A2E] border-white/5 hover:bg-white/[0.02]' : 'bg-[#0A1929] border-white/5 hover:bg-white/[0.02]'
                              }`}>
                              <td className={`px-4 py-3 font-mono font-bold text-[10px] ${isLight ? 'text-purple-600' : 'text-purple-400'}`}>{wth.id}</td>
                              <td className="px-4 py-3">
                                <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{wth.userName || '—'}</div>
                                <div className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{wth.userEmail}</div>
                              </td>
                              <td className={`px-4 py-3 font-black ${isLight ? 'text-red-600' : 'text-red-400'}`}>${wth.amount?.toFixed(2)}</td>
                              <td className={`px-4 py-3 font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>${(wth.fee ?? 1).toFixed(2)}</td>
                              <td className="px-4 py-3 font-black text-emerald-500">${(wth.netAmount ?? (wth.amount - (wth.fee ?? 1))).toFixed(2)}</td>
                              <td className="px-4 py-3 max-w-[200px]">
                                <div className="font-bold text-xs text-sky-500">{wth.paymentMethod}</div>
                                <div className={`font-mono text-[10px] break-all select-all mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                                  {wth.destinationDetails}
                                </div>
                              </td>
                              <td className="px-4 py-3 max-w-[220px]">
                                <span className={statusBadge(wth.status)}>{wth.status}</span>
                                {wth.status === 'Rejected' && (wth.rejectionReason || wth.adminComment) && (
                                  <div className="mt-1 text-[10px] text-rose-500 font-semibold bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20">
                                    Reason: "{wth.rejectionReason || wth.adminComment}"
                                    <div className="text-[9px] text-emerald-500 font-medium">✓ Refunded to Available Cash</div>
                                  </div>
                                )}
                                {wth.status === 'Completed' && (
                                  <div className="mt-1">
                                    {wth.txHash ? (
                                      <div className="text-[10px] font-mono text-emerald-500 break-all" title={`TXID: ${wth.txHash}`}>
                                        TXID: {wth.txHash.length > 20 ? `${wth.txHash.slice(0, 10)}...${wth.txHash.slice(-8)}` : wth.txHash}
                                      </div>
                                    ) : (
                                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400">Processed</span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className={`px-4 py-3 text-[10px] whitespace-nowrap ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{wth.createdAt ? new Date(wth.createdAt).toLocaleDateString() : '—'}</td>
                              <td className="px-4 py-3">
                                {wth.status === 'Pending' && (
                                  <div className="flex gap-1.5 whitespace-nowrap">
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => {
                                        setWthApproveModalItem(wth);
                                        setWthApproveTxHash('');
                                        setWthApproveNote('Approved and processed via Blockchain Network');
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
                                    >
                                      ✓ Process
                                    </button>
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => {
                                        setWthRejectModalItem(wth);
                                        setWthRejectReason('');
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
                                    >
                                      ✗ Reject
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB: SUPPORT TICKETS (Admin)                                  */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'support' && (
              <div className="space-y-4">
                <div className={`p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isLight ? 'bg-white border border-slate-200 shadow-md' : 'bg-[#091A2E] border border-white/10'
                  }`}>
                  <div>
                    <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Support Tickets</h3>
                    <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {adminTickets.length} tickets · {adminTickets.filter(t => t.status === 'Open').length} open · {adminTickets.filter(t => t.status === 'Completed').length} completed
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {['all', 'Open', 'In Progress', 'Completed', 'Closed'].map(f => (
                      <button key={f} onClick={() => { setAdminTicketFilter(f); fetchAdminTickets(f); }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${adminTicketFilter === f ? 'bg-amber-500 text-slate-950' : isLight ? 'bg-slate-100 border border-slate-200 text-slate-600' : 'bg-white/10 text-slate-300'
                          }`}>{f === 'all' ? 'All' : f}</button>
                    ))}
                    <button onClick={() => fetchAdminTickets(adminTicketFilter)} className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer">↻ Refresh</button>
                    <button
                      onClick={() => setContactUserModal(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Contact User
                    </button>
                  </div>
                </div>

                {/* Contact User Modal */}
                {contactUserModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                    <div className={`w-full max-w-md rounded-3xl p-6 space-y-4 ${isLight ? 'bg-white border border-slate-200 shadow-2xl text-slate-900' : 'bg-[#091A2E] border border-white/15 shadow-2xl text-white'
                      }`}>
                      <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-slate-200' : 'border-white/10'
                        }`}>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-emerald-500" />
                          <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Contact User</h3>
                        </div>
                        <button onClick={() => setContactUserModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                      </div>

                      <form onSubmit={handleSendContactUser} className="space-y-3">
                        <div>
                          <label className={`block text-[11px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Select User</label>
                          <select
                            required
                            value={contactUserId}
                            onChange={e => setContactUserId(e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl text-xs outline-none ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                              }`}
                          >
                            <option value="">— Choose a user —</option>
                            {allUsers.map((u: any) => (
                              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={`block text-[11px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Category</label>
                          <select
                            value={contactCategory}
                            onChange={e => setContactCategory(e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl text-xs outline-none ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                              }`}
                          >
                            {['General', 'Account', 'KYC', 'Deposit', 'Withdrawal', 'Investment', 'Technical'].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={`block text-[11px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Subject</label>
                          <input
                            type="text"
                            required
                            value={contactSubject}
                            onChange={e => setContactSubject(e.target.value)}
                            placeholder="Brief subject line..."
                            className={`w-full px-3.5 py-2.5 rounded-xl text-xs outline-none ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                              }`}
                          />
                        </div>

                        <div>
                          <label className={`block text-[11px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Message</label>
                          <textarea
                            required
                            rows={4}
                            value={contactMessage}
                            onChange={e => setContactMessage(e.target.value)}
                            placeholder="Write your message to the user..."
                            className={`w-full p-3 rounded-xl text-xs outline-none resize-none ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                              }`}
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setContactUserModal(false)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold ${isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/5 text-slate-300'
                              }`}
                          >Cancel</button>
                          <button
                            type="submit"
                            disabled={contactSending || !contactUserId || !contactSubject || !contactMessage}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs"
                          >
                            {contactSending ? '…' : <Send className="w-3.5 h-3.5" />}
                            {contactSending ? 'Sending…' : 'Send Message'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="grid lg:grid-cols-5 gap-4" style={{ minHeight: '72vh' }}>
                  {/* Ticket List — left column */}
                  <div className="lg:col-span-2 space-y-2 overflow-y-auto pr-1" style={{ maxHeight: '72vh' }}>
                    {adminTicketsLoading ? (
                      <div className={`p-8 text-center text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Loading...</div>
                    ) : adminTickets.length === 0 ? (
                      <div className={`p-8 text-center text-sm ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>No tickets found.</div>
                    ) : adminTickets.map(t => (
                      <div
                        key={t.id}
                        onClick={() => { setSelectedTicket(t); setTicketReply(''); }}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${selectedTicket?.id === t.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                            : isLight ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm' : 'bg-[#091A2E] border-white/10 hover:border-white/25'
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-xs truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{t.subject}</p>
                            <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t.userName}</p>
                            <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'} truncate`}>{t.userEmail}</p>
                          </div>
                          <span className={statusBadge(t.status)}>{t.status}</span>
                        </div>
                        <div className={`flex items-center justify-between text-[10px] mt-2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span className={`px-2 py-0.5 rounded-md font-medium ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}>{t.category}</span>
                          <div className="flex items-center gap-2">
                            <span>{t.messages?.length || 0} msgs · {t.createdDate ? new Date(t.createdDate).toLocaleDateString() : ''}</span>
                            {t.status !== 'Closed' && t.status !== 'Completed' ? (
                              <button
                                type="button"
                                disabled={completingTicketId === t.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompleteTicket(t.id);
                                }}
                                className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="Mark Completed"
                              >
                                <CheckCircle2 className={`w-2.5 h-2.5 ${completingTicketId === t.id ? 'animate-spin' : ''}`} />
                                Complete
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={reopeningTicketId === t.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReopenTicket(t.id);
                                }}
                                className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-slate-950 font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="Reopen Ticket"
                              >
                                <RefreshCw className={`w-2.5 h-2.5 ${reopeningTicketId === t.id ? 'animate-spin' : ''}`} />
                                Reopen
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Ticket Detail — right column (full chat interface) */}
                  {selectedTicket ? (
                    <div className={`lg:col-span-3 rounded-2xl border flex flex-col overflow-hidden ${isLight ? 'bg-white border-slate-200' : 'bg-[#091A2E] border-white/10'
                      }`} style={{ height: '72vh' }}>

                      {/* Chat Header */}
                      <div className={`p-4 border-b flex-shrink-0 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-[#071322]'
                        }`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-black text-sm ${isLight ? 'text-slate-900' : 'text-white'} truncate`}>{selectedTicket.subject}</h4>
                            <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              {selectedTicket.id} · {selectedTicket.userName} · {selectedTicket.userEmail}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={statusBadge(selectedTicket.status)}>{selectedTicket.status}</span>
                            {selectedTicket.status !== 'Closed' && selectedTicket.status !== 'Completed' ? (
                              <>
                                <button
                                  disabled={completingTicketId === selectedTicket.id}
                                  onClick={() => handleCompleteTicket(selectedTicket.id)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-sm active:scale-95"
                                >
                                  <CheckCircle2 className={`w-3 h-3 ${completingTicketId === selectedTicket.id ? 'animate-spin' : ''}`} />
                                  {completingTicketId === selectedTicket.id ? 'Completing…' : 'Mark Completed'}
                                </button>
                                <button
                                  onClick={() => handleCloseTicket(selectedTicket.id)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-500 hover:bg-slate-600 text-white text-[10px] font-bold cursor-pointer transition-colors"
                                >
                                  Close Ticket
                                </button>
                              </>
                            ) : (
                              <button
                                disabled={reopeningTicketId === selectedTicket.id}
                                onClick={() => handleReopenTicket(selectedTicket.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${reopeningTicketId === selectedTicket.id ? 'animate-spin' : ''}`} />
                                {reopeningTicketId === selectedTicket.id ? 'Reopening…' : 'Reopen Ticket'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Messages — scrollable flex fill */}
                      <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${isLight ? 'bg-slate-50/50' : ''
                        }`}>
                        {(selectedTicket.messages || []).length === 0 ? (
                          <div className={`flex items-center justify-center h-full text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                            No messages yet
                          </div>
                        ) : (selectedTicket.messages || []).map((msg: any) => {
                          const isAdmin = msg.sender === 'admin';
                          return (
                            <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                              <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'} mb-1 px-1`}>
                                {msg.senderName} · {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                              <div className={`px-3.5 py-2.5 rounded-2xl max-w-[80%] text-xs leading-relaxed ${isAdmin
                                  ? 'bg-[#155EEF] text-white rounded-br-none shadow-md'
                                  : isLight
                                    ? 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                                    : 'bg-[#06121F] border border-white/10 text-slate-200 rounded-bl-none'
                                }`}>
                                {msg.message}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Reply Input */}
                      {selectedTicket.status !== 'Closed' && selectedTicket.status !== 'Completed' ? (
                        <div className={`p-3 border-t flex-shrink-0 flex gap-2 ${isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-[#071322]'
                          }`}>
                          <textarea
                            value={ticketReply}
                            onChange={e => setTicketReply(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTicketReply(); } }}
                            placeholder="Type your reply… (Enter to send, Shift+Enter for newline)"
                            rows={2}
                            className={`flex-1 px-3 py-2.5 rounded-xl text-xs border outline-none resize-none ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-400' : 'bg-[#07121E] border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500'
                              }`}
                          />
                          <button
                            disabled={actionLoading || !ticketReply.trim()}
                            onClick={handleTicketReply}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs self-end cursor-pointer disabled:opacity-40 flex items-center gap-1.5 transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Send
                          </button>
                        </div>
                      ) : (
                        <div className={`p-3.5 border-t flex-shrink-0 flex items-center justify-between gap-3 ${selectedTicket.status === 'Completed'
                            ? isLight ? 'border-slate-200 bg-emerald-50/70' : 'border-white/10 bg-emerald-500/10'
                            : isLight ? 'border-slate-200 bg-amber-50/70' : 'border-white/10 bg-amber-500/10'
                          }`}>
                          <div className="flex items-center gap-2 text-xs">
                            {selectedTicket.status === 'Completed' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                            )}
                            <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                              {selectedTicket.status === 'Completed'
                                ? 'This ticket is marked as Completed.'
                                : 'This ticket is closed.'} Click Reopen to resume conversation and send replies.
                            </span>
                          </div>
                          <button
                            type="button"
                            disabled={reopeningTicketId === selectedTicket.id}
                            onClick={() => handleReopenTicket(selectedTicket.id)}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-all shrink-0 shadow-sm active:scale-95"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${reopeningTicketId === selectedTicket.id ? 'animate-spin' : ''}`} />
                            <span>{reopeningTicketId === selectedTicket.id ? 'Reopening…' : 'Reopen Ticket'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`lg:col-span-3 rounded-2xl border flex items-center justify-center ${isLight ? 'bg-white border-slate-200 text-slate-400' : 'bg-[#091A2E] border-white/10 text-slate-500'
                      } text-sm`} style={{ height: '72vh' }}>
                      <div className="text-center">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>Select a ticket to view conversation</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB: PLAN CANCELLATIONS (Admin Approval)                     */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'cancellations' && (
              <div className="space-y-4">
                {/* Header & Controls */}
                <div className={`p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isLight ? 'bg-white border border-slate-200 shadow-md' : 'bg-[#091A2E] border border-white/10'
                  }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Plan Cancellation Requests
                      </h3>
                      {adminCancellations.filter(c => c.status === 'Pending').length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 animate-pulse">
                          {adminCancellations.filter(c => c.status === 'Pending').length} Pending
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Review member cancellations. Approving credits <b>Principal + Today's Earning</b> directly into the user's Available Cash.
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap items-center">
                    {['all', 'Pending', 'Approved', 'Rejected'].map(f => (
                      <button
                        key={f}
                        onClick={() => { setAdminCancelFilter(f); fetchAdminCancellations(f); }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${adminCancelFilter === f
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : isLight ? 'bg-slate-100 border border-slate-200 text-slate-600' : 'bg-white/10 text-slate-300'
                          }`}
                      >
                        {f === 'all' ? 'All' : f}
                      </button>
                    ))}
                    <button
                      onClick={() => fetchAdminCancellations(adminCancelFilter)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1"
                    >
                      ↻ Refresh
                    </button>
                  </div>
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#091A2E] border-white/10'}`}>
                    <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Pending Approvals
                    </span>
                    <div className="text-xl font-black text-amber-500 mt-1 font-['Outfit',sans-serif]">
                      {adminCancellations.filter(c => c.status === 'Pending').length} Requests
                    </div>
                  </div>
                  <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#091A2E] border-white/10'}`}>
                    <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Total Approved Refunds
                    </span>
                    <div className="text-xl font-black text-emerald-500 mt-1 font-['Outfit',sans-serif]">
                      ${adminCancellations
                        .filter(c => c.status === 'Approved')
                        .reduce((acc, c) => acc + (parseFloat(c.investedAmount || 0) + parseFloat(c.todayReward || 0)), 0)
                        .toFixed(2)}
                    </div>
                  </div>
                  <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#091A2E] border-white/10'}`}>
                    <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Total Requests Handled
                    </span>
                    <div className="text-xl font-black text-blue-500 mt-1 font-['Outfit',sans-serif]">
                      {adminCancellations.length} Requests
                    </div>
                  </div>
                </div>

                {/* Table / List */}
                <div className={`rounded-2xl overflow-hidden border ${isLight ? 'border-slate-200 shadow-md bg-white' : 'border-white/10 bg-[#091A2E]'
                  }`}>
                  {adminCancellationsLoading ? (
                    <div className="p-8 text-center text-sm opacity-60">Loading cancellation requests...</div>
                  ) : adminCancellations.length === 0 ? (
                    <div className="p-8 text-center text-sm opacity-60">No cancellation requests found.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-xs">
                        <thead>
                          <tr className={isLight ? 'bg-slate-50 border-b border-slate-200' : 'bg-[#0D1F30] border-b border-white/10'}>
                            {['Req ID', 'Member', 'Plan Details', 'Principal Refund', "Today's Earning", 'Total to Available Cash', 'Reason / Note', 'Status', 'Action'].map(h => (
                              <th key={h} className={`px-4 py-3 text-left font-bold uppercase tracking-wider text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'
                                }`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {adminCancellations.map((c, i) => {
                            const principal = parseFloat(c.investedAmount || 0);
                            const todayEarn = parseFloat(c.todayReward || 0);
                            const totalRefund = principal + todayEarn;
                            return (
                              <tr
                                key={c.id}
                                className={`border-b transition-colors ${isLight
                                    ? i % 2 === 0 ? 'bg-white border-slate-100 hover:bg-slate-50/80' : 'bg-slate-50/40 border-slate-100 hover:bg-slate-50/80'
                                    : i % 2 === 0 ? 'bg-[#091A2E] border-white/5 hover:bg-white/[0.02]' : 'bg-[#0A1929] border-white/5 hover:bg-white/[0.02]'
                                  }`}
                              >
                                <td className="px-4 py-3 font-mono font-bold text-[10px] text-blue-500">
                                  {c.id}
                                </td>
                                <td className="px-4 py-3">
                                  <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                    {c.userName || 'Member'}
                                  </div>
                                  <div className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {c.userEmail}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                                    {c.planName}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    Inv ID: {c.investmentId}
                                  </div>
                                </td>
                                <td className={`px-4 py-3 font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                  ${principal.toFixed(2)}
                                </td>
                                <td className="px-4 py-3 font-mono font-bold text-amber-500">
                                  +${todayEarn.toFixed(2)}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="font-mono font-black text-emerald-500 text-sm">
                                    ${totalRefund.toFixed(2)}
                                  </div>
                                  <div className="text-[9px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">
                                    → Available Cash
                                  </div>
                                </td>
                                <td className="px-4 py-3 max-w-[200px]">
                                  {c.reason ? (
                                    <p className={`text-xs truncate ${isLight ? 'text-slate-700' : 'text-slate-300'}`} title={c.reason}>
                                      "{c.reason}"
                                    </p>
                                  ) : (
                                    <span className="text-slate-400 italic text-[10px]">No reason given</span>
                                  )}
                                  {c.adminNote && (
                                    <p className="text-[10px] text-red-400 mt-0.5 truncate" title={c.adminNote}>
                                      Note: {c.adminNote}
                                    </p>
                                  )}
                                  <div className={`text-[9px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={statusBadge(c.status)}>{c.status}</span>
                                </td>
                                <td className="px-4 py-3">
                                  {c.status === 'Pending' ? (
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        disabled={actionLoading}
                                        onClick={() => handleApproveCancellation(c.id)}
                                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer disabled:opacity-50 transition-colors whitespace-nowrap flex items-center gap-1 shadow-xs"
                                        title="Refund Principal + Today's Earning to Available Cash"
                                      >
                                        ✓ Approve
                                      </button>
                                      <button
                                        disabled={actionLoading}
                                        onClick={() => setCancelRejectModalReq(c)}
                                        className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] cursor-pointer disabled:opacity-50 transition-colors whitespace-nowrap flex items-center gap-1 shadow-xs"
                                      >
                                        ✗ Reject
                                      </button>
                                    </div>
                                  ) : c.status === 'Approved' ? (
                                    <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                      ✓ Refunded
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-red-400">
                                      ✗ Rejected
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 1: Investment Plans Manager */}
            {activeTab === 'plans' && (
              <div className="space-y-4">
                <div
                  className={`p-4 sm:p-5 rounded-3xl ${isLight ? 'bg-white border border-slate-200 shadow-md' : 'bg-[#091A2E] border border-white/10 shadow-xl'
                    } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                >
                  <div>
                    <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Investment Fleet Packages
                    </h3>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                      Create new investment plans or update yield rates, durations, and minimum investment limits.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenCreatePlan}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-blue-500/25 flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Plan</span>
                  </button>
                </div>

                {/* Grid of Plans */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plans.map((p) => {
                    return (
                      <div
                        key={p.id}
                        className={`rounded-3xl border ${isLight ? 'bg-white border-slate-200 shadow-md' : 'bg-[#081729] border-white/10 shadow-xl'
                          } overflow-hidden flex flex-col justify-between`}
                      >
                        <div>
                          {/* Plan Image Header */}
                          <div className="relative h-36 w-full bg-slate-900 overflow-hidden">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover opacity-85"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop&q=80';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            <div className="absolute top-3 left-3 flex items-center gap-1.5">
                              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-600/90 text-white uppercase tracking-wider backdrop-blur-sm">
                                {p.category}
                              </span>
                              {(p.popular || p.isPopular) && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                  <Sparkles className="w-3 h-3" />
                                  Popular
                                </span>
                              )}
                            </div>
                            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                              <div>
                                <h4 className="text-base font-black text-white">{p.name}</h4>
                                <span className="text-xs font-bold text-sky-300">
                                  {p.dailyRewardRate}% Daily ROI
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-300 block">Duration</span>
                                <span className="text-xs font-black text-emerald-400">Unlimited</span>
                              </div>
                            </div>
                          </div>

                          {/* Plan Body Details */}
                          <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className={`p-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-white/5 border border-white/5'}`}>
                                <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'} block`}>
                                  Min - Max Range
                                </span>
                                <span className={`font-black text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                  ${p.minInvest} - {p.id === 'plan_premium' || p.maxInvest >= 99999999 ? 'Unlimited' : `$${p.maxInvest.toLocaleString()}`}
                                </span>
                              </div>
                              <div className={`p-2.5 rounded-xl ${isLight ? 'bg-emerald-50 border border-emerald-200' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
                                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                                  Daily Yield Rate
                                </span>
                                <span className="font-black text-xs text-emerald-600 dark:text-emerald-300">
                                  {p.dailyRewardRate}%<span className="text-[10px] font-semibold opacity-80"> / day</span>
                                </span>
                              </div>
                            </div>

                            {p.vehicleExamples && p.vehicleExamples.length > 0 && (
                              <div>
                                <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'} block mb-1`}>
                                  Fleet Models Included:
                                </span>
                                <p className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'} line-clamp-1`}>
                                  {Array.isArray(p.vehicleExamples) ? p.vehicleExamples.join(', ') : p.vehicleExamples}
                                </p>
                              </div>
                            )}

                            {p.description && (
                              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} line-clamp-2`}>
                                {p.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions Footer */}
                        <div className={`p-3 border-t ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/[0.02]'} flex items-center justify-between gap-2`}>
                          <button
                            onClick={() => handleOpenEditPlan(p)}
                            className="flex-1 py-2 px-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Plan</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                                deleteInvestmentPlan(p.id);
                              }
                            }}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs transition-colors cursor-pointer"
                            title="Delete Plan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: Deposit Gateways & Withdrawal Crypto Gateways */}
            {activeTab === 'wallets' && (
              <div className="space-y-4">
                {/* Sub-tab switcher */}
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/10 dark:bg-white/5 border border-slate-200 dark:border-white/10 w-fit">
                  <button
                    type="button"
                    onClick={() => setGatewaysSubTab('deposits')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${gatewaysSubTab === 'deposits'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    <span>📥 Deposit Channels</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${gatewaysSubTab === 'deposits' ? 'bg-black/20 text-white' : 'bg-black/10 dark:bg-white/10'
                      }`}>
                      {paymentMethods.length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGatewaysSubTab('withdrawals')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${gatewaysSubTab === 'withdrawals'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    <span>📤 Crypto Withdrawal Gateways</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${gatewaysSubTab === 'withdrawals' ? 'bg-black/20 text-white' : 'bg-black/10 dark:bg-white/10'
                      }`}>
                      {withdrawalMethods.length}
                    </span>
                  </button>
                </div>

                {/* ───────────────────────────────────────────────────────────── */}
                {/* SUBTAB 1: DEPOSIT CHANNELS                                    */}
                {/* ───────────────────────────────────────────────────────────── */}
                {gatewaysSubTab === 'deposits' && (
                  <div className="space-y-4">
                    <div
                      className={`p-4 sm:p-5 rounded-3xl ${isLight ? 'bg-white border border-slate-200 shadow-md' : 'bg-[#091A2E] border border-white/10 shadow-xl'
                        } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                    >
                      <div>
                        <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          Deposit Gateways &amp; Payment Wallets
                        </h3>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                          Configure JazzCash, Easypaisa, Crypto (USDT, BTC, ETH), and Bank Wire deposit channels.
                        </p>
                      </div>
                      <button
                        onClick={handleOpenCreateWallet}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-500/25 flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Payment Gateway</span>
                      </button>
                    </div>

                    {/* Grid of Deposit Channels */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {paymentMethods.map((w) => (
                        <div
                          key={w.id}
                          className={`p-5 rounded-3xl border ${isLight ? 'bg-white border-slate-200 shadow-md' : 'bg-[#081729] border-white/10 shadow-xl'
                            } flex flex-col justify-between space-y-4`}
                        >
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <PaymentBrandIcon iconType={w.iconType} iconUrl={w.iconUrl} size="md" />
                                <div>
                                  <h4 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                    {w.name}
                                  </h4>
                                  <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} font-bold`}>
                                    {w.networkOrBank || w.category}
                                  </span>
                                </div>
                              </div>

                              {/* Status Toggle Button */}
                              <button
                                onClick={() => togglePaymentMethodStatus(w.id)}
                                className={`text-[10px] font-black px-2.5 py-1 rounded-full border transition-all cursor-pointer ${w.isActive
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-300'
                                    : 'bg-slate-500/20 border-slate-500/30 text-slate-400'
                                  }`}
                              >
                                {w.isActive ? 'Active' : 'Disabled'}
                              </button>
                            </div>

                            {/* Account Details Box */}
                            <div
                              className={`p-3 rounded-2xl ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-black/30 border border-white/5'
                                } space-y-1.5 text-xs font-mono`}
                            >
                              {w.accountTitle && (
                                <div className="flex justify-between items-center text-[11px]">
                                  <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Account Title:</span>
                                  <span className="font-bold">{w.accountTitle}</span>
                                </div>
                              )}
                              <div className="pt-1 border-t border-slate-200/80 dark:border-white/10">
                                <span className={`text-[9px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'} block mb-0.5`}>
                                  Account Number / Address:
                                </span>
                                <div className="font-bold text-xs text-blue-600 dark:text-sky-300 break-all select-all">
                                  {w.accountNumber}
                                </div>
                              </div>

                              {w.tillId && (
                                <div className="flex justify-between items-center text-[11px] bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                                  <span className="text-amber-600 dark:text-amber-400 font-bold">Till ID:</span>
                                  <span className="font-black text-amber-600 dark:text-amber-300 font-mono">{w.tillId}</span>
                                </div>
                              )}

                              <div className="flex justify-between items-center pt-1 border-t border-slate-200/80 dark:border-white/10 text-[11px]">
                                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Limits:</span>
                                <span className="font-bold">
                                  ${w.minDeposit} - ${w.maxDeposit.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {w.instructions && (
                              <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'} line-clamp-2`}>
                                {w.instructions}
                              </p>
                            )}
                          </div>

                          {/* Actions Footer */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80 dark:border-white/10">
                            <button
                              onClick={() => handleOpenEditWallet(w)}
                              className="flex-1 py-2 px-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Details</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete payment channel "${w.name}"?`)) {
                                  deletePaymentMethod(w.id);
                                }
                              }}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs transition-colors cursor-pointer"
                              title="Delete Gateway"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ───────────────────────────────────────────────────────────── */}
                {/* SUBTAB 2: WITHDRAWAL CRYPTO GATEWAYS                         */}
                {/* ───────────────────────────────────────────────────────────── */}
                {gatewaysSubTab === 'withdrawals' && (
                  <div className="space-y-4">
                    <div
                      className={`p-4 sm:p-5 rounded-3xl ${isLight ? 'bg-white border border-slate-200 shadow-md' : 'bg-[#091A2E] border border-white/10 shadow-xl'
                        } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            Withdrawal Crypto Gateways
                          </h3>
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-500/20 text-sky-400 border border-blue-500/30 uppercase">
                            Crypto Only
                          </span>
                        </div>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                          Configure crypto withdrawal destinations: USDT TRC20, USDT ERC20, ETH, BTC. Add new chains, adjust fixed network fees, or update payout instructions.
                        </p>
                      </div>
                      <button
                        onClick={handleOpenCreateWthGateway}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-blue-500/25 flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Crypto Gateway</span>
                      </button>
                    </div>

                    {/* Grid of Withdrawal Crypto Channels */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {withdrawalMethods.map((w) => (
                        <div
                          key={w.id}
                          className={`p-5 rounded-3xl border ${isLight ? 'bg-white border-slate-200 shadow-md' : 'bg-[#081729] border-white/10 shadow-xl'
                            } flex flex-col justify-between space-y-4`}
                        >
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <PaymentBrandIcon iconType={w.iconType as any} iconUrl={w.iconUrl} size="md" />
                                <div>
                                  <h4 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                    {w.name}
                                  </h4>
                                  <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                                    {w.network} • {w.currency || w.symbol}
                                  </span>
                                </div>
                              </div>

                              {/* Status Toggle Button */}
                              <button
                                onClick={() => toggleWithdrawalMethodStatus(w.id)}
                                className={`text-[10px] font-black px-2.5 py-1 rounded-full border transition-all cursor-pointer ${w.isActive
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-300'
                                    : 'bg-slate-500/20 border-slate-500/30 text-slate-400'
                                  }`}
                              >
                                {w.isActive ? 'Active' : 'Disabled'}
                              </button>
                            </div>

                            {/* Parameters Box */}
                            <div
                              className={`p-3 rounded-2xl ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-black/30 border border-white/5'
                                } space-y-2 text-xs font-mono`}
                            >
                              <div className="flex justify-between items-center text-[11px]">
                                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Network Gas/Fee:</span>
                                <span className="font-black text-amber-500">${(w.fee ?? w.feeFixed ?? 1).toFixed(2)} Fixed</span>
                              </div>
                              <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-200/80 dark:border-white/10">
                                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Min Withdrawal:</span>
                                <span className="font-bold text-emerald-500">${w.minWithdrawal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-200/80 dark:border-white/10">
                                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Max Withdrawal:</span>
                                <span className="font-bold text-blue-500">${w.maxWithdrawal.toLocaleString()}</span>
                              </div>
                            </div>

                            {w.instructions && (
                              <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'} line-clamp-2`}>
                                {w.instructions}
                              </p>
                            )}
                          </div>

                          {/* Actions Footer */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80 dark:border-white/10">
                            <button
                              onClick={() => handleOpenEditWthGateway(w)}
                              className="flex-1 py-2 px-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Gateway</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete withdrawal gateway "${w.name}"?`)) {
                                  deleteWithdrawalMethod(w.id);
                                }
                              }}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs transition-colors cursor-pointer"
                              title="Delete Gateway"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Daily Distribution Working Hours & Real Schedule Settings */}
            {activeTab === 'distribution' && (
              <div className="space-y-4">
                {/* Header Card */}
                <div
                  className={`p-4 sm:p-5 rounded-3xl ${isLight ? 'bg-white border border-slate-200 shadow-md' : 'bg-[#091A2E] border border-white/10 shadow-xl'
                    } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-sky-400 border border-blue-500/30 uppercase">
                        Time Synchronization
                      </span>
                      <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        PostgreSQL Backed
                      </span>
                    </div>
                    <h3 className={`text-base sm:text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'} mt-1 font-['Outfit',sans-serif]`}>
                      Daily Distribution Working Hours &amp; Schedule
                    </h3>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                      Configure the exact time window when users are permitted to claim distributions. No random numbers — all users get the exact same synchronized real-time countdown.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleImmediateClaim}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${distForm.allowImmediateClaim
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25'
                          : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/25'
                        }`}
                    >
                      {distForm.allowImmediateClaim ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Distribution Forced OPEN</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4" />
                          <span>Allow Distribution NOW</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Current Live System Status Banner */}
                <div
                  className={`p-5 rounded-3xl border ${distForm.allowImmediateClaim || distributionStatus === 'open'
                      ? 'bg-gradient-to-br from-emerald-950/40 via-[#071E1C] to-[#041212] border-emerald-500/40'
                      : 'bg-gradient-to-br from-[#0B1B2B] via-[#0E243A] to-[#06111D] border-blue-500/30'
                    } shadow-xl relative overflow-hidden`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-300' : 'text-slate-400'}`}>
                          Active Status for All Logged-in Users
                        </span>
                        {distForm.allowImmediateClaim || distributionStatus === 'open' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                            WINDOW OPEN NOW
                          </span>
                        ) : distributionStatus === 'upcoming' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                            UPCOMING (STARTS AT {distForm.startTime} {distForm.timezone})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/40">
                            CLOSED FOR TODAY
                          </span>
                        )}
                      </div>

                      <div className="text-xl sm:text-2xl font-black text-white font-['Outfit',sans-serif]">
                        Current Schedule: {distributionFormattedWindow}
                      </div>
                      <p className="text-xs text-slate-300">
                        {distForm.allowImmediateClaim
                          ? '⚠️ Admin override active: All users can claim distributions immediately regardless of current hour.'
                          : `Operating strictly by schedule: Window opens at ${distForm.startTime} and closes at ${distForm.endTime} (${distForm.timezone}).`}
                      </p>
                    </div>

                    {/* Countdown Preview */}
                    <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center min-w-[200px]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Live Countdown
                      </span>
                      <div className="text-2xl font-black font-mono text-white tracking-widest">
                        {Math.floor(timeRemainingSeconds / 3600).toString().padStart(2, '0')}:
                        {Math.floor((timeRemainingSeconds % 3600) / 60).toString().padStart(2, '0')}:
                        {(timeRemainingSeconds % 60).toString().padStart(2, '0')}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1">
                        {distributionStatus === 'open' ? 'Time left in window' : 'Time until next window'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Configuration Form */}
                <div
                  className={`p-5 sm:p-6 rounded-3xl ${isLight ? 'bg-white border border-slate-200 shadow-md' : 'bg-[#091A2E] border border-white/10 shadow-xl'
                    } space-y-5`}
                >
                  <div>
                    <h4 className={`text-sm sm:text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Set Permitted Working Hours
                    </h4>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                      Specify when the system allows users to receive and claim their daily yield.
                    </p>
                  </div>

                  {/* Presets */}
                  <div>
                    <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'} block mb-2`}>
                      Quick Schedule Presets:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Default UTC (12:00 PM - 3:00 PM)', start: '12:00', end: '15:00', tz: 'UTC' },
                        { label: 'Evening UTC (06:00 PM - 09:00 PM)', start: '18:00', end: '21:00', tz: 'UTC' },
                        { label: 'Pakistan Standard (02:00 PM - 06:00 PM PKT)', start: '14:00', end: '18:00', tz: 'Asia/Karachi' },
                        { label: 'Gulf UAE Standard (03:00 PM - 07:00 PM GST)', start: '15:00', end: '19:00', tz: 'Asia/Dubai' },
                        { label: 'All-Day 24h Window', start: '00:00', end: '23:59', tz: 'UTC' },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setDistForm((prev) => ({
                              ...prev,
                              startTime: preset.start,
                              endTime: preset.end,
                              timezone: preset.tz,
                            }));
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${distForm.startTime === preset.start && distForm.endTime === preset.end && distForm.timezone === preset.tz
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : isLight
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                            }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSaveDistribution} className="space-y-4 pt-2 border-t border-slate-200/80 dark:border-white/10">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Start Time */}
                      <div className="space-y-1.5">
                        <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} flex items-center gap-1.5`}>
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span>Window Start Time (24h)</span>
                        </label>
                        <input
                          type="time"
                          required
                          value={distForm.startTime}
                          onChange={(e) => setDistForm({ ...distForm, startTime: e.target.value })}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold border transition-colors ${isLight
                              ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-500'
                              : 'bg-[#040C16] border-white/15 text-white focus:border-blue-500'
                            }`}
                        />
                        <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Example: 12:00 for 12:00 PM
                        </span>
                      </div>

                      {/* End Time */}
                      <div className="space-y-1.5">
                        <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} flex items-center gap-1.5`}>
                          <Clock className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Window End Time (24h)</span>
                        </label>
                        <input
                          type="time"
                          required
                          value={distForm.endTime}
                          onChange={(e) => setDistForm({ ...distForm, endTime: e.target.value })}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold border transition-colors ${isLight
                              ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-500'
                              : 'bg-[#040C16] border-white/15 text-white focus:border-blue-500'
                            }`}
                        />
                        <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Example: 15:00 for 03:00 PM
                        </span>
                      </div>

                      {/* Timezone */}
                      <div className="space-y-1.5">
                        <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                          Reference Timezone
                        </label>
                        <select
                          value={distForm.timezone}
                          onChange={(e) => setDistForm({ ...distForm, timezone: e.target.value })}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold border transition-colors ${isLight
                              ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-500'
                              : 'bg-[#040C16] border-white/15 text-white focus:border-blue-500'
                            }`}
                        >
                          <option value="UTC">UTC (Universal Coordinated Time)</option>
                          <option value="Asia/Karachi">Asia/Karachi (PKT, UTC+5)</option>
                          <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</option>
                          <option value="Europe/London">Europe/London (GMT/BST)</option>
                          <option value="America/New_York">America/New_York (EST/EDT)</option>
                        </select>
                        <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Determines clock evaluation standard
                        </span>
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Instant Force Open Toggle */}
                      <div
                        className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${distForm.allowImmediateClaim
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : isLight
                              ? 'bg-slate-50 border-slate-200'
                              : 'bg-white/5 border-white/10'
                          }`}
                      >
                        <div>
                          <span className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'} block`}>
                            Instant Allow (Force Open)
                          </span>
                          <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Bypass hours &amp; allow immediate claims.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDistForm((prev) => ({ ...prev, allowImmediateClaim: !prev.allowImmediateClaim }))}
                          className="cursor-pointer"
                        >
                          {distForm.allowImmediateClaim ? (
                            <ToggleRight className="w-7 h-7 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="w-7 h-7 text-slate-400" />
                          )}
                        </button>
                      </div>

                      {/* Auto-Claim Engine Toggle */}
                      <div
                        className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${distForm.autoClaimEnabled
                            ? 'bg-purple-500/10 border-purple-500/30'
                            : isLight
                              ? 'bg-slate-50 border-slate-200'
                              : 'bg-white/5 border-white/10'
                          }`}
                      >
                        <div>
                          <span className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'} block flex items-center gap-1.5`}>
                            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                            <span>Auto-Claim Engine</span>
                          </span>
                          <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Auto-credits wallets without manual claiming.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDistForm((prev) => ({ ...prev, autoClaimEnabled: !prev.autoClaimEnabled }))}
                          className="cursor-pointer"
                        >
                          {distForm.autoClaimEnabled ? (
                            <ToggleRight className="w-7 h-7 text-purple-500" />
                          ) : (
                            <ToggleLeft className="w-7 h-7 text-slate-400" />
                          )}
                        </button>
                      </div>

                      {/* Master Distribution Schedule Toggle */}
                      <div
                        className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${distForm.distributionEnabled
                            ? 'bg-blue-500/10 border-blue-500/30'
                            : isLight
                              ? 'bg-slate-50 border-slate-200'
                              : 'bg-white/5 border-white/10'
                          }`}
                      >
                        <div>
                          <span className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'} block`}>
                            Daily Distribution Active
                          </span>
                          <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Master switch for daily reward generation.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDistForm((prev) => ({ ...prev, distributionEnabled: !prev.distributionEnabled }))}
                          className="cursor-pointer"
                        >
                          {distForm.distributionEnabled ? (
                            <ToggleRight className="w-7 h-7 text-blue-500" />
                          ) : (
                            <ToggleLeft className="w-7 h-7 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {autoClaimSweepMessage && (
                      <div className="p-3.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-xs font-bold text-purple-300 flex items-center justify-between">
                        <span>{autoClaimSweepMessage}</span>
                        <button
                          type="button"
                          onClick={() => setAutoClaimSweepMessage(null)}
                          className="text-purple-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
                      <button
                        type="button"
                        onClick={handleTriggerAutoClaimSweep}
                        disabled={isRunningAutoClaim}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${isRunningAutoClaim ? 'animate-spin' : ''}`} />
                        <span>{isRunningAutoClaim ? 'Running Auto-Claim...' : 'Run Auto-Claim Now (Force Sweep)'}</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isSavingDist}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isSavingDist ? 'Saving to Database...' : 'Save Distribution Schedule'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Live Daily Claims & Dispute Audit Ledger Table */}
                <div
                  className={`p-5 sm:p-6 rounded-3xl ${isLight ? 'bg-white border border-slate-200 shadow-md' : 'bg-[#091A2E] border border-white/10 shadow-xl'
                    } space-y-4`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase">
                          Audit &amp; Dispute Protection
                        </span>
                        <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Total: {adminClaimsTotal} records
                        </span>
                      </div>
                      <h3 className={`text-base sm:text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'} mt-1 font-['Outfit',sans-serif]`}>
                        Live Daily Claims &amp; Rewards Audit Ledger
                      </h3>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                        Verify whether any user claimed their daily reward, the exact date &amp; timestamp of the claim, and transaction settlement references.
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative min-w-[200px]">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search user, plan, ref..."
                          value={adminClaimsSearch}
                          onChange={(e) => {
                            setAdminClaimsSearch(e.target.value);
                            fetchAdminClaims(adminClaimsFilter, e.target.value, 1);
                          }}
                          className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs border outline-none ${isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
                              : 'bg-[#040C16] border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500'
                            }`}
                        />
                      </div>

                      <div className="flex gap-1 overflow-x-auto">
                        {['all', 'Claimed', 'Available', 'Locked', 'Unlock Requested'].map((f) => (
                          <button
                            key={f}
                            onClick={() => {
                              setAdminClaimsFilter(f);
                              fetchAdminClaims(f, adminClaimsSearch, 1);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${adminClaimsFilter === f
                                ? 'bg-blue-600 text-white shadow-sm'
                                : isLight
                                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
                              }`}
                          >
                            {f === 'all' ? 'All' : f}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => fetchAdminClaims(adminClaimsFilter, adminClaimsSearch, adminClaimsPage)}
                        className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1"
                      >
                        ↻ Refresh
                      </button>
                    </div>
                  </div>

                  {/* Claims Table */}
                  <div className={`rounded-2xl overflow-hidden border ${isLight ? 'border-slate-200 shadow-xs' : 'border-white/10'}`}>
                    {adminClaimsLoading ? (
                      <div className={`p-10 text-center text-sm ${isLight ? 'text-slate-500 bg-white' : 'text-slate-400 bg-[#06121E]'}`}>
                        Loading claims ledger...
                      </div>
                    ) : adminClaims.length === 0 ? (
                      <div className={`p-10 text-center text-sm ${isLight ? 'text-slate-500 bg-white' : 'text-slate-400 bg-[#06121E]'}`}>
                        No daily claim records match the filter criteria.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className={isLight ? 'bg-slate-100 text-slate-600 uppercase font-black tracking-wider text-[10px]' : 'bg-[#040C16] text-slate-400 uppercase font-black tracking-wider text-[10px]'}>
                            <tr>
                              <th className="p-3.5">User</th>
                              <th className="p-3.5">Plan Name</th>
                              <th className="p-3.5">Reward Date</th>
                              <th className="p-3.5">Net Amount</th>
                              <th className="p-3.5">Status</th>
                              <th className="p-3.5">Claim Date &amp; Time (Timestamp)</th>
                              <th className="p-3.5">Transaction ID</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${isLight ? 'divide-slate-200 bg-white text-slate-800' : 'divide-white/5 bg-[#06121E] text-slate-200'}`}>
                            {adminClaims.map((c) => (
                              <tr key={c.id} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5'}>
                                <td className="p-3.5">
                                  <div className="font-bold text-sm">{c.userName || 'Member'}</div>
                                  <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{c.userEmail}</div>
                                  <div className={`text-[9px] font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{c.userId}</div>
                                </td>
                                <td className="p-3.5">
                                  <span className="font-semibold">{c.planName}</span>
                                </td>
                                <td className="p-3.5">
                                  <div className="font-bold">{c.date}</div>
                                  <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {c.claimWindowStart} - {c.claimWindowEnd}
                                  </div>
                                </td>
                                <td className="p-3.5">
                                  <span className="font-mono font-black text-sm text-emerald-500">
                                    ${c.netAmount?.toFixed(2)}
                                  </span>
                                </td>
                                <td className="p-3.5">
                                  <span className={statusBadge(c.status)}>{c.status}</span>
                                </td>
                                <td className="p-3.5">
                                  {c.status === 'Claimed' ? (
                                    <div className="space-y-0.5">
                                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                        Claimed: {formatClaimDateTime(c.claimedAt) || 'Yes'}
                                      </span>
                                    </div>
                                  ) : c.status === 'Locked' ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg">
                                      <Lock className="w-3 h-3 text-red-500 shrink-0" />
                                      Missed Window (Locked)
                                    </span>
                                  ) : c.status === 'Unlock Requested' ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                                      <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                                      Unlock Pending Review
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-500 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">
                                      <Clock className="w-3 h-3 text-blue-500 shrink-0" />
                                      Awaiting Claim (Available)
                                    </span>
                                  )}
                                </td>
                                <td className="p-3.5 font-mono text-[11px]">
                                  {c.transactionId ? (
                                    <span className={`px-2 py-0.5 rounded-md font-bold ${isLight ? 'bg-slate-100 text-slate-800' : 'bg-white/10 text-white'}`}>
                                      {c.transactionId}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">—</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Pagination footer */}
                  {adminClaimsTotal > 50 && (
                    <div className="flex items-center justify-between pt-2">
                      <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Showing page {adminClaimsPage} of {Math.ceil(adminClaimsTotal / 50)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          disabled={adminClaimsPage <= 1}
                          onClick={() => fetchAdminClaims(adminClaimsFilter, adminClaimsSearch, adminClaimsPage - 1)}
                          className="px-3 py-1.5 rounded-lg border text-xs font-bold disabled:opacity-40 cursor-pointer"
                        >
                          Previous
                        </button>
                        <button
                          disabled={adminClaimsPage >= Math.ceil(adminClaimsTotal / 50)}
                          onClick={() => fetchAdminClaims(adminClaimsFilter, adminClaimsSearch, adminClaimsPage + 1)}
                          className="px-3 py-1.5 rounded-lg border text-xs font-bold disabled:opacity-40 cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Unlock Requests */}
            {activeTab === 'unlocks' && (
              <div className="space-y-4">
                {/* Header Card */}
                <div
                  className={`p-4 sm:p-5 rounded-3xl ${isLight ? 'bg-white border border-slate-200 shadow-md' : 'bg-[#091A2E] border border-white/10 shadow-xl'
                    } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase">
                        Reward Unlock Desk
                      </span>
                      <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Total: {unlockRequests.length} requests
                      </span>
                    </div>
                    <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'} mt-1 font-['Outfit',sans-serif]`}>
                      Daily Reward Unlock Queue
                    </h3>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                      Review user petitions to unlock rewards locked by missing the distribution claim window.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRefreshUnlocks}
                      disabled={adminUnlocksLoading}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${adminUnlocksLoading ? 'animate-spin' : ''}`} />
                      <span>Refresh Queue</span>
                    </button>
                  </div>
                </div>

                {/* Filter Pills & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                    {[
                      { id: 'all', label: 'All Requests', count: unlockRequests.length },
                      { id: 'Under Support Review', label: 'Under Review', count: unlockRequests.filter((u) => u.status === 'Under Support Review').length },
                      { id: 'Approved', label: 'Approved', count: unlockRequests.filter((u) => u.status === 'Approved').length },
                      { id: 'Rejected', label: 'Rejected', count: unlockRequests.filter((u) => u.status === 'Rejected').length },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setAdminUnlocksFilter(f.id)}
                        className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${adminUnlocksFilter === f.id
                            ? 'bg-blue-600 text-white shadow-sm'
                            : isLight
                              ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                              : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                      >
                        <span>{f.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full ${adminUnlocksFilter === f.id
                              ? 'bg-white/20 text-white'
                              : isLight
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-white/10 text-slate-400'
                            }`}
                        >
                          {f.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="relative min-w-[220px]">
                    <input
                      type="text"
                      placeholder="Search user, ID, plan..."
                      value={adminUnlocksSearch}
                      onChange={(e) => setAdminUnlocksSearch(e.target.value)}
                      className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs ${isLight
                          ? 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400'
                          : 'bg-[#091A2E] border border-white/10 text-white placeholder:text-slate-500'
                        } outline-none focus:border-blue-500`}
                    />
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* List Card */}
                <div
                  className={`rounded-3xl ${isLight
                      ? 'bg-white border border-slate-200 shadow-md text-slate-900'
                      : 'bg-[#091A2E] border border-white/10 shadow-xl text-white'
                    } p-5 space-y-4`}
                >
                  {unlockRequests.filter((req) => {
                    const statusMatch = adminUnlocksFilter === 'all' || req.status === adminUnlocksFilter;
                    if (!statusMatch) return false;
                    if (!adminUnlocksSearch.trim()) return true;
                    const q = adminUnlocksSearch.toLowerCase();
                    const id = (req.id || '').toLowerCase();
                    const name = (req.userName || (req as any).user_name || '').toLowerCase();
                    const email = (req.userEmail || (req as any).user_email || '').toLowerCase();
                    const plan = (req.planName || (req as any).plan_name || '').toLowerCase();
                    return id.includes(q) || name.includes(q) || email.includes(q) || plan.includes(q);
                  }).length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <Lock className={`w-8 h-8 mx-auto ${isLight ? 'text-slate-300' : 'text-slate-600'}`} />
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        No unlock requests found matching the current filter.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {unlockRequests
                        .filter((req) => {
                          const statusMatch = adminUnlocksFilter === 'all' || req.status === adminUnlocksFilter;
                          if (!statusMatch) return false;
                          if (!adminUnlocksSearch.trim()) return true;
                          const q = adminUnlocksSearch.toLowerCase();
                          const id = (req.id || '').toLowerCase();
                          const name = (req.userName || (req as any).user_name || '').toLowerCase();
                          const email = (req.userEmail || (req as any).user_email || '').toLowerCase();
                          const plan = (req.planName || (req as any).plan_name || '').toLowerCase();
                          return id.includes(q) || name.includes(q) || email.includes(q) || plan.includes(q);
                        })
                        .map((req) => {
                          const isPending = req.status === 'Under Support Review';
                          const grossAmt = Number(req.grossReward ?? (req as any).gross_reward ?? 0);
                          const planTitle = req.planName || (req as any).plan_name || 'Daily Plan';
                          const usrName = req.userName || (req as any).user_name || 'Member';
                          const usrEmail = req.userEmail || (req as any).user_email || '';
                          const windowText = req.claimWindow || (req as any).claim_window || '12:00 PM - 3:00 PM';
                          const submitDate = req.submittedAt || (req as any).submitted_at || 'Recently';
                          const adminNoteText = req.adminNote || (req as any).admin_note;

                          return (
                            <div
                              key={req.id}
                              className={`p-4 rounded-2xl ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-[#06121F] border border-white/10'
                                } space-y-3`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-sky-400">{req.id}</span>
                                    <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                      User: {usrName}
                                    </span>
                                    {usrEmail && (
                                      <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                        ({usrEmail})
                                      </span>
                                    )}
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${req.status === 'Approved'
                                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                          : req.status === 'Rejected'
                                            ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                                        }`}
                                    >
                                      {req.status}
                                    </span>
                                  </div>
                                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-1`}>
                                    Reward: <strong className={isLight ? 'text-slate-800' : 'text-white'}>{planTitle}</strong> (${grossAmt.toFixed(2)}) • Window: {windowText} • Submitted: {typeof submitDate === 'string' && submitDate.includes('T') ? new Date(submitDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : submitDate}
                                  </p>
                                </div>

                                {/* Admin Actions */}
                                {isPending && (
                                  <div className="flex items-center gap-2 pt-2 sm:pt-0 shrink-0">
                                    <button
                                      disabled={unlockActionLoading === req.id}
                                      onClick={() => {
                                        setUnlockModalItem(req);
                                        setUnlockModalAction('reject');
                                        setUnlockActionNote('Missed window exceeds allowable threshold / non-verifiable reason.');
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                      <span>Reject</span>
                                    </button>
                                    <button
                                      disabled={unlockActionLoading === req.id}
                                      onClick={() => {
                                        setUnlockModalItem(req);
                                        setUnlockModalAction('approve');
                                        setUnlockActionNote('Reviewed and approved per grace policy. Reward unlocked.');
                                      }}
                                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Approve & Unlock</span>
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className={`text-xs ${isLight ? 'text-slate-700 bg-white border border-slate-200' : 'text-slate-300 bg-white/5 border border-white/5'} p-2.5 rounded-xl`}>
                                <span className={`font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>User Stated Reason:</span> "{req.reason || (req as any).reason || 'No statement provided'}"
                              </div>

                              {adminNoteText && (
                                <div className={`text-xs ${isLight ? 'text-amber-800 bg-amber-50 border border-amber-200' : 'text-amber-300 bg-amber-500/10 border border-amber-500/20'} p-2.5 rounded-xl border`}>
                                  <span className="font-semibold">Supervisor Action Note:</span> {adminNoteText}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Live KYC Queue (PostgreSQL Connected) */}
            {activeTab === 'kyc' && (
              <div className="space-y-4">
                <div
                  className={`p-4 sm:p-5 rounded-3xl ${isLight ? 'bg-white border border-slate-200 shadow-md' : 'bg-[#091A2E] border border-white/10 shadow-xl'
                    } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-sky-400 border border-blue-500/30 uppercase">
                        Compliance Audit Desk
                      </span>
                      <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Total: {adminKycList.length} submissions
                      </span>
                    </div>
                    <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'} mt-1 font-['Outfit',sans-serif]`}>
                      KYC Identity Verifications Queue
                    </h3>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                      Review Tier 1 (Personal &amp; Address details) and Tier 2 (National ID / DL / Passport scans &amp; live selfie photos).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => fetchLiveAdminKyc()}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <span>Refresh Queue</span>
                  </button>
                </div>

                {/* Search & Filter Bar Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                    <input
                      type="text"
                      value={adminKycSearch}
                      onChange={(e) => setAdminKycSearch(e.target.value)}
                      placeholder="Search member name, email, phone, user ID, doc number..."
                      className={`w-full pl-9.5 pr-9 py-2.5 rounded-2xl text-xs border outline-none transition-all ${isLight
                          ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 shadow-2xs'
                          : 'bg-[#071322] border-white/10 text-white placeholder:text-slate-500 focus:border-sky-500 shadow-inner'
                        }`}
                    />
                    {adminKycSearch && (
                      <button
                        type="button"
                        onClick={() => setAdminKycSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
                    {[
                      { id: 'all', label: 'All Records', count: adminKycList.length },
                      { id: 'Under Review', label: 'Under Review', count: adminKycList.filter((k) => k.status === 'Under Review').length },
                      { id: 'Submitted', label: 'Tier 1 Submitted', count: adminKycList.filter((k) => k.status === 'Submitted').length },
                      { id: 'Approved', label: 'Approved', count: adminKycList.filter((k) => k.status === 'Approved').length },
                      { id: 'Rejected', label: 'Rejected', count: adminKycList.filter((k) => k.status === 'Rejected').length },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setAdminKycFilter(f.id)}
                        className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${adminKycFilter === f.id
                            ? 'bg-blue-600 text-white shadow-sm'
                            : isLight
                              ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                              : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                      >
                        <span>{f.label}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${adminKycFilter === f.id ? 'bg-black/20 text-white' : 'bg-black/10 dark:bg-white/10'
                          }`}>
                          {f.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Search Filter Status */}
                {adminKycSearch.trim() && (
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                      Showing <strong className={isLight ? 'text-slate-900' : 'text-white'}>{filteredKycList.length}</strong> matching {filteredKycList.length === 1 ? 'record' : 'records'} for <strong className="text-blue-500">"{adminKycSearch}"</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdminKycSearch('')}
                      className="text-xs text-blue-500 hover:underline font-bold cursor-pointer"
                    >
                      Reset Search
                    </button>
                  </div>
                )}

                {/* KYC Records List */}
                {adminKycLoading ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Loading KYC queue records from database...
                  </div>
                ) : filteredKycList.length === 0 ? (
                  <div
                    className={`p-10 rounded-3xl border text-center ${isLight ? 'bg-white border-slate-200' : 'bg-[#091A2E] border-white/10'
                      } space-y-2`}
                  >
                    <Search className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
                    <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {adminKycSearch ? `No Member Found Matching "${adminKycSearch}"` : 'No KYC Submissions Matching Filter'}
                    </h4>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {adminKycSearch
                        ? 'No KYC submissions or registered users match your search query. Try searching by Name, Email, Phone, or User ID.'
                        : `No member verification records found in the "${adminKycFilter}" category.`}
                    </p>
                    {adminKycSearch && (
                      <button
                        type="button"
                        onClick={() => setAdminKycSearch('')}
                        className="mt-2 px-3.5 py-1.5 rounded-xl bg-blue-600/10 text-blue-600 dark:text-sky-400 text-xs font-bold hover:bg-blue-600/20 transition-all cursor-pointer inline-block"
                      >
                        Clear Search Filter
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredKycList.map((k) => {
                      const itemKey = k.id || k.userId;
                      const isExpanded = expandedKycId === itemKey;
                      const currentSubTab = kycSubTab[itemKey] || 'basic';
                      const hasAdvanceDocs = !!(k.hasFrontDoc || k.hasSelfie || k.documentFrontUrl || k.frontDocUrl || k.selfieUrl);

                      return (
                        <div
                          key={itemKey}
                          className={`rounded-2xl sm:rounded-3xl border transition-all ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#081729] border-white/10 shadow-lg'
                            } ${isExpanded ? (isLight ? 'ring-2 ring-blue-500/20' : 'ring-2 ring-sky-500/20') : ''}`}
                        >
                          {/* Compact Summary Header Row (Click to Expand / Collapse) */}
                          <div
                            onClick={() => setExpandedKycId(prev => (prev === itemKey ? null : itemKey))}
                            className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors ${isLight ? 'hover:bg-slate-50/80' : 'hover:bg-white/[0.02]'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md shadow-blue-500/15">
                                {(k.fullName || k.userName || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className={`text-sm font-black truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                    {k.fullName || k.userName || 'Member'}
                                  </h4>
                                  <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-blue-500/10 text-blue-600 dark:text-sky-400 border border-blue-500/20 font-bold">
                                    {k.userId}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                                    {k.docType || k.documentType || 'National ID'}
                                  </span>
                                </div>
                                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} truncate mt-0.5`}>
                                  {k.userEmail || 'No email provided'} • {k.country || 'Global'}
                                </p>
                              </div>
                            </div>

                            {/* Status + Badges + Expand Button */}
                            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto shrink-0" onClick={e => e.stopPropagation()}>
                              {/* Tier 1 Status */}
                              <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${k.basicStatus === 'Approved' || k.first_name || k.docNumber || k.documentNumber
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                                    : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20'
                                  }`}
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span>Tier 1: {k.basicStatus === 'Approved' || k.docNumber || k.documentNumber ? 'Verified' : 'Pending'}</span>
                              </span>

                              {/* Tier 2 Verification Status Badge */}
                              <span
                                className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${k.status === 'Approved' || k.advanceStatus === 'Approved'
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                    : k.status === 'Under Review' || k.advanceStatus === 'Under Review'
                                      ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30 animate-pulse'
                                      : k.status === 'Rejected' || k.advanceStatus === 'Rejected'
                                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                                        : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                                  }`}
                              >
                                <span>Tier 2: {
                                  k.status === 'Approved' || k.advanceStatus === 'Approved'
                                    ? 'Approved'
                                    : k.status === 'Under Review' || k.advanceStatus === 'Under Review'
                                      ? 'Under Review'
                                      : k.status === 'Rejected' || k.advanceStatus === 'Rejected'
                                        ? 'Rejected'
                                        : hasAdvanceDocs
                                          ? 'Submitted'
                                          : 'Not Attached'
                                }</span>
                              </span>

                              {/* Expand / Collapse Button */}
                              <button
                                type="button"
                                onClick={() => setExpandedKycId(prev => (prev === itemKey ? null : itemKey))}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${isExpanded
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : isLight
                                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                      : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/10'
                                  }`}
                              >
                                <span>{isExpanded ? 'Hide Details' : 'Review Details'}</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* ── LAZY-LOADED EXPANDED DETAILS ──────────────── */}
                          {isExpanded && (
                            <div className="p-4 sm:p-6 border-t border-slate-200/80 dark:border-white/10 space-y-5 animate-in fade-in duration-200">
                              {k.unsubmitted ? (
                                <div className="space-y-4">
                                  <div className={`p-4 sm:p-5 rounded-2xl border ${isLight ? 'bg-amber-50/80 border-amber-200 text-amber-900' : 'bg-amber-500/10 border-amber-500/25 text-amber-200'}`}>
                                    <div className="flex items-start gap-3">
                                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                      <div className="space-y-1.5 flex-1">
                                        <h5 className="text-sm font-bold">No KYC Verification Submitted Yet</h5>
                                        <p className="text-xs opacity-85">
                                          This member is registered in the system but has not yet initiated their Tier 1 (Identity Info) or Tier 2 (Document &amp; Live Selfie) submission.
                                        </p>
                                        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                                          <div className={`p-2.5 rounded-xl ${isLight ? 'bg-white/80 border border-amber-100' : 'bg-black/20 border border-white/5'}`}>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase">Member ID</div>
                                            <div className="font-mono font-bold mt-0.5">{k.userId}</div>
                                          </div>
                                          <div className={`p-2.5 rounded-xl ${isLight ? 'bg-white/80 border border-amber-100' : 'bg-black/20 border border-white/5'}`}>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase">Email Address</div>
                                            <div className="font-bold truncate mt-0.5">{k.userEmail || '—'}</div>
                                          </div>
                                          <div className={`p-2.5 rounded-xl ${isLight ? 'bg-white/80 border border-amber-100' : 'bg-black/20 border border-white/5'}`}>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</div>
                                            <div className="font-bold mt-0.5">{k.userPhone || '—'}</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between pt-2">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedKycId(null)}
                                      className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                                    >
                                      Collapse
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleToggleAdvanceKyc(k.userId, !!k.advanceKycAllowed);
                                      }}
                                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                    >
                                      <ShieldCheck className="w-3.5 h-3.5" />
                                      <span>{k.advanceKycAllowed ? 'Revoke Advance KYC Access' : 'Authorize Advance KYC Access'}</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {/* Inner Sub-navigation Tabs: Basic first, then Advance */}
                                  <div className={`p-1.5 rounded-2xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/30 border-white/10'} flex items-center gap-2`}>
                                    <button
                                      type="button"
                                      onClick={() => setKycSubTab(prev => ({ ...prev, [itemKey]: 'basic' }))}
                                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${currentSubTab === 'basic'
                                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                                          : isLight
                                            ? 'text-slate-600 hover:text-slate-900'
                                            : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                      <span>1. Basic Identity Records</span>
                                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/15 font-mono">Tier 1</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setKycSubTab(prev => ({ ...prev, [itemKey]: 'advance' }));
                                        loadMemberKycDocs(k.userId || k.id);
                                      }}
                                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${currentSubTab === 'advance'
                                          ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/25'
                                          : isLight
                                            ? 'text-slate-600 hover:text-slate-900'
                                            : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                      <span>2. Advance Documents &amp; Selfie</span>
                                      <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${hasAdvanceDocs ? 'bg-emerald-500/20 text-emerald-200' : 'bg-slate-400/20 text-slate-300'
                                        }`}>
                                        {hasAdvanceDocs ? '✓ Uploaded' : 'Not Attached'}
                                      </span>
                                    </button>
                                  </div>

                                  {/* SUB-TAB 1: Basic Identity Information */}
                                  {currentSubTab === 'basic' && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                        {/* Left: Identity Credentials */}
                                        <div
                                          className={`p-4 rounded-2xl ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-black/25 border border-white/5'
                                            } space-y-2.5`}
                                        >
                                          <span className="text-[10px] uppercase font-black tracking-wider text-blue-600 dark:text-sky-400 block">
                                            Official Document Credentials
                                          </span>
                                          <div className="space-y-1.5 text-xs">
                                            <div className="flex justify-between py-0.5">
                                              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Full Legal Name:</span>
                                              <span className="font-bold text-slate-900 dark:text-white">{k.fullName || k.userName || '—'}</span>
                                            </div>
                                            <div className="flex justify-between py-0.5">
                                              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Document Type:</span>
                                              <span className="font-bold">{k.docType || k.documentType || 'National ID'}</span>
                                            </div>
                                            <div className="flex justify-between py-0.5">
                                              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Document Number:</span>
                                              <span className="font-mono font-black text-blue-600 dark:text-sky-300 select-all">
                                                {k.docNumber || k.documentNumber || '—'}
                                              </span>
                                            </div>
                                            <div className="flex justify-between py-0.5">
                                              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Country of Issue:</span>
                                              <span className="font-bold">{k.countryOfIssue || k.country || '—'}</span>
                                            </div>
                                            <div className="flex justify-between py-0.5">
                                              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Date of Birth:</span>
                                              <span className="font-mono">{k.dob || '—'}</span>
                                            </div>
                                            {(k.issueDate || k.expiryDate) && (
                                              <div className="flex justify-between text-[11px] pt-1.5 border-t border-slate-200/80 dark:border-white/10">
                                                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Validity Window:</span>
                                                <span className="font-mono">
                                                  {k.issueDate || '—'} to {k.expiryDate || 'No Expiry'}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Right: Residential Address */}
                                        <div
                                          className={`p-4 rounded-2xl ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-black/25 border border-white/5'
                                            } space-y-2.5`}
                                        >
                                          <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400 block">
                                            Residential Address Record
                                          </span>
                                          <div className="space-y-1.5 text-xs">
                                            <div>
                                              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} block`}>
                                                Street Address:
                                              </span>
                                              <span className="font-bold block text-slate-900 dark:text-white">{k.address || 'Address not provided'}</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 dark:border-white/10">
                                              <div>
                                                <span className={`text-[9px] ${isLight ? 'text-slate-500' : 'text-slate-400'} block`}>City:</span>
                                                <span className="font-bold">{k.city || '—'}</span>
                                              </div>
                                              <div>
                                                <span className={`text-[9px] ${isLight ? 'text-slate-500' : 'text-slate-400'} block`}>State:</span>
                                                <span className="font-bold">{k.state || '—'}</span>
                                              </div>
                                              <div>
                                                <span className={`text-[9px] ${isLight ? 'text-slate-500' : 'text-slate-400'} block`}>Postal Code:</span>
                                                <span className="font-mono font-bold">{k.postalCode || '—'}</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Button to navigate to advance docs */}
                                      <div className="flex justify-end pt-1">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setKycSubTab(prev => ({ ...prev, [itemKey]: 'advance' }));
                                            loadMemberKycDocs(k.userId || k.id);
                                          }}
                                          className="px-4 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-indigo-500/20"
                                        >
                                          <span>Review Advance Documents (Scans &amp; Selfie)</span>
                                          <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* SUB-TAB 2: Advance Document Proofs (Heavy images mounted lazily on-demand) */}
                                  {currentSubTab === 'advance' && (() => {
                                    const memberDocs = loadedKycDocs[k.userId] || loadedKycDocs[k.id];
                                    const frontImg = memberDocs?.front ?? k.documentFrontUrl ?? k.frontDocUrl;
                                    const backImg = memberDocs?.back ?? k.documentBackUrl ?? k.backDocUrl;
                                    const selfieImg = memberDocs?.selfie ?? k.selfieUrl;
                                    const isDocLoading = memberDocs?.loading;
                                    const docError = memberDocs?.error;

                                    return (
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                          <span className={`text-[10px] uppercase font-black tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'} block`}>
                                            Uploaded Document Scans &amp; Face Liveness Verification
                                          </span>
                                          {hasAdvanceDocs && !isDocLoading && (
                                            <button
                                              type="button"
                                              onClick={() => loadMemberKycDocs(k.userId || k.id)}
                                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 cursor-pointer transition-colors ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' : 'bg-white/10 hover:bg-white/15 text-slate-300 border-white/10'
                                                }`}
                                            >
                                              <RefreshCw className="w-3 h-3" />
                                              <span>Reload Proofs</span>
                                            </button>
                                          )}
                                        </div>

                                        {isDocLoading ? (
                                          <div className={`p-8 rounded-2xl border text-center space-y-3 ${isLight ? 'bg-indigo-50/60 border-indigo-200/60' : 'bg-indigo-950/20 border-indigo-500/25'}`}>
                                            <div className="w-8 h-8 mx-auto rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                                            <div>
                                              <h5 className={`text-xs font-black ${isLight ? 'text-indigo-950' : 'text-indigo-300'}`}>
                                                Fetching Encrypted Identity Proofs &amp; Live Selfie...
                                              </h5>
                                              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                                                Documents are loaded on-demand for this member to prevent server bottlenecks and keep platform performance ultra-fast.
                                              </p>
                                            </div>
                                          </div>
                                        ) : docError ? (
                                          <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-center space-y-2">
                                            <p className="text-xs font-bold text-rose-500">Failed to load documents on-demand: {docError}</p>
                                            <button
                                              type="button"
                                              onClick={() => loadMemberKycDocs(k.userId || k.id)}
                                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                                            >
                                              <RefreshCw className="w-3 h-3" />
                                              <span>Retry Loading Documents</span>
                                            </button>
                                          </div>
                                        ) : !frontImg && !selfieImg && hasAdvanceDocs ? (
                                          <div className={`p-6 rounded-2xl border text-center space-y-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'}`}>
                                            <FileText className="w-8 h-8 mx-auto text-indigo-400" />
                                            <div>
                                              <h5 className="text-xs font-bold">Advance Identity Documents Recorded</h5>
                                              <p className="text-[11px] text-slate-400 mt-0.5">Click below to fetch the high-resolution encrypted scans and live face selfie.</p>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => loadMemberKycDocs(k.userId || k.id)}
                                              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 cursor-pointer inline-flex items-center gap-1.5"
                                            >
                                              <Eye className="w-3.5 h-3.5" />
                                              <span>Load Scans &amp; Selfie</span>
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {/* Front Document */}
                                            <div
                                              className={`p-3 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
                                                } text-center space-y-2`}
                                            >
                                              <span className={`text-[11px] font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'} block`}>
                                                Front of Document
                                              </span>
                                              {frontImg ? (
                                                <div className="relative h-32 rounded-xl overflow-hidden group bg-slate-900/10 border border-slate-200/50 dark:border-white/10">
                                                  <img
                                                    src={frontImg}
                                                    alt="Front Scan"
                                                    loading="lazy"
                                                    className="w-full h-full object-contain"
                                                  />
                                                  <button
                                                    type="button"
                                                    onClick={() => setKycLightboxImg(frontImg)}
                                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5 cursor-pointer backdrop-blur-[2px]"
                                                  >
                                                    <Eye className="w-4 h-4" />
                                                    <span>Inspect Full View</span>
                                                  </button>
                                                </div>
                                              ) : (
                                                <div className="h-32 rounded-xl border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center text-[11px] text-slate-400">
                                                  Not Attached
                                                </div>
                                              )}
                                            </div>

                                            {/* Back Document */}
                                            <div
                                              className={`p-3 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
                                                } text-center space-y-2`}
                                            >
                                              <span className={`text-[11px] font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'} block`}>
                                                Back of Document
                                              </span>
                                              {backImg ? (
                                                <div className="relative h-32 rounded-xl overflow-hidden group bg-slate-900/10 border border-slate-200/50 dark:border-white/10">
                                                  <img
                                                    src={backImg}
                                                    alt="Back Scan"
                                                    loading="lazy"
                                                    className="w-full h-full object-contain"
                                                  />
                                                  <button
                                                    type="button"
                                                    onClick={() => setKycLightboxImg(backImg)}
                                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5 cursor-pointer backdrop-blur-[2px]"
                                                  >
                                                    <Eye className="w-4 h-4" />
                                                    <span>Inspect Full View</span>
                                                  </button>
                                                </div>
                                              ) : (
                                                <div className="h-32 rounded-xl border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center text-[11px] text-slate-400">
                                                  {k.docType === 'Passport' ? 'Not Required (Passport)' : 'Not Attached'}
                                                </div>
                                              )}
                                            </div>

                                            {/* Selfie Liveness */}
                                            <div
                                              className={`p-3 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
                                                } text-center space-y-2`}
                                            >
                                              <span className={`text-[11px] font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'} block`}>
                                                Live Selfie with ID
                                              </span>
                                              {selfieImg ? (
                                                <div className="relative h-32 rounded-xl overflow-hidden group bg-slate-900/10 border border-slate-200/50 dark:border-white/10">
                                                  <img
                                                    src={selfieImg}
                                                    alt="Live Selfie"
                                                    loading="lazy"
                                                    className="w-full h-full object-contain"
                                                  />
                                                  <button
                                                    type="button"
                                                    onClick={() => setKycLightboxImg(selfieImg)}
                                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5 cursor-pointer backdrop-blur-[2px]"
                                                  >
                                                    <Eye className="w-4 h-4" />
                                                    <span>Inspect Full View</span>
                                                  </button>
                                                </div>
                                              ) : (
                                                <div className="h-32 rounded-xl border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center text-[11px] text-slate-400">
                                                  Not Attached
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}

                                  {/* Rejection Note Display if rejected */}
                                  {k.rejectionReason && (
                                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-600 dark:text-rose-400">
                                      <span className="font-bold">Rejection Note:</span> {k.rejectionReason}
                                    </div>
                                  )}

                                  {/* Approval & Rejection Controls */}
                                  <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-200/80 dark:border-white/10 flex-wrap">
                                    {/* Allow / Revoke Advance KYC */}
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const newVal = !k.advanceKycAllowed;
                                        const r = await fetch(`/api/admin/kyc/${k.userId}/allow-advance`, {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ allow: newVal }),
                                        });
                                        if (r.ok) {
                                          fetchLiveAdminKyc();
                                        }
                                      }}
                                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${k.advanceKycAllowed
                                          ? 'bg-slate-500/10 hover:bg-slate-500/20 text-slate-500 dark:text-slate-400 border-slate-500/20'
                                          : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border-amber-500/30'
                                        }`}
                                    >
                                      {k.advanceKycAllowed ? (
                                        <><Lock className="w-3.5 h-3.5" /><span>Revoke Advance KYC</span></>
                                      ) : (
                                        <><ShieldCheck className="w-3.5 h-3.5" /><span>Allow Advance KYC</span></>
                                      )}
                                    </button>

                                    <div className="flex items-center gap-2 ml-auto">
                                      <button
                                        type="button"
                                        onClick={() => setExpandedKycId(null)}
                                        className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                                          }`}
                                      >
                                        Collapse
                                      </button>

                                      {k.status !== 'Rejected' && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setKycRejectModalItem(k);
                                            setKycRejectReason('Document photos blurry or unreadable. Please provide higher resolution photos.');
                                          }}
                                          className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                        >
                                          <XCircle className="w-4 h-4" />
                                          <span>Reject KYC</span>
                                        </button>
                                      )}

                                      {k.status !== 'Approved' && (
                                        <button
                                          type="button"
                                          onClick={() => handleApproveKycItem(k)}
                                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
                                        >
                                          <CheckCircle2 className="w-4 h-4" />
                                          <span>Approve Identity</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* MODAL: Reject KYC with Reason */}
            {kycRejectModalItem && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
                <div
                  className={`w-full max-w-lg rounded-3xl p-6 ${isLight ? 'bg-white border border-slate-200 shadow-2xl text-slate-900' : 'bg-[#0A1929] border border-white/10 shadow-2xl text-white'
                    } space-y-4`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center text-sm font-black">
                        ✕
                      </span>
                      <div>
                        <h3 className="text-base font-black">Reject KYC Verification</h3>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Member: {kycRejectModalItem.fullName || kycRejectModalItem.userName} ({kycRejectModalItem.userId})
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setKycRejectModalItem(null); setKycRejectReason(''); }}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <label className="block font-bold">Reason for Rejection (Displayed to Member):</label>

                    {/* Quick Preset Reason Chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Document photo blurry or unreadable',
                        'Document expired or invalid',
                        'Selfie holding ID photo missing or dark',
                        'Name does not match government document',
                        'Address mismatch with proof of residence',
                      ].map((reasonChip) => (
                        <button
                          key={reasonChip}
                          type="button"
                          onClick={() => setKycRejectReason(reasonChip)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${kycRejectReason === reasonChip
                              ? 'bg-rose-600 text-white border-rose-600'
                              : isLight
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                            }`}
                        >
                          {reasonChip}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={3}
                      required
                      value={kycRejectReason}
                      onChange={(e) => setKycRejectReason(e.target.value)}
                      placeholder="Enter detailed instructions for member to rectify..."
                      className={`w-full px-3.5 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                        } outline-none focus:border-rose-500 font-medium resize-none`}
                    />

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => { setKycRejectModalItem(null); setKycRejectReason(''); }}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleRejectKycItem}
                        className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-md shadow-rose-500/20"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL: Full-Res KYC Lightbox Image Inspection */}
            {kycLightboxImg && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
                <div className="max-w-4xl w-full space-y-3">
                  <div className="flex justify-between items-center text-white">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Admin KYC Document Inspection View</span>
                    </span>
                    <button
                      onClick={() => setKycLightboxImg(null)}
                      className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-white/20 bg-black flex items-center justify-center max-h-[85vh]">
                    <img src={kycLightboxImg} alt="Inspection" className="max-h-[85vh] w-auto object-contain" />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Deposits */}
            {activeTab === 'deposits' && (
              <div
                className={`rounded-3xl ${isLight
                    ? 'bg-white border border-slate-200 shadow-md text-slate-900'
                    : 'bg-[#091A2E] border border-white/10 shadow-xl text-white'
                  } p-5 space-y-4`}
              >
                <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Incoming Escrow Deposits
                </h3>
                <div className="space-y-2">
                  {deposits.map((d) => (
                    <div
                      key={d.id}
                      className={`p-3.5 rounded-2xl ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-[#06121F] border border-white/10'
                        } flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <ArrowDownCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {d.paymentMethod} • Ref: {d.reference}
                          </h4>
                          <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Date: {d.createdAt}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          +${d.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
                          {d.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Withdrawals */}
            {activeTab === 'withdrawals' && (
              <div
                className={`rounded-3xl ${isLight
                    ? 'bg-white border border-slate-200 shadow-md text-slate-900'
                    : 'bg-[#091A2E] border border-white/10 shadow-xl text-white'
                  } p-5 space-y-4`}
              >
                <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Outgoing Withdrawal Liquidity
                </h3>
                <div className="space-y-2">
                  {withdrawals.map((w) => (
                    <div
                      key={w.id}
                      className={`p-3.5 rounded-2xl ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-[#06121F] border border-white/10'
                        } flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-sky-400 flex items-center justify-center">
                          <ArrowUpCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {w.paymentMethod} ({w.destinationDetails})
                          </h4>
                          <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Date: {w.createdAt}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          -${w.amount.toFixed(2)}
                        </span>
                        <span
                          className={`block text-[10px] font-bold ${w.status === 'Completed'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : w.status === 'Pending'
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-slate-400'
                            }`}
                        >
                          {w.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: Audit Logs */}
            {activeTab === 'audit' && (
              <div
                className={`rounded-3xl ${
                  isLight
                    ? 'bg-white border border-slate-200 shadow-md text-slate-900'
                    : 'bg-[#091A2E] border border-white/10 shadow-xl text-white'
                } p-5 sm:p-6 space-y-5`}
              >
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-sky-400 border border-blue-500/20">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          Security & System Audit Logs
                        </h3>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                          {auditTotalCount} audit events recorded • Server lazy loaded with live pagination
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Search and Refresh */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative min-w-[240px] sm:min-w-[280px]">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search action, performer, user, IP..."
                        value={auditSearch}
                        onChange={(e) => setAuditSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setAuditPage(1);
                            fetchAuditLogs(1, auditPageSize, auditSearch);
                          }
                        }}
                        className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs font-medium outline-none transition-all ${
                          isLight
                            ? 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white'
                            : 'bg-[#06121F] border border-white/10 text-white placeholder-slate-500 focus:border-blue-400 focus:bg-[#081829]'
                        }`}
                      />
                      {auditSearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setAuditSearch('');
                            setAuditPage(1);
                            fetchAuditLogs(1, auditPageSize, '');
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 rounded cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAuditPage(1);
                        fetchAuditLogs(1, auditPageSize, auditSearch);
                      }}
                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Search</span>
                    </button>

                    <button
                      type="button"
                      disabled={auditLoading}
                      onClick={() => fetchAuditLogs(auditPage, auditPageSize, auditSearch)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                      }`}
                      title="Refresh Logs"
                    >
                      <RefreshCw className={`w-4 h-4 ${auditLoading ? 'animate-spin text-blue-500' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Sub-bar: Per-page chips */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Rows per page:
                    </span>
                    {[10, 25, 50].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setAuditPageSize(size);
                          setAuditPage(1);
                          fetchAuditLogs(1, size, auditSearch);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          auditPageSize === size
                            ? 'bg-blue-600 text-white shadow-xs'
                            : isLight
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {auditTotalCount === 0
                      ? '0 records'
                      : `Showing ${(auditPage - 1) * auditPageSize + 1}-${Math.min(
                          auditPage * auditPageSize,
                          auditTotalCount
                        )} of ${auditTotalCount} records`}
                  </span>
                </div>

                {/* Content Section */}
                {auditLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <RefreshCw className="w-7 h-7 animate-spin text-blue-500" />
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Loading audit logs from server...
                    </p>
                  </div>
                ) : auditList.length === 0 ? (
                  <div
                    className={`py-12 rounded-2xl border text-center space-y-2 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#06121F] border-white/5'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                      No audit records found
                    </p>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {auditSearch ? 'No logs match your search filter.' : 'System audit log is currently clean.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {auditList.map((log: any) => (
                      <div
                        key={log.id}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                          isLight
                            ? 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80'
                            : 'bg-[#06121F] hover:bg-[#071626] border-white/10'
                        } flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs`}
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-500/15 text-blue-600 dark:text-sky-400 border border-blue-500/25">
                              {log.action}
                            </span>
                            {log.ipAddress && (
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                                  isLight ? 'bg-slate-200/70 text-slate-700' : 'bg-white/5 text-slate-300'
                                }`}
                              >
                                IP: {log.ipAddress}
                              </span>
                            )}
                          </div>

                          <p
                            className={`${
                              isLight ? 'text-slate-700' : 'text-slate-200'
                            } text-xs font-medium leading-relaxed break-words`}
                          >
                            {log.details || 'No additional details logged.'}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                            {log.performedBy && (
                              <span>
                                Performed by:{' '}
                                <strong className={isLight ? 'text-slate-700' : 'text-slate-200'}>
                                  {log.performedBy}
                                </strong>
                              </span>
                            )}
                            {log.targetUser && (
                              <span>
                                Target user:{' '}
                                <strong className={isLight ? 'text-slate-700' : 'text-slate-200'}>
                                  {log.targetUser}
                                </strong>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.timestamp || log.createdAt || 'Recent'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                <div
                  className={`pt-4 border-t ${
                    isLight ? 'border-slate-200/80' : 'border-white/10'
                  } flex flex-wrap items-center justify-between gap-3`}
                >
                  <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Page <strong className={isLight ? 'text-slate-800' : 'text-white'}>{auditPage}</strong> of{' '}
                    <strong className={isLight ? 'text-slate-800' : 'text-white'}>{auditTotalPages}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={auditPage <= 1 || auditLoading}
                      onClick={() => {
                        const p = Math.max(1, auditPage - 1);
                        setAuditPage(p);
                        fetchAuditLogs(p, auditPageSize, auditSearch);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                        isLight
                          ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          : 'bg-[#06121F] hover:bg-[#081829] border-white/10 text-slate-200'
                      }`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    <div
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-700'
                          : 'bg-[#06121F] border-white/10 text-white'
                      }`}
                    >
                      {auditPage} / {auditTotalPages}
                    </div>

                    <button
                      type="button"
                      disabled={auditPage >= auditTotalPages || auditLoading}
                      onClick={() => {
                        const p = Math.min(auditTotalPages, auditPage + 1);
                        setAuditPage(p);
                        fetchAuditLogs(p, auditPageSize, auditSearch);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                        isLight
                          ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          : 'bg-[#06121F] hover:bg-[#081829] border-white/10 text-slate-200'
                      }`}
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: Splash Screen Editor */}
            {activeTab === 'splash' && (
              <div
                className={`rounded-3xl ${isLight
                    ? 'bg-white border border-slate-200 shadow-md text-slate-900'
                    : 'bg-[#091A2E] border border-white/10 shadow-xl text-white'
                  } p-5 space-y-4`}
              >
                <div>
                  <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-2`}>
                    <ImageIcon className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                    Splash Screen Editor
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-1`}>
                    Changes are live immediately — users will see them on next app open.
                  </p>
                </div>

                <div className="space-y-4">
                  {splashSlides.map((slide, idx) => (
                    <SplashSlideEditor
                      key={idx}
                      index={idx}
                      slide={slide}
                      isLight={isLight}
                      onUpdate={(field, value) => updateSplashSlide(idx, { [field]: value } as Partial<SplashSlide>)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: Database Backup & Disaster Recovery */}
            {activeTab === 'backup' && (
              <div className="space-y-6">
                {/* Header Card */}
                <div
                  className={`rounded-3xl ${
                    isLight
                      ? 'bg-white border border-slate-200 shadow-md text-slate-900'
                      : 'bg-[#091A2E] border border-white/10 shadow-xl text-white'
                  } p-6 sm:p-7 relative overflow-hidden`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30 shrink-0">
                        <Database className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className={`text-lg sm:text-xl font-black font-['Outfit',sans-serif] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            PostgreSQL Database Backup & Disaster Recovery
                          </h2>
                          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            Live SQL Engine
                          </span>
                        </div>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-1`}>
                          Export full standalone `.sql` snapshots to your device or restore tables directly from uploaded backup files.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                      <button
                        type="button"
                        onClick={fetchDatabaseInfo}
                        disabled={dbInfoLoading}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                          isLight
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                        }`}
                        title="Refresh Database Diagnostics"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${dbInfoLoading ? 'animate-spin text-amber-500' : ''}`} />
                        <span>Refresh Metrics</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Metrics Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Storage Size */}
                  <div
                    className={`rounded-2xl p-5 border transition-all ${
                      isLight
                        ? 'bg-white border-slate-200 shadow-sm'
                        : 'bg-[#091A2E] border-white/10 shadow-lg'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Database Size
                      </span>
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        <HardDrive className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className={`text-2xl font-black font-['Outfit',sans-serif] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {dbInfoLoading ? '...' : dbInfo?.databaseSize || '2.8 MB'}
                      </span>
                      <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-slate-400'} mt-0.5`}>
                        Database: <strong className={isLight ? 'text-slate-700' : 'text-slate-200'}>{dbInfo?.databaseName || 'rentobit'}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Card 2: Schema Tables */}
                  <div
                    className={`rounded-2xl p-5 border transition-all ${
                      isLight
                        ? 'bg-white border-slate-200 shadow-sm'
                        : 'bg-[#091A2E] border-white/10 shadow-lg'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Public Tables
                      </span>
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                        <Layers className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className={`text-2xl font-black font-['Outfit',sans-serif] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {dbInfoLoading ? '...' : `${dbInfo?.totalTables || 16} Tables`}
                      </span>
                      <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-slate-400'} mt-0.5`}>
                        Schema: <strong className={isLight ? 'text-slate-700' : 'text-slate-200'}>public</strong> · Port {dbInfo?.port || 5432}
                      </p>
                    </div>
                  </div>

                  {/* Card 3: Core Records */}
                  <div
                    className={`rounded-2xl p-5 border transition-all ${
                      isLight
                        ? 'bg-white border-slate-200 shadow-sm'
                        : 'bg-[#091A2E] border-white/10 shadow-lg'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Core Records
                      </span>
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className={`text-2xl font-black font-['Outfit',sans-serif] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {dbInfoLoading
                          ? '...'
                          : `${(
                              (dbInfo?.tableRows?.users || 0) +
                              (dbInfo?.tableRows?.deposits || 0) +
                              (dbInfo?.tableRows?.withdrawals || 0) +
                              (dbInfo?.tableRows?.investments || 0)
                            ).toLocaleString()} Rows`}
                      </span>
                      <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-slate-400'} mt-0.5`}>
                        {dbInfo?.tableRows?.users || 0} users · {dbInfo?.tableRows?.deposits || 0} deposits
                      </p>
                    </div>
                  </div>

                  {/* Card 4: Last Activity */}
                  <div
                    className={`rounded-2xl p-5 border transition-all ${
                      isLight
                        ? 'bg-white border-slate-200 shadow-sm'
                        : 'bg-[#091A2E] border-white/10 shadow-lg'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Last Recovery Action
                      </span>
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className={`text-sm font-bold truncate block ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                        {dbInfo?.lastBackupAt ? 'Snapshot Saved' : dbInfo?.lastRestoreAt ? 'Restored' : 'Never'}
                      </span>
                      <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5 truncate`}>
                        {dbInfo?.lastBackupAt || dbInfo?.lastRestoreAt || 'No backup taken yet'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main Operations Split: Backup vs Restore */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* PANEL 1: Export & Download SQL */}
                  <div
                    className={`rounded-3xl border ${
                      isLight
                        ? 'bg-white border-slate-200 shadow-md'
                        : 'bg-[#091A2E] border-white/10 shadow-xl'
                    } p-6 flex flex-col justify-between space-y-6`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          <Download className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className={`text-base font-black font-['Outfit',sans-serif] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            Export & Download SQL Backup
                          </h3>
                          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Generate an offline .sql snapshot file of all tables and active records
                          </p>
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#06121F] border-white/10 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Target Database:</span>
                          <span className="font-mono font-bold">{dbInfo?.databaseName || 'rentobit'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Output Format:</span>
                          <span className="font-mono font-bold text-blue-500">PostgreSQL UTF-8 (.sql)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Engine Protocol:</span>
                          <span className="font-mono font-bold">DROP IF EXISTS + INSERT INTO</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Compatibility:</span>
                          <span className="font-mono font-bold">psql, pgAdmin, DBeaver, RentoBit</span>
                        </div>
                      </div>

                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} leading-relaxed`}>
                        The exported file contains the full database structure, active user accounts, wallets, investment plans, deposits, payouts, and compliance logs.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleDownloadBackup}
                        disabled={isExporting}
                        className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isExporting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Generating SQL Snapshot...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Download SQL Backup (.sql)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* PANEL 2: Upload & Restore SQL */}
                  <div
                    className={`rounded-3xl border ${
                      isLight
                        ? 'bg-white border-slate-200 shadow-md'
                        : 'bg-[#091A2E] border-white/10 shadow-xl'
                    } p-6 flex flex-col justify-between space-y-6`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className={`text-base font-black font-['Outfit',sans-serif] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            Restore Database from SQL File
                          </h3>
                          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Upload an existing .sql backup file to restore database tables
                          </p>
                        </div>
                      </div>

                      {/* Warning Notice */}
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium leading-relaxed">
                          <strong>Warning:</strong> Restoring will execute the SQL script against PostgreSQL. Data in affected tables will be updated according to the uploaded backup.
                        </p>
                      </div>

                      {/* File Selection Box */}
                      <div>
                        <label
                          htmlFor="sql-file-input"
                          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all block ${
                            restoreFile
                              ? isLight
                                ? 'border-emerald-500 bg-emerald-50/50'
                                : 'border-emerald-500/60 bg-emerald-500/5'
                              : isLight
                              ? 'border-slate-300 hover:border-blue-500 bg-slate-50'
                              : 'border-white/20 hover:border-blue-400 bg-[#06121F]'
                          }`}
                        >
                          <input
                            id="sql-file-input"
                            type="file"
                            accept=".sql,text/plain"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setRestoreFile(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />
                          {restoreFile ? (
                            <div className="space-y-1">
                              <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="font-mono truncate max-w-[260px]">{restoreFile.name}</span>
                              </div>
                              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                Size: {(restoreFile.size / 1024 / 1024).toFixed(2)} MB · Click to change file
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-1 py-1">
                              <UploadCloud className="w-6 h-6 mx-auto text-slate-400" />
                              <p className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                                Click or drag & drop to choose .sql backup file
                              </p>
                              <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
                                Standard PostgreSQL plain SQL dump files supported
                              </p>
                            </div>
                          )}
                        </label>
                      </div>

                      {/* Confirmation Checkbox */}
                      {restoreFile && (
                        <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={restoreConfirm}
                            onChange={(e) => setRestoreConfirm(e.target.checked)}
                            className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            I confirm that I want to restore the database from this backup file.
                          </span>
                        </label>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleExecuteRestore}
                        disabled={!restoreFile || !restoreConfirm || isRestoring}
                        className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isRestoring ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>{restoreProgress || 'Executing Database Restore...'}</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4" />
                            <span>Execute Database Restore</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table Breakdown Card */}
                <div
                  className={`rounded-3xl border ${
                    isLight
                      ? 'bg-white border-slate-200 shadow-md text-slate-900'
                      : 'bg-[#091A2E] border-white/10 shadow-xl text-white'
                  } p-6 space-y-4`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                    <div>
                      <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Database Schema Record Counts
                      </h3>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                        Live table record census before and after backup or restoration
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                    {[
                      { name: 'users', label: 'User Accounts', count: dbInfo?.tableRows?.users ?? 0 },
                      { name: 'deposits', label: 'Deposits', count: dbInfo?.tableRows?.deposits ?? 0 },
                      { name: 'withdrawals', label: 'Withdrawals', count: dbInfo?.tableRows?.withdrawals ?? 0 },
                      { name: 'investments', label: 'Active Plans', count: dbInfo?.tableRows?.investments ?? 0 },
                      { name: 'transactions', label: 'Ledger Records', count: dbInfo?.tableRows?.transactions ?? 0 },
                      { name: 'kyc', label: 'KYC Profiles', count: dbInfo?.tableRows?.kyc ?? 0 },
                      { name: 'audit_logs', label: 'Audit Logs', count: dbInfo?.tableRows?.auditLogs ?? 0 },
                      { name: 'plans', label: 'Fleet Plans', count: plans.length },
                    ].map((tbl) => (
                      <div
                        key={tbl.name}
                        className={`p-3 rounded-xl border flex flex-col justify-between ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#06121F] border-white/5'
                        }`}
                      >
                        <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {tbl.label}
                        </span>
                        <span className={`text-lg font-black font-['Outfit',sans-serif] mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {dbInfoLoading ? '...' : (tbl.count as number).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {planModalMode !== null && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
                <div
                  className={`w-full max-w-xl rounded-3xl ${isLight ? 'bg-white text-slate-900 border border-slate-200' : 'bg-[#091A2E] text-white border border-white/10'
                    } p-5 sm:p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                    <div>
                      <h3 className="text-base sm:text-lg font-black font-['Outfit',sans-serif]">
                        {planModalMode === 'create' ? 'Create New Investment Plan' : 'Edit Investment Plan'}
                      </h3>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Configure vehicle fleet tier, yield returns, and investment limits.
                      </p>
                    </div>
                    <button
                      onClick={() => setPlanModalMode(null)}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSavePlan} className="space-y-3.5 text-xs">
                    <div>
                      <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                        Plan Title / Package Name
                      </label>
                      <input
                        type="text"
                        required
                        value={planForm.name}
                        onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                        placeholder="e.g. Economy Sedan VIP Tier 1"
                        className={`w-full px-3.5 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                          } outline-none focus:border-blue-500 font-medium`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                          Category Tier
                        </label>
                        <select
                          value={planForm.category}
                          onChange={(e) => setPlanForm({ ...planForm, category: e.target.value as VehicleCategory })}
                          className={`w-full px-3 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                            } outline-none focus:border-blue-500 font-medium`}
                        >
                          <option value="ECONOMY">ECONOMY</option>
                          <option value="STANDARD">STANDARD</option>
                          <option value="SUV">SUV</option>
                          <option value="PREMIUM">PREMIUM</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                          Daily Return Rate (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={planForm.dailyRewardRate}
                          onChange={(e) => setPlanForm({ ...planForm, dailyRewardRate: Number(e.target.value) })}
                          className={`w-full px-3 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                            } outline-none focus:border-blue-500 font-medium`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                          Min Investment ($)
                        </label>
                        <input
                          type="number"
                          required
                          value={planForm.minInvest}
                          onChange={(e) => setPlanForm({ ...planForm, minInvest: Number(e.target.value) })}
                          className={`w-full px-3 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                            } outline-none focus:border-blue-500 font-medium`}
                        />
                      </div>

                      <div>
                        <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                          Max Investment ($)
                        </label>
                        <input
                          type="number"
                          required
                          value={planForm.maxInvest}
                          onChange={(e) => setPlanForm({ ...planForm, maxInvest: Number(e.target.value) })}
                          className={`w-full px-3 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                            } outline-none focus:border-blue-500 font-medium`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                          Duration (Days)
                        </label>
                        <input
                          type="number"
                          required
                          value={planForm.durationDays}
                          onChange={(e) => setPlanForm({ ...planForm, durationDays: Number(e.target.value) })}
                          className={`w-full px-3 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                            } outline-none focus:border-blue-500 font-medium`}
                        />
                      </div>

                      <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 cursor-pointer font-bold select-none">
                          <input
                            type="checkbox"
                            checked={planForm.popular}
                            onChange={(e) => setPlanForm({ ...planForm, popular: e.target.checked })}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                          />
                          <span>Highlight as Popular</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                        Fleet Vehicle Models (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={planForm.vehicleExamples}
                        onChange={(e) => setPlanForm({ ...planForm, vehicleExamples: e.target.value })}
                        placeholder="Toyota Camry, Honda Accord, Nissan Altima"
                        className={`w-full px-3.5 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                          } outline-none focus:border-blue-500 font-medium`}
                      />
                    </div>

                    <div>
                      <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                        Image URL
                      </label>
                      <input
                        type="text"
                        value={planForm.image}
                        onChange={(e) => setPlanForm({ ...planForm, image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className={`w-full px-3.5 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                          } outline-none focus:border-blue-500 font-medium`}
                      />
                    </div>

                    <div>
                      <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                        Plan Description
                      </label>
                      <textarea
                        rows={2}
                        value={planForm.description}
                        onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                        className={`w-full px-3.5 py-2 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                          } outline-none focus:border-blue-500 font-medium resize-none`}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => setPlanModalMode(null)}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                      >
                        {planModalMode === 'create' ? 'Create Plan' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL 2: Deposit Gateway / Wallet Add / Edit Modal */}
            {walletModalMode !== null && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
                <div
                  className={`w-full max-w-xl rounded-3xl ${isLight ? 'bg-white text-slate-900 border border-slate-200' : 'bg-[#091A2E] text-white border border-white/10'
                    } p-5 sm:p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                    <div>
                      <h3 className="text-base sm:text-lg font-black font-['Outfit',sans-serif]">
                        {walletModalMode === 'create' ? 'Add Deposit Payment Gateway' : 'Edit Deposit Payment Gateway'}
                      </h3>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Configure JazzCash, Easypaisa, USDT, BTC, ETH, or Bank account parameters.
                      </p>
                    </div>
                    <button
                      onClick={() => setWalletModalMode(null)}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveWallet} className="space-y-3.5 text-xs">
                    <div>
                      <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                        Gateway / Channel Name
                      </label>
                      <input
                        type="text"
                        required
                        value={walletForm.name}
                        onChange={(e) => setWalletForm({ ...walletForm, name: e.target.value })}
                        placeholder="e.g. JazzCash Direct, Easypaisa Transfer, USDT TRC-20, Bitcoin (BTC)"
                        className={`w-full px-3.5 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                          } outline-none focus:border-blue-500 font-medium`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                          Category
                        </label>
                        <select
                          value={walletForm.category}
                          onChange={(e) => setWalletForm({ ...walletForm, category: e.target.value as PaymentMethodCategory })}
                          className={`w-full px-3 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                            } outline-none focus:border-blue-500 font-medium`}
                        >
                          <option value="mobile_wallet">Mobile Wallet (JazzCash / Easypaisa)</option>
                          <option value="crypto">Crypto Asset (USDT / BTC / ETH)</option>
                          <option value="bank">Bank / Wire Escrow</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                          Brand Logo Preset
                        </label>
                        <select
                          value={walletForm.iconType}
                          onChange={(e) => setWalletForm({ ...walletForm, iconType: e.target.value as any })}
                          className={`w-full px-3 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                            } outline-none focus:border-blue-500 font-medium`}
                        >
                          <option value="jazzcash">JazzCash Official Logo (Red/Gold)</option>
                          <option value="easypaisa">Easypaisa Official Logo (Green/White)</option>
                          <option value="usdt">Tether USDT Official Logo (Teal)</option>
                          <option value="btc">Bitcoin BTC Official Logo (Orange ₿)</option>
                          <option value="eth">Ethereum ETH Official Logo (Purple Diamond)</option>
                          <option value="bank">Bank Wire Escrow Emblem</option>
                        </select>
                      </div>
                    </div>

                    {/* Custom Logo Image URL with Live Preview */}
                    <div>
                      <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                        Custom Brand Logo / Image URL (Optional)
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="shrink-0">
                          <PaymentBrandIcon iconType={walletForm.iconType} iconUrl={walletForm.iconUrl} size="md" />
                        </div>
                        <input
                          type="text"
                          value={walletForm.iconUrl}
                          onChange={(e) => setWalletForm({ ...walletForm, iconUrl: e.target.value })}
                          placeholder="https://... (Leave empty to use official preset brand icon)"
                          className={`flex-1 px-3.5 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                            } outline-none focus:border-blue-500 text-xs font-mono`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                          Beneficiary Account Title
                        </label>
                        <input
                          type="text"
                          value={walletForm.accountTitle}
                          onChange={(e) => setWalletForm({ ...walletForm, accountTitle: e.target.value })}
                          placeholder="e.g. RentoBit Mobility Official"
                          className={`w-full px-3.5 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                            } outline-none focus:border-blue-500 font-medium`}
                        />
                      </div>

                      <div>
                        <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                          Network / Bank Provider
                        </label>
                        <input
                          type="text"
                          value={walletForm.networkOrBank}
                          onChange={(e) => setWalletForm({ ...walletForm, networkOrBank: e.target.value })}
                          placeholder="e.g. TRC-20, ERC-20, Bitcoin Mainnet, JazzCash"
                          className={`w-full px-3.5 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                            } outline-none focus:border-blue-500 font-medium`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                          Account Number / Crypto Address{' '}
                          <span className={`font-normal text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>(Optional — leave blank to hide from users)</span>
                        </label>
                        <input
                          type="text"
                          value={walletForm.accountNumber}
                          onChange={(e) => setWalletForm({ ...walletForm, accountNumber: e.target.value })}
                          placeholder="03001234567 or TX9zV2aK8s... (leave blank if using Till ID only)"
                          className={`w-full px-3.5 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                            } outline-none focus:border-blue-500 font-mono text-xs`}
                        />
                      </div>

                      <div>
                        <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                          Merchant Till ID (JazzCash / Easypaisa)
                        </label>
                        <input
                          type="text"
                          value={walletForm.tillId}
                          onChange={(e) => setWalletForm({ ...walletForm, tillId: e.target.value })}
                          placeholder="e.g. 882910 or 542109 (Optional)"
                          className={`w-full px-3.5 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                            } outline-none focus:border-blue-500 font-mono text-xs`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                          Min Deposit ($)
                        </label>
                        <input
                          type="number"
                          required
                          value={walletForm.minDeposit}
                          onChange={(e) => setWalletForm({ ...walletForm, minDeposit: Number(e.target.value) })}
                          className={`w-full px-3 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                            } outline-none focus:border-blue-500 font-medium`}
                        />
                      </div>

                      <div>
                        <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                          Max Deposit ($)
                        </label>
                        <input
                          type="number"
                          required
                          value={walletForm.maxDeposit}
                          onChange={(e) => setWalletForm({ ...walletForm, maxDeposit: Number(e.target.value) })}
                          className={`w-full px-3 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                            } outline-none focus:border-blue-500 font-medium`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                        Deposit Instructions for Members
                      </label>
                      <textarea
                        rows={2}
                        value={walletForm.instructions}
                        onChange={(e) => setWalletForm({ ...walletForm, instructions: e.target.value })}
                        placeholder="Instructions displayed to user on deposit screen..."
                        className={`w-full px-3.5 py-2 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                          } outline-none focus:border-blue-500 font-medium resize-none`}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer font-bold select-none">
                        <input
                          type="checkbox"
                          checked={walletForm.isActive}
                          onChange={(e) => setWalletForm({ ...walletForm, isActive: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-0"
                        />
                        <span>Channel is Active &amp; Selectable by Members</span>
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => setWalletModalMode(null)}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
                      >
                        {walletModalMode === 'create' ? 'Add Gateway' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL 2.5: Crypto Withdrawal Gateway Add / Edit Modal */}
            {wthGatewayModalMode !== null && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
                <div
                  className={`w-full max-w-xl rounded-3xl ${isLight ? 'bg-white text-slate-900 border border-slate-200' : 'bg-[#091A2E] text-white border border-white/10'
                    } p-5 sm:p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                    <div>
                      <h3 className="text-base sm:text-lg font-black font-['Outfit',sans-serif]">
                        {wthGatewayModalMode === 'create' ? 'Add Withdrawal Crypto Gateway' : 'Edit Withdrawal Crypto Gateway'}
                      </h3>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Configure crypto wallet channels permitted for member payouts (USDT TRC20, USDT ERC20, ETH, BTC).
                      </p>
                    </div>
                    <button
                      onClick={() => setWthGatewayModalMode(null)}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveWthGateway} className="space-y-3.5 text-xs">
                    <div>
                      <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                        Gateway Name
                      </label>
                      <input
                        type="text"
                        required
                        value={wthGatewayForm.name}
                        onChange={(e) => setWthGatewayForm({ ...wthGatewayForm, name: e.target.value })}
                        placeholder="e.g. USDT TRC20, USDT ERC20, Bitcoin (BTC), Ethereum (ETH)"
                        className={`w-full px-3.5 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                          } outline-none focus:border-blue-500 font-medium`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                          Currency Symbol
                        </label>
                        <input
                          type="text"
                          required
                          value={wthGatewayForm.currency}
                          onChange={(e) => setWthGatewayForm({ ...wthGatewayForm, currency: e.target.value })}
                          placeholder="USDT, BTC, ETH"
                          className={`w-full px-3 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                            } outline-none focus:border-blue-500 font-medium`}
                        />
                      </div>

                      <div>
                        <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                          Blockchain Network
                        </label>
                        <input
                          type="text"
                          required
                          value={wthGatewayForm.network}
                          onChange={(e) => setWthGatewayForm({ ...wthGatewayForm, network: e.target.value })}
                          placeholder="TRC20, ERC20, Bitcoin Mainnet, Ethereum"
                          className={`w-full px-3 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                            } outline-none focus:border-blue-500 font-medium`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                          Brand Logo Preset
                        </label>
                        <select
                          value={wthGatewayForm.iconType}
                          onChange={(e) => setWthGatewayForm({ ...wthGatewayForm, iconType: e.target.value })}
                          className={`w-full px-3 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                            } outline-none focus:border-blue-500 font-medium`}
                        >
                          <option value="usdt">Tether USDT (Teal)</option>
                          <option value="btc">Bitcoin BTC (Orange ₿)</option>
                          <option value="eth">Ethereum ETH (Purple Diamond)</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                          Fixed Network Fee ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={wthGatewayForm.fee}
                          onChange={(e) => setWthGatewayForm({ ...wthGatewayForm, fee: Number(e.target.value) })}
                          placeholder="1.00"
                          className={`w-full px-3 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                            } outline-none focus:border-blue-500 font-medium`}
                        />
                      </div>
                    </div>

                    {/* Custom Logo Image URL with Live Preview */}
                    <div>
                      <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                        Custom Brand Logo URL (Optional)
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="shrink-0">
                          <PaymentBrandIcon iconType={wthGatewayForm.iconType as any} iconUrl={wthGatewayForm.iconUrl} size="md" />
                        </div>
                        <input
                          type="text"
                          value={wthGatewayForm.iconUrl}
                          onChange={(e) => setWthGatewayForm({ ...wthGatewayForm, iconUrl: e.target.value })}
                          placeholder="https://... (Leave blank to use preset logo)"
                          className={`flex-1 px-3.5 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                            } outline-none focus:border-blue-500 text-xs font-mono`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                          Min Withdrawal ($)
                        </label>
                        <input
                          type="number"
                          required
                          value={wthGatewayForm.minWithdrawal}
                          onChange={(e) => setWthGatewayForm({ ...wthGatewayForm, minWithdrawal: Number(e.target.value) })}
                          className={`w-full px-3 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                            } outline-none focus:border-blue-500 font-medium`}
                        />
                      </div>

                      <div>
                        <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                          Max Withdrawal ($)
                        </label>
                        <input
                          type="number"
                          required
                          value={wthGatewayForm.maxWithdrawal}
                          onChange={(e) => setWthGatewayForm({ ...wthGatewayForm, maxWithdrawal: Number(e.target.value) })}
                          className={`w-full px-3 py-2.5 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                            } outline-none focus:border-blue-500 font-medium`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                        Instructions Displayed to Member
                      </label>
                      <textarea
                        rows={2}
                        value={wthGatewayForm.instructions}
                        onChange={(e) => setWthGatewayForm({ ...wthGatewayForm, instructions: e.target.value })}
                        placeholder="e.g. Ensure you provide a valid address on this specific network..."
                        className={`w-full px-3.5 py-2 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                          } outline-none focus:border-blue-500 font-medium resize-none`}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer font-bold select-none">
                        <input
                          type="checkbox"
                          checked={wthGatewayForm.isActive}
                          onChange={(e) => setWthGatewayForm({ ...wthGatewayForm, isActive: e.target.checked })}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                        />
                        <span>Crypto Gateway is Active &amp; Selectable by Members</span>
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => setWthGatewayModalMode(null)}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                      >
                        {wthGatewayModalMode === 'create' ? 'Add Crypto Gateway' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL: Reject Withdrawal Request with Reason */}
            {wthRejectModalItem && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
                <div className={`w-full max-w-lg rounded-3xl p-6 ${isLight ? 'bg-white border border-slate-200 shadow-2xl text-slate-900' : 'bg-[#0A1929] border border-white/10 shadow-2xl text-white'
                  } space-y-4`}>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center text-sm font-black">
                        ✗
                      </span>
                      <div>
                        <h3 className="text-base font-black">Reject Withdrawal Request</h3>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Request #{wthRejectModalItem.id}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setWthRejectModalItem(null); setWthRejectReason(''); }}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Item summary */}
                  <div className={`p-4 rounded-2xl ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-white/5 border border-white/5'} space-y-2 text-xs`}>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">User:</span>
                      <span className="font-bold">{wthRejectModalItem.userName || wthRejectModalItem.userEmail}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Gross Amount:</span>
                      <span className="font-black text-rose-500">${wthRejectModalItem.amount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Crypto Method:</span>
                      <span className="font-bold text-sky-400">{wthRejectModalItem.paymentMethod}</span>
                    </div>
                    <div className="pt-1 border-t border-slate-200 dark:border-white/10">
                      <span className="text-slate-400 font-medium block mb-0.5">Destination Address:</span>
                      <span className="font-mono text-[11px] text-slate-300 break-all select-all">{wthRejectModalItem.destinationDetails}</span>
                    </div>
                  </div>

                  {/* Balance Refund Notice */}
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>
                      <b>Auto-Refund:</b> ${wthRejectModalItem.amount?.toFixed(2)} will be immediately refunded back to user's <b>Available Cash</b>.
                    </span>
                  </div>

                  {/* Quick Reason Chips */}
                  <div>
                    <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} block mb-1.5`}>
                      Quick Reason Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Invalid crypto wallet address format',
                        'Destination network mismatch (e.g. sent to incorrect chain)',
                        'KYC document verification required before withdrawal',
                        'Security compliance review failed - contact support',
                        'Duplicate withdrawal request',
                        'Cancelled upon customer request',
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setWthRejectReason(chip)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors cursor-pointer text-left ${wthRejectReason === chip
                              ? 'bg-rose-500 text-white border-rose-500 font-bold'
                              : isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                            }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Rejection Reason (Delivered to Member):
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={wthRejectReason}
                      onChange={(e) => setWthRejectReason(e.target.value)}
                      placeholder="Explain clearly why this withdrawal is being rejected..."
                      className={`w-full px-3 py-2.5 rounded-xl text-xs border outline-none resize-none ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#07121E] border-white/15 text-white'
                        } focus:border-rose-500`}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => { setWthRejectModalItem(null); setWthRejectReason(''); }}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading || !wthRejectReason.trim()}
                      onClick={async () => {
                        const success = await handleWthAction(wthRejectModalItem.id, 'reject', { reason: wthRejectReason.trim() });
                        if (success) {
                          setWthRejectModalItem(null);
                          setWthRejectReason('');
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white cursor-pointer disabled:opacity-50 shadow-md shadow-red-600/25"
                    >
                      {actionLoading ? 'Rejecting...' : 'Confirm Rejection & Refund'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL: Approve / Process Withdrawal Request with TXID */}
            {wthApproveModalItem && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
                <div className={`w-full max-w-lg rounded-3xl p-6 ${isLight ? 'bg-white border border-slate-200 shadow-2xl text-slate-900' : 'bg-[#0A1929] border border-white/10 shadow-2xl text-white'
                  } space-y-4`}>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-black">
                        ✓
                      </span>
                      <div>
                        <h3 className="text-base font-black">Process &amp; Approve Withdrawal</h3>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Request #{wthApproveModalItem.id}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setWthApproveModalItem(null); setWthApproveTxHash(''); setWthApproveNote(''); }}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Breakdown card */}
                  <div className={`p-4 rounded-2xl ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-white/5 border border-white/5'} space-y-2 text-xs`}>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">User:</span>
                      <span className="font-bold">{wthApproveModalItem.userName || wthApproveModalItem.userEmail}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Crypto Gateway:</span>
                      <span className="font-black text-sky-400">{wthApproveModalItem.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Gross Requested:</span>
                      <span className="font-bold">${wthApproveModalItem.amount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Network Fee:</span>
                      <span className="font-bold text-amber-500">-${(wthApproveModalItem.fee ?? 1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 dark:border-white/10">
                      <span className="font-bold text-slate-300">Net Amount to Send:</span>
                      <span className="font-black text-emerald-400 text-sm">
                        ${(wthApproveModalItem.netAmount ?? (wthApproveModalItem.amount - (wthApproveModalItem.fee ?? 1))).toFixed(2)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400 font-bold text-[10px] uppercase">Send To Wallet Address:</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(wthApproveModalItem.destinationDetails || '');
                            alert('Wallet address copied to clipboard!');
                          }}
                          className="text-[10px] text-sky-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Address</span>
                        </button>
                      </div>
                      <div className="font-mono text-xs text-sky-300 bg-black/30 p-2.5 rounded-xl break-all select-all border border-white/5">
                        {wthApproveModalItem.destinationDetails}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Blockchain Transaction Hash (TXID / Reference) <span className="font-normal text-slate-400">(Recommended)</span>:
                    </label>
                    <input
                      type="text"
                      value={wthApproveTxHash}
                      onChange={(e) => setWthApproveTxHash(e.target.value)}
                      placeholder="e.g. 0x8f2d... or b1c9... (Provides member blockchain tracking proof)"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono border outline-none ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#07121E] border-white/15 text-white'
                        } focus:border-emerald-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Admin Note / Audit Remark (Optional):
                    </label>
                    <input
                      type="text"
                      value={wthApproveNote}
                      onChange={(e) => setWthApproveNote(e.target.value)}
                      placeholder="e.g. Processed via Binance Custody / SafePal"
                      className={`w-full px-3.5 py-2 rounded-xl text-xs border outline-none ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#07121E] border-white/15 text-white'
                        } focus:border-emerald-500`}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => { setWthApproveModalItem(null); setWthApproveTxHash(''); setWthApproveNote(''); }}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={async () => {
                        const success = await handleWthAction(wthApproveModalItem.id, 'approve', {
                          txHash: wthApproveTxHash.trim(),
                          note: wthApproveNote.trim() || 'Processed via Blockchain Network',
                        });
                        if (success) {
                          setWthApproveModalItem(null);
                          setWthApproveTxHash('');
                          setWthApproveNote('');
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-600/25"
                    >
                      {actionLoading ? 'Processing...' : 'Mark as Processed & Paid'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {cancelRejectModalReq && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className={`w-full max-w-md rounded-3xl p-6 ${isLight ? 'bg-white border border-slate-200 shadow-2xl' : 'bg-[#0A1929] border border-white/10 shadow-2xl'
                  } animate-in fade-in zoom-in-95`}>
                  <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'} mb-1`}>
                    Reject Plan Cancellation
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mb-4`}>
                    Provide a reason for rejecting this cancellation request. The investment plan will remain active.
                  </p>
                  <div className={`p-3 rounded-xl mb-4 ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-white/5 text-slate-300'} text-xs space-y-1`}>
                    <div><span className="font-bold">User:</span> {cancelRejectModalReq.userName || cancelRejectModalReq.userEmail}</div>
                    <div><span className="font-bold">Plan:</span> {cancelRejectModalReq.planName} (${cancelRejectModalReq.investedAmount})</div>
                    {cancelRejectModalReq.reason && <div><span className="font-bold">User Reason:</span> "{cancelRejectModalReq.reason}"</div>}
                  </div>
                  <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Rejection Reason / Note:
                  </label>
                  <textarea
                    value={cancelRejectReason}
                    onChange={e => setCancelRejectReason(e.target.value)}
                    placeholder="e.g. Plan is locked under promo terms, please contact support..."
                    rows={3}
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none resize-none mb-4 ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#07121E] border-white/15 text-white'
                      }`}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => { setCancelRejectModalReq(null); setCancelRejectReason(''); }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading || !cancelRejectReason.trim()}
                      onClick={handleRejectCancellation}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Unlock Request Approval / Rejection Modal */}
            {unlockModalItem && unlockModalAction && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div
                  className={`w-full max-w-md rounded-3xl p-6 ${isLight ? 'bg-white text-slate-900 border border-slate-200' : 'bg-[#0A192F] text-white border border-white/10'
                    } shadow-2xl space-y-4`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${unlockModalAction === 'approve'
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : 'bg-rose-500/20 text-rose-500'
                          }`}
                      >
                        {unlockModalAction === 'approve' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </div>
                      <h3 className="font-black text-base font-['Outfit',sans-serif]">
                        {unlockModalAction === 'approve' ? 'Approve & Unlock Reward' : 'Reject Unlock Request'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUnlockModalItem(null);
                        setUnlockModalAction(null);
                      }}
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    {unlockModalAction === 'approve'
                      ? `You are about to approve unlock request ${unlockModalItem.id} for ${unlockModalItem.userName}. The reward ($${(Number(unlockModalItem.grossReward ?? unlockModalItem.gross_reward ?? 0)).toFixed(2)}) will become immediately Available / Unlocked for the user to claim.`
                      : `You are about to reject unlock request ${unlockModalItem.id} for ${unlockModalItem.userName}. The reward will remain locked.`}
                  </p>

                  <div>
                    <label className={`block text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                      Supervisor Note / Audit Reason
                    </label>
                    <textarea
                      value={unlockActionNote}
                      onChange={(e) => setUnlockActionNote(e.target.value)}
                      rows={3}
                      placeholder="Enter audit note for user and record..."
                      className={`w-full p-2.5 rounded-xl text-xs ${isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-black/30 border border-white/10 text-white'
                        } outline-none focus:border-blue-500`}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUnlockModalItem(null);
                        setUnlockModalAction(null);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/10 hover:bg-white/15 text-slate-300'
                        }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={unlockActionLoading === unlockModalItem.id}
                      onClick={async () => {
                        setUnlockActionLoading(unlockModalItem.id);
                        try {
                          await adminReviewUnlock(unlockModalItem.id, unlockModalAction, unlockActionNote);
                          setUnlockModalItem(null);
                          setUnlockModalAction(null);
                          await handleRefreshUnlocks();
                        } finally {
                          setUnlockActionLoading(null);
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black text-white flex items-center gap-1.5 shadow-md ${unlockModalAction === 'approve'
                          ? 'bg-emerald-500 hover:bg-emerald-600'
                          : 'bg-rose-500 hover:bg-rose-600'
                        } disabled:opacity-50`}
                    >
                      {unlockActionLoading === unlockModalItem.id && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>{unlockModalAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SCREENSHOT LIGHTBOX MODAL                                      */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {screenshotPreviewUrl && (
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
                onClick={() => setScreenshotPreviewUrl(null)}
              >
                <div
                  className="relative max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#07121E]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📸</span>
                      <span className="text-sm font-black text-white">Payment Screenshot</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={screenshotPreviewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open Full Size ↗
                      </a>
                      <button
                        onClick={() => setScreenshotPreviewUrl(null)}
                        className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-center bg-black/30 min-h-[300px] max-h-[75vh] overflow-auto">
                    <img
                      src={screenshotPreviewUrl}
                      alt="Payment Proof Screenshot"
                      className="max-w-full max-h-[70vh] rounded-2xl object-contain shadow-xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%23334155"><rect width="400" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="%2394a3b8" font-size="14" dy=".3em">Image failed to load</text></svg>';
                      }}
                    />
                  </div>
                  <div className="px-5 py-3 border-t border-white/10 text-[10px] text-slate-500 text-center">
                    Click outside or press ✕ to close
                  </div>
                </div>
              </div>
            )}

            {/* close: space-y-5 content div */}
          </div>
          {/* close: main */}
        </main>
        {/* close: flex wrapper */}
      </div>
      {/* close: outer min-h-screen div */}
    </div>
  );
};

// ── Splash Slide Editor Sub-component ─────────────────────────────────────────
interface SlideEditorProps {
  index: number;
  slide: SplashSlide;
  isLight?: boolean;
  onUpdate: (field: keyof SplashSlide, value: string) => void;
}

const SplashSlideEditor: React.FC<SlideEditorProps> = ({ index, slide, isLight, onUpdate }) => {
  const [open, setOpen] = useState(index === 0);

  return (
    <div
      className={`rounded-2xl ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-[#06121F] border border-white/10'
        } overflow-hidden`}
    >
      {/* Accordion Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <img
            src={slide.imageUrl}
            alt={`Slide ${index + 1}`}
            className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-white/10"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=80'; }}
          />
          <div className="text-left">
            <p className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Slide {index + 1}
            </p>
            <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} truncate max-w-[180px]`}>
              {slide.headline}
            </p>
          </div>
        </div>
        <span className="text-slate-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {/* Accordion Body */}
      {open && (
        <div className={`px-4 pb-4 space-y-3 border-t ${isLight ? 'border-slate-200' : 'border-white/10'} pt-3`}>
          {/* Image URL */}
          <div>
            <label className={`block text-[10px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'} mb-1 uppercase tracking-wider`}>
              Image URL
            </label>
            <input
              type="text"
              value={slide.imageUrl}
              onChange={(e) => onUpdate('imageUrl', e.target.value)}
              placeholder="https://... or local asset"
              className={`w-full px-3 py-2 rounded-xl ${isLight ? 'bg-white border border-slate-300 text-slate-900' : 'bg-[#07121E] border border-white/10 text-white'
                } text-xs outline-none focus:border-blue-500`}
            />
            {slide.imageUrl && (
              <img
                src={slide.imageUrl}
                alt="preview"
                className="mt-2 w-full h-24 object-cover rounded-xl border border-slate-200 dark:border-white/10"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>

          {/* Headline */}
          <div>
            <label className={`block text-[10px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'} mb-1 uppercase tracking-wider`}>
              Headline
            </label>
            <input
              type="text"
              value={slide.headline}
              onChange={(e) => onUpdate('headline', e.target.value)}
              className={`w-full px-3 py-2 rounded-xl ${isLight ? 'bg-white border border-slate-300 text-slate-900' : 'bg-[#07121E] border border-white/10 text-white'
                } text-xs outline-none focus:border-blue-500`}
            />
          </div>

          {/* Subheadline */}
          <div>
            <label className={`block text-[10px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'} mb-1 uppercase tracking-wider`}>
              Subheadline
            </label>
            <input
              type="text"
              value={slide.subheadline}
              onChange={(e) => onUpdate('subheadline', e.target.value)}
              className={`w-full px-3 py-2 rounded-xl ${isLight ? 'bg-white border border-slate-300 text-blue-600 font-bold' : 'bg-[#07121E] border border-white/10 text-[#38BDF8]'
                } text-xs outline-none focus:border-blue-500`}
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-[10px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'} mb-1 uppercase tracking-wider`}>
              Description
            </label>
            <textarea
              value={slide.description}
              onChange={(e) => onUpdate('description', e.target.value)}
              rows={2}
              className={`w-full px-3 py-2 rounded-xl ${isLight ? 'bg-white border border-slate-300 text-slate-900' : 'bg-[#07121E] border border-white/10 text-white'
                } text-xs outline-none focus:border-blue-500 resize-none`}
            />
          </div>

          {/* Badges */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`block text-[10px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'} mb-1 uppercase tracking-wider`}>
                Badge Left
              </label>
              <input
                type="text"
                value={slide.badge1}
                onChange={(e) => onUpdate('badge1', e.target.value)}
                className={`w-full px-3 py-2 rounded-xl ${isLight ? 'bg-white border border-blue-300 text-blue-700' : 'bg-[#07121E] border border-sky-500/30 text-sky-300'
                  } text-xs outline-none focus:border-blue-500`}
              />
            </div>
            <div>
              <label className={`block text-[10px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'} mb-1 uppercase tracking-wider`}>
                Badge Right
              </label>
              <input
                type="text"
                value={slide.badge2}
                onChange={(e) => onUpdate('badge2', e.target.value)}
                className={`w-full px-3 py-2 rounded-xl ${isLight ? 'bg-white border border-emerald-300 text-emerald-700' : 'bg-[#07121E] border border-emerald-500/30 text-emerald-300'
                  } text-xs outline-none focus:border-blue-500`}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
