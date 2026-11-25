import {
  AIContinuationPayload,
  Story,
  StoryAISource,
  StoryCustomizationConfig,
  StoryGenerationConfig,
  StoryGenerationInput,
  StoryGenerationResult,
  StoryState,
} from '../types';
import {
  createStoryStateFromPayload,
  generateLocalContinuation,
  generateLocalOpening,
  resolveGenreBySlugOrName,
} from '../utils/storyEngine';
import { validateAIContinuationPayload } from '../utils/storySchema';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

const rawFunctionEnv = import.meta.env.VITE_SUPABASE_GENERATE_STORY_FUNCTION?.trim() || '';
const HAS_VALID_EDGE_FUNCTION =
  rawFunctionEnv.length > 0 &&
  !rawFunctionEnv.includes('YOUR_PROJECT_ID') &&
  !rawFunctionEnv.startsWith('http://') &&
  !rawFunctionEnv.startsWith('https://');
const DEFAULT_FUNCTION_NAME = HAS_VALID_EDGE_FUNCTION ? rawFunctionEnv : 'generate_story';

const defaultConfig: StoryGenerationConfig = {
  functionName: DEFAULT_FUNCTION_NAME,
};

export interface ContinuationResponse {
  payload: AIContinuationPayload;
  source: StoryAISource;
}

export async function checkServerGeminiStatus(): Promise<boolean> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return false;
    const json = (await res.json()) as { geminiConfigured?: boolean };
    return Boolean(json.geminiConfigured);
  } catch {
    return false;
  }
}

export async function generateOpeningStoryState(
  config: StoryCustomizationConfig,
  options?: { preferLocalFallback?: boolean },
): Promise<{ story: Story; initialState: StoryState; source: StoryAISource; message: string }> {
  const genre = resolveGenreBySlugOrName(config.genreSlug);
  const slugBase = config.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const uniqueSuffix = Date.now().toString(36);
  const storyId = `whatif-${slugBase || 'story'}-${uniqueSuffix}`;
  const storySlug = `${slugBase || 'story'}-${uniqueSuffix}`;

  let payload: AIContinuationPayload | null = null;
  let aiSource: StoryAISource = 'local-engine';
  let statusMessage = 'Story universe launched in Interactive Story Engine mode.';

  // 1. Attempt server-side Gemini API if configured and not bypassed
  if (!options?.preferLocalFallback) {
    try {
      const response = await fetch('/api/story/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      if (response.ok) {
        const json = (await response.json()) as {
          payload: unknown;
          source?: string;
          code?: string;
        };
        if (json.payload) {
          payload = validateAIContinuationPayload(json.payload, {
            storyId,
            expectedChapter: 1,
            expectedSceneNumber: 1,
          });
          aiSource = 'gemini';
          statusMessage = 'Opening scene crafted by Gemini AI Story Architect.';
        } else if (json.code === 'GEMINI_HIGH_DEMAND') {
          statusMessage =
            'Gemini cloud capacity is temporarily overloaded — continuing seamlessly via Interactive Story Engine.';
        }
      } else if (response.status === 503) {
        const errJson = (await response.json().catch(() => ({}))) as { code?: string };
        if (errJson.code === 'GEMINI_HIGH_DEMAND') {
          statusMessage =
            'Gemini cloud capacity is temporarily overloaded — continuing seamlessly via Interactive Story Engine.';
        }
      } else {
        const errJson = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errJson.error || `Story server error (${response.status}).`);
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('Story server error')) {
        throw err;
      }
    }
  }

  // 2. Fallback to configured Supabase Edge Function if still unresolved
  if (!payload && !options?.preferLocalFallback && HAS_VALID_EDGE_FUNCTION) {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.functions.invoke(DEFAULT_FUNCTION_NAME, {
          body: {
            mode: 'start',
            genre: config.genreSlug,
            title: config.title,
            scenario: config.topicOrPremise,
            customization: config,
          },
        });
        if (!error && data && typeof data === 'object') {
          const candidate = (data as Record<string, unknown>).payload ?? data;
          payload = validateAIContinuationPayload(candidate, {
            storyId,
            expectedChapter: 1,
            expectedSceneNumber: 1,
          });
          aiSource = 'supabase-edge';
          statusMessage = `Opening scene generated via Supabase "${DEFAULT_FUNCTION_NAME}".`;
        }
      } catch {
        // Fallback to local engine if edge function uses legacy contract or is unreachable
      }
    }
  }

  // 3. Stateful local story engine when Gemini / Edge Function are unconfigured or 503 capacity overloaded
  if (!payload) {
    payload = generateLocalOpening(config);
    aiSource = 'local-engine';
    if (!statusMessage.includes('Gemini cloud capacity')) {
      statusMessage =
        'Interactive Story Engine active — dynamic memory, clues, characters, and custom actions enabled.';
    }
  }

  const initialState = createStoryStateFromPayload(
    storyId,
    storySlug,
    config,
    payload,
    aiSource,
    genre.coverImage,
    genre.accentGradient,
  );

  const firstScene = initialState.scenes[initialState.currentSceneId];
  const today = new Date().toISOString().slice(0, 10);

  const story: Story = {
    id: storyId,
    slug: storySlug,
    title: config.title,
    subtitle: `${config.atmosphere} ${genre.name} · ${config.length} Adventure`,
    description: config.topicOrPremise,
    author: config.mainCharacterName || 'You',
    genreId: genre.id,
    genreSlug: genre.slug,
    genreName: genre.name,
    coverImage: genre.coverImage,
    accentGradient: genre.accentGradient,
    difficulty: config.difficulty,
    tone: config.atmosphere === 'Hopeful' ? 'Hopeful' : config.atmosphere === 'Suspenseful' ? 'Suspenseful' : 'Cinematic',
    estimatedMinutes: config.length === 'Long' ? 25 : config.length === 'Short' ? 8 : 15,
    totalPaths: 16,
    totalEndings: 4,
    popularityScore: 95,
    publishedAt: today,
    updatedAt: today,
    isRecentlyAdded: true,
    isDemo: aiSource === 'local-engine',
    defaultCustomization: config,
    startNodeId: firstScene.id,
    nodes: {
      [firstScene.id]: {
        id: firstScene.id,
        chapterNumber: firstScene.chapterNumber,
        chapterTitle: firstScene.sceneTitle,
        sceneLabel: firstScene.location,
        content: firstScene.narrativeParagraphs,
        isEnding: firstScene.isEnding,
        choices: firstScene.availableDecisions.map((d) => ({
          id: d.id,
          label: d.label,
          consequenceHint: d.consequenceHint,
          nextNodeId: firstScene.id,
        })),
      },
    },
  };

  return { story, initialState, source: aiSource, message: statusMessage };
}

