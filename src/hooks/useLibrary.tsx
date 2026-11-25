import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { DEMO_GENRES } from '../data/demoGenres';
import { DEMO_STORIES } from '../data/demoStories';
import { continueInteractiveStory } from '../services/aiStoryService';
import { fetchGenres } from '../services/genreService';
import {
  fetchPublishedStories,
  fetchUserStoryStatesFromSupabase,
  syncStoryStateToSupabase,
} from '../services/storyService';
import {
  Genre,
  ReadingProgress,
  Story,
  StoryChoice,
  StoryState,
} from '../types';
import {
  applyContinuationToState,
  createStoryStateFromStory,
  rewindStoryToScene,
} from '../utils/storyEngine';
import {
  advanceStoryProgress,
  createInitialProgress,
  restartStoryProgress,
} from '../utils/storyProgress';

const STORAGE_KEYS = {
  favorites: 'whatif_demo_favorites_v1',
  progress: 'whatif_demo_progress_v1',
  customStories: 'whatif_demo_custom_stories_v1',
  storyStates: 'whatif_story_states_v2',
};

const SEED_FAVORITES = ['story-midnight-sleeper', 'story-glass-observatory'];

const SEED_PROGRESS: Record<string, ReadingProgress> = {
  'story-glass-observatory': {
    storyId: 'story-glass-observatory',
    currentNodeId: 'obs-2a',
    visitedNodeIds: ['obs-1', 'obs-2a'],
    choicesMade: [
      {
        nodeId: 'obs-1',
        choiceId: 'obs-c1',
        choiceLabel: 'Confront Archivist Mirek at the stairwell with the ledger',
      },
    ],
    discoveredEndings: [],
    completed: false,
    progressPercent: 45,
    lastReadAt: '2026-11-24T06:30:00.000Z',
    isDemo: true,
  },
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota issues
  }
}

function toReadingProgressFromState(state: StoryState): ReadingProgress {
  return {
    storyId: state.storyId,
    currentNodeId: state.currentSceneId,
    visitedNodeIds: state.activePathSceneIds,
    choicesMade: state.decisionHistory.map((d) => ({
      nodeId: d.sceneId,
      choiceId: d.decisionId,
      choiceLabel: d.decisionLabel,
    })),
    discoveredEndings: state.discoveredEndings.map((e) => e.title),
    completed: state.discoveredEndings.length > 0 || state.isEnding,
    progressPercent: state.progressPercent,
    lastReadAt: state.updatedAt,
    isDemo: state.aiSource === 'local-engine',
  };
}

interface LibraryContextValue {
  genres: Genre[];
  stories: Story[];
  favoriteIds: string[];
  progressMap: Record<string, ReadingProgress>;
  storyStates: Record<string, StoryState>;
  isLoading: boolean;
  error: string | null;
  dataSource: 'supabase' | 'demo';
  refreshData: () => Promise<void>;
  isFavorite: (storyId: string) => boolean;
  toggleFavorite: (storyId: string) => void;
  getProgress: (storyId: string) => ReadingProgress | undefined;
  startOrResumeStory: (story: Story) => ReadingProgress;
  makeStoryChoice: (story: Story, choice: StoryChoice) => ReadingProgress;
  restartStory: (story: Story) => ReadingProgress;
  addGeneratedStory: (story: Story, initialState?: StoryState) => void;
  getStoryByIdOrSlug: (idOrSlug: string) => Story | undefined;
  getStoryState: (story: Story) => StoryState;
  saveStoryState: (state: StoryState) => void;
  advanceDynamicStory: (
    story: Story,
    decisionId: string,
    actionLabel: string,
    isCustomAction: boolean,
    options?: { forceFinish?: boolean; preferLocalFallback?: boolean },
  ) => Promise<StoryState>;
  rewindDynamicStory: (story: Story, targetSceneId: string) => StoryState;
  resetDynamicStory: (story: Story) => StoryState;
}

