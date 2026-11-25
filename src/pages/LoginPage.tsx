import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { DemoModeNotice } from '../components/StateFeedback';
import { useAuth } from '../hooks/useAuth';
import { AuthValidationErrors, validateLoginForm } from '../utils/authValidation';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, isSupabaseReady } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<AuthValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validation = validateLoginForm(email, password);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn(email, password);
      if (result.error) {
        setFormError(result.error);
        return;
      }
      navigate('/profile');
    } catch {
      setFormError('Unable to sign in right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setFormError(result.error);
        return;
      }
      if (result.user) {
        navigate('/profile');
      }
    } catch {
      setFormError('Unable to initiate Google sign-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14 sm:px-6">
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8">
        <p className="text-xs font-semibold text-amber-300/90">Reader Access</p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-slate-50">
          Welcome Back
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Sign in to access your reading progress, favorites, and story history.
        </p>

        {!isSupabaseReady && (
          <div className="mt-5">
            <DemoModeNotice message="Supabase Auth is not configured yet. Signing in creates a clearly labeled local Demo Session only." />
          </div>
        )}

        {formError && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-rose-400/35 bg-rose-950/40 px-4 py-3 text-xs text-rose-200"
          >
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-medium text-slate-200"
            >
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="reader@example.com"
              className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#070B19] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-rose-300">{errors.email}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="block text-xs font-medium text-slate-200"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-indigo-300 hover:text-amber-200"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative mt-1.5">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-white/12 bg-[#070B19] py-2.5 pr-11 pl-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute top-1/2 right-2.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-rose-300">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
          >
            {isSubmitting && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            <span>{isSupabaseReady ? 'Sign In' : 'Sign In (Demo Mode)'}</span>
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
          <div className="h-px flex-1 bg-white/10" />
          <span>or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-medium text-slate-100 transition-colors hover:bg-white/10"
        >
          <span>
            {isSupabaseReady
              ? 'Continue with Google'
              : 'Continue with Google (Demo Preview)'}
          </span>
        </button>

        <p className="mt-6 text-center text-xs text-slate-400">
          New to WHAT IF 3.0?{' '}
          <Link
            to="/register"
            className="font-semibold text-indigo-300 hover:text-amber-200"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
