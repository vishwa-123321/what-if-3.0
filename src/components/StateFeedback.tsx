import React from 'react';
import { AlertCircle, Compass, Info, Loader2 } from 'lucide-react';

export function LoadingState({
  title = 'Loading narrative...',
  description = 'Preparing chapters and branching paths.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="glass-panel flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center"
    >
      <Loader2 className="mb-4 h-7 w-7 animate-spin text-amber-300" aria-hidden="true" />
      <h3 className="font-display text-lg font-medium text-slate-100">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-slate-400">{description}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="glass-panel flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-indigo-950/60 text-amber-300">
        {icon ?? <Compass className="h-5 w-5" aria-hidden="true" />}
      </div>
      <h3 className="font-display text-xl font-medium text-slate-100">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="glass-panel flex flex-col items-center justify-center rounded-2xl border-rose-500/30 px-6 py-14 text-center"
    >
      <AlertCircle className="mb-3 h-7 w-7 text-rose-400" aria-hidden="true" />
      <h3 className="font-display text-lg font-medium text-slate-100">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-slate-300">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-white/10"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function DemoModeNotice({
  label = 'Demo Preview Mode',
  message,
}: {
  label?: string;
  message: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-950/20 px-4 py-3 text-xs leading-relaxed text-amber-100/90">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
      <div>
        <span className="font-semibold text-amber-200">{label}: </span>
        <span className="text-slate-300">{message}</span>
      </div>
    </div>
  );
}
