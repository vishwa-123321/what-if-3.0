import { DEMO_STORIES } from '../data/demoStories';
import { Story, StoryState } from '../types';
import { getSupabaseClient } from './supabaseClient';

export interface StoryListResult {
  stories: Story[];
  source: 'supabase' | 'demo';
}

export async function fetchPublishedStories(
  localDemoStories: Story[] = [],
): Promise<StoryListResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      stories: [...localDemoStories, ...DEMO_STORIES],
      source: 'demo',
    };
  }

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    return {
      stories: [...localDemoStories, ...DEMO_STORIES],
      source: 'demo',
    };
  }

  const mapped: Story[] = data.map((row: Record<string, unknown>, idx: number) => {
    const fallback = DEMO_STORIES[idx % DEMO_STORIES.length];
    return {
      ...fallback,
      id: String(row.id ?? fallback.id),
      slug: String(row.slug ?? fallback.slug),
      title: String(row.title ?? fallback.title),
      subtitle: String(row.subtitle ?? fallback.subtitle),
      description: String(row.description ?? fallback.description),
      coverImage: String(row.cover_image ?? row.coverImage ?? fallback.coverImage),
      genreName: String(row.genre_name ?? row.genreName ?? fallback.genreName),
      genreSlug: String(row.genre_slug ?? row.genreSlug ?? fallback.genreSlug),
      publishedAt: String(row.created_at ?? fallback.publishedAt),
      updatedAt: String(row.updated_at ?? fallback.updatedAt),
      isDemo: false,
    };
  });

  // Combine Supabase rows with curated catalog stories avoiding duplicate IDs
  const mappedIds = new Set(mapped.map((m) => m.id));
  const remainingDemo = DEMO_STORIES.filter((d) => !mappedIds.has(d.id));

  return {
    stories: [...localDemoStories, ...mapped, ...remainingDemo],
    source: 'supabase',
  };
}

export async function fetchStoryByIdOrSlug(
  idOrSlug: string,
  localDemoStories: Story[] = [],
): Promise<Story | null> {
  const allLocal = [...localDemoStories, ...DEMO_STORIES];
  const localMatch = allLocal.find(
    (s) => s.id === idOrSlug || s.slug === idOrSlug,
  );
  if (localMatch) {
    return localMatch;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const fallback = DEMO_STORIES[0];
  return {
    ...fallback,
    id: String(data.id ?? fallback.id),
    slug: String(data.slug ?? fallback.slug),
    title: String(data.title ?? fallback.title),
    subtitle: String(data.subtitle ?? fallback.subtitle),
    description: String(data.description ?? fallback.description),
    coverImage: String(data.cover_image ?? fallback.coverImage),
    isDemo: false,
  };
}

/**
 * Best-effort cloud sync of continuous StoryState to Supabase tables when user is signed in
 * and migration tables exist. Never throws or disrupts offline/local play.
 */
export async function syncStoryStateToSupabase(state: StoryState): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) return;

    await supabase.from('story_progress').upsert(
      {
        user_id: userId,
        story_id: state.storyId,
        current_scene_id: state.currentSceneId,
        current_chapter: state.currentChapter,
        current_scene_number: state.currentSceneNumber,
        current_location: state.currentLocation,
        current_objective: state.currentObjective,
        progress_percent: state.progressPercent,
        is_ending: state.isEnding,
        ending_title: state.endingTitle ?? null,
        ending_type: state.endingType ?? null,
        state_snapshot: state,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,story_id' },
    );
  } catch {
    // Graceful no-op when optional schema tables are not yet provisioned
  }
}

export async function fetchUserStoryStatesFromSupabase(): Promise<Record<string, StoryState>> {
  const supabase = getSupabaseClient();
  if (!supabase) return {};

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) return {};

    const { data, error } = await supabase
      .from('story_progress')
      .select('story_id, state_snapshot')
      .eq('user_id', userId);

    if (error || !data) return {};

    const result: Record<string, StoryState> = {};
    for (const row of data as Array<{ story_id: string; state_snapshot?: StoryState }>) {
      if (row.state_snapshot && row.state_snapshot.currentSceneId) {
        result[row.story_id] = row.state_snapshot;
      }
    }
    return result;
  } catch {
    return {};
  }
}
