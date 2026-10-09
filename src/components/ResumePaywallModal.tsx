import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Sparkles,
  FileText
} from 'lucide-react';

interface ResumePaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  isOwner: boolean;
}

export const ResumePaywallModal: React.FC<ResumePaywallModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  isOwner,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'momo'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  
  // Mobile money fields
  const [momoNumber, setMomoNumber] = useState('');
  const [momoNetwork, setMomoNetwork] = useState('MTN Mobile Money');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txId, setTxId] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentError(null);

    try {
      const response = await fetch('/api/payments/resume-unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          paymentMethod === 'card'
            ? { paymentMethod: 'card', name: cardName, cardNumber, cardExpiry, cardCvc }
            : { paymentMethod: 'momo', name: momoNumber, momoNetwork, momoNumber }
        ),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success !== true) {
        throw new Error(data.error || 'The payment could not be completed.');
      }

      setTxId(typeof data.receiptId === 'string' ? data.receiptId : '');
      setIsSuccess(true);

      // Unlock the resume only after the server confirmed the charge.
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
        setIsSuccess(false);
      }, 1500);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'The payment could not be completed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOwnerBypass = () => {
    onPaymentSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 no-print">
      <div
        className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6 sm:p-7 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                Unlock Verified Credentials & CV
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                Official Drone License, Certs & Resume Access
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pricing Card */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">
              All-Access Credential Fee
            </span>
            <span className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 font-mono">
              $0.50 <span className="text-xs text-zinc-500 font-normal">USD</span>
            </span>
          </div>

          <div className="text-right">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              Certs + CV Unlocked
            </span>
            <p className="text-[10px] text-zinc-400 mt-1">GCAA License + Google Certs + CV</p>
          </div>
        </div>

        {/* Owner Bypass Alert */}
        {isOwner && (
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs flex items-center justify-between">
            <span>👤 You are logged in as <strong>Owner</strong>.</span>
            <button
              onClick={handleOwnerBypass}
              className="text-xs font-bold underline text-blue-700 dark:text-blue-300"
            >
              Download Free →
            </button>
          </div>
        )}

        {isSuccess ? (
          <div className="text-center py-6 space-y-3 animate-in fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
              Payment Confirmed!
            </h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              Receipt ID: <code className="font-mono text-zinc-700 dark:text-zinc-300">{txId}</code>. Your high-res PDF resume and verified certificates vault are now unlocked.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePay} className="space-y-4">
            {/* Method Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Card (Debit/Credit)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('momo')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'momo'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile Money (MoMo)</span>
              </button>
            </div>

            {/* Method 1: Card */}
            {paymentMethod === 'card' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                    Cardholder Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Recruiter / Hiring Lead"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="•••• •••• •••• ••••"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                      CVC / CVV
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="•••"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Method 2: Mobile Money */}
            {paymentMethod === 'momo' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                    Select Network Provider
                  </label>
                  <select
                    value={momoNetwork}
                    onChange={(e) => setMomoNetwork(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="MTN Mobile Money">MTN Mobile Money (Ghana / Africa)</option>
                    <option value="Telecel Cash">Telecel Cash (Vodafone)</option>
                    <option value="AirtelTigo Money">ATMoney (AirtelTigo)</option>
                    <option value="M-Pesa">M-Pesa (East Africa / Global)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                    Mobile Wallet Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +233 59 178 4205"
                    value={momoNumber}
                    onChange={(e) => setMomoNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>
            )}

            {paymentError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing $0.50 Secure Payment...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Pay $0.50 & Download Resume Now</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-zinc-400 text-center font-mono flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>TLS 256-Bit Encrypted Micro-Payment • Instant Receipt</span>
            </p>
          </form>
        )}

      </div>
    </div>
  );
};
