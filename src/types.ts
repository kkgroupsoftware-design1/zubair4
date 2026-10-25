export type Role = 'user' | 'admin';

export type KYCStatus =
  | 'Not Started'
  | 'Documents Uploaded'
  | 'Submitted'
  | 'Under Review'
  | 'More Information Required'
  | 'Approved'
  | 'Rejected';

export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  role: Role;
  status: 'Active' | 'Suspended';
  kycStatus: KYCStatus;
  twoFactorEnabled: boolean;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
}

export interface UserBalance {
  totalBalance: number;
  availableBalance: number;
  totalInvested: number;
  todayReward: number;
  activePlansCount: number;
}

export type VehicleCategory = 'ECONOMY' | 'STANDARD' | 'SUV' | 'PREMIUM';

export interface InvestmentPlan {
  id: string;
  name: string;
  category: VehicleCategory;
  vehicleExamples: string[];
  minInvest: number;
  maxInvest: number;
  dailyRewardRate: number; // e.g. 0.44% daily
  durationDays: number;
  image: string;
  accentColor: string;
  badgeColor: string;
  popular?: boolean;
  isPopular?: boolean;
  description: string;
  features?: string[];
  payoutFrequency?: string;
}

export interface ActiveInvestment {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  vehicleCategory: VehicleCategory;
  vehicleModel: string;
  investedAmount: number;
  dailyReward: number;
  startDate: string;
  endDate: string;
  nextRewardTime: string;
  totalEarned: number;
  progress: number; // 0 to 100
  status: 'Active' | 'Pending' | 'Cancellation Requested' | 'Cancelled' | 'Completed';
  isMatured?: boolean;
  secondsRemaining?: number;
  agreementUrl?: string;
  image?: string;
}

export interface PlanCancellationRequest {
  id: string;
  investmentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  planName: string;
  investedAmount: number;
  todayReward: number;
  totalEarned: number;
  totalRefund: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

export type RewardClaimStatus =
  | 'Available'
  | 'Claimed'
  | 'Locked'
  | 'Unlock Requested'
  | 'Unlocked'
  | 'Settled';

export interface DailyRewardRecord {
  id: string;
  userId: string;
  planName: string;
  date: string;
  grossAmount: number;
  withholding: number;
  fee: number;
  netAmount: number;
  status: RewardClaimStatus;
  claimWindowStart: string;
  claimWindowEnd: string;
  claimTimeRemainingSeconds?: number;
  claimedAt?: string;
  lockTime?: string;
  unlockRequestId?: string;
  transactionId?: string;
}

export interface UnlockRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  rewardId: string;
  planName: string;
  grossReward: number;
  claimWindow: string;
  lockTime: string;
  reason: string;
  status: 'Under Support Review' | 'Approved' | 'Rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  adminNote?: string;
}

export type PaymentMethodCategory = 'mobile_wallet' | 'crypto' | 'bank';

export interface DepositPaymentMethod {
  id: string;
  name: string;
  category: PaymentMethodCategory;
  iconType: 'jazzcash' | 'easypaisa' | 'usdt' | 'btc' | 'eth' | 'bank';
  iconUrl?: string; // Optional custom brand logo/image URL
  accountTitle: string;
  accountNumber?: string; // Optional — leave blank to hide from users (e.g. Till-ID-only methods)
  tillId?: string; // Till ID for JazzCash / Easypaisa merchants
  networkOrBank?: string;
  qrCodeUrl?: string;
  instructions?: string;
  minDeposit: number;
  maxDeposit: number;
  feePercent: number;
  isActive: boolean;
  createdAt: string;
}

export interface Deposit {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userCreatedAt?: string;
  userReferralCode?: string;
  referrerId?: string;
  referrerName?: string;
  referrerEmail?: string;
  referrerCode?: string;
  planId?: string;
  planName?: string;
  planCategory?: string;
  planDailyRate?: number;
  planDuration?: number;
  expectedProfit?: number;
  investmentId?: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  proofUrl?: string;
  hasProof?: boolean;
  fee: number;
  totalAmount: number;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  createdAt: string;
  rejectionReason?: string;
  approvedAt?: string;
  approvedBy?: string;
  commissionRate?: number;
  expectedCommission?: number;
  commissionCredited?: boolean;
  commissionAmount?: number;
}

