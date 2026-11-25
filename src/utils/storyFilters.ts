import { Genre, GenreCategory, Story, StorySortOption } from '../types';

export interface StoryFilterParams {
  query: string;
  genreSlug: string;
  sortBy: StorySortOption;
}

const SLUG_EQUIVALENTS: Record<string, string[]> = {
  mystery: ['mystery', 'noir-mystery', 'detective-investigation', 'detective'],
  'noir-mystery': ['noir-mystery', 'mystery', 'detective', 'crime-investigation'],
  'science-fiction': ['science-fiction', 'sci-fi', 'space-exploration'],
  'sci-fi': ['sci-fi', 'science-fiction', 'space-exploration'],
  'time-travel': ['time-travel', 'time-paradox'],
  'time-paradox': ['time-paradox', 'time-travel'],
  fantasy: ['fantasy', 'dark-fantasy', 'mythology'],
  'dark-fantasy': ['dark-fantasy', 'fantasy', 'mythology'],
  'historical-fiction': ['historical-fiction', 'gothic-historical', 'alternate-history'],
  'gothic-historical': ['gothic-historical', 'historical-fiction', 'supernatural'],
  'alternate-history': ['alternate-history', 'historical-fiction'],
  detective: ['detective', 'detective-investigation', 'crime-investigation', 'mystery', 'noir-mystery'],
  'detective-investigation': ['detective-investigation', 'detective', 'crime-investigation', 'mystery'],
  survival: ['survival', 'survival-adventure'],
  'survival-adventure': ['survival-adventure', 'survival'],
};

export function doesStoryMatchGenre(story: Story, targetSlug: string): boolean {
  const normalizedTarget = targetSlug.trim().toLowerCase();
  if (!normalizedTarget || normalizedTarget === 'all') {
    return true;
  }
  const storySlug = story.genreSlug.toLowerCase();
  const storyNameSlug = story.genreName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (storySlug === normalizedTarget || storyNameSlug === normalizedTarget) {
    return true;
  }
  const aliases = SLUG_EQUIVALENTS[normalizedTarget];
  if (aliases && (aliases.includes(storySlug) || aliases.includes(storyNameSlug))) {
    return true;
  }
  return storySlug.includes(normalizedTarget) || normalizedTarget.includes(storySlug);
}

export function filterAndSortStories(
  stories: Story[],
  params: StoryFilterParams,
): Story[] {
  const normalizedQuery = params.query.trim().toLowerCase();

  const filtered = stories.filter((story) => {
    if (!doesStoryMatchGenre(story, params.genreSlug)) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return (
      story.title.toLowerCase().includes(normalizedQuery) ||
      story.subtitle.toLowerCase().includes(normalizedQuery) ||
      story.description.toLowerCase().includes(normalizedQuery) ||
      story.genreName.toLowerCase().includes(normalizedQuery) ||
      story.author.toLowerCase().includes(normalizedQuery)
    );
  });

  return [...filtered].sort((a, b) => {
    if (params.sortBy === 'popular') {
      return b.popularityScore - a.popularityScore;
    }
    if (params.sortBy === 'updated') {
      return b.updatedAt.localeCompare(a.updatedAt);
    }
    return b.publishedAt.localeCompare(a.publishedAt);
  });
}

export interface GenreFilterParams {
  query: string;
  category: GenreCategory;
}

export function filterGenres(genres: Genre[], params: GenreFilterParams): Genre[] {
  const normalizedQuery = params.query.trim().toLowerCase();

  return genres.filter((genre) => {
    const matchesCategory =
      params.category === 'All' || genre.category === params.category;

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return (
      genre.name.toLowerCase().includes(normalizedQuery) ||
      genre.description.toLowerCase().includes(normalizedQuery) ||
      genre.category.toLowerCase().includes(normalizedQuery)
    );
  });
}
