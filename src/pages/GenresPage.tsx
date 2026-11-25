import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { GenreCard } from '../components/GenreCard';
import {
  DemoModeNotice,
  EmptyState,
  ErrorState,
  LoadingState,
} from '../components/StateFeedback';
import { useLibrary } from '../hooks/useLibrary';
import { GenreCategory } from '../types';
import { doesStoryMatchGenre, filterGenres } from '../utils/storyFilters';

const CATEGORIES: GenreCategory[] = [
  'All',
  'Speculative',
  'Mystery & Noir',
  'Fantasy & Myth',
  'Drama & History',
];

export function GenresPage() {
  const { genres, stories, isLoading, error, dataSource, refreshData } = useLibrary();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GenreCategory>('All');

  const genresWithLiveCounts = useMemo(() => {
    return genres.map((genre) => {
      const count = stories.filter((s) => doesStoryMatchGenre(s, genre.slug)).length;
      return {
        ...genre,
        storyCount: count || genre.storyCount,
      };
    });
  }, [genres, stories]);

  const filteredGenres = useMemo(
    () =>
      filterGenres(genresWithLiveCounts, {
        query,
        category: selectedCategory,
      }),
    [genresWithLiveCounts, query, selectedCategory],
  );

  const resetFilters = () => {
    setQuery('');
    setSelectedCategory('All');
  };

  const hasLiveGenres = genres.some((g) => g.isDemo === false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-amber-300/90">Genre Library</p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-slate-100 sm:text-4xl">
          Twenty Worlds Waiting to Branch
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-300">
          Browse twenty curated narrative genres. Select any genre to explore its
          published interactive stories.
        </p>
      </div>

      {dataSource === 'demo' && !hasLiveGenres && (
        <div className="mt-6">
          <DemoModeNotice message="Displaying 20 demo genres. When connected to your Supabase project, this library loads directly from your existing genres table." />
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <label htmlFor="genre-search" className="sr-only">
            Search genres
          </label>
          <input
            id="genre-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search genres by name or theme..."
            className="w-full rounded-xl border border-white/12 bg-[#0B1022] py-2.5 pr-10 pl-10 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear genre search"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div
          role="tablist"
          aria-label="Filter genres by category"
          className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-[#0B1022]/80 p-1.5"
        >
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono-tabular">
          Showing {filteredGenres.length} of {genres.length} genres
        </span>
        {(query || selectedCategory !== 'All') && (
          <button
            type="button"
            onClick={resetFilters}
            className="font-medium text-indigo-300 hover:text-amber-200"
          >
            Reset filters
          </button>
        )}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <LoadingState title="Loading genres..." />
        ) : error ? (
          <ErrorState description={error} onRetry={refreshData} />
        ) : filteredGenres.length === 0 ? (
          <EmptyState
            title="No matching genres found"
            description="Try a different keyword or reset the category filter to browse all 20 genres."
            actionLabel="Show All 20 Genres"
            onAction={resetFilters}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredGenres.map((genre) => (
              <GenreCard key={genre.id} genre={genre} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
