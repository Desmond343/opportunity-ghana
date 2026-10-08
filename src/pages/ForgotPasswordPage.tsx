import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import {
  Compass,
  Mail,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  RefreshCw,
  Clock
} from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigate: (path: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // 60-second cooldown timer after sending
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const validateEmail = (val: string): string | null => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Please enter your email address.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return 'Please enter a valid email address.';
    }
    return null;
  };

  const handleSendReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const validationErr = validateEmail(email);
    if (validationErr) {
      setErrorMsg(validationErr);
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(email.trim());
      setSentEmail(email.trim());
      setSubmitted(true);
      setCooldown(60);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading || !sentEmail) return;
    setErrorMsg(null);
    setLoading(true);
    try {
      await sendPasswordReset(sentEmail);
      setCooldown(60);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not resend reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-6 h-6 text-emerald-200" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-space tracking-tight">
          {submitted ? 'Check Your Email' : 'Forgot Password?'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          {submitted
            ? 'We have sent password recovery instructions to your email.'
            : 'Enter your registered email address and we will send you a secure link to reset your password.'}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-[#141B29] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5">
        {/* Error notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {submitted ? (
          /* Confirmation State */
          <div className="space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-2 text-left bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Reset link sent to:</span>
              </div>
              <p className="text-xs font-mono font-medium text-emerald-800 dark:text-emerald-300 break-all bg-white dark:bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                {sentEmail}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                If an account exists with this email address, you will find instructions to reset your password. Be sure to check your spam or junk folder if it does not appear within a few minutes.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2 text-left">
              <Clock className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>For your account security, reset links remain valid for 1 hour.</span>
            </div>

            {/* Resend button with cooldown */}
            <div className="pt-1 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
                className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  cooldown > 0 || loading
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Resending Link...</span>
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Resend email in {cooldown}s</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Resend Reset Email</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setErrorMsg(null);
                }}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:underline cursor-pointer py-1"
              >
                Try a different email address
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Login</span>
              </button>
            </div>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSendReset} className="space-y-4">
            <div>
              <label
                htmlFor="reset-email"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
              >
                Registered Email Address
              </label>
              <div className="relative">
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="e.g. kwame@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="w-full text-xs p-2.5 pl-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                We'll send a one-time secure link to this address.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Security note */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>Opportunity Ghana accounts are protected with industry-standard encryption.</span>
      </div>
    </div>
  );
};
