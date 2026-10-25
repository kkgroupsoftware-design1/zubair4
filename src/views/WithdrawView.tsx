import React, { useState, useEffect } from 'react';
import {
  ArrowUpCircle,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Loader2,
  CheckCircle2,
  Copy,
  ExternalLink,
  Coins,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentBrandIcon } from '../components/ui/PaymentBrandIcon';
import { WithdrawalPaymentMethod } from '../types';

export const WithdrawView: React.FC = () => {
  const { balance, withdrawals, requestWithdrawal, withdrawalMethods = [], theme, loadViewData } = useApp();

  // Lazy load: fetch withdrawal history and live crypto methods on mount
  useEffect(() => {
    loadViewData('withdraw', 1);
  }, []);

  const isLight = theme === 'light';

  // Active crypto withdrawal methods only
  const activeCryptoMethods = withdrawalMethods.filter((m) => m.isActive);
  const availableMethods: WithdrawalPaymentMethod[] =
    activeCryptoMethods.length > 0
      ? activeCryptoMethods
      : [
          {
            id: 'wth_usdt_trc20',
            name: 'USDT TRC20',
            symbol: 'USDT',
            network: 'TRC20 (Tron Network)',
            iconType: 'usdt',
            iconUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
            minWithdrawal: 20.0,
            maxWithdrawal: 50000.0,
            feeFixed: 1.0,
            feePercent: 0.0,
            instructions: 'Provide your TRC20 address (begins with T). Transferred via Tron blockchain with $1.00 network fee.',
            isActive: true,
          },
          {
            id: 'wth_usdt_erc20',
            name: 'USDT ERC20',
            symbol: 'USDT',
            network: 'ERC20 (Ethereum Network)',
            iconType: 'usdt',
            iconUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
            minWithdrawal: 30.0,
            maxWithdrawal: 50000.0,
            feeFixed: 5.0,
            feePercent: 0.0,
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
            minWithdrawal: 30.0,
            maxWithdrawal: 50000.0,
            feeFixed: 3.0,
            feePercent: 0.0,
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
            minWithdrawal: 50.0,
            maxWithdrawal: 50000.0,
            feeFixed: 4.0,
            feePercent: 0.0,
            instructions: 'Provide your native Bitcoin address (begins with 1, 3, or bc1). Settles across Bitcoin blockchain.',
            isActive: true,
          },
        ];

  const [selectedMethodId, setSelectedMethodId] = useState<string>(availableMethods[0]?.id || 'wth_usdt_trc20');
  const selectedMethod = availableMethods.find((m) => m.id === selectedMethodId) || availableMethods[0];

  const [amount, setAmount] = useState<number>(100);
  const [destination, setDestination] = useState('');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalConfirm, setModalConfirm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic fee calculation based on selected crypto gateway
  const fixedFee = selectedMethod?.feeFixed ?? 1.0;
  const percentFee = selectedMethod?.feePercent ? (amount * selectedMethod.feePercent) / 100 : 0;
  const totalFee = parseFloat((fixedFee + percentFee).toFixed(2));
  const netAmount = Math.max(0, parseFloat((amount - totalFee).toFixed(2)));

  const minWithdraw = selectedMethod?.minWithdrawal ?? 20;
  const maxWithdraw = Math.min(selectedMethod?.maxWithdrawal ?? 50000, balance.availableBalance);

  const getPlaceholder = () => {
    if (!selectedMethod) return 'Enter destination wallet address';
    if (selectedMethod.symbol === 'BTC') return 'Enter BTC address (starts with 1, 3, or bc1...)';
    if (selectedMethod.network.toLowerCase().includes('trc') || selectedMethod.name.includes('TRC')) {
      return 'Enter Tron TRC20 address (starts with T...)';
    }
    return 'Enter Ethereum / ERC20 address (starts with 0x...)';
  };

  const handleStartWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > balance.availableBalance) return;
    if (amount < minWithdraw) return;
    if (!destination.trim()) return;
    setPin('');
    setModalConfirm(true);
  };

  const handleConfirm2FA = async () => {
    if (!pin || pin.length < 4) return;
    setIsSubmitting(true);
    const ok = await requestWithdrawal(amount, selectedMethod.name, destination.trim(), totalFee, pin.trim());
    setIsSubmitting(false);
    if (ok) {
      setModalConfirm(false);
      setDestination('');
      setPin('');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div
        className={`rounded-3xl ${
          isLight
            ? 'bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-blue-800 text-white shadow-xl'
            : 'bg-gradient-to-r from-[#07192C] to-[#0D2644] border border-blue-500/20 text-white shadow-xl'
        } p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase tracking-wider">
              Payouts &amp; Liquidity
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
              <Coins className="w-3 h-3" />
              Crypto Only
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 font-['Outfit',sans-serif]">
            Withdraw Funds
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
            Transfer your available balance and daily fleet rewards directly to your verified Crypto wallet.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-white/10 border border-white/10 text-right shrink-0">
          <span className="text-[11px] text-slate-300 block">Available For Withdrawal:</span>
          <span className="font-black text-emerald-400 text-lg sm:text-xl font-['Outfit',sans-serif]">
            ${balance.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Withdraw Form */}
        <div
          className={`md:col-span-7 rounded-3xl ${
            isLight
              ? 'bg-white border border-slate-200 shadow-md text-slate-900'
              : 'bg-[#091A2E] border border-white/10 shadow-xl text-white'
          } p-5 space-y-4`}
        >
          <div>
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Select Crypto Payout Wallet
              </h3>
              <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">
                Blockchain Settlement
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
              Supported assets: USDT (TRC20 / ERC20), Ethereum (ETH), and Bitcoin (BTC).
            </p>
          </div>

          {/* Crypto Wallets Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {availableMethods.map((m) => {
              const isSel = selectedMethodId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMethodId(m.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    isSel
                      ? isLight
                        ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-2 ring-blue-500/25'
                        : 'bg-gradient-to-br from-blue-600/20 to-sky-600/10 border-[#38BDF8] shadow-lg ring-1 ring-[#38BDF8]/40'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                  }`}
                >
                  {isSel && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}

                  <div className="flex items-center gap-2.5">
                    <PaymentBrandIcon iconType={m.iconType || 'usdt'} iconUrl={m.iconUrl} size="md" />
                    <div className="min-w-0 flex-1">
                      <h4 className={`text-xs font-black truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {m.name}
                      </h4>
                      <span className={`text-[10px] font-bold block truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {m.network}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-[10px]">
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Fee:</span>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400">
                      ${m.feeFixed.toFixed(2)} fixed
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Form Controls */}
          <form onSubmit={handleStartWithdraw} className="space-y-4 pt-1">
            {/* Amount Field */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  Withdrawal Amount ($ USD)
                </label>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Min: ${minWithdraw}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAmount(Math.max(minWithdraw, Math.floor(balance.availableBalance)))}
                    className="text-blue-600 dark:text-[#38BDF8] font-bold hover:underline text-xs cursor-pointer"
                  >
                    Max (${balance.availableBalance.toFixed(2)})
                  </button>
                </div>
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold text-base">
                  $
                </span>
                <input
                  type="number"
                  min={minWithdraw}
                  max={balance.availableBalance}
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className={`w-full pl-9 pr-4 py-3 rounded-2xl ${
                    isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900'
                      : 'bg-[#06121F] border border-white/15 text-white'
                  } font-bold text-lg outline-none focus:border-blue-500 transition-colors`}
                  placeholder="0.00"
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex items-center gap-2 mt-2">
                {[25, 50, 100, 250, 500].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      amount === val
                        ? 'bg-blue-600 text-white'
                        : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination Wallet Address */}
            <div>
              <label className={`block text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'} mb-1`}>
                Your {selectedMethod.name} Receiving Address
              </label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={getPlaceholder()}
                className={`w-full px-4 py-3 rounded-2xl ${
                  isLight
                    ? 'bg-slate-50 border border-slate-300 text-slate-900'
                    : 'bg-[#06121F] border border-white/15 text-white'
                } text-xs font-mono outline-none focus:border-blue-500 transition-colors`}
              />

              {/* Network Warning Banner */}
              <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  {selectedMethod.instructions ||
                    `Double check that your address belongs strictly to ${selectedMethod.network}. Assets sent to unsupported blockchains cannot be recovered.`}
                </span>
              </div>
            </div>

            {/* Fee summary card */}
            <div
              className={`p-4 rounded-2xl ${
                isLight ? 'bg-slate-50 border border-slate-200' : 'bg-[#06121F] border border-white/10'
              } space-y-2 text-xs`}
            >
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Requested Amount:</span>
                <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  ${amount.toFixed(2)} USD
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Blockchain Network Fee ({selectedMethod.name}):</span>
                <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  ${totalFee.toFixed(2)} USD
                </span>
              </div>
              <div
                className={`flex justify-between pt-2.5 border-t ${
                  isLight ? 'border-slate-200' : 'border-white/10'
                } text-sm font-black`}
              >
                <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>You Will Receive:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-['Outfit',sans-serif]">
                  ${netAmount.toFixed(2)} {selectedMethod.symbol}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={amount < minWithdraw || amount > balance.availableBalance || !destination.trim()}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#155EEF] via-blue-600 to-[#0EA5E9] hover:from-[#1D4ED8] text-white font-black text-sm shadow-xl shadow-blue-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpCircle className="w-5 h-5" />
              <span>Request Crypto Payout (${netAmount.toFixed(2)})</span>
            </button>
          </form>
        </div>

        {/* Security & KYC requirement note */}
        <div className="md:col-span-5 space-y-4">
          <div
            className={`rounded-3xl ${
              isLight
                ? 'bg-white border border-slate-200 shadow-md text-slate-900'
                : 'bg-[#091A2E] border border-white/10 shadow-xl text-white'
            } p-5 space-y-3`}
          >
            <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Compliance &amp; Security
            </h3>
            <div className={`space-y-3 text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'} leading-relaxed`}>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Cold Storage:</strong> All payouts are processed from multi-signature vaults with mandatory compliance review.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Settlement Times:</strong> USDT TRC20 typically completes within 10–30 minutes upon admin approval. BTC and ETH settle based on network confirmations.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Rejection &amp; Refund Protection:</strong> If any withdrawal request is rejected by compliance, the full principal amount is immediately returned to your Available Cash balance with the administrative comment.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal History */}
      <div
        className={`rounded-3xl ${
          isLight
            ? 'bg-white border border-slate-200 shadow-md text-slate-900'
            : 'bg-[#091A2E] border border-white/10 shadow-xl text-white'
        } p-5 space-y-4`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Withdrawal History
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
              Track recent payout requests, blockchain transaction hashes, and admin reviews.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-xl bg-blue-600/10 text-blue-600 dark:text-sky-400">
            {withdrawals.length} Total
          </span>
        </div>

        {withdrawals.length === 0 ? (
          <div className={`p-8 text-center rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#06121F] border-white/10 text-slate-400'} text-xs`}>
            No withdrawal requests submitted yet.
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((wth) => (
              <div
                key={wth.id}
                className={`p-4 rounded-2xl border transition-all ${
                  wth.status === 'Rejected'
                    ? isLight
                      ? 'bg-rose-50/70 border-rose-200 shadow-xs'
                      : 'bg-rose-950/20 border-rose-500/30'
                    : wth.status === 'Completed'
                    ? isLight
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-emerald-950/20 border-emerald-500/20'
                    : isLight
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-[#06121F] border-white/10'
                } flex flex-col gap-3`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        wth.status === 'Completed'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500'
                          : wth.status === 'Rejected'
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-500'
                          : 'bg-amber-500/15 border-amber-500/30 text-amber-500'
                      }`}
                    >
                      <ArrowUpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {wth.paymentMethod}
                        </h4>
                        <span className="font-mono text-[10px] text-slate-500">ID: {wth.id}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[11px] font-mono select-all truncate max-w-[200px] sm:max-w-[320px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          {wth.destinationDetails}
                        </span>
                        <button
                          onClick={() => handleCopy(wth.destinationDetails, `dest-${wth.id}`)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                          title="Copy Wallet Address"
                        >
                          {copiedId === `dest-${wth.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <span className={`text-[10px] block mt-0.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                        {wth.createdAt ? new Date(wth.createdAt).toLocaleString() : 'Recent'}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/80 dark:border-white/10">
                    <span className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      -${wth.amount.toFixed(2)} USD
                    </span>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border mt-1 ${
                        wth.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          : wth.status === 'Pending'
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {wth.status === 'Completed' ? '✓ Completed' : wth.status === 'Pending' ? '⏳ Under Review' : '✗ Rejected & Refunded'}
                    </span>
                  </div>
                </div>

                {/* Prominent Rejection Reason / Admin Comment Notice */}
                {wth.status === 'Rejected' && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="font-black block text-[11px] uppercase tracking-wider text-rose-600 dark:text-rose-400">
                        Rejection Reason / Admin Note:
                      </span>
                      <p className="text-xs font-semibold leading-relaxed break-words">
                        "{wth.rejectionReason || wth.adminComment || 'Administrative compliance verification required.'}"
                      </p>
                      <div className="pt-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                        ✓ Refund Status: Full amount of ${wth.amount.toFixed(2)} was credited back to your Available Cash balance.
                      </div>
                    </div>
                  </div>
                )}

                {/* Completed Blockchain TXID & Note */}
                {wth.status === 'Completed' && (wth.txHash || wth.adminComment) && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                    {wth.txHash && (
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">TXID:</span>
                        <span className="truncate select-all flex-1">{wth.txHash}</span>
                        <button
                          onClick={() => handleCopy(wth.txHash || '', `tx-${wth.id}`)}
                          className="cursor-pointer text-emerald-600 hover:text-emerald-700"
                          title="Copy TXID"
                        >
                          {copiedId === `tx-${wth.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                    {wth.adminComment && (
                      <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Admin Note: {wth.adminComment}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2FA PIN Confirmation Modal */}
      {modalConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div
            className={`w-full max-w-sm ${
              isLight
                ? 'bg-white border border-slate-200 shadow-2xl text-slate-900'
                : 'bg-[#091A2E] border border-white/15 shadow-2xl text-white'
            } rounded-3xl p-6 space-y-4 text-center`}
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-[#38BDF8] border border-blue-500/30 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Authorize Crypto Payout
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-1`}>
                Enter your 4-6 digit security PIN to confirm the transfer of ${amount.toFixed(2)} USD via {selectedMethod.name}.
              </p>
            </div>

            {/* Transaction Brief */}
            <div className={`p-3 rounded-2xl ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-black/30 border border-white/5'} text-left text-xs space-y-1 font-mono`}>
              <div className="flex justify-between">
                <span className="text-slate-500">Method:</span>
                <span className="font-bold">{selectedMethod.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Network:</span>
                <span className="font-bold">{selectedMethod.network}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Address:</span>
                <span className="font-bold truncate max-w-[150px]">{destination}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200/60 dark:border-white/10 font-bold">
                <span className="text-emerald-600 dark:text-emerald-400">Receive:</span>
                <span className="text-emerald-600 dark:text-emerald-400">${netAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-center my-2">
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                placeholder="••••"
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className={`w-44 text-center tracking-[10px] text-2xl font-mono py-2 rounded-xl ${
                  isLight
                    ? 'bg-slate-50 border border-slate-300 text-slate-900'
                    : 'bg-[#06121F] border border-white/20 text-white'
                } font-bold outline-none focus:border-blue-500`}
                autoFocus
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalConfirm(false)}
                className={`flex-1 py-2.5 rounded-xl ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/5 text-slate-300'
                } text-xs font-semibold cursor-pointer`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting || pin.length < 4}
                onClick={handleConfirm2FA}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Payout</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
