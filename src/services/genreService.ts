import { DEMO_GENRES } from '../data/demoGenres';
import { Genre } from '../types';
import { getSupabaseClient } from './supabaseClient';

export interface GenreListResult {
  genres: Genre[];
  source: 'supabase' | 'demo';
}

const COVER_OBSERVATORY = '/src/assets/images/anime_hero_nexus_1795594457243.jpg';
const COVER_NOIR = '/src/assets/images/anime_genre_mystery_1795594455293.jpg';
const COVER_SUNKEN = '/src/assets/images/anime_genre_fantasy_1795594455101.jpg';
const COVER_KEPLER = '/src/assets/images/anime_genre_scifi_1795594455684.jpg';
const COVER_CONSERVATORY = '/src/assets/images/anime_genre_conservatory_1795594456644.jpg';

export function slugifyGenreName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function inferGenreCategory(name: string): Genre['category'] {
  const lower = name.toLowerCase();
  if (
    lower.includes('mystery') ||
    lower.includes('detective') ||
    lower.includes('thriller') ||
    lower.includes('noir') ||
    lower.includes('horror') ||
    lower.includes('crime') ||
    lower.includes('puzzle') ||
    lower.includes('espionage')
  ) {
    return 'Mystery & Noir';
  }
  if (
    lower.includes('fantasy') ||
    lower.includes('magic') ||
    lower.includes('myth') ||
    lower.includes('supernatural') ||
    lower.includes('kingdom') ||
    lower.includes('superhero') ||
    lower.includes('fable')
  ) {
    return 'Fantasy & Myth';
  }
  if (
    lower.includes('sci') ||
    lower.includes('space') ||
    lower.includes('time') ||
    lower.includes('cyber') ||
    lower.includes('post-apocalyptic') ||
    lower.includes('clockwork')
  ) {
    return 'Speculative';
  }
  return 'Drama & History';
}

export function pickGenreCover(name: string, index: number): string {
  const lower = name.toLowerCase();
  if (
    lower.includes('adventure') ||
    lower.includes('space') ||
    lower.includes('sci') ||
    lower.includes('action')
  ) {
    return COVER_KEPLER;
  }
  if (
    lower.includes('detective') ||
    lower.includes('mystery') ||
    lower.includes('thriller') ||
    lower.includes('crime') ||
    lower.includes('noir') ||
    lower.includes('puzzle') ||
    lower.includes('psychological')
  ) {
    return COVER_NOIR;
  }
  if (
    lower.includes('fantasy') ||
    lower.includes('kingdom') ||
    lower.includes('myth') ||
    lower.includes('horror') ||
    lower.includes('post-apocalyptic') ||
    lower.includes('survival')
  ) {
    return COVER_SUNKEN;
  }
  if (
    lower.includes('historical') ||
    lower.includes('time') ||
    lower.includes('observatory') ||
    lower.includes('supernatural') ||
    lower.includes('political')
  ) {
    return COVER_OBSERVATORY;
  }
  if (
    lower.includes('magic') ||
    lower.includes('romance') ||
    lower.includes('comedy') ||
    lower.includes('school')
  ) {
    return COVER_CONSERVATORY;
  }
  const pool = [
    COVER_OBSERVATORY,
    COVER_KEPLER,
    COVER_NOIR,
    COVER_SUNKEN,
    COVER_CONSERVATORY,
  ];
  return pool[index % pool.length];
}

export function findMatchingGenreTemplate(name: string, slug: string): Genre {
  const lowerName = name.toLowerCase();
  const lowerSlug = slug.toLowerCase();
  return (
    DEMO_GENRES.find(
      (g) =>
        g.slug === lowerSlug ||
        g.name.toLowerCase() === lowerName ||
        lowerName.includes(g.name.toLowerCase()) ||
        g.name.toLowerCase().includes(lowerName),
    ) ?? DEMO_GENRES[0]
  );
}

export function mapSupabaseGenreRow(
  row: Record<string, unknown>,
  index: number,
): Genre {
  const fallback = DEMO_GENRES[index % DEMO_GENRES.length];
  const name = String(row.name ?? fallback.name).trim();
  const slug =
    typeof row.slug === 'string' && row.slug.trim()
      ? row.slug.trim()
      : slugifyGenreName(name);
  const templateMatch = findMatchingGenreTemplate(name, slug);

  const category =
    typeof row.category === 'string' &&
    ['Speculative', 'Mystery & Noir', 'Fantasy & Myth', 'Drama & History'].includes(
      row.category,
    )
      ? (row.category as Genre['category'])
      : inferGenreCategory(name);

  const rawCover = String(row.cover_image ?? row.coverImage ?? '').trim();
  const useAnimeFallback = !rawCover || rawCover.includes('1795535') || !rawCover.startsWith('/');
  return {
    id: String(row.id ?? `supabase-genre-${slug}`),
    slug,
    name,
    description: String(row.description ?? templateMatch.description),
    category,
    coverImage: useAnimeFallback ? pickGenreCover(name, index) : rawCover,
    accentGradient: templateMatch.accentGradient,
    storyCount: Number(row.story_count ?? row.storyCount ?? templateMatch.storyCount ?? 1),
    template: templateMatch.template,
    isDemo: false,
  };
}

export async function fetchGenres(): Promise<GenreListResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { genres: DEMO_GENRES, source: 'demo' };
  }

  const { data, error } = await supabase
    .from('genres')
    .select('*')
    .order('name', { ascending: true });

  if (error || !data || data.length === 0) {
    return { genres: DEMO_GENRES, source: 'demo' };
  }

  const mapped = data.map((row: Record<string, unknown>, index: number) =>
    mapSupabaseGenreRow(row, index),
  );

  // Merge any core 20 genres not present in Supabase yet so the universe stays complete.
  const existingSlugs = new Set(mapped.map((g) => g.slug.toLowerCase()));
  const existingNames = new Set(mapped.map((g) => g.name.toLowerCase()));
  const additions = DEMO_GENRES.filter(
    (g) => !existingSlugs.has(g.slug.toLowerCase()) && !existingNames.has(g.name.toLowerCase()),
  );

  return { genres: [...mapped, ...additions], source: 'supabase' };
}
