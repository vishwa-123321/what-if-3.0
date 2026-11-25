import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { validateEmail } from '../utils/authValidation';

export function ForgotPasswordPage() {
  const { requestPasswordReset, isSupabaseReady } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestPasswordReset(email);
      if (!res.ok || res.error) {
        setError(res.error ?? 'Unable to send reset link.');
        return;
      }
      setSuccessMessage(res.message);
    } catch {
      setError('Unable to process password reset request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14 sm:px-6">
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-amber-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Sign In</span>
        </Link>

        <h1 className="font-display mt-4 text-3xl font-semibold text-slate-50">
          Reset Password
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Enter your email address to receive password recovery instructions.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-rose-400/35 bg-rose-950/40 px-4 py-3 text-xs text-rose-200"
          >
            {error}
          </div>
        )}

        {successMessage ? (
          <div
            role="status"
            className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-950/30 p-5 text-sm text-emerald-100"
          >
            <div className="flex items-center gap-2 font-semibold text-emerald-200">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>Request Processed</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-200">
              {successMessage}
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block text-xs font-semibold text-amber-200 hover:underline"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="reset-email"
                className="block text-xs font-medium text-slate-200"
              >
                Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reader@example.com"
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#070B19] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              <span>
                {isSupabaseReady
                  ? 'Send Reset Instructions'
                  : 'Preview Reset Request (Demo)'}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