const LibraryContext = createContext<LibraryContextValue | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [genres, setGenres] = useState<Genre[]>(DEMO_GENRES);
  const [customStories, setCustomStories] = useState<Story[]>(() =>
    readStorage<Story[]>(STORAGE_KEYS.customStories, []),
  );
  const [stories, setStories] = useState<Story[]>(() => [
    ...readStorage<Story[]>(STORAGE_KEYS.customStories, []),
    ...DEMO_STORIES,
  ]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() =>
    readStorage<string[]>(STORAGE_KEYS.favorites, SEED_FAVORITES),
  );
  const [progressMap, setProgressMap] = useState<Record<string, ReadingProgress>>(() =>
    readStorage<Record<string, ReadingProgress>>(STORAGE_KEYS.progress, SEED_PROGRESS),
  );
  const [storyStates, setStoryStates] = useState<Record<string, StoryState>>(() =>
    readStorage<Record<string, StoryState>>(STORAGE_KEYS.storyStates, {}),
  );
  const storyStatesRef = useRef<Record<string, StoryState>>(storyStates);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'supabase' | 'demo'>('demo');

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [genreRes, storyRes, remoteStates] = await Promise.all([
        fetchGenres(),
        fetchPublishedStories(customStories),
        fetchUserStoryStatesFromSupabase(),
      ]);
      setGenres(genreRes.genres);
      setStories(storyRes.stories);
      setDataSource(storyRes.source);
      if (Object.keys(remoteStates).length > 0) {
        setStoryStates((prev) => ({ ...remoteStates, ...prev }));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load stories right now. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [customStories]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.favorites, favoriteIds);
  }, [favoriteIds]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.progress, progressMap);
  }, [progressMap]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.customStories, customStories);
  }, [customStories]);

  useEffect(() => {
    storyStatesRef.current = storyStates;
    writeStorage(STORAGE_KEYS.storyStates, storyStates);
  }, [storyStates]);

  const isFavorite = useCallback(
    (storyId: string) => favoriteIds.includes(storyId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback((storyId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(storyId) ? prev.filter((id) => id !== storyId) : [storyId, ...prev],
    );
  }, []);

  const getProgress = useCallback(
    (storyId: string) => {
      const dynamic = storyStates[storyId];
      if (dynamic) {
        return toReadingProgressFromState(dynamic);
      }
      return progressMap[storyId];
    },
    [progressMap, storyStates],
  );

  const startOrResumeStory = useCallback(
    (story: Story) => {
      const existingDynamic = storyStates[story.id];
      if (existingDynamic) {
        return toReadingProgressFromState(existingDynamic);
      }
      const existing = progressMap[story.id];
      if (existing && story.nodes[existing.currentNodeId]) {
        return existing;
      }
      const fresh = createInitialProgress(story);
      setProgressMap((prev) => ({ ...prev, [story.id]: fresh }));
      return fresh;
    },
    [progressMap, storyStates],
  );

  const makeStoryChoice = useCallback(
    (story: Story, choice: StoryChoice) => {
      const updated = advanceStoryProgress(story, progressMap[story.id], choice);
      setProgressMap((prev) => ({ ...prev, [story.id]: updated }));
      return updated;
    },
    [progressMap],
  );

  const restartStory = useCallback(
    (story: Story) => {
      const reset = restartStoryProgress(story, progressMap[story.id]);
      setProgressMap((prev) => ({ ...prev, [story.id]: reset }));
      return reset;
    },
    [progressMap],
  );

  const saveStoryState = useCallback((state: StoryState) => {
    storyStatesRef.current = { ...storyStatesRef.current, [state.storyId]: state };
    setStoryStates((prev) => ({ ...prev, [state.storyId]: state }));
    setProgressMap((prev) => ({
      ...prev,
      [state.storyId]: toReadingProgressFromState(state),
    }));
    void syncStoryStateToSupabase(state);
  }, []);

  const addGeneratedStory = useCallback(
    (story: Story, initialState?: StoryState) => {
      setCustomStories((prev) => [story, ...prev.filter((s) => s.id !== story.id)]);
      setStories((prev) => [story, ...prev.filter((s) => s.id !== story.id)]);
      if (initialState) {
        saveStoryState(initialState);
      }
    },
    [saveStoryState],
  );

  const getStoryByIdOrSlug = useCallback(
    (idOrSlug: string) =>
      stories.find((s) => s.id === idOrSlug || s.slug === idOrSlug),
    [stories],
  );

  const getStoryState = useCallback(
    (story: Story): StoryState => {
      const existing = storyStatesRef.current[story.id] ?? storyStates[story.id];
      if (existing && existing.scenes[existing.currentSceneId]) {
        return existing;
      }
      return createStoryStateFromStory(story);
    },
    [storyStates],
  );

  const advanceDynamicStory = useCallback(
    async (
      story: Story,
      decisionId: string,
      actionLabel: string,
      isCustomAction: boolean,
      options?: { forceFinish?: boolean; preferLocalFallback?: boolean },
    ): Promise<StoryState> => {
      const baseState = storyStatesRef.current[story.id] ?? createStoryStateFromStory(story);
      const { payload, source } = await continueInteractiveStory(
        baseState,
        actionLabel,
        isCustomAction,
        options,
      );
      const nextState = applyContinuationToState(
        baseState,
        payload,
        decisionId,
        actionLabel,
        isCustomAction,
        source,
      );
      saveStoryState(nextState);
      return nextState;
    },
    [saveStoryState],
  );

  const rewindDynamicStory = useCallback(
    (story: Story, targetSceneId: string): StoryState => {
      const baseState = storyStatesRef.current[story.id] ?? createStoryStateFromStory(story);
      const rewound = rewindStoryToScene(baseState, targetSceneId);
      saveStoryState(rewound);
      return rewound;
    },
    [saveStoryState],
  );

  const resetDynamicStory = useCallback(
    (story: Story): StoryState => {
      const existing = storyStatesRef.current[story.id];
      const fresh = createStoryStateFromStory(story);
      if (existing) {
        fresh.discoveredEndings = existing.discoveredEndings;
      }
      saveStoryState(fresh);
      return fresh;
    },
    [saveStoryState],
  );

  return (
    <LibraryContext.Provider
      value={{
        genres,
        stories,
        favoriteIds,
        progressMap,
        storyStates,
        isLoading,
        error,
        dataSource,
        refreshData,
        isFavorite,
        toggleFavorite,
        getProgress,
        startOrResumeStory,
        makeStoryChoice,
        restartStory,
        addGeneratedStory,
        getStoryByIdOrSlug,
        getStoryState,
        saveStoryState,
        advanceDynamicStory,
        rewindDynamicStory,
        resetDynamicStory,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error('useLibrary must be used inside a LibraryProvider.');
  }
  return ctx;
}
