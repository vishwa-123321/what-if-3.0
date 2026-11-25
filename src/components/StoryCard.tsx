import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark } from 'lucide-react';
import { useLibrary } from '../hooks/useLibrary';
import { Story } from '../types';
import { MediaCover } from './MediaCover';

interface StoryCardProps {
  story: Story;
  compact?: boolean;
}

export function StoryCard({ story, compact = false }: StoryCardProps) {
  const { isFavorite, toggleFavorite, getProgress } = useLibrary();
  const saved = isFavorite(story.id);
  const progress = getProgress(story.id);

  return (
    <article className="glass-panel group relative flex h-full flex-col overflow-hidden rounded-2xl transition-transform duration-200 hover:-translate-y-0.5 hover:border-indigo-400/30">
      <div className="relative">
        <Link
          to={`/stories/${story.slug}`}
          className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
          aria-label={`View details for ${story.title}`}
        >
          <MediaCover
            src={story.coverImage}
            alt={`Cover artwork for ${story.title}`}
            accentGradient={story.accentGradient}
            aspectClassName={compact ? 'aspect-[4/3]' : 'aspect-[4/5]'}
            fallbackTitle={story.title}
          />
        </Link>

        <button
          type="button"
          onClick={() => toggleFavorite(story.id)}
          aria-label={
            saved
              ? `Remove ${story.title} from favorites`
              : `Save ${story.title} to favorites`
          }
          aria-pressed={saved}
          className={`absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 ${
            saved
              ? 'border-amber-300/60 bg-amber-500/20 text-amber-200'
              : 'border-white/15 bg-[#070B19]/75 text-slate-200 hover:border-white/30 hover:text-white'
          }`}
        >
          <Bookmark
            className="h-4 w-4"
            fill={saved ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        </button>

        {progress && (
          <div className="absolute right-3 bottom-3 left-3">
            <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-amber-200">
              <span>{progress.completed ? 'Completed' : 'In Progress'}</span>
              <span className="font-mono-tabular">{progress.progressPercent}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-amber-300"
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
          <span className="font-medium text-amber-300/90">{story.genreName}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-tabular">{story.estimatedMinutes} min</span>
          <span aria-hidden="true">·</span>
          <span>{story.difficulty}</span>
          {story.isDemo && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-indigo-300/90">Demo</span>
            </>
          )}
        </div>

        <h3 className="font-display mt-2 text-xl font-semibold leading-snug text-slate-100">
          <Link
            to={`/stories/${story.slug}`}
            className="transition-colors hover:text-amber-200"
          >
            {story.title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-300/90">
          {story.subtitle}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-white/8 pt-4 text-xs text-slate-400">
          <span className="truncate pr-2">
            {story.totalEndings} endings · {story.totalPaths} paths
          </span>
          <Link
            to={progress ? `/read/${story.slug}` : `/stories/${story.slug}`}
            className="inline-flex shrink-0 items-center gap-1.5 font-medium text-indigo-300 transition-colors hover:text-amber-200 whitespace-nowrap"
          >
            <span>{progress ? 'Continue' : 'Read'}</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
