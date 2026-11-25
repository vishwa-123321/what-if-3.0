import { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface MediaCoverProps {
  src: string;
  alt: string;
  accentGradient?: string;
  className?: string;
  aspectClassName?: string;
  fallbackTitle?: string;
}

export function MediaCover({
  src,
  alt,
  accentGradient = 'from-indigo-950 via-slate-950 to-violet-950',
  className = '',
  aspectClassName = 'aspect-[3/4]',
  fallbackTitle,
}: MediaCoverProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${accentGradient} ${aspectClassName} ${className}`}
    >
      {!hasError && src ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setHasError(true)}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
          <BookOpen className="mb-3 h-8 w-8 text-amber-300/70" aria-hidden="true" />
          {fallbackTitle && (
            <span className="font-display text-sm font-medium text-slate-200">
              {fallbackTitle}
            </span>
          )}
        </div>
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050711]/90 via-[#050711]/25 to-transparent"
      />
    </div>
  );
}
