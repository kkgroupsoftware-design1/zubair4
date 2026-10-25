import React, { useState, useEffect } from 'react';
import {
  History,
  ArrowDownCircle,
  ArrowUpCircle,
  Gift,
  Car,
  Search,
  Download,
  Filter,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Transaction } from '../types';

export const TransactionsView: React.FC = () => {
  const { transactions, theme, loadViewData, loadingView, txnPage, txnTotalPages } = useApp();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [receiptTxn, setReceiptTxn] = useState<Transaction | null>(null);

  // Lazy load: fetch transactions only when this view mounts
  useEffect(() => {
    loadViewData('transactions', 1);
  }, []);

  const isLight = theme === 'light';

  const filtered = transactions.filter((t) => {
    const matchType = filterType === 'all' ? true : t.type === filterType;
    const matchSearch =
      t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'Deposit':
        return <ArrowDownCircle className="w-5 h-5 text-emerald-500" />;
      case 'Withdrawal':
        return <ArrowUpCircle className="w-5 h-5 text-sky-500" />;
      case 'Daily Reward':
        return <Gift className="w-5 h-5 text-purple-500" />;
      default:
        return <Car className="w-5 h-5 text-blue-500" />;
    }
  };

  const exportCSV = () => {
    const headers = ['ID,Type,Amount,Fee,Status,Date,Reference,Details\n'];
    const rows = filtered.map(
      (t) =>
        `"${t.id}","${t.type}","${t.amount}","${t.fee || 0}","${t.status}","${t.date}","${t.reference}","${t.details}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RentoBit-Statement-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div
        className={`rounded-3xl ${
          isLight
            ? 'bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-blue-800 text-white shadow-xl'
            : 'bg-gradient-to-r from-[#07192C] to-[#0D2644] border border-blue-500/20 text-white shadow-xl'
        } p-5 flex items-center justify-between`}
      >
        <div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-sky-300 border border-blue-500/30 uppercase tracking-wider">
            Ledger & Accounting
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 font-['Outfit',sans-serif]">
            Transaction History
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
            Audit trail of fleet subscriptions, daily payouts, deposits, and transfers.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl ${
            isLight ? 'bg-white/10 hover:bg-white/20 border-white/20' : 'bg-white/5 hover:bg-white/10 border-white/10'
          } border text-white text-xs font-bold transition-colors`}
        >
          <Download className="w-4 h-4 text-sky-300" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      {/* Controls: Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by reference, details, or ID..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl ${
              isLight
                ? 'bg-white border border-slate-200 text-slate-900 shadow-2xs'
                : 'bg-[#091A2E] border border-white/10 text-white'
            } text-xs outline-none focus:border-blue-500`}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'Deposit', 'Withdrawal', 'Daily Reward', 'Investment'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterType === type
                  ? 'bg-blue-600 text-white shadow-md'
                  : isLight
                  ? 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
                  : 'bg-[#091A2E] border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {type === 'all' ? 'All' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div
        className={`rounded-3xl ${
          isLight
            ? 'bg-white border border-slate-200 shadow-md text-slate-900'
            : 'bg-[#091A2E] border border-white/10 shadow-xl text-white'
        } p-5 space-y-3`}
      >
        {filtered.length === 0 ? (
          <div className={`py-12 text-center ${isLight ? 'text-slate-500' : 'text-slate-400'} text-xs`}>
            No transactions found matching your criteria.
          </div>
        ) : (
          filtered.map((t) => {
            const isCredit = t.amount > 0;
            return (
              <div
                key={t.id}
                onClick={() => setReceiptTxn(t)}
                className={`p-3.5 rounded-2xl ${
                  isLight ? 'bg-slate-50 hover:bg-slate-100/80 border border-slate-200' : 'bg-[#06121F] hover:bg-[#07172B] border border-white/10'
                } flex items-center justify-between gap-3 cursor-pointer transition-colors`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl ${
                      isLight ? 'bg-white border border-slate-200' : 'bg-white/5 border border-white/10'
                    } flex items-center justify-center shrink-0`}
                  >
                    {getIcon(t.type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-xs font-bold ${
                          isLight ? 'text-slate-900' : 'text-white'
                        } truncate`}
                      >
                        {t.details}
                      </h4>
                      <span
                        className={`text-[9px] font-mono ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        } hidden sm:inline`}
                      >
                        {t.reference}
                      </span>
                    </div>
                    <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5 block`}>
                      {t.date}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-sm font-black ${
                      t.status === 'Pending' || t.status === 'Failed'
                        ? isLight
                          ? 'text-red-600'
                          : 'text-red-400'
                        : isCredit
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isLight
                        ? 'text-slate-900'
                        : 'text-slate-200'
                    }`}
                  >
                    {isCredit ? '+' : ''}
                    ${Math.abs(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`block text-[10px] font-bold ${
                      t.status === 'Completed'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : t.status === 'Pending' || t.status === 'Failed'
                        ? isLight
                          ? 'text-red-600'
                          : 'text-red-400'
                        : isLight
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Receipt Modal */}
      {receiptTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div
            className={`w-full max-w-sm ${
              isLight
                ? 'bg-white border border-slate-200 shadow-2xl text-slate-900'
                : 'bg-[#091A2E] border border-white/15 shadow-2xl text-white'
            } rounded-3xl p-6 space-y-4`}
          >
            <div
              className={`text-center pb-2 border-b ${
                isLight ? 'border-slate-200' : 'border-white/10'
              }`}
            >
              <span className="text-[10px] font-bold text-blue-600 dark:text-sky-400 uppercase tracking-wider">
                Official Transaction Receipt
              </span>
              <h3
                className={`text-xl font-black ${
                  isLight ? 'text-slate-900' : 'text-white'
                } mt-1`}
              >
                {receiptTxn.amount > 0 ? '+' : ''}${Math.abs(receiptTxn.amount).toFixed(2)} USD
              </h3>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                Status: {receiptTxn.status}
              </span>
            </div>

            <div
              className={`p-3.5 rounded-2xl ${
                isLight ? 'bg-slate-50 border border-slate-200' : 'bg-[#06121F] border border-white/10'
              } space-y-2 text-xs font-mono`}
            >
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Transaction ID:</span>
                <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {receiptTxn.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Type:</span>
                <span className="text-blue-600 dark:text-sky-300 font-bold">{receiptTxn.type}</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Reference:</span>
                <span className={isLight ? 'text-slate-700' : 'text-white'}>{receiptTxn.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Timestamp:</span>
                <span className={isLight ? 'text-slate-700' : 'text-white'}>{receiptTxn.date}</span>
              </div>
              <div
                className={`flex justify-between border-t ${
                  isLight ? 'border-slate-200' : 'border-white/10'
                } pt-1.5`}
              >
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Platform Fee:</span>
                <span className={isLight ? 'text-slate-700' : 'text-white'}>${(receiptTxn.fee || 0).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setReceiptTxn(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
      {txnPage < txnTotalPages && (
        <div className="flex justify-center pt-4 pb-2">
          <button
            onClick={() => loadViewData('transactions', txnPage + 1)}
            disabled={loadingView}
            className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-all"
          >
            {loadingView ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};
