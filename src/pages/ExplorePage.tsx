import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, X } from 'lucide-react';
import {
  DemoModeNotice,
  EmptyState,
  ErrorState,
  LoadingState,
} from '../components/StateFeedback';
import { StoryCard } from '../components/StoryCard';
import { useLibrary } from '../hooks/useLibrary';
import { StorySortOption } from '../types';
import { filterAndSortStories } from '../utils/storyFilters';

export function ExplorePage() {
  const { stories, genres, isLoading, error, dataSource, refreshData } = useLibrary();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialGenre = searchParams.get('genre') ?? 'all';
  const initialSort = (searchParams.get('sort') as StorySortOption) ?? 'latest';
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [sortBy, setSortBy] = useState<StorySortOption>(
    ['latest', 'popular', 'updated'].includes(initialSort) ? initialSort : 'latest',
  );

  const handleGenreChange = (slug: string) => {
    setSelectedGenre(slug);
    const next = new URLSearchParams(searchParams);
    if (slug === 'all') {
      next.delete('genre');
    } else {
      next.set('genre', slug);
    }
    setSearchParams(next, { replace: true });
  };

  const handleSortChange = (nextSort: StorySortOption) => {
    setSortBy(nextSort);
    const next = new URLSearchParams(searchParams);
    next.set('sort', nextSort);
    setSearchParams(next, { replace: true });
  };

  const resetFilters = () => {
    setQuery('');
    setSelectedGenre('all');
    setSortBy('latest');
    setSearchParams({}, { replace: true });
  };

  const filteredStories = useMemo(
    () =>
      filterAndSortStories(stories, {
        query,
        genreSlug: selectedGenre,
        sortBy,
      }),
    [stories, query, selectedGenre, sortBy],
  );

  const activeGenreName =
    selectedGenre === 'all'
      ? null
      : genres.find((g) => g.slug === selectedGenre)?.name ?? selectedGenre;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-amber-300/90">Story Library</p>
          <h1 className="font-display mt-2 text-3xl font-semibold text-slate-100 sm:text-4xl">
            {activeGenreName ? `${activeGenreName} Stories` : 'Explore All Stories'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Search published interactive titles, filter by genre, or sort by latest,
            popularity, and recent updates.
          </p>
        </div>

        <Link
          to="/generate"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-500 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Create Story</span>
        </Link>
      </div>

      {dataSource === 'demo' && (
        <div className="mt-6">
          <DemoModeNotice message="Showing demo interactive stories. Connect your existing Supabase project to browse live published records." />
        </div>
      )}

      <div className="glass-panel mt-8 grid gap-4 rounded-2xl p-4 sm:grid-cols-12">
        <div className="relative sm:col-span-5">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <label htmlFor="story-search" className="sr-only">
            Search stories by title
          </label>
          <input
            id="story-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stories by title or author..."
            className="w-full rounded-xl border border-white/12 bg-[#070B19] py-2.5 pr-9 pl-10 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear story search"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="sm:col-span-4">
          <label htmlFor="genre-filter" className="sr-only">
            Filter by genre
          </label>
          <select
            id="genre-filter"
            value={selectedGenre}
            onChange={(e) => handleGenreChange(e.target.value)}
            className="w-full rounded-xl border border-white/12 bg-[#070B19] px-3.5 py-2.5 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
          >
            <option value="all">All Genres ({genres.length})</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.slug}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="story-sort" className="sr-only">
            Sort stories
          </label>
          <select
            id="story-sort"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as StorySortOption)}
            className="w-full rounded-xl border border-white/12 bg-[#070B19] px-3.5 py-2.5 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
          >
            <option value="latest">Sort: Latest</option>
            <option value="popular">Sort: Popular</option>
            <option value="updated">Sort: Recently Updated</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono-tabular">
          {filteredStories.length}{' '}
          {filteredStories.length === 1 ? 'story' : 'stories'} found
        </span>
        {(query || selectedGenre !== 'all') && (
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
          <LoadingState title="Loading stories..." />
        ) : error ? (
          <ErrorState description={error} onRetry={refreshData} />
        ) : filteredStories.length === 0 ? (
          <EmptyState
            title="No stories match this filter"
            description={
              activeGenreName
                ? `No demo stories are published under ${activeGenreName} yet. Reset filters to explore other worlds or generate a custom ${activeGenreName} story in AI Studio.`
                : 'Try adjusting your search query or selecting another genre.'
            }
            actionLabel="Show All Stories"
            onAction={resetFilters}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
