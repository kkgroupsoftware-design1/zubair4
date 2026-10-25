import React, { useState, useEffect } from 'react';
import {
  Headphones,
  Plus,
  Send,
  Lock,
  MessageSquare,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import { SupportTicket } from '../types';

export const SupportView: React.FC = () => {
  const { supportTickets, createTicket, sendTicketReply, dailyRewards, theme, loadViewData, user } = useApp();
  const { showToast } = useToast();

  // Lazy load: fetch support tickets only when this view mounts
  useEffect(() => {
    loadViewData('support');
  }, []);

  const isLight = theme === 'light';

  const [activeTicket, setActiveTicket] = useState<SupportTicket>(supportTickets[0] || null);
  const [replyText, setReplyText] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<'Unlock Request' | 'Deposit/Withdrawal' | 'KYC' | 'Plan Question' | 'Technical'>('Unlock Request');
  const [newMessage, setNewMessage] = useState('');
  const [attachedReward, setAttachedReward] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  const lockedRewards = dailyRewards.filter((r) => r.status === 'Locked');

  // Keep activeTicket in sync with supportTickets refreshes
  useEffect(() => {
    if (activeTicket) {
      const fresh = supportTickets.find(t => t.id === activeTicket.id);
      if (fresh) setActiveTicket(fresh);
    }
  }, [supportTickets]);

  const statusBadgeClass = (status: string) => {
    if (status === 'Completed' || status === 'Resolved')
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
    if (status === 'Closed')
      return 'bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30';
    if (status === 'In Progress')
      return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
    return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
  };

  const handleUserCompleteTicket = async (ticketId: string) => {
    if (!ticketId || isCompleting) return;
    setIsCompleting(true);
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed', userId: user?.id }),
      });
      if (res.ok) {
        if (activeTicket && activeTicket.id === ticketId) {
          setActiveTicket({ ...activeTicket, status: 'Completed' });
        }
        showToast('Ticket Completed', 'Your ticket has been marked as Completed.', 'success');
        loadViewData('support');
      } else {
        showToast('Error', 'Failed to update ticket status', 'error');
      }
    } catch (e: any) {
      showToast('Error', e.message || 'Network error', 'error');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    await sendTicketReply(activeTicket.id, replyText);
    const updatedMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user' as const,
      senderName: 'Ali Hassan',
      message: replyText,
      timestamp: 'Just now',
    };
    setActiveTicket({
      ...activeTicket,
      messages: [...activeTicket.messages, updatedMsg],
    });
    setReplyText('');
  };

  const handleCreateNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newMessage) return;
    await createTicket(newSubject, newCategory, newMessage, attachedReward || undefined);
    setCreateModalOpen(false);
    setNewSubject('');
    setNewMessage('');
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
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
            24/7 Client Desk
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 font-['Outfit',sans-serif]">
            Support Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
            Resolve locked distributions, deposit queries, and KYC verifications.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4" style={{ minHeight: '75vh' }}>
        {/* Left Column: Tickets list */}
        <div className="md:col-span-4 space-y-3">
          <h3
            className={`text-xs font-bold ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            } uppercase tracking-wider px-1`}
          >
            Your Tickets ({supportTickets.length})
          </h3>

          <div className="space-y-2" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '2px' }}>
            {supportTickets.length === 0 ? (
              <div className={`p-6 rounded-2xl border text-center text-xs ${isLight ? 'bg-white border-slate-200 text-slate-400' : 'bg-[#091A2E] border-white/10 text-slate-500'}`}>
                No tickets yet. Click <strong>New Ticket</strong> to get started.
              </div>
            ) : supportTickets.map((t) => {
              const isSelected = activeTicket?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTicket(t)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? isLight
                        ? 'bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-500'
                        : 'bg-blue-950/40 border-[#38BDF8] shadow-lg shadow-blue-950/50'
                      : isLight
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                      : 'bg-[#091A2E] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-sky-400">{t.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadgeClass(t.status)}`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'} mt-1.5 line-clamp-1`}>
                    {t.subject}
                  </h4>
                  <div className={`flex items-center justify-between text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-2`}>
                    <span className={`${isLight ? 'bg-slate-100' : 'bg-white/5'} px-2 py-0.5 rounded-md font-medium`}>
                      {t.category}
                    </span>
                    <span>{t.lastUpdate}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Chat & Message Thread */}
        <div
          className={`md:col-span-8 rounded-3xl ${
            isLight
              ? 'bg-white border border-slate-200 shadow-md text-slate-900'
              : 'bg-[#091A2E] border border-white/10 shadow-xl text-white'
          } flex flex-col overflow-hidden`}
          style={{ height: '75vh' }}
        >
          {activeTicket ? (
            <>
              {/* Chat Header */}
              <div
                className={`p-4 border-b flex-shrink-0 ${
                  isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-[#071322]'
                } flex items-center justify-between gap-3`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-sky-400">{activeTicket.id}</span>
                    <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'} line-clamp-1`}>
                      {activeTicket.subject}
                    </span>
                  </div>
                  <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Category: {activeTicket.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[11px] px-2.5 py-1 rounded-full border font-bold flex-shrink-0 ${statusBadgeClass(activeTicket.status)}`}>
                    {activeTicket.status}
                  </span>
                  {activeTicket.status !== 'Closed' && activeTicket.status !== 'Completed' && (
                    <button
                      type="button"
                      disabled={isCompleting}
                      onClick={() => handleUserCompleteTicket(activeTicket.id)}
                      className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 active:scale-95"
                      title="Mark ticket as Completed"
                    >
                      <CheckCircle2 className={`w-3 h-3 ${isCompleting ? 'animate-spin' : ''}`} />
                      <span>{isCompleting ? 'Completing…' : 'Mark Completed'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Message bubbles */}
              <div className={`flex-1 overflow-y-auto p-4 space-y-3.5 ${isLight ? 'bg-slate-50/50' : ''}`}>
                {activeTicket.messages.length === 0 ? (
                  <div className={`flex items-center justify-center h-full text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                    No messages yet — we'll reply here shortly.
                  </div>
                ) : activeTicket.messages.map((m) => {
                  const isUser = m.sender === 'user';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mb-1 px-1`}>
                        {m.senderName} • {m.timestamp}
                      </span>
                      <div
                        className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                          isUser
                            ? 'bg-[#155EEF] text-white rounded-br-none shadow-md'
                            : isLight
                            ? 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                            : 'bg-[#06121F] border border-white/10 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              {activeTicket.status === 'Closed' ? (
                <div className={`p-3.5 border-t flex-shrink-0 text-center text-xs ${
                  isLight ? 'border-slate-200 bg-slate-50 text-slate-400' : 'border-white/10 bg-[#071322] text-slate-500'
                }`}>
                  🔒 This ticket is closed. Contact support to reopen if you need further assistance.
                </div>
              ) : activeTicket.status === 'Completed' ? (
                <div className={`p-3.5 border-t flex-shrink-0 flex items-center justify-between gap-3 text-xs ${
                  isLight ? 'border-slate-200 bg-emerald-50/70 text-emerald-800' : 'border-white/10 bg-emerald-500/10 text-emerald-300'
                }`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>This ticket is marked as Completed. Need more help? Click to reply and reopen.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTicket({ ...activeTicket, status: 'Open' })}
                    className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer shrink-0 transition-all shadow-sm active:scale-95"
                  >
                    Reply / Reopen
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSendReply}
                  className={`p-3 border-t flex-shrink-0 ${
                    isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-[#071322]'
                  } flex gap-2`}
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a message..."
                    className={`flex-1 px-4 py-2.5 rounded-xl ${
                      isLight
                        ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-400'
                        : 'bg-[#06121F] border border-white/15 text-white focus:border-blue-500'
                    } text-xs outline-none`}
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs disabled:opacity-40 transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className={`flex-1 flex flex-col items-center justify-center text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
              <p>Select a ticket to open conversation</p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div
            className={`w-full max-w-md ${
              isLight
                ? 'bg-white border border-slate-200 shadow-2xl text-slate-900'
                : 'bg-[#091A2E] border border-white/15 shadow-2xl text-white'
            } rounded-3xl p-6 space-y-4`}
          >
            <div
              className={`flex items-center justify-between border-b ${
                isLight ? 'border-slate-200' : 'border-white/10'
              } pb-3`}
            >
              <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Create Support Ticket
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className={`${isLight ? 'text-slate-400 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewTicket} className="space-y-3">
              <div>
                <label className={`block text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'} mb-1`}>
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Brief summary of inquiry"
                  className={`w-full px-3.5 py-2.5 rounded-xl ${
                    isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900'
                      : 'bg-[#06121F] border border-white/15 text-white'
                  } text-xs outline-none focus:border-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'} mb-1`}>
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className={`w-full px-3.5 py-2.5 rounded-xl ${
                    isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900'
                      : 'bg-[#06121F] border border-white/15 text-white'
                  } text-xs outline-none focus:border-blue-500`}
                >
                  <option value="Unlock Request">Unlock Request (Daily Distribution)</option>
                  <option value="Deposit/Withdrawal">Deposit / Withdrawal Support</option>
                  <option value="KYC">KYC & Identity Review</option>
                  <option value="Plan Question">Mobility Fleet Plan Questions</option>
                  <option value="Technical">Technical & Security</option>
                </select>
              </div>

              {newCategory === 'Unlock Request' && lockedRewards.length > 0 && (
                <div>
                  <label className={`block text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'} mb-1`}>
                    Attach Locked Reward (Optional)
                  </label>
                  <select
                    value={attachedReward}
                    onChange={(e) => setAttachedReward(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl ${
                      isLight
                        ? 'bg-slate-50 border border-slate-300 text-slate-900'
                        : 'bg-[#06121F] border border-white/15 text-white'
                    } text-xs outline-none focus:border-blue-500`}
                  >
                    <option value="">None</option>
                    {lockedRewards.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.planName} - ${r.grossAmount.toFixed(2)} ({r.date})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className={`block text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'} mb-1`}>
                  Details
                </label>
                <textarea
                  rows={4}
                  required
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Describe your issue or request in detail..."
                  className={`w-full p-3 rounded-xl ${
                    isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900'
                      : 'bg-[#06121F] border border-white/15 text-white'
                  } text-xs outline-none focus:border-blue-500`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className={`px-4 py-2 rounded-xl ${
                    isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/5 text-slate-300'
                  } text-xs font-semibold`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
