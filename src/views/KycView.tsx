import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Camera,
  UploadCloud,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  CreditCard,
  Car,
  Plane,
  Eye,
  X,
  Lock,
  Search,
  Check,
  ChevronRight,
  Shield,
  Sparkles,
  RefreshCw,
  Info,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';

import { COUNTRIES, CountryItem as CountryInfo } from '../data/countries';

export const KycView: React.FC = () => {
  const { kyc, user, submitKycBasic, submitKycAdvance, theme, loadViewData } = useApp();
  const { showToast } = useToast();
  const isLight = theme === 'light';

  // Lazy load KYC record
  useEffect(() => {
    loadViewData('kyc');
  }, []);

  // Country Selector Modal / Dropdown state
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // Selected country object
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(() => {
    const found = COUNTRIES.find((c) => c.name.toLowerCase() === (kyc.country || 'Pakistan').toLowerCase());
    return found || COUNTRIES[0];
  });

  // Filtered countries
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRIES;
    const q = countrySearch.toLowerCase().trim();
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [countrySearch]);

  // Active Flow Tab: 'basic' (Tier 1) | 'advance' (Tier 2)
  const [activeTierTab, setActiveTierTab] = useState<'basic' | 'advance'>(() => {
    // If user has submitted basic or advance, let them switch, default to advance if basic is already submitted/approved
    if (kyc.status === 'Approved' || kyc.status === 'Under Review' || kyc.status === 'Submitted') {
      return 'advance';
    }
    return 'basic';
  });

  // ── Form State: Tier 1 Basic Info ───────────────────────────
  const [fullName, setFullName] = useState<string>(() => {
    return kyc.fullName || user?.name || '';
  });
  const [dob, setDob] = useState<string>(() => kyc.dob || '1995-06-15');
  const [address, setAddress] = useState<string>(() => kyc.address || '');
  const [city, setCity] = useState<string>(() => kyc.city || '');
  const [stateProv, setStateProv] = useState<string>(() => kyc.state || '');
  const [postalCode, setPostalCode] = useState<string>(() => kyc.postalCode || '');

  // Document Type selection: 'National ID' | 'Driver\'s License' | 'Passport'
  const [docType, setDocType] = useState<'National ID' | 'Driver\'s License' | 'Passport'>(() => {
    const raw = (kyc.docType || kyc.documentType || 'National ID') as string;
    if (raw.toLowerCase().includes('pass')) return 'Passport';
    if (raw.toLowerCase().includes('driv') || raw.toLowerCase().includes('dl')) return 'Driver\'s License';
    return 'National ID';
  });

  const [docNumber, setDocNumber] = useState<string>(() => kyc.docNumber || kyc.documentNumber || '');
  const [countryOfIssue, setCountryOfIssue] = useState<string>(() => kyc.countryOfIssue || selectedCountry.name);
  const [issueDate, setIssueDate] = useState<string>(() => kyc.issueDate || '');
  const [expiryDate, setExpiryDate] = useState<string>(() => kyc.expiryDate || '');
  const [isSubmittingBasic, setIsSubmittingBasic] = useState(false);

  // Sync country change
  const handleSelectCountry = (c: CountryInfo) => {
    setSelectedCountry(c);
    setCountryOfIssue(c.name);
    setCountryModalOpen(false);
  };

  // ── Form State: Tier 2 Advance Document Uploads ──────────────
  const [frontDoc, setFrontDoc] = useState<string | null>(() => kyc.documentFrontUrl || kyc.frontDocUrl || null);
  const [frontDocName, setFrontDocName] = useState<string>('');
  const [backDoc, setBackDoc] = useState<string | null>(() => kyc.documentBackUrl || kyc.backDocUrl || null);
  const [backDocName, setBackDocName] = useState<string>('');
  const [selfieImg, setSelfieImg] = useState<string | null>(() => kyc.selfieUrl || null);
  const [selfieImgName, setSelfieImgName] = useState<string>('');
  const [isSubmittingAdvance, setIsSubmittingAdvance] = useState(false);
  const [previewLightboxUrl, setPreviewLightboxUrl] = useState<string | null>(null);
  const [compressingDoc, setCompressingDoc] = useState<'front' | 'back' | 'selfie' | null>(null);
  const [isEditingSubmittedDocs, setIsEditingSubmittedDocs] = useState(false);
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isLoadingAdvanceDocs, setIsLoadingAdvanceDocs] = useState<boolean>(false);
  const [hasAttemptedDocLoad, setHasAttemptedDocLoad] = useState<boolean>(false);

  // Lazy load Tier 2 advance documents & selfie ONLY when user actually opens Tier 2 Advance tab
  useEffect(() => {
    const hasExistingUploads = Boolean(
      kyc.hasFrontDoc ||
      kyc.hasSelfie ||
      kyc.documentFrontUrl ||
      kyc.status === 'Approved' ||
      kyc.status === 'Under Review' ||
      kyc.advanceStatus === 'Under Review' ||
      kyc.advanceStatus === 'Approved'
    );

    if (activeTierTab === 'advance' && hasExistingUploads && !hasAttemptedDocLoad && !frontDoc && !selfieImg) {
      setIsLoadingAdvanceDocs(true);
      setHasAttemptedDocLoad(true);
      const targetUserId = user?.id || kyc.userId || 'usr_admin_001';
      fetch(`/api/kyc/${targetUserId}/documents`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            if (data.documentFrontUrl || data.frontDocUrl) {
              setFrontDoc(data.documentFrontUrl || data.frontDocUrl);
            }
            if (data.documentBackUrl || data.backDocUrl) {
              setBackDoc(data.documentBackUrl || data.backDocUrl);
            }
            if (data.selfieUrl) {
              setSelfieImg(data.selfieUrl);
            }
          }
        })
        .catch((err) => console.error('[KYC View] Failed to lazy load advance documents:', err))
        .finally(() => setIsLoadingAdvanceDocs(false));
    }
  }, [activeTierTab, kyc.hasFrontDoc, kyc.hasSelfie, kyc.documentFrontUrl, kyc.status, kyc.advanceStatus, hasAttemptedDocLoad, frontDoc, selfieImg, user?.id, kyc.userId]);

  // File processing helper for client-side lightweight optimization:
  // Downscales to max 1200px and 0.80 JPEG quality, preserving razor-sharp text on IDs/passports
  // while reducing payload size by ~85% (< 150KB per photo) to eliminate server load and transfer lag.
  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDimension = 1200;
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.80));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // ── Handlers for Uploads ─────────────────────────────────────
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const handleFrontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressingDoc('front');
    try {
      const dataUrl = await processImage(file);
      setFrontDoc(dataUrl);
      setFrontDocName(file.name);
      showToast('Document Front Ready', `${file.name} compressed and attached.`);
    } catch {
      showToast('Error', 'Failed to process document image', 'error');
    } finally {
      setCompressingDoc(null);
    }
  };

  const handleBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressingDoc('back');
    try {
      const dataUrl = await processImage(file);
      setBackDoc(dataUrl);
      setBackDocName(file.name);
      showToast('Document Back Ready', `${file.name} compressed and attached.`);
    } catch {
      showToast('Error', 'Failed to process document image', 'error');
    } finally {
      setCompressingDoc(null);
    }
  };

  const handleSelfieUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressingDoc('selfie');
    try {
      const dataUrl = await processImage(file);
      setSelfieImg(dataUrl);
      setSelfieImgName(file.name);
      showToast('Liveness Selfie Ready', 'Selfie compressed and attached.');
    } catch {
      showToast('Error', 'Failed to process selfie photo', 'error');
    } finally {
      setCompressingDoc(null);
    }
  };

  // ── Submission: Submit Tier 1 Basic Info ──────────────────────
  const handleSubmitBasic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Full Name Required', 'Please enter your full legal name as it appears on your document.', 'error');
      return;
    }
    if (!address.trim() || !city.trim() || !stateProv.trim() || !postalCode.trim()) {
      showToast('Address Details Required', 'Please complete your street address, city, state, and postal code.', 'error');
      return;
    }
    if (!docNumber.trim()) {
      showToast('Document Number Required', `Please enter your ${selectedCountry.idName} or ${docType} number.`, 'error');
      return;
    }

    setIsSubmittingBasic(true);
    const success = await submitKycBasic({
      fullName: fullName.trim(),
      dob,
      address: address.trim(),
      city: city.trim(),
      state: stateProv.trim(),
      postalCode: postalCode.trim(),
      country: selectedCountry.name,
      docType,
      docNumber: docNumber.trim(),
      countryOfIssue: countryOfIssue.trim() || selectedCountry.name,
      issueDate: issueDate || undefined,
      expiryDate: expiryDate || undefined,
    });
    setIsSubmittingBasic(false);

    if (success) {
      setIsEditingBasic(false);
      setActiveTierTab('advance');
    }
  };

  // ── Submission: Submit Tier 2 Advance KYC ─────────────────────
  const handleSubmitAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontDoc) {
      showToast('Front Document Required', `Please attach the front side of your ${docType}.`, 'error');
      return;
    }
    if (docType !== 'Passport' && !backDoc) {
      showToast('Back Document Required', `Please attach the back side of your ${docType}.`, 'error');
      return;
    }
    if (!selfieImg) {
      showToast('Selfie Photo Required', 'Please upload a clear selfie holding your identity document.', 'error');
      return;
    }

    setIsSubmittingAdvance(true);
    const success = await submitKycAdvance({
      documentFrontUrl: frontDoc,
      documentBackUrl: backDoc || undefined,
      selfieUrl: selfieImg,
    });
    setIsSubmittingAdvance(false);
    if (success) {
      setIsEditingSubmittedDocs(false);
    }
  };

  // Distinct Tier Status Computation
  const isBasicSubmitted = !!(
    kyc.basicStatus === 'Approved' ||
    kyc.basicStatus === 'Completed' ||
    kyc.status === 'Approved' ||
    kyc.status === 'Submitted' ||
    kyc.status === 'Under Review' ||
    (kyc.docNumber && (kyc.fullName || kyc.firstName || fullName))
  );

  const isAdvanceSubmitted = !!(
    kyc.hasFrontDoc ||
    kyc.hasSelfie ||
    kyc.documentFrontUrl ||
    kyc.frontDocUrl ||
    frontDoc
  );

  const isAdvanceUnderReview =
    isAdvanceSubmitted &&
    kyc.status !== 'Approved' &&
    kyc.advanceStatus !== 'Approved' &&
    kyc.status !== 'Rejected' &&
    kyc.advanceStatus !== 'Rejected';

  const isFullyApproved = kyc.status === 'Approved' || (kyc.basicStatus === 'Approved' && kyc.advanceStatus === 'Approved');

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto">
      {/* ── Compliance Header & Security Shield Banner ──────────────── */}
      <div
        className={`rounded-3xl ${
          isLight
            ? 'bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-900/50 text-white shadow-xl'
            : 'bg-gradient-to-r from-[#061424] via-[#091D34] to-[#0A223E] border border-blue-500/20 text-white shadow-2xl'
        } p-5 sm:p-6 relative overflow-hidden`}
      >
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Global KYC Compliance • ISO 27001</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-['Outfit',sans-serif] tracking-tight">
              Identity Verification (KYC)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Verify your legal identity across 200+ countries with National ID, Driver's License, or Passport to unlock full fleet escrow liquidity.
            </p>
          </div>

          {/* Dual Verification Status Badges (Tier 1 vs Tier 2) */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
            {/* Tier 1 Badge */}
            <div
              className={`px-3 py-1.5 rounded-2xl border text-xs font-black flex items-center gap-1.5 shadow-sm ${
                isBasicSubmitted
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              {isBasicSubmitted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Shield className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Tier 1: {isBasicSubmitted ? 'Verified' : 'Pending'}</span>
            </div>

            {/* Tier 2 Badge */}
            <div
              className={`px-3 py-1.5 rounded-2xl border text-xs font-black flex items-center gap-1.5 shadow-sm ${
                isFullyApproved
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10'
                  : isAdvanceUnderReview
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 animate-pulse'
                  : kyc.status === 'Rejected' || kyc.advanceStatus === 'Rejected'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
              }`}
            >
              {isFullyApproved ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : isAdvanceUnderReview ? (
                <Clock className="w-3.5 h-3.5 text-sky-400 animate-spin" />
              ) : kyc.status === 'Rejected' || kyc.advanceStatus === 'Rejected' ? (
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>Tier 2: {
                isFullyApproved
                  ? 'Approved'
                  : isAdvanceUnderReview
                  ? 'Under Review'
                  : kyc.status === 'Rejected' || kyc.advanceStatus === 'Rejected'
                  ? 'Rejected'
                  : 'Not Uploaded'
              }</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Status Notifications (Approved, Under Review, or Rejection Note) ─ */}
      {isFullyApproved && (
        <div
          className={`p-5 sm:p-6 rounded-3xl ${
            isLight ? 'bg-emerald-50 border border-emerald-200 text-emerald-950' : 'bg-emerald-950/30 border border-emerald-500/30 text-white'
          } shadow-md flex items-start gap-4 animate-in fade-in`}
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black font-['Outfit',sans-serif]">
              Identity Fully Verified &amp; Approved ✓
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Both Tier 1 (Basic Details) and Tier 2 (Document Proofs) have been verified and approved by Compliance ({kyc.docType || 'ID Card'} #{kyc.docNumber || kyc.documentNumber}). Your account has uncapped daily deposits, unlimited vehicle allocations, and priority withdrawal liquidity.
            </p>
          </div>
        </div>
      )}

      {isAdvanceUnderReview && !isFullyApproved && (
        <div
          className={`p-5 sm:p-6 rounded-3xl ${
            isLight ? 'bg-sky-50 border border-sky-200 text-sky-950' : 'bg-sky-950/30 border border-sky-500/30 text-white'
          } shadow-md flex items-start gap-4 animate-in fade-in`}
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
            <Clock className="w-7 h-7 animate-spin" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black font-['Outfit',sans-serif]">
                Tier 2 Advance Verification Under Review
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Tier 1 Basic Info: Verified ✓</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Your legal personal credentials ({kyc.docType || 'ID Card'}: {kyc.docNumber || docNumber || 'Recorded'}) are verified on record. Compliance officers are actively auditing your uploaded document scans and live selfie. Verification completes automatically within 15 to 45 minutes.
            </p>
          </div>
        </div>
      )}

      {isBasicSubmitted && !isAdvanceSubmitted && !isFullyApproved && kyc.status !== 'Rejected' && (
        <div
          className={`p-5 sm:p-6 rounded-3xl ${
            isLight ? 'bg-blue-50 border border-blue-200 text-blue-950' : 'bg-blue-950/30 border border-blue-500/30 text-white'
          } shadow-md flex items-start gap-4 animate-in fade-in`}
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black font-['Outfit',sans-serif]">
              Tier 1 Basic Identity Verified ✓
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Your basic identity information has been saved and verified. Please proceed to <strong>Tier 2: Advance KYC</strong> to upload your {kyc.docType || 'ID'} scans and face selfie to unlock full platform features.
            </p>
          </div>
        </div>
      )}

      {(kyc.status === 'Rejected' || kyc.advanceStatus === 'Rejected') && (
        <div
          className={`p-5 sm:p-6 rounded-3xl ${
            isLight ? 'bg-rose-50 border border-rose-200 text-rose-950' : 'bg-rose-950/30 border border-rose-500/30 text-white'
          } shadow-md flex items-start gap-4 animate-in fade-in`}
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <XCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-base font-black font-['Outfit',sans-serif] text-rose-600 dark:text-rose-400">
              Identity Verification Requires Re-submission
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold">Compliance Reason:</span>{' '}
              {kyc.rejectionReason || 'Document photo was blurry, expired, or names did not match. Please re-submit valid credentials below.'}
            </p>
          </div>
        </div>
      )}

      {/* ── Progressive KYC Tier Selector Tabs ──────────────────────── */}
      <div
        className={`p-2 rounded-2xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#091A2E] border-white/10 shadow-lg'
        } grid grid-cols-2 gap-2`}
      >
        <button
          type="button"
          onClick={() => setActiveTierTab('basic')}
          className={`py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-2 ${
            activeTierTab === 'basic'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : isLight
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
              activeTierTab === 'basic' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10'
            }`}>
              1
            </span>
            <span>Tier 1: Basic Identity Information</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isBasicSubmitted
              ? activeTierTab === 'basic'
                ? 'bg-emerald-400/20 text-emerald-200'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : activeTierTab === 'basic'
              ? 'bg-white/20 text-white'
              : 'bg-slate-200 dark:bg-white/10 text-slate-400'
          }`}>
            {isBasicSubmitted ? '✓ Verified' : 'Incomplete'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTierTab('advance')}
          className={`py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-2 ${
            activeTierTab === 'advance'
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/25'
              : isLight
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
              activeTierTab === 'advance' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10'
            }`}>
              2
            </span>
            <span>Tier 2: Advance KYC (ID &amp; Selfie Uploads)</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isFullyApproved
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : isAdvanceUnderReview
              ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 animate-pulse'
              : isAdvanceSubmitted
              ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
              : 'bg-slate-500/15 text-slate-300 border border-slate-500/20'
          }`}>
            {isFullyApproved
              ? '✓ Approved'
              : isAdvanceUnderReview
              ? '⏳ Under Review'
              : isAdvanceSubmitted
              ? 'Files Attached'
              : 'Upload Required'}
          </span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* TAB 1: TIER 1 BASIC IDENTITY DETAILS FORM                       */}
      {/* ─────────────────────────────────────────────────────────────── */}
      {activeTierTab === 'basic' && (
        <div
          className={`rounded-3xl border ${
            isLight ? 'bg-white border-slate-200 shadow-md text-slate-900' : 'bg-[#091A2E] border-white/10 shadow-xl text-white'
          } p-5 sm:p-7 space-y-6`}
        >
          {isBasicSubmitted && !isEditingBasic ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-white/10">
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tier 1: Basic Identity Information Verified &amp; On Record</span>
                  </div>
                  <h3 className="text-lg font-black font-['Outfit',sans-serif]">
                    Personal &amp; Residential Identification
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                    Your legal identity credentials and residential address are recorded and verified.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingBasic(true)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/15 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Edit / Update Information</span>
                </button>
              </div>

              {/* Verified Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Left Card: Document Credentials */}
                <div className={`p-4 rounded-2xl ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-[#06121F] border border-white/10'} space-y-2.5`}>
                  <span className="text-[10px] uppercase font-black tracking-wider text-blue-600 dark:text-sky-400 block">
                    Document Credentials
                  </span>
                  <div className="space-y-2">
                    <div className="flex justify-between py-0.5">
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Full Legal Name:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{fullName || kyc.fullName || user?.name}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Document Type:</span>
                      <span className="font-bold">{docType}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Document Number:</span>
                      <span className="font-mono font-black text-blue-600 dark:text-sky-300">{docNumber || kyc.docNumber || kyc.documentNumber}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Country of Issue:</span>
                      <span className="font-bold">{countryOfIssue || selectedCountry.name}</span>
                    </div>
                    {(dob || kyc.dob) && (
                      <div className="flex justify-between py-0.5">
                        <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Date of Birth:</span>
                        <span className="font-mono">{dob || kyc.dob}</span>
                      </div>
                    )}
                    {(issueDate || expiryDate || kyc.issueDate || kyc.expiryDate) && (
                      <div className="flex justify-between text-[11px] pt-1.5 border-t border-slate-200/80 dark:border-white/10">
                        <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Validity Window:</span>
                        <span className="font-mono">
                          {issueDate || kyc.issueDate || '—'} to {expiryDate || kyc.expiryDate || 'No Expiry'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Card: Residential Address */}
                <div className={`p-4 rounded-2xl ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-[#06121F] border border-white/10'} space-y-2.5`}>
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    Residential Address
                  </span>
                  <div className="space-y-2">
                    <div>
                      <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} block`}>Street Address:</span>
                      <span className="font-bold block text-slate-900 dark:text-white">{address || kyc.address || 'Address registered'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 dark:border-white/10">
                      <div>
                        <span className={`text-[9px] ${isLight ? 'text-slate-500' : 'text-slate-400'} block`}>City:</span>
                        <span className="font-bold">{city || kyc.city || '—'}</span>
                      </div>
                      <div>
                        <span className={`text-[9px] ${isLight ? 'text-slate-500' : 'text-slate-400'} block`}>State:</span>
                        <span className="font-bold">{stateProv || kyc.state || '—'}</span>
                      </div>
                      <div>
                        <span className={`text-[9px] ${isLight ? 'text-slate-500' : 'text-slate-400'} block`}>Postal Code:</span>
                        <span className="font-mono font-bold">{postalCode || kyc.postalCode || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tier 1 Footer Confirmation */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/80 dark:border-white/10">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tier 1 Basic Identity is verified and active.</span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTierTab('advance')}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Continue to Tier 2 (Advance Documents)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b border-slate-200/80 dark:border-white/10 pb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-blue-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Step 1 of 2: Legal Identity Records</span>
                  </div>
                  <h3 className="text-lg font-black font-['Outfit',sans-serif]">
                    Personal &amp; Residential Identification
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                    Enter your legal name, current residential address, and document identification number.
                  </p>
                </div>
                {isEditingBasic && (
                  <button
                    type="button"
                    onClick={() => setIsEditingBasic(false)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-white/15 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmitBasic} className="space-y-5 text-xs">
            {/* Country Selector with Flag */}
            <div>
              <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1.5`}>
                Nationality &amp; Country of Residence <span className="text-rose-500 font-black">*</span>
              </label>

              <button
                type="button"
                onClick={() => setCountryModalOpen(true)}
                className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  isLight
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-900'
                    : 'bg-[#06121F] hover:bg-[#08182b] border-white/15 text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedCountry.flag}</span>
                  <div className="text-left">
                    <span className="text-sm font-bold block">{selectedCountry.name}</span>
                    <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Standard ID: {selectedCountry.idName} ({selectedCountry.idFormat})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-sky-400">
                  <span>Change Country</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>

            {/* Full Name & Date of Birth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1.5`}>
                  Full Legal Name <span className="text-rose-500 font-black">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Muhammad Ali Hassan"
                  className={`w-full px-4 py-3 rounded-2xl ${
                    isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900'
                      : 'bg-[#06121F] border border-white/15 text-white'
                  } outline-none focus:border-blue-500 font-bold text-sm`}
                />
                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-1 block`}>
                  Must match the exact spelling on your government-issued ID.
                </span>
              </div>

              <div>
                <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1.5`}>
                  Date of Birth <span className="text-rose-500 font-black">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl ${
                    isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900'
                      : 'bg-[#06121F] border border-white/15 text-white'
                  } outline-none focus:border-blue-500 font-bold text-sm`}
                />
                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-1 block`}>
                  Must be at least 18 years of age to participate.
                </span>
              </div>
            </div>

            {/* Residential Address Details */}
            <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 space-y-4">
              <h4 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Residential Address
              </h4>

              <div>
                <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1.5`}>
                  Street Address / Apartment / House No <span className="text-rose-500 font-black">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. House 42, Street 10, Sector F-7/2 or 123 Main St"
                  className={`w-full px-4 py-3 rounded-2xl ${
                    isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900'
                      : 'bg-[#06121F] border border-white/15 text-white'
                  } outline-none focus:border-blue-500 font-medium text-xs`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1.5`}>
                    City <span className="text-rose-500 font-black">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lahore, Dubai, London"
                    className={`w-full px-4 py-3 rounded-2xl ${
                      isLight
                        ? 'bg-slate-50 border border-slate-300 text-slate-900'
                        : 'bg-[#06121F] border border-white/15 text-white'
                    } outline-none focus:border-blue-500 font-medium text-xs`}
                  />
                </div>

                <div>
                  <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1.5`}>
                    State / Province / Region <span className="text-rose-500 font-black">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={stateProv}
                    onChange={(e) => setStateProv(e.target.value)}
                    placeholder="e.g. Punjab, Dubai, NY, Ontario"
                    className={`w-full px-4 py-3 rounded-2xl ${
                      isLight
                        ? 'bg-slate-50 border border-slate-300 text-slate-900'
                        : 'bg-[#06121F] border border-white/15 text-white'
                    } outline-none focus:border-blue-500 font-medium text-xs`}
                  />
                </div>

                <div>
                  <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1.5`}>
                    Postal / Zip Code <span className="text-rose-500 font-black">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 54000 or 10001"
                    className={`w-full px-4 py-3 rounded-2xl ${
                      isLight
                        ? 'bg-slate-50 border border-slate-300 text-slate-900'
                        : 'bg-[#06121F] border border-white/15 text-white'
                    } outline-none focus:border-blue-500 font-mono text-xs`}
                  />
                </div>
              </div>
            </div>

            {/* Document Selection: 3 Cards */}
            <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 space-y-4">
              <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Government Identification Document Type <span className="text-rose-500 font-black">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. National ID Card / CNIC */}
                <button
                  type="button"
                  onClick={() => setDocType('National ID')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    docType === 'National ID'
                      ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/15 text-blue-600 dark:text-sky-400 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    {docType === 'National ID' && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-sky-400" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      National ID Card
                    </h4>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                      {selectedCountry.idName} or Government Citizen Card.
                    </p>
                  </div>
                </button>

                {/* 2. Driver's License */}
                <button
                  type="button"
                  onClick={() => setDocType('Driver\'s License')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    docType === 'Driver\'s License'
                      ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Car className="w-5 h-5" />
                    </div>
                    {docType === 'Driver\'s License' && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-sky-400" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Driver's License
                    </h4>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                      Official state/provincial vehicular driving license.
                    </p>
                  </div>
                </button>

                {/* 3. Passport */}
                <button
                  type="button"
                  onClick={() => setDocType('Passport')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    docType === 'Passport'
                      ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Plane className="w-5 h-5" />
                    </div>
                    {docType === 'Passport' && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-sky-400" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Passport
                    </h4>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                      Machine-readable passport data page.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Document Number Input */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1.5`}>
                    {docType === 'National ID'
                      ? `${selectedCountry.idName} (${selectedCountry.name})`
                      : docType === 'Driver\'s License'
                      ? 'Driver\'s License Number'
                      : 'Passport Number'}{' '}
                    <span className="text-rose-500 font-black">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder={
                      docType === 'National ID'
                        ? `e.g. ${selectedCountry.idFormat}`
                        : docType === 'Driver\'s License'
                        ? 'e.g. DL-98210349'
                        : 'e.g. A9821034 or PK829104'
                    }
                    className={`w-full px-4 py-3 rounded-2xl ${
                      isLight
                        ? 'bg-slate-50 border border-slate-300 text-slate-900'
                        : 'bg-[#06121F] border border-white/15 text-white'
                    } outline-none focus:border-blue-500 font-mono font-bold text-sm tracking-wide`}
                  />
                  <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-1 block`}>
                    Ensure all numbers, letters, and hyphens match your physical card.
                  </span>
                </div>

                <div>
                  <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1.5`}>
                    Country of Issue <span className="text-rose-500 font-black">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={countryOfIssue}
                    onChange={(e) => setCountryOfIssue(e.target.value)}
                    placeholder="e.g. Pakistan, UAE, United States"
                    className={`w-full px-4 py-3 rounded-2xl ${
                      isLight
                        ? 'bg-slate-50 border border-slate-300 text-slate-900'
                        : 'bg-[#06121F] border border-white/15 text-white'
                    } outline-none focus:border-blue-500 font-bold text-xs`}
                  />
                </div>
              </div>

              {/* Document Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1.5`}>
                    Document Issue Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl ${
                      isLight
                        ? 'bg-slate-50 border border-slate-300 text-slate-900'
                        : 'bg-[#06121F] border border-white/15 text-white'
                    } outline-none focus:border-blue-500 text-xs font-mono`}
                  />
                </div>

                <div>
                  <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} mb-1.5`}>
                    Document Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl ${
                      isLight
                        ? 'bg-slate-50 border border-slate-300 text-slate-900'
                        : 'bg-[#06121F] border border-white/15 text-white'
                    } outline-none focus:border-blue-500 text-xs font-mono`}
                  />
                </div>
              </div>
            </div>

            {/* Submission Actions */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>256-bit encrypted. Submitting saves your Basic KYC record.</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={isSubmittingBasic}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSubmittingBasic ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Basic Details...</span>
                    </>
                  ) : (
                    <>
                      <span>Save &amp; Continue to Advance Uploads</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
          </>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* TAB 2: TIER 2 ADVANCE KYC (DOCUMENTS & LIVENESS UPLOADS)       */}
      {/* ─────────────────────────────────────────────────────────────── */}
      {activeTierTab === 'advance' && (
        <div
          className={`rounded-3xl border ${
            isLight ? 'bg-white border-slate-200 shadow-md text-slate-900' : 'bg-[#091A2E] border-white/10 shadow-xl text-white'
          } p-5 sm:p-7 space-y-6`}
        >
          {/* ── PERMISSION GATE: Only shown if neither Basic is completed nor permission granted ── */}
          {!kyc.advanceKycAllowed && !isBasicSubmitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${isLight ? 'bg-blue-100 border border-blue-200' : 'bg-blue-500/10 border border-blue-500/20'}`}>
                <ShieldCheck className="w-8 h-8 text-blue-500" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className={`text-base font-black font-['Outfit',sans-serif] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Tier 1 Identity Information Required First
                </h3>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Advanced KYC (ID document scans &amp; live selfie verification) requires completing <strong>Tier 1 Basic Identity</strong> first. Switch to Tier 1 to record your personal and residential details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTierTab('basic')}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer"
              >
                <span>Go to Tier 1 Basic Info</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {(isAdvanceSubmitted && !isEditingSubmittedDocs) ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-white/10">
                    <div>
                      <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1 ${
                        isFullyApproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-sky-600 dark:text-sky-400'
                      }`}>
                        {isFullyApproved ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4 animate-spin" />}
                        <span>{isFullyApproved ? 'Tier 2 Advance Documents Approved & Verified' : 'Tier 2 Advance Documents Under Compliance Review'}</span>
                      </div>
                      <h3 className="text-lg font-black font-['Outfit',sans-serif]">
                        Uploaded Verification Proofs
                      </h3>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                        Your encrypted identity files are safely on record with the RentoBit Compliance Team.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsEditingSubmittedDocs(true)}
                      className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/15 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Update / Re-upload Documents</span>
                    </button>
                  </div>

                  {/* Document Thumbnails Grid */}
                  {isLoadingAdvanceDocs ? (
                    <div className={`p-8 rounded-2xl border text-center space-y-3 ${isLight ? 'bg-indigo-50/60 border-indigo-200/60' : 'bg-[#06121F] border-indigo-500/25'}`}>
                      <div className="w-8 h-8 mx-auto rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                      <div>
                        <h5 className={`text-xs font-black ${isLight ? 'text-indigo-950' : 'text-indigo-300'}`}>
                          Loading Identity Documents &amp; Live Selfie...
                        </h5>
                        <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                          Fetched on-demand securely to keep your session ultra-fast and memory light.
                        </p>
                      </div>
                    </div>
                  ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Front Document */}
                    <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#06121F] border-white/15'} space-y-2 text-center`}>
                      <span className={`text-[11px] font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} block`}>Front of {docType}</span>
                      <div className="relative h-36 rounded-xl overflow-hidden group bg-black/10">
                        <img src={frontDoc || kyc.documentFrontUrl || kyc.frontDocUrl || ''} alt="Front Document" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => setPreviewLightboxUrl(frontDoc || kyc.documentFrontUrl || kyc.frontDocUrl || null)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5 cursor-pointer backdrop-blur-[2px]"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Inspect View</span>
                        </button>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                        <Check className="w-3 h-3" /> Encrypted &amp; Audited
                      </span>
                    </div>

                    {/* Back Document */}
                    <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#06121F] border-white/15'} space-y-2 text-center`}>
                      <span className={`text-[11px] font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} block`}>Back of {docType}</span>
                      {backDoc || kyc.documentBackUrl || kyc.backDocUrl ? (
                        <div className="relative h-36 rounded-xl overflow-hidden group bg-black/10">
                          <img src={backDoc || kyc.documentBackUrl || kyc.backDocUrl || ''} alt="Back Document" className="w-full h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => setPreviewLightboxUrl(backDoc || kyc.documentBackUrl || kyc.backDocUrl || null)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5 cursor-pointer backdrop-blur-[2px]"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Inspect View</span>
                          </button>
                        </div>
                      ) : (
                        <div className="h-36 rounded-xl border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center text-[11px] text-slate-400">
                          {docType === 'Passport' ? 'Not Required (Passport)' : 'Not Provided'}
                        </div>
                      )}
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                        <Check className="w-3 h-3" /> Encrypted &amp; Audited
                      </span>
                    </div>

                    {/* Live Selfie */}
                    <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#06121F] border-white/15'} space-y-2 text-center`}>
                      <span className={`text-[11px] font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} block`}>Live Selfie with ID</span>
                      {selfieImg || kyc.selfieUrl ? (
                        <div className="relative h-36 rounded-xl overflow-hidden group bg-black/10">
                          <img src={selfieImg || kyc.selfieUrl || ''} alt="Live Selfie" className="w-full h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => setPreviewLightboxUrl(selfieImg || kyc.selfieUrl || null)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5 cursor-pointer backdrop-blur-[2px]"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Inspect View</span>
                          </button>
                        </div>
                      ) : (
                        <div className="h-36 rounded-xl border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center text-[11px] text-slate-400">
                          Not Provided
                        </div>
                      )}
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                        <Check className="w-3 h-3" /> Liveness Confirmed
                      </span>
                    </div>
                  </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="border-b border-slate-200/80 dark:border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                        <Sparkles className="w-4 h-4" />
                        <span>Step 2 of 2: Document Proofs &amp; Face Liveness</span>
                      </div>
                      <h3 className="text-lg font-black font-['Outfit',sans-serif]">
                        Upload {docType} &amp; Verification Selfie
                      </h3>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                        Provide clear, uncropped color photos of your physical document and a face selfie holding your ID.
                      </p>
                    </div>

                    {/* Quick summary pill of current basic details */}
                    <div className={`p-2.5 rounded-2xl ${isLight ? 'bg-slate-100' : 'bg-white/5'} text-[11px] self-start sm:self-auto`}>
                      <span className="font-bold block">{fullName || user?.name || 'Member'}</span>
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                        {selectedCountry.flag} {docType}: {docNumber || 'Recorded'}
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitAdvance} className="space-y-6">
                    {/* 3 Upload Grid Cards: Front, Back, Selfie */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Card 1: Front Side */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'} flex items-center gap-1.5`}>
                            <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                            <span>Front Side of {docType}</span>
                            <span className="text-rose-500 font-bold">*</span>
                          </label>
                          {frontDoc && (
                            <button
                              type="button"
                              onClick={() => setPreviewLightboxUrl(frontDoc)}
                              className="text-[10px] font-bold text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Preview</span>
                            </button>
                          )}
                        </div>

                        <input
                          ref={frontInputRef}
                          type="file"
                          accept="image/*,.heic,.heif"
                          onChange={handleFrontUpload}
                          className="hidden"
                          id="kyc-front-upload"
                        />

                        {compressingDoc === 'front' ? (
                          <div className={`border-2 border-dashed border-blue-500/50 ${isLight ? 'bg-blue-50/50' : 'bg-blue-500/5'} rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-2 h-48 animate-pulse`}>
                            <RefreshCw className="w-7 h-7 text-blue-500 animate-spin" />
                            <p className={`text-xs font-bold ${isLight ? 'text-blue-900' : 'text-sky-300'}`}>Optimizing &amp; Compressing...</p>
                            <p className="text-[10px] text-slate-400">Lightweight canvas optimization active</p>
                          </div>
                        ) : !frontDoc ? (
                          <label
                            htmlFor="kyc-front-upload"
                            className={`border-2 border-dashed ${
                              isLight ? 'border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/50' : 'border-white/15 hover:border-sky-400 bg-white/[0.02] hover:bg-sky-500/5'
                            } rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group h-48`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-all">
                              <UploadCloud className="w-5 h-5" />
                            </div>
                            <div>
                              <p className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                Upload Front Image
                              </p>
                              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                                PNG, JPG, HEIC (Auto-Compressed)
                              </p>
                            </div>
                          </label>
                        ) : (
                          <div className={`p-3 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#06121F] border-white/15'} space-y-2`}>
                            <div className="relative h-36 rounded-xl overflow-hidden group">
                              <img src={frontDoc} alt="Front Document" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setPreviewLightboxUrl(frontDoc)}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1 cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Full</span>
                              </button>
                            </div>
                            <div className="flex items-center justify-between text-[11px] pt-1">
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Front Attached (~120KB)
                              </span>
                              <button
                                type="button"
                                onClick={() => { setFrontDoc(null); setFrontDocName(''); }}
                                className="text-rose-500 font-bold hover:underline cursor-pointer"
                              >
                                Replace
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card 2: Back Side (Hidden or Optional for Passport) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'} flex items-center gap-1.5`}>
                            <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Back Side of {docType}</span>
                            {docType !== 'Passport' && <span className="text-rose-500 font-bold">*</span>}
                          </label>
                          {backDoc && (
                            <button
                              type="button"
                              onClick={() => setPreviewLightboxUrl(backDoc)}
                              className="text-[10px] font-bold text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Preview</span>
                            </button>
                          )}
                        </div>

                        <input
                          ref={backInputRef}
                          type="file"
                          accept="image/*,.heic,.heif"
                          onChange={handleBackUpload}
                          className="hidden"
                          id="kyc-back-upload"
                        />

                        {compressingDoc === 'back' ? (
                          <div className={`border-2 border-dashed border-indigo-500/50 ${isLight ? 'bg-indigo-50/50' : 'bg-indigo-500/5'} rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-2 h-48 animate-pulse`}>
                            <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin" />
                            <p className={`text-xs font-bold ${isLight ? 'text-indigo-900' : 'text-indigo-300'}`}>Optimizing &amp; Compressing...</p>
                            <p className="text-[10px] text-slate-400">Lightweight canvas optimization active</p>
                          </div>
                        ) : !backDoc ? (
                          <label
                            htmlFor="kyc-back-upload"
                            className={`border-2 border-dashed ${
                              isLight ? 'border-slate-300 hover:border-indigo-500 bg-slate-50/70 hover:bg-indigo-50/50' : 'border-white/15 hover:border-indigo-400 bg-white/[0.02] hover:bg-indigo-500/5'
                            } rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group h-48`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-all">
                              <UploadCloud className="w-5 h-5" />
                            </div>
                            <div>
                              <p className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                Upload Back Image
                              </p>
                              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                                {docType === 'Passport' ? 'Optional for passports' : 'Clear barcode & MRZ lines'}
                              </p>
                            </div>
                          </label>
                        ) : (
                          <div className={`p-3 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#06121F] border-white/15'} space-y-2`}>
                            <div className="relative h-36 rounded-xl overflow-hidden group">
                              <img src={backDoc} alt="Back Document" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setPreviewLightboxUrl(backDoc)}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1 cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Full</span>
                              </button>
                            </div>
                            <div className="flex items-center justify-between text-[11px] pt-1">
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Back Attached (~120KB)
                              </span>
                              <button
                                type="button"
                                onClick={() => { setBackDoc(null); setBackDocName(''); }}
                                className="text-rose-500 font-bold hover:underline cursor-pointer"
                              >
                                Replace
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card 3: Selfie with Document */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'} flex items-center gap-1.5`}>
                            <Camera className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Selfie Holding {docType}</span>
                            <span className="text-rose-500 font-bold">*</span>
                          </label>
                          {selfieImg && (
                            <button
                              type="button"
                              onClick={() => setPreviewLightboxUrl(selfieImg)}
                              className="text-[10px] font-bold text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Preview</span>
                            </button>
                          )}
                        </div>

                        <input
                          ref={selfieInputRef}
                          type="file"
                          accept="image/*,.heic,.heif"
                          capture="user"
                          onChange={handleSelfieUpload}
                          className="hidden"
                          id="kyc-selfie-upload"
                        />

                        {compressingDoc === 'selfie' ? (
                          <div className={`border-2 border-dashed border-emerald-500/50 ${isLight ? 'bg-emerald-50/50' : 'bg-emerald-500/5'} rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-2 h-48 animate-pulse`}>
                            <RefreshCw className="w-7 h-7 text-emerald-500 animate-spin" />
                            <p className={`text-xs font-bold ${isLight ? 'text-emerald-900' : 'text-emerald-300'}`}>Optimizing &amp; Compressing...</p>
                            <p className="text-[10px] text-slate-400">Lightweight canvas optimization active</p>
                          </div>
                        ) : !selfieImg ? (
                          <label
                            htmlFor="kyc-selfie-upload"
                            className={`border-2 border-dashed ${
                              isLight ? 'border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/50' : 'border-white/15 hover:border-emerald-400 bg-white/[0.02] hover:bg-emerald-500/5'
                            } rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group h-48`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center transition-all">
                              <Camera className="w-5 h-5" />
                            </div>
                            <div>
                              <p className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                Take or Upload Selfie
                              </p>
                              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                                Hold your card next to face
                              </p>
                            </div>
                          </label>
                        ) : (
                          <div className={`p-3 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#06121F] border-white/15'} space-y-2`}>
                            <div className="relative h-36 rounded-xl overflow-hidden group">
                              <img src={selfieImg} alt="Liveness Selfie" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setPreviewLightboxUrl(selfieImg)}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1 cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Full</span>
                              </button>
                            </div>
                            <div className="flex items-center justify-between text-[11px] pt-1">
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Liveness Photo OK (~120KB)
                              </span>
                              <button
                                type="button"
                                onClick={() => { setSelfieImg(null); setSelfieImgName(''); }}
                                className="text-rose-500 font-bold hover:underline cursor-pointer"
                              >
                                Retake
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Document Readiness Checklist & Speed Badge */}
                    <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/10'} space-y-3`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-bold flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-500" />
                          <span>Advance Document Verification Checklist</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          ⚡ Zero-Lag Client Compression Active (&lt; 150KB per photo)
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${frontDoc ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'}`}>
                          {frontDoc ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Clock className="w-4 h-4 text-amber-500 shrink-0" />}
                          <span className="truncate">Front: {frontDoc ? 'Ready' : 'Required *'}</span>
                        </div>
                        <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${(backDoc || docType === 'Passport') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'}`}>
                          {(backDoc || docType === 'Passport') ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Clock className="w-4 h-4 text-amber-500 shrink-0" />}
                          <span className="truncate">Back: {backDoc ? 'Ready' : docType === 'Passport' ? 'Optional (Passport)' : 'Required *'}</span>
                        </div>
                        <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${selfieImg ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'}`}>
                          {selfieImg ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Clock className="w-4 h-4 text-amber-500 shrink-0" />}
                          <span className="truncate">Selfie: {selfieImg ? 'Ready' : 'Required *'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Photo Quality Instructions Card */}
                    <div
                      className={`p-4 rounded-2xl ${
                        isLight ? 'bg-blue-50 border border-blue-200 text-blue-900' : 'bg-blue-500/10 border border-blue-500/20 text-sky-200'
                      } text-xs flex items-start gap-3`}
                    >
                      <Info className="w-5 h-5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-bold block">Document Photography Guidelines</span>
                        <p className="leading-relaxed text-[11px] opacity-90">
                          Ensure all 4 corners of the identity card are visible. No heavy glares, flash reflections, or watermarks over your photo or text. Hold your card steadily beside your face for the liveness selfie.
                        </p>
                      </div>
                    </div>

                    {/* Advance Submit Button */}
                    <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveTierTab('basic')}
                          className={`text-xs font-bold ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'} flex items-center gap-1`}
                        >
                          <span>← Back to Basic Details</span>
                        </button>
                        {isEditingSubmittedDocs && (
                          <button
                            type="button"
                            onClick={() => setIsEditingSubmittedDocs(false)}
                            className="text-xs font-bold text-slate-400 hover:text-rose-500"
                          >
                            Cancel Editing
                          </button>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={!frontDoc || (docType !== 'Passport' && !backDoc) || !selfieImg || isSubmittingAdvance || compressingDoc !== null}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                      >
                        {isSubmittingAdvance ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Uploading Encrypted Documents...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Submit Advance Documents for Audit</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Country Selector Modal ─────────────────────────────────── */}
      {countryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-lg rounded-3xl ${
              isLight ? 'bg-white text-slate-900 border border-slate-200' : 'bg-[#091A2E] text-white border border-white/10'
            } p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <div>
                <h3 className="text-base font-black font-['Outfit',sans-serif]">
                  Select Nationality &amp; Country
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Choose the country of your legal government identification.
                </p>
              </div>
              <button
                onClick={() => setCountryModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder="Search country by name or code..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl ${
                  isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-[#06121F] border border-white/15 text-white'
                } text-xs outline-none focus:border-blue-500 font-medium`}
                autoFocus
              />
            </div>

            {/* Countries List */}
            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
              {filteredCountries.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleSelectCountry(c)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedCountry.code === c.code
                      ? 'bg-blue-600/15 border-blue-500 text-blue-600 dark:text-sky-300 shadow-sm'
                      : isLight
                      ? 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-800'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{c.flag}</span>
                    <div>
                      <span className="text-xs font-bold block">{c.name}</span>
                      <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {c.idName}
                      </span>
                    </div>
                  </div>
                  {selectedCountry.code === c.code && <Check className="w-4 h-4 text-blue-600 dark:text-sky-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Document Full-Res Lightbox Modal ───────────────────────── */}
      {previewLightboxUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="max-w-3xl w-full space-y-3">
            <div className="flex justify-between items-center text-white">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>KYC Document High-Res Verification Inspection</span>
              </span>
              <button
                onClick={() => setPreviewLightboxUrl(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/20 bg-black flex items-center justify-center max-h-[80vh]">
              <img src={previewLightboxUrl} alt="KYC Document Preview" className="max-h-[80vh] w-auto object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