export interface ReferralCommission {
  id: string;
  depositId: string;
  refereeName: string;
  refereeEmail: string;
  planName: string;
  depositAmount: number;
  commissionRate: number;
  commissionEarned: number;
  status: string;
  createdAt: string;
}

export interface UserReferralData {
  referralCode: string;
  mySponsor?: {
    name: string;
    referralCode: string;
  } | null;
  totalReferrals: number;
  totalCommissionEarned: number;
  referrals: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    status: string;
  }[];
  commissions: ReferralCommission[];
}

export interface Withdrawal {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  amount: number;
  paymentMethod: string;
  destinationDetails: string;
  fee: number;
  netAmount: number;
  status: 'Pending' | 'Review' | 'Processing' | 'Completed' | 'Rejected';
  createdAt: string;
  twoFactorVerified: boolean;
  rejectionReason?: string;
  adminComment?: string;
  txHash?: string;
}

export interface WithdrawalPaymentMethod {
  id: string;
  name: string;
  symbol: string;
  currency?: string;
  network: string;
  iconType?: 'usdt' | 'btc' | 'eth' | string;
  iconUrl?: string;
  minWithdrawal: number;
  maxWithdrawal: number;
  feeFixed: number;
  fee?: number;
  feePercent: number;
  instructions?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface KYCData {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  docType: 'Passport' | 'Driver\'s License' | 'National ID';
  docNumber: string;
  documentType?: 'Passport' | 'Driver\'s License' | 'National ID' | string;
  documentNumber?: string;
  countryOfIssue: string;
  issueDate: string;
  expiryDate: string;
  fullName?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  frontDocUrl?: string;
  backDocUrl?: string;
  documentFrontUrl?: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  hasFrontDoc?: boolean;
  hasBackDoc?: boolean;
  hasSelfie?: boolean;
  livenessPassed: boolean;
  status: KYCStatus;
  basicStatus?: 'Not Started' | 'Submitted' | 'Approved' | 'Completed';
  advanceStatus?: 'Not Started' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  advanceKycAllowed?: boolean;
}

export interface SupportTicketMessage {
  id: string;
  sender: 'user' | 'support';
  senderName: string;
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category:
    | 'Account'
    | 'KYC'
    | 'Deposit'
    | 'Investment'
    | 'Reward'
    | 'Claim Locked'
    | 'Unlock Request'
    | 'Withdrawal'
    | 'Technical'
    | 'General';
  status: 'Open' | 'Pending' | 'In Progress' | 'Resolved' | 'Closed' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  attachedRewardId?: string;
  attachedInvestmentId?: string;
  createdDate: string;
  lastUpdate: string;
  messages: SupportTicketMessage[];
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'Deposit' | 'Withdrawal' | 'Investment' | 'Reward' | 'Daily Reward' | 'Fee' | 'Withholding' | 'Unlock Settle';
  amount: number;
  fee?: number;
  status: 'Completed' | 'Pending' | 'Processing' | 'Failed';
  date: string;
  reference: string;
  details: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'kyc' | 'deposit' | 'investment' | 'reward' | 'security' | 'support' | 'finance' | string;
  isRead: boolean;
  date: string;
  actionUrl?: string;
  createdAt?: string;
  userName?: string;
  userEmail?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  targetUser?: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface DistributionSettings {
  startTime: string; // "12:00" (24h)
  endTime: string;   // "15:00" (24h)
  timezone: string;  // "UTC"
  distributionEnabled: boolean;
  allowImmediateClaim: boolean;
  autoClaimEnabled?: boolean;
  label?: string;
  serverTime?: string;
  serverEpoch?: number;
}

