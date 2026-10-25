import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ArrowDownCircle,
  Building2,
  Copy,
  Check,
  FileCheck,
  ShieldCheck,
  Coins,
  QrCode,
  Info,
  UploadCloud,
  Camera,
  Eye,
  X,
  CheckCircle2,
  FileText,
  Loader2,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import { DepositPaymentMethod } from '../types';
import { PaymentBrandIcon } from '../components/ui/PaymentBrandIcon';

export const DepositView: React.FC = () => {
  const {
    balance,
    deposits,
    depositFunds,
    paymentMethods,
    theme,
    loadViewData,
    navigate,
  } = useApp();

  // Lazy load: fetch deposit history
  useEffect(() => {
    loadViewData('deposit', 1);
  }, []);

  const { showToast } = useToast();
  const isLight = theme === 'light';

  // Active payment methods from context
  const activeMethods = useMemo(() => {
    const list = paymentMethods && paymentMethods.length > 0 ? paymentMethods : [];
    return list.filter((m) => m.isActive);
  }, [paymentMethods]);

  const [selectedMethodId, setSelectedMethodId] = useState<string>(() => {
    return activeMethods[0]?.id || 'pay_jazzcash';
  });

  const selectedMethod: DepositPaymentMethod = useMemo(() => {
    return (
      activeMethods.find((m) => m.id === selectedMethodId) ||
      activeMethods[0] || {
        id: 'pay_jazzcash',
        name: 'JazzCash Direct',
        category: 'mobile_wallet',
        iconType: 'jazzcash',
        accountTitle: 'RentoBit Mobility Official',
        accountNumber: '0304-9876543',
        tillId: '882910',
        networkOrBank: 'JazzCash Mobile / Till',
        instructions: 'Send deposit funds via JazzCash App or Till to the account number above.',
        minDeposit: 10,
        maxDeposit: 500000,
        feePercent: 0,
        isActive: true,
        createdAt: '2026-01-01',
      }
    );
  }, [activeMethods, selectedMethodId]);

  const [amount, setAmount] = useState<number>(() => {
    return selectedMethod?.minDeposit || 500;
  });


  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [reference, setReference] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);
  const [loadingReceiptId, setLoadingReceiptId] = useState<string | null>(null);
  const [cachedReceipts, setCachedReceipts] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleViewReceipt = async (dep: any) => {
    if (dep.proofUrl) {
      setPreviewModalImg(dep.proofUrl);
      return;
    }
    if (cachedReceipts[dep.id]) {
      setPreviewModalImg(cachedReceipts[dep.id]);
      return;
    }
    setLoadingReceiptId(dep.id);
    try {
      const res = await fetch(`/api/deposits/${dep.id}/proof`);
      if (res.ok) {
        const data = await res.json();
        if (data.proofUrl) {
          setCachedReceipts(prev => ({ ...prev, [dep.id]: data.proofUrl }));
          setPreviewModalImg(data.proofUrl);
        } else {
          showToast('No Receipt Found', 'No proof image was attached to this deposit.', 'info');
        }
      } else {
        showToast('Receipt Error', 'Unable to retrieve receipt image.', 'error');
      }
    } catch {
      showToast('Receipt Error', 'Failed to load receipt image.', 'error');
    } finally {
      setLoadingReceiptId(null);
    }
  };

  const handleCopy = (text: string, key = 'account') => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    showToast('Copied to Clipboard', text);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const processImageFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isHeic =
      ext === 'heic' ||
      ext === 'heif' ||
      file.type === 'image/heic' ||
      file.type === 'image/heif';

    const isGeneralImage =
      file.type.startsWith('image/') ||
      isHeic ||
      ['png', 'jpg', 'jpeg', 'webp', 'heic', 'heif'].includes(ext);

    if (!isGeneralImage) {
      showToast(
        'Unsupported Format',
        'Please select a valid image (PNG, JPG, iPhone HEIC, or WEBP).',
        'error'
      );
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showToast('File Too Large', 'Maximum image size is 25MB.', 'error');
      return;
    }

    setIsProcessingFile(true);
    let blobToProcess: Blob = file;
    let finalFileName = file.name;

    if (isHeic) {
      showToast('iPhone HEIC Detected', 'Converting iOS screenshot for universal preview...');
      try {
        const heic2anyModule = await import('heic2any');
        const heic2any = heic2anyModule.default || heic2anyModule;
        const converted = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9,
        });
        blobToProcess = (Array.isArray(converted) ? converted[0] : converted) as Blob;
        finalFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
      } catch (err) {
        console.warn('heic2any conversion fallback:', err);
      }
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDimension = 2048;
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimized = canvas.toDataURL('image/jpeg', 0.88);
            setScreenshot(optimized);
            setScreenshotName(finalFileName);
            setIsProcessingFile(false);
            showToast('Receipt Attached', 'Payment proof screenshot attached successfully.');
            return;
          }
        }
        setScreenshot(dataUrl);
        setScreenshotName(finalFileName);
        setIsProcessingFile(false);
        showToast('Receipt Attached', 'Payment proof screenshot attached successfully.');
      };
      img.onerror = () => {
        setScreenshot(dataUrl);
        setScreenshotName(finalFileName);
        setIsProcessingFile(false);
        showToast('Receipt Attached', 'Payment proof screenshot attached.');
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setIsProcessingFile(false);
      showToast('Upload Error', 'Failed to read image. Please try again.', 'error');
    };
    reader.readAsDataURL(blobToProcess);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImageFile(file);
  };

  const handleRemoveScreenshot = () => {
    setScreenshot(null);
    setScreenshotName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const minLimit = selectedMethod.minDeposit || 10;
    const maxLimit = selectedMethod.maxDeposit || 500000;

    if (amount < minLimit) {
      showToast('Minimum Deposit Required', `Minimum deposit for ${selectedMethod.name} is $${minLimit.toLocaleString()}`, 'error');
      return;
    }
    if (amount > maxLimit) {
      showToast('Maximum Deposit Limit Exceeded', `Maximum deposit limit for ${selectedMethod.name} is $${maxLimit.toLocaleString()}`, 'error');
      return;
    }
    if (!reference.trim()) {
      showToast(
        selectedMethod.category === 'crypto' ? 'TxHash Required' : 'Transaction ID Required',
        selectedMethod.category === 'crypto'
          ? 'Please enter your Blockchain Transaction Hash (TxHash) from your wallet receipt.'
          : 'Please enter your Transaction ID (TID) or Crypto TxHash from your payment receipt.',
        'error'
      );
      return;
    }
    if (!screenshot) {
      showToast('Screenshot Required', 'Payment screenshot / receipt is strictly mandatory. Please attach your payment proof.', 'error');
      return;
    }
    setIsSubmitting(true);
    const success = await depositFunds(
      amount,
      selectedMethod.name,
      reference.trim(),
      screenshot,
      undefined,
      undefined
    );
    setIsSubmitting(false);
    if (success) {
      setScreenshot(null);
      setScreenshotName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setReference('');
    }
  };

  const renderBeneficiaryDetailsCard = (isMobile = false) => {
    const isCrypto = selectedMethod.category === 'crypto';
    const isAccCopied = copiedKey === 'account';
    const isTillCopied = copiedKey === 'till';

    return (
      <div
        className={`rounded-3xl border transition-all ${isLight
            ? 'bg-white border-slate-200 shadow-sm text-slate-900'
            : 'bg-[#091A2E] border-white/10 shadow-xl text-white'
          } p-4 sm:p-5 space-y-4`}
      >
        {/* Card Header: Channel Logo + Clean Name + Verified Badge */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center p-2 shrink-0 ${isLight
                  ? 'bg-slate-50 border border-slate-200 shadow-xs'
                  : 'bg-white/5 border border-white/10'
                }`}
            >
              <PaymentBrandIcon iconType={selectedMethod.iconType} iconUrl={selectedMethod.iconUrl} size="md" />
            </div>
            <div className="min-w-0">
              <h4 className={`text-sm sm:text-base font-black ${isLight ? 'text-slate-900' : 'text-white'} truncate font-['Outfit',sans-serif]`}>
                {selectedMethod.name}
              </h4>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} truncate`}>
                {selectedMethod.networkOrBank || (isCrypto ? 'Blockchain Network' : 'Direct Account')}
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 border ${isLight
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified</span>
          </div>
        </div>

        {/* Banking Metadata Rows */}
        <div
          className={`divide-y text-xs rounded-2xl p-3 ${isLight
              ? 'bg-slate-50 divide-slate-200/80 border border-slate-200/70 text-slate-700'
              : 'bg-[#06121F] divide-white/5 border border-white/10 text-slate-300'
            }`}
        >
          {/* Account Title: strictly for fiat & mobile wallet accounts only, NEVER for crypto */}
          {!isCrypto && selectedMethod.accountTitle && (
            <div className="flex items-center justify-between py-2 first:pt-0">
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Account Title</span>
              <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'} text-right truncate ml-2`}>
                {selectedMethod.accountTitle}
              </span>
            </div>
          )}

          {/* Network Protocol for Crypto, or Settlement Bank for Fiat */}
          {selectedMethod.networkOrBank && (
            <div className="flex items-center justify-between py-2">
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                {isCrypto ? 'Blockchain Network' : 'Bank / Channel'}
              </span>
              <span className="font-bold text-sky-600 dark:text-sky-400 text-right truncate ml-2 font-mono">
                {selectedMethod.networkOrBank}
              </span>
            </div>
          )}

          {/* Crypto Asset Type */}
          {isCrypto && (
            <div className="flex items-center justify-between py-2">
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Deposit Asset</span>
              <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'} text-right truncate ml-2 font-mono`}>
                {selectedMethod.iconType === 'btc'
                  ? 'Bitcoin (BTC)'
                  : selectedMethod.iconType === 'eth'
                    ? 'Ethereum (ETH)'
                    : 'Tether USD (USDT-TRC20)'}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between py-2 last:pb-0">
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Deposit Fee</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              0% (Free)
            </span>
          </div>
        </div>

        {/* Primary Account Number / Deposit Address Box — only shown when accountNumber is set */}
        {selectedMethod.accountNumber && selectedMethod.accountNumber.trim() !== '' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {isCrypto ? 'Deposit Wallet Address' : 'Account / Mobile Number'}
              </span>
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Click to copy
              </span>
            </div>

            <div
              className={`p-2.5 sm:p-3 rounded-2xl border ${isLight
                  ? 'bg-slate-50 border-slate-300/80'
                  : 'bg-[#040C16] border-white/15'
                } flex items-center justify-between gap-2`}
            >
              <div className="min-w-0 flex-1 overflow-x-auto no-scrollbar py-0.5">
                <span
                  className={`font-mono ${isCrypto ? 'text-[11px] sm:text-xs md:text-sm' : 'text-xs sm:text-sm md:text-base'
                    } font-black whitespace-nowrap select-all tracking-tight sm:tracking-normal block ${isLight ? 'text-slate-900' : 'text-sky-300'
                    }`}
                  title={selectedMethod.accountNumber}
                >
                  {selectedMethod.accountNumber}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(selectedMethod.accountNumber, 'account')}
                className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 shadow-sm ${isAccCopied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
              >
                {isAccCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Merchant Till ID — only shown when tillId is set and non-empty */}
        {selectedMethod.tillId && selectedMethod.tillId.trim() !== '' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Till ID (Merchant Retailer)
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">
                0% Fee
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-2.5">
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600/70 dark:text-amber-400/70 mb-0.5">
                  Till ID
                </span>
                <span className="font-mono text-sm sm:text-base font-black text-amber-700 dark:text-amber-300 tracking-wider whitespace-nowrap">
                  {selectedMethod.tillId.trim()}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(selectedMethod.tillId!.trim(), 'till')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 ${isTillCopied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-200 border border-amber-500/40'
                  }`}
              >
                {isTillCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Till ID</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Custom Instructions */}
        {selectedMethod.instructions && (
          <div
            className={`p-3 rounded-2xl ${isLight
                ? 'bg-blue-50 border border-blue-200 text-blue-900'
                : 'bg-blue-500/10 border border-blue-500/20 text-sky-200'
              } text-xs flex items-start gap-2`}
          >
            <Info className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{selectedMethod.instructions}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div
        className={`rounded-3xl ${isLight
            ? 'bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-blue-800 text-white shadow-xl'
            : 'bg-gradient-to-r from-[#07192C] to-[#0D2644] border border-blue-500/20 text-white shadow-xl'
          } p-5 sm:p-6`}
      >
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-sky-300 border border-blue-500/30 uppercase tracking-wider">
          Capital Funding Portal
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white mt-1 font-['Outfit',sans-serif]">
          Deposit &amp; Fund Account
        </h2>
        <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
          Fund via JazzCash, Easypaisa, Crypto (USDT, BTC, ETH), or Bank Wire to activate commercial vehicle mobility fleets.
        </p>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-300">Current Available Cash:</span>
          <span className="font-bold text-emerald-400 font-['Outfit',sans-serif] text-sm sm:text-base">
            ${balance.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Main Deposit Interface */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Column: Method Selector & Amount */}
        <div
          className={`md:col-span-7 rounded-3xl ${isLight
              ? 'bg-white border border-slate-200 shadow-md text-slate-900'
              : 'bg-[#091A2E] border border-white/10 shadow-xl text-white'
            } p-5 space-y-4`}
        >
          {/* STEP 1: Select Payment Channel */}
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-2`}>
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center">1</span>
              <span>Select Payment Channel</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              0% Fee
            </span>
          </div>

          {/* Dynamic Payment Method Grid with Real Logos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {activeMethods.map((m) => {
              const isSel = selectedMethodId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedMethodId(m.id);
                    if (amount < m.minDeposit) setAmount(m.minDeposit);
                  }}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${isSel
                      ? isLight
                        ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-2 ring-blue-500/40'
                        : 'bg-blue-600/20 border-[#38BDF8] shadow-md shadow-blue-950/40 ring-1 ring-sky-400/50'
                      : isLight
                        ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <PaymentBrandIcon iconType={m.iconType} iconUrl={m.iconUrl} size="md" />
                    {isSel && (
                      <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] shadow-sm">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'} block truncate`}>
                      {m.name}
                    </span>
                    <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5 block truncate`}>
                      {m.networkOrBank || (m.tillId ? `Till: ${m.tillId}` : 'Instant')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Amount & Reference Form */}
          <form onSubmit={handleSubmitDeposit} className="space-y-4 pt-2 border-t border-slate-200/80 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-2`}>
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center">2</span>
                <span>Enter Deposit Amount ($ USD)</span>
              </h3>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className={`text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  Deposit Amount ($ USD)
                </label>
                <span className={`text-[11px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Limit: ${selectedMethod.minDeposit} – ${(selectedMethod.maxDeposit || 500000).toLocaleString()}
                </span>
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold text-lg">
                  $
                </span>
                <input
                  type="number"
                  min={selectedMethod.minDeposit || 10}
                  max={selectedMethod.maxDeposit || 500000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className={`w-full pl-9 pr-4 py-3 rounded-2xl ${isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900'
                      : 'bg-[#06121F] border border-white/15 text-white'
                    } font-black text-lg outline-none focus:border-blue-500`}
                />
              </div>

              {/* Quick Chips */}
              <div className="flex flex-wrap gap-2 mt-2.5">
                {[10, 50, 100, 500, 1000, 5000, 25000, 100000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${amount === val
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                  >
                    ${val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile-Only: Beneficiary Wallet Details placed directly before Transaction ID */}
            <div className="block md:hidden pt-2 space-y-2">
              <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Beneficiary Wallet &amp; Details
              </h3>
              {renderBeneficiaryDetailsCard(true)}
            </div>

            {/* Reference input */}
            <div className="pt-2">
              <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} mb-2 md:hidden`}>
                4. Confirm Transfer Details
              </h3>
              <label className={`block text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'} mb-1`}>
                {selectedMethod.category === 'crypto' ? 'Blockchain TxHash / Transaction Hash' : 'Transaction ID (TID) / Crypto TxHash'}{' '}
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={
                  selectedMethod.category === 'crypto'
                    ? 'Enter Blockchain TxHash / TxID (e.g. 7f8b9c...)'
                    : 'e.g. 03829104829 (TID) or Crypto TxHash...'
                }
                required
                className={`w-full px-4 py-2.5 rounded-xl ${isLight
                    ? 'bg-slate-50 border border-slate-300 text-slate-900'
                    : 'bg-[#06121F] border border-white/15 text-white'
                  } text-xs outline-none focus:border-blue-500 font-mono`}
              />
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-1 block`}>
                Blockchain TxHash for Crypto transfers. Enter the Transaction ID (TID) received via SMS, bank app receipt.
              </span>
            </div>

            {/* Payment Screenshot / Receipt Upload */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'} flex items-center gap-1.5`}>
                  <Camera className="w-3.5 h-3.5 text-blue-500" />
                  <span>Payment Screenshot / Receipt</span>
                  <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                    Required *
                  </span>
                </label>
                {screenshot && (
                  <button
                    type="button"
                    onClick={handleRemoveScreenshot}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <X className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif,image/heic,image/heif"
                onChange={handleFileChange}
                disabled={isProcessingFile}
                className="hidden"
                id="deposit-screenshot-upload"
              />

              {!screenshot ? (
                <label
                  htmlFor="deposit-screenshot-upload"
                  className={`border-2 border-dashed ${isProcessingFile
                      ? 'border-blue-400 bg-blue-50/50 cursor-wait'
                      : isLight
                        ? 'border-blue-400 hover:border-blue-600 bg-blue-50/40 hover:bg-blue-50/70 cursor-pointer'
                        : 'border-sky-400/40 hover:border-sky-400 bg-sky-500/5 hover:bg-sky-500/10 cursor-pointer'
                    } rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2 transition-all group`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl ${isLight ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-500 text-white shadow-md'
                      } flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs`}
                  >
                    {isProcessingFile ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <UploadCloud className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {isProcessingFile
                        ? 'Converting & Optimizing Screenshot...'
                        : 'Upload Payment Screenshot / Receipt (Required) *'}
                    </p>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                      PNG, JPG, WEBP, or HEIC (Max 25MB) • Mandatory for deposit verification &amp; approval
                    </p>
                  </div>
                </label>
              ) : (
                <div
                  className={`p-3 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#06121F] border-white/15'
                    } flex items-center justify-between gap-3`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      onClick={() => setPreviewModalImg(screenshot)}
                      className="relative w-12 h-12 rounded-xl overflow-hidden border border-emerald-500/40 shrink-0 cursor-pointer group/thumb shadow-sm"
                      title="Click to zoom preview"
                    >
                      <img
                        src={screenshot}
                        alt="Payment Receipt"
                        className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {screenshotName || 'Payment_Proof.jpg'}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                        ✓ Screenshot attached &amp; ready for review
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewModalImg(screenshot)}
                        className="text-[10px] font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer inline-flex items-center gap-1 mt-0.5"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Preview full receipt</span>
                      </button>
                    </div>
                  </div>

                  <label
                    htmlFor="deposit-screenshot-upload"
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer shrink-0 ${isLight
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                      }`}
                  >
                    Change
                  </label>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isProcessingFile || amount <= 0 || !reference.trim() || !screenshot}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#155EEF] to-[#0EA5E9] hover:from-[#1D4ED8] hover:to-[#0284C7] text-white font-black text-sm shadow-xl shadow-blue-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownCircle className="w-5 h-5" />
              <span>
                {isProcessingFile
                  ? 'Optimizing Screenshot...'
                  : !screenshot
                    ? 'Attach Screenshot to Submit Deposit'
                    : !reference.trim()
                      ? selectedMethod.category === 'crypto'
                        ? 'Enter Blockchain TxHash'
                        : 'Enter Transaction ID / TxHash'
                      : `Submit Deposit of $${amount.toLocaleString()}`}
              </span>
            </button>
          </form>
        </div>

        {/* Right Column: Dynamic Beneficiary Details (Desktop) */}
        <div className="hidden md:block md:col-span-5 space-y-4">
          {renderBeneficiaryDetailsCard(false)}
        </div>
      </div>

      {/* Deposit Ledger */}
      <div
        className={`rounded-3xl ${isLight
            ? 'bg-white border border-slate-200 shadow-md text-slate-900'
            : 'bg-[#091A2E] border border-white/10 shadow-xl text-white'
          } p-5 space-y-3`}
      >
        <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Deposit History &amp; Records
        </h3>
        <div className="space-y-2">
          {deposits.length === 0 ? (
            <div className={`py-8 text-center text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              No deposit records yet.
            </div>
          ) : (
            deposits.map((dep) => {
              const isApproved = dep.status === 'Approved';
              return (
                <div
                  key={dep.id}
                  className={`p-3.5 rounded-2xl ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-[#06121F] border border-white/10'
                    } flex items-center justify-between`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${isApproved
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : isLight
                            ? 'bg-red-50 border border-red-200 text-red-600'
                            : 'bg-red-500/10 border border-red-500/25 text-red-400'
                        }`}
                    >
                      <ArrowDownCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {dep.paymentMethod}
                        </h4>
                        <span className="font-mono text-[10px] text-slate-400">({dep.reference})</span>
                        {dep.planName && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-500/10 text-blue-600 dark:text-sky-400 border border-blue-500/20">
                            🚗 {dep.planName}
                          </span>
                        )}
                        {(dep.hasProof || dep.proofUrl) && (
                          <button
                            type="button"
                            disabled={loadingReceiptId === dep.id}
                            onClick={() => handleViewReceipt(dep)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-sky-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-pointer disabled:opacity-50"
                            title="View payment receipt screenshot"
                          >
                            {loadingReceiptId === dep.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <FileText className="w-3 h-3" />
                            )}
                            <span>Receipt</span>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {dep.createdAt ? new Date(dep.createdAt).toLocaleString() : 'Just now'}
                        </span>
                        {dep.rejectionReason && (
                          <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                            Reason: "{dep.rejectionReason}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-black ${isApproved
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : dep.status === 'Rejected'
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-amber-500'
                        }`}
                    >
                      ${dep.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="mt-0.5">
                      <span
                        className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${isApproved
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : dep.status === 'Rejected'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          }`}
                      >
                        {dep.status === 'Pending' ? '⏳ PENDING APPROVAL' : dep.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Full-screen Receipt Preview Modal */}
      {previewModalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div
            className={`w-full max-w-lg ${isLight ? 'bg-white border border-slate-200 text-slate-900' : 'bg-[#091A2E] border border-blue-500/30 text-white'
              } rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative max-h-[90vh] flex flex-col`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-black font-['Outfit',sans-serif]">
                  Deposit Payment Receipt
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto rounded-2xl bg-black/5 dark:bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-center p-2 min-h-[250px]">
              <img
                src={previewModalImg}
                alt="Deposit Proof Receipt"
                className="max-h-[60vh] w-auto max-w-full rounded-xl object-contain shadow-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1 shrink-0">
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
