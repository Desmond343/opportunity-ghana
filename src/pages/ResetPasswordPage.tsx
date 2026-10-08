import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../services/authContext';
import {
  Compass,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';

interface ResetPasswordPageProps {
  onNavigate: (path: string) => void;
  queryString?: string;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigate, queryString }) => {
  const { verifyResetCode, confirmPasswordReset } = useAuth();

  // Extract oobCode from URL query params
  const [oobCode, setOobCode] = useState<string>(() => {
    const search = queryString || (typeof window !== 'undefined' ? window.location.search : '');
    const params = new URLSearchParams(search);
    return params.get('oobCode') || params.get('code') || params.get('token') || '';
  });

  const [verifyingCode, setVerifyingCode] = useState(true);
  const [codeVerified, setCodeVerified] = useState(false);
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Form fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Manual code entry if user arrives without URL parameter
  const [manualCode, setManualCode] = useState('');

  // 1. Verify code on initial load
  useEffect(() => {
    let isMounted = true;
    const verify = async (codeToVerify: string) => {
      if (!codeToVerify.trim()) {
        if (isMounted) {
          setVerifyingCode(false);
          setCodeVerified(false);
        }
        return;
      }

      setVerifyingCode(true);
      setVerificationError(null);
      try {
        const email = await verifyResetCode(codeToVerify.trim());
        if (isMounted) {
          setAccountEmail(email);
          setCodeVerified(true);
        }
      } catch (err: any) {
        if (isMounted) {
          setCodeVerified(false);
          setVerificationError(
            err.message || 'This password reset link is invalid or has expired. Please request a new link.'
          );
        }
      } finally {
        if (isMounted) {
          setVerifyingCode(false);
        }
      }
    };

    verify(oobCode);

    return () => {
      isMounted = false;
    };
  }, [oobCode, verifyResetCode]);

  // Password strength calculation
  const strengthInfo = useMemo(() => {
    if (!newPassword) return { score: 0, label: '', color: 'bg-slate-200 dark:bg-slate-700' };

    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score += 1;
    if (/\d/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    // Normalize to 0-4
    const normalized = Math.min(score, 4);

    switch (normalized) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-rose-500' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-blue-500' };
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-emerald-600' };
      default:
        return { score: 0, label: 'Too short', color: 'bg-slate-300 dark:bg-slate-700' };
    }
  }, [newPassword]);

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!oobCode.trim()) {
      setSubmitError('Missing password reset security code.');
      return;
    }

    if (!newPassword) {
      setSubmitError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setSubmitError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSubmitError('Passwords do not match. Please verify both fields.');
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordReset(oobCode.trim(), newPassword);
      setResetSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to reset password. Please try again or request a new link.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyManualCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      setOobCode(manualCode.trim());
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
          {resetSuccess ? 'Password Reset Complete' : 'Set New Password'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          {resetSuccess
            ? 'Your account password has been securely updated.'
            : 'Create a strong, new password to access your Opportunity Ghana account.'}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-[#141B29] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5">
        {/* State 1: Verifying Reset Code */}
        {verifyingCode && (
          <div className="py-10 text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Verifying Security Credentials...
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Validating your password reset token with Opportunity Ghana.
              </p>
            </div>
          </div>
        )}

        {/* State 2: Success State */}
        {!verifyingCode && resetSuccess && (
          <div className="space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-space">
                Password Successfully Reset!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Your password has been changed. You can now use your new password to sign in to your account.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign In with New Password</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* State 3: Code Verification Error / Expired Code */}
        {!verifyingCode && !resetSuccess && verificationError && (
          <div className="space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-space">
                Invalid or Expired Link
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {verificationError}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Password reset links expire after 1 hour or can only be used once for security reasons.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => onNavigate('/forgot-password')}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Request a New Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="w-full py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </button>
            </div>
          </div>
        )}

        {/* State 4: Missing Code (User navigated directly to /reset-password without link) */}
        {!verifyingCode && !resetSuccess && !verificationError && !oobCode && (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-space">
                Reset Link Required
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                To reset your password, please open the secure link sent to your registered email address.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Have a reset code from your email link?
              </p>
              <form onSubmit={handleApplyManualCode} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste reset code here"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
                <button
                  type="submit"
                  disabled={!manualCode.trim()}
                  className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => onNavigate('/forgot-password')}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Request a Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="w-full py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </button>
            </div>
          </div>
        )}

        {/* State 5: Valid Code - Set New Password Form */}
        {!verifyingCode && !resetSuccess && !verificationError && codeVerified && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {accountEmail && (
              <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  Setting new password for: <strong className="font-mono">{accountEmail}</strong>
                </span>
              </div>
            )}

            {submitError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <span className="leading-relaxed">{submitError}</span>
              </div>
            )}

            {/* New Password Field */}
            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter at least 6 characters"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (submitError) setSubmitError(null);
                  }}
                  className="w-full text-xs p-2.5 pr-10 pl-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength indicator */}
              {newPassword.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Password strength:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {strengthInfo.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full rounded-full transition-all duration-300 ${
                          step <= strengthInfo.score
                            ? strengthInfo.color
                            : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Use 8+ characters with uppercase letters, numbers, and symbols for best security.
                  </p>
                </div>
              )}
            </div>

            {/* Confirm New Password Field */}
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (submitError) setSubmitError(null);
                  }}
                  className={`w-full text-xs p-2.5 pr-10 pl-9 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                    passwordsMismatch
                      ? 'border-rose-400 dark:border-rose-800 focus:ring-rose-500/20'
                      : passwordsMatch
                      ? 'border-emerald-400 dark:border-emerald-800 focus:ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500/20'
                  }`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password match indicator */}
              {confirmPassword.length > 0 && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                  {passwordsMatch ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                        Passwords match
                      </span>
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      <span className="text-rose-600 dark:text-rose-400 font-medium">
                        Passwords do not match
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting || newPassword.length < 6 || passwordsMismatch}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Back to login */}
            <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Security note */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>Your new password is encrypted immediately upon saving.</span>
      </div>
    </div>
  );
};
