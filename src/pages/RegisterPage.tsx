import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { DemoModeNotice } from '../components/StateFeedback';
import { useAuth } from '../hooks/useAuth';
import { AuthValidationErrors, validateRegisterForm } from '../utils/authValidation';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, signInWithGoogle, isSupabaseReady } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<AuthValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validation = validateRegisterForm(name, email, password, confirmPassword);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register(name, email, password);
      if (result.error) {
        setFormError(result.error);
        return;
      }
      navigate('/profile');
    } catch {
      setFormError('Unable to create account right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
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
      setFormError('Unable to initiate Google sign-up.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14 sm:px-6">
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8">
        <p className="text-xs font-semibold text-amber-300/90">Create Account</p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-slate-50">
          Begin Your Archive
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Save favorite stories, track unlocked endings, and customize your genres.
        </p>

        {!isSupabaseReady && (
          <div className="mt-5">
            <DemoModeNotice message="Supabase Auth is not connected yet. Registration stores a local Demo Reader profile in your browser only." />
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
              htmlFor="register-name"
              className="block text-xs font-medium text-slate-200"
            >
              Display Name
            </label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Avery Mercer"
              className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#070B19] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-rose-300">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="block text-xs font-medium text-slate-200"
            >
              Email Address
            </label>
            <input
              id="register-email"
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
            <label
              htmlFor="register-password"
              className="block text-xs font-medium text-slate-200"
            >
              Password
            </label>
            <div className="relative mt-1.5">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
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

          <div>
            <label
              htmlFor="register-confirm"
              className="block text-xs font-medium text-slate-200"
            >
              Confirm Password
            </label>
            <input
              id="register-confirm"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#070B19] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-rose-300">{errors.confirmPassword}</p>
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
            <span>
              {isSupabaseReady ? 'Create Account' : 'Create Demo Account'}
            </span>
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
          <div className="h-px flex-1 bg-white/10" />
          <span>or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
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
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-indigo-300 hover:text-amber-200"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
