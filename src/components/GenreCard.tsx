import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Genre } from '../types';
import { MediaCover } from './MediaCover';

interface GenreCardProps {
  genre: Genre;
}

export function GenreCard({ genre }: GenreCardProps) {
  return (
    <Link
      to={`/explore?genre=${encodeURIComponent(genre.slug)}`}
      className="glass-panel group flex h-full flex-col overflow-hidden rounded-2xl transition-transform duration-200 hover:-translate-y-0.5 hover:border-amber-300/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
    >
      <div className="relative">
        <MediaCover
          src={genre.coverImage}
          alt={`${genre.name} genre atmosphere`}
          accentGradient={genre.accentGradient}
          aspectClassName="aspect-[16/10]"
          fallbackTitle={genre.name}
        />
        <div className="absolute right-4 bottom-3 left-4 flex items-center justify-between text-xs text-slate-200/90">
          <span>{genre.category}</span>
          <span className="font-mono-tabular text-amber-200/90">
            {genre.storyCount} {genre.storyCount === 1 ? 'story' : 'stories'}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-slate-100 transition-colors group-hover:text-amber-200">
          {genre.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-400">
          {genre.description}
        </p>
        <div className="mt-auto flex items-center gap-1.5 pt-4 text-xs font-medium text-indigo-300 group-hover:text-amber-200">
          <span>Explore genre</span>
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
  );
}