export async function continueInteractiveStory(
  state: StoryState,
  actionLabel: string,
  isCustomAction: boolean,
  options?: { forceFinish?: boolean; preferLocalFallback?: boolean },
): Promise<ContinuationResponse> {
  const nextSceneNumber = state.currentSceneNumber + 1;

  if (!options?.preferLocalFallback) {
    try {
      const response = await fetch('/api/story/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state,
          actionLabel,
          isCustomAction,
          forceFinish: Boolean(options?.forceFinish),
        }),
      });

      if (response.ok) {
        const json = (await response.json()) as { payload: unknown; code?: string };
        if (json.payload) {
          const payload = validateAIContinuationPayload(json.payload, {
            storyId: state.storyId,
            expectedChapter: state.currentChapter,
            expectedSceneNumber: nextSceneNumber,
          });
          return { payload, source: 'gemini' };
        }
      } else if (response.status !== 503) {
        // If Gemini is configured on server and failed transiently (502 / 500), surface the error honestly so user can Retry or choose offline fallback!
        const errBody = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(
          errBody.error || `Story engine encountered an error (${response.status}).`,
        );
      }
    } catch (err) {
      if (err instanceof Error && !err.message.includes('Failed to fetch')) {
        throw err;
      }
    }
  }

  // Simulated pacing delay for smooth cinematic scene transition
  await new Promise((resolve) => setTimeout(resolve, 320));
  const localPayload = generateLocalContinuation(
    state,
    actionLabel,
    isCustomAction,
    Boolean(options?.forceFinish),
  );
  const validated = validateAIContinuationPayload(localPayload, {
    storyId: state.storyId,
    expectedChapter: state.currentChapter,
    expectedSceneNumber: nextSceneNumber,
  });

  return { payload: validated, source: 'local-engine' };
}

/**
 * Backward-compatible wrapper used by existing callers.
 */
export async function generateInteractiveStory(
  input: StoryGenerationInput,
  _configOverride?: Partial<StoryGenerationConfig>,
): Promise<StoryGenerationResult> {
  const genre = resolveGenreBySlugOrName(input.genreSlug);
  const config: StoryCustomizationConfig = input.customization ?? {
    genreSlug: genre.slug,
    genreName: genre.name,
    title: input.title,
    topicOrPremise: input.scenario,
    mainCharacterName: 'Morgan',
    characterPersonality: 'Analytical & Bold',
    difficulty: input.difficulty,
    length: 'Medium',
    pov: 'First-person',
    atmosphere: input.tone === 'Hopeful' ? 'Hopeful' : input.tone === 'Suspenseful' ? 'Suspenseful' : 'Cinematic',
    settingType: genre.category === 'Speculative' || genre.category === 'Fantasy & Myth' ? 'Imaginative' : 'Realistic',
  };

  const res = await generateOpeningStoryState(config);
  return {
    story: res.story,
    initialState: res.initialState,
    source: res.source === 'gemini' ? 'gemini' : res.source === 'supabase-edge' ? 'supabase-edge' : 'demo-simulator',
    message: res.message,
  };
}
