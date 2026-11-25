import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  FastForward,
  Flag,
  GitBranch,
  History,
  LayoutDashboard,
  Loader2,
  MapPin,
  MessageSquareQuote,
  RotateCcw,
  Send,
  Sparkles,
  Users,
} from 'lucide-react';
import { AnimatedCharacterAvatar } from '../components/AnimatedCharacterAvatar';
import { AnimatedSceneStage } from '../components/AnimatedSceneStage';
import { BranchingTreePanel } from '../components/BranchingTreePanel';
import { EmptyState, ErrorState } from '../components/StateFeedback';
import { StoryDashboardPanel } from '../components/StoryDashboardPanel';
import { useLibrary } from '../hooks/useLibrary';
import { StoryDecisionOption } from '../types';

type ReaderViewMode = 'stage' | 'tree' | 'archive';

export function StoryReaderPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const {
    storyStates,
    getStoryByIdOrSlug,
    getStoryState,
    saveStoryState,
    advanceDynamicStory,
    rewindDynamicStory,
    resetDynamicStory,
    isFavorite,
    toggleFavorite,
  } = useLibrary();

  const story = storyId ? getStoryByIdOrSlug(storyId) : undefined;
  const [viewMode, setViewMode] = useState<ReaderViewMode>('stage');
  const [showDashboard, setShowDashboard] = useState(true);
  const [showVisualDetails, setShowVisualDetails] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [customAction, setCustomAction] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [readerError, setReaderError] = useState<string | null>(null);
  const [pendingRetry, setPendingRetry] = useState<{
    decisionId: string;
    actionLabel: string;
    isCustomAction: boolean;
    forceFinish?: boolean;
  } | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Initialize storyState once when opening a story not yet persisted
  useEffect(() => {
    if (story && !storyStates[story.id]) {
      const initial = getStoryState(story);
      saveStoryState(initial);
    }
    // Intentionally run when story id changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);

  if (!story) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <EmptyState
          title="Story could not be opened"
          description="We could not locate this interactive narrative in your library."
          actionLabel="Return to Library"
          onAction={() => navigate('/explore')}
        />
      </div>
    );
  }

  const state = getStoryState(story);
  const currentScene =
    state.scenes[state.currentSceneId] ?? Object.values(state.scenes)[0];
  const saved = isFavorite(story.id);

  const [revealedParagraphCount, setRevealedParagraphCount] = useState(1);

  useEffect(() => {
    if (!currentScene) return;
    if (!motionEnabled) {
      setRevealedParagraphCount(currentScene.narrativeParagraphs.length);
      return;
    }
    setRevealedParagraphCount(1);
    if (currentScene.narrativeParagraphs.length <= 1) return;
    const timer = window.setInterval(() => {
      setRevealedParagraphCount((prev) => {
        if (prev >= currentScene.narrativeParagraphs.length) {
          window.clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 360);
    return () => window.clearInterval(timer);
  }, [currentScene?.id, currentScene?.narrativeParagraphs.length, motionEnabled]);

  if (!currentScene) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <ErrorState
          title="Scene unavailable"
          description="This story branch encountered an unexpected missing scene."
          onRetry={() => resetDynamicStory(story)}
        />
      </div>
    );
  }

  const runAction = async (
    decisionId: string,
    actionLabel: string,
    isCustom: boolean,
    options?: { forceFinish?: boolean; preferLocalFallback?: boolean },
  ) => {
    if (isTransitioning) return;
    setReaderError(null);
    setPendingRetry({
      decisionId,
      actionLabel,
      isCustomAction: isCustom,
      forceFinish: options?.forceFinish,
    });
    setIsTransitioning(true);

    try {
      await advanceDynamicStory(story, decisionId, actionLabel, isCustom, options);
      if (isCustom) setCustomAction('');
      setPendingRetry(null);
      setViewMode('stage');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setReaderError(
        err instanceof Error
          ? err.message
          : 'Unable to advance to the next scene. Your previous state is preserved.',
      );
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleSelectDecision = (decision: StoryDecisionOption) => {
    void runAction(decision.id, decision.label, false);
  };

  const handleSubmitCustomAction = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customAction.trim();
    if (cleaned.length < 2) {
      setReaderError('Describe your action before continuing.');
      return;
    }
    void runAction(`custom-${Date.now().toString(36)}`, cleaned, true);
  };

  const handleFinishStory = () => {
    void runAction(
      `finish-${Date.now().toString(36)}`,
      'Bring all uncovered threads together and resolve the story.',
      false,
      { forceFinish: true },
    );
  };

  const handleRestart = () => {
    setReaderError(null);
    setPendingRetry(null);
    resetDynamicStory(story);
    setViewMode('stage');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePauseSave = () => {
    saveStoryState(state);
    setSaveFeedback('Progress saved');
    window.setTimeout(() => setSaveFeedback(null), 2200);
  };

  const handleRewind = (targetSceneId: string) => {
    setReaderError(null);
    rewindDynamicStory(story, targetSceneId);
    setViewMode('stage');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeArchiveScenes = state.activePathSceneIds
    .map((id) => state.scenes[id])
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#04060E] pb-20">
      {/* Scene Header Bar */}
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#04060E]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-amber-300/40 hover:text-amber-200 whitespace-nowrap"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Library</span>
            </Link>

            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold text-slate-100 sm:text-base">
                {state.title}
              </p>
              <p
                data-testid="scene-header-meta"
                className="font-mono-tabular text-[11px] text-amber-300/90"
              >
                Ch. {currentScene.chapterNumber} · Scene {currentScene.sceneNumber} ·{' '}
                {state.progressPercent}%
              </p>
            </div>
          </div>

          {/* Stage / Turning Points / Archive View Tabs */}
          <div
            role="tablist"
            aria-label="Reader workspace view"
            className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#080D1F] p-1"
          >
            {[
              { id: 'stage', label: 'Story Stage', icon: Sparkles },
              { id: 'tree', label: 'Turning Points', icon: GitBranch },
              { id: 'archive', label: 'Scene Log', icon: History },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setViewMode(tab.id as ReaderViewMode)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {saveFeedback && (
              <span className="text-xs font-medium text-emerald-300">{saveFeedback}</span>
            )}

            <button
              type="button"
              onClick={() => setShowDashboard((prev) => !prev)}
              aria-expanded={showDashboard}
              aria-label="Toggle real-time story dashboard"
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors whitespace-nowrap ${
                showDashboard
                  ? 'border-indigo-400/50 bg-indigo-600/25 text-amber-200'
                  : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <button
              type="button"
              onClick={handlePauseSave}
              className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 whitespace-nowrap"
            >
              <span>Save</span>
            </button>

            <button
              type="button"
              onClick={() => toggleFavorite(story.id)}
              aria-label={saved ? 'Remove from favorites' : 'Save to favorites'}
              aria-pressed={saved}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                saved
                  ? 'border-amber-300/50 bg-amber-500/15 text-amber-200'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:text-white'
              }`}
            >
              <Bookmark
                className="h-4 w-4"
                fill={saved ? 'currentColor' : 'none'}
                aria-hidden="true"
              />
            </button>

            {!currentScene.isEnding && currentScene.sceneNumber >= 3 && (
              <button
                type="button"
                onClick={handleFinishStory}
                disabled={isTransitioning}
                aria-label="Finish story now"
                className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-lg border border-amber-300/35 bg-amber-500/10 px-3 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-500/20 whitespace-nowrap disabled:opacity-50"
              >
                <Flag className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Finish Story</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRestart}
              aria-label="Restart story"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden lg:inline">Restart</span>
            </button>
          </div>
        </div>

        <div className="h-0.5 w-full bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-300 transition-all duration-300"
            style={{ width: `${state.progressPercent}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:pt-8">
        {viewMode === 'tree' ? (
          <BranchingTreePanel state={state} onRewindScene={handleRewind} />
        ) : viewMode === 'archive' ? (
          <section
            aria-label="Previously visited scenes"
            className="glass-panel-elevated space-y-6 rounded-2xl p-6 sm:p-8"
          >
            <div className="border-b border-white/10 pb-4">
              <h2 className="font-display text-2xl font-semibold text-slate-50">
                Scene Archive ({activeArchiveScenes.length} Scenes)
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Complete chronological log of your current branch in {state.title}.
              </p>
            </div>
            <div className="space-y-6">
              {activeArchiveScenes.map((scene) => (
                <article
                  key={scene.id}
                  className="rounded-xl border border-white/8 bg-white/[0.02] p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-amber-300">
                    <span className="font-mono-tabular">
                      Chapter {scene.chapterNumber} · Scene {scene.sceneNumber} — {scene.location}
                    </span>
                    {scene.triggeredByDecisionLabel && (
                      <span className="text-slate-400">
                        Choice: “{scene.triggeredByDecisionLabel}”
                      </span>
                    )}
                  </div>
                  <h3 className="font-display mt-1.5 text-lg font-semibold text-slate-100">
                    {scene.sceneTitle}
                  </h3>
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-300">
                    {scene.narrativeParagraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-12">
            {/* Left/Main Narrative & Decision Stage */}
            <div
              className={
                showDashboard ? 'lg:col-span-7 xl:col-span-7' : 'lg:col-span-8'
              }
            >
              {/* A. Scene Header */}
              <div className="mb-5 border-b border-white/8 pb-4">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-amber-300/90">
                  <span>{state.genreName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tabular">
                    Chapter {currentScene.chapterNumber} · Scene {currentScene.sceneNumber}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-indigo-300">{currentScene.arcStage}</span>
                </div>

                <h1 className="font-display mt-2 text-2xl font-semibold text-slate-50 sm:text-3xl">
                  {currentScene.sceneTitle}
                </h1>
              </div>

              {readerError && (
                <div className="mb-5 rounded-2xl border border-rose-400/35 bg-rose-950/35 p-4 text-sm text-rose-100">
                  <p className="font-semibold text-rose-200">
                    Unable to generate next scene
                  </p>
                  <p className="mt-1 text-xs text-rose-100/90">{readerError}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {pendingRetry && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            void runAction(
                              pendingRetry.decisionId,
                              pendingRetry.actionLabel,
                              pendingRetry.isCustomAction,
                              { forceFinish: pendingRetry.forceFinish },
                            )
                          }
                          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                        >
                          Retry Generation
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void runAction(
                              pendingRetry.decisionId,
                              pendingRetry.actionLabel,
                              pendingRetry.isCustomAction,
                              {
                                forceFinish: pendingRetry.forceFinish,
                                preferLocalFallback: true,
                              },
                            )
                          }
                          className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-white/15"
                        >
                          Continue with Local Story Engine
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {isTransitioning ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="glass-panel flex flex-col items-center justify-center rounded-2xl px-6 py-20 text-center"
                >
                  <Loader2
                    className="mb-4 h-7 w-7 animate-spin text-amber-300"
                    aria-hidden="true"
                  />
                  <p className="font-display text-lg text-slate-100">
                    Unfolding Scene {currentScene.sceneNumber + 1}...
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Updating character memory, clues, and branching consequences.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Action Echo */}
                  {currentScene.triggeredByDecisionLabel && (
                    <div className="rounded-xl border border-indigo-400/25 bg-indigo-950/35 px-4 py-3 text-sm text-indigo-100">
                      <span className="font-mono-tabular text-xs font-semibold text-amber-300">
                        You:{' '}
                      </span>
                      <span>{currentScene.triggeredByDecisionLabel}</span>
                    </div>
                  )}

                  {/* D. Current Situation Strip */}
                  <section
                    aria-label="Current situation"
                    className="rounded-2xl border border-white/8 bg-[#090F24]/90 p-4 text-xs"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="flex items-center gap-1.5 font-semibold text-amber-300 uppercase">
                          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Location</span>
                        </p>
                        <p className="mt-1 text-slate-200">{currentScene.location}</p>
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 font-semibold text-indigo-300 uppercase">
                          <Users className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Present Characters</span>
                        </p>
                        <p className="mt-1 text-slate-200">
                          {currentScene.charactersPresent.length > 0
                            ? currentScene.charactersPresent.join(', ')
                            : 'Alone'}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 border-t border-white/8 pt-2.5 leading-relaxed text-slate-300">
                      <span className="font-semibold text-slate-100">Situation: </span>
                      {currentScene.situationSummary}
                    </p>
                  </section>

                  {/* C. Animated Story Narrative + Dialogue */}
                  <motion.article
                    key={currentScene.id}
                    initial={motionEnabled ? { opacity: 0, y: 8 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="glass-panel-elevated space-y-5 rounded-2xl p-5 sm:p-7"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-white/8 pb-3">
                      <span className="font-mono-tabular text-[11px] font-semibold text-indigo-300 uppercase">
                        Animated Scene Beat
                      </span>
                      {revealedParagraphCount < currentScene.narrativeParagraphs.length && (
                        <button
                          type="button"
                          onClick={() =>
                            setRevealedParagraphCount(currentScene.narrativeParagraphs.length)
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-amber-200 hover:bg-white/10"
                        >
                          <FastForward className="h-3 w-3" aria-hidden="true" />
                          <span>Reveal All</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-4 text-base leading-[1.82] text-slate-100 sm:text-[17px]">
                      {currentScene.narrativeParagraphs
                        .slice(0, revealedParagraphCount)
                        .map((paragraph, idx) => (
                          <motion.p
                            key={`${currentScene.id}-p-${idx}`}
                            initial={motionEnabled ? { opacity: 0, y: 6 } : false}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                          >
                            {paragraph}
                          </motion.p>
                        ))}
                    </div>

                    {currentScene.dialogue.length > 0 && (
                      <div className="space-y-3 border-t border-white/10 pt-5">
                        {currentScene.dialogue.map((dlg, idx) => (
                          <motion.div
                            key={`${currentScene.id}-dlg-${idx}`}
                            initial={motionEnabled ? { opacity: 0, x: -10 } : false}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.35, delay: idx * 0.08 }}
                            className="flex items-start gap-3.5 rounded-xl border border-indigo-400/20 bg-[#070B19]/90 p-3.5"
                          >
                            <AnimatedCharacterAvatar
                              name={dlg.speaker}
                              emotion={dlg.emotion}
                              size="sm"
                              speaking
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold text-amber-200">
                                  {dlg.speaker}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-slate-300">
                                  <MessageSquareQuote className="h-2.5 w-2.5" aria-hidden="true" />
                                  {dlg.emotion}
                                </span>
                              </div>
                              <p className="mt-1 text-sm italic leading-relaxed text-slate-200">
                                {dlg.line}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {(currentScene.newClues.length > 0 ||
                      currentScene.newObjects.length > 0 ||
                      currentScene.consequences.length > 0) && (
                      <div className="rounded-xl border border-amber-300/20 bg-amber-500/[0.07] p-3.5 text-xs text-amber-100">
                        {currentScene.newClues.length > 0 && (
                          <p>
                            <span className="font-semibold text-amber-300">New Clue: </span>
                            {currentScene.newClues.join(', ')}
                          </p>
                        )}
                        {currentScene.newObjects.length > 0 && (
                          <p className="mt-1">
                            <span className="font-semibold text-amber-300">Item Acquired: </span>
                            {currentScene.newObjects.join(', ')}
                          </p>
                        )}
                        {currentScene.consequences.length > 0 && (
                          <p className="mt-1 text-slate-300">
                            <span className="font-semibold text-indigo-300">Consequence: </span>
                            {currentScene.consequences[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </motion.article>

                  {/* E. Decisions & Custom Action Input OR Ending View */}
                  {currentScene.isEnding ? (
                    <section
                      aria-label="Story ending reached"
                      className="glass-panel-elevated rounded-2xl border-amber-300/30 p-6 sm:p-8"
                    >
                      <div className="flex items-center gap-2 text-amber-300">
                        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                        <span className="text-xs font-semibold tracking-wide uppercase">
                          {currentScene.endingType ?? 'Mysterious'} Ending Reached
                        </span>
                      </div>

                      <h2 className="font-display mt-2 text-2xl font-semibold text-slate-50">
                        {currentScene.endingTitle ?? currentScene.sceneTitle}
                      </h2>

                      <p className="mt-2 text-sm text-slate-300">
                        Completed across{' '}
                        <span className="font-mono-tabular font-semibold text-amber-200">
                          {currentScene.sceneNumber} scenes
                        </span>{' '}
                        with{' '}
                        <span className="font-mono-tabular font-semibold text-amber-200">
                          {state.clues.length} clues
                        </span>{' '}
                        and{' '}
                        <span className="font-mono-tabular font-semibold text-amber-200">
                          {state.discoveredEndings.length} unlocked ending(s)
                        </span>
                        .
                      </p>

                      {state.decisionHistory.length > 0 && (
                        <div className="mt-5 border-t border-white/10 pt-4">
                          <h3 className="text-xs font-semibold text-slate-400 uppercase">
                            Key Decisions Taken
                          </h3>
                          <ol className="mt-2.5 max-h-56 space-y-1.5 overflow-y-auto text-xs text-slate-300">
                            {state.decisionHistory.map((entry, idx) => (
                              <li key={`${entry.sceneId}-${idx}`} className="flex gap-2">
                                <span className="font-mono-tabular text-amber-300">
                                  {String(idx + 1).padStart(2, '0')}.
                                </span>
                                <span>{entry.decisionLabel}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      <div className="mt-7 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setViewMode('tree')}
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-xs font-semibold text-white hover:opacity-95"
                        >
                          <GitBranch className="h-4 w-4" aria-hidden="true" />
                          <span>Rewind to Turning Point</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleRestart}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-medium text-slate-100 hover:bg-white/10"
                        >
                          <RotateCcw className="h-4 w-4" aria-hidden="true" />
                          <span>Restart Story</span>
                        </button>

                        <Link
                          to="/explore"
                          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-medium text-slate-100 hover:bg-white/10"
                        >
                          <span>Explore Library</span>
                        </Link>
                      </div>
                    </section>
                  ) : (
                    <section aria-labelledby="decisions-heading" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2
                          id="decisions-heading"
                          className="font-display text-lg font-medium text-amber-200"
                        >
                          Choose Your Next Move
                        </h2>
                        <span className="text-xs text-slate-400">
                          {currentScene.availableDecisions.length} contextual paths or custom action
                        </span>
                      </div>

                      <div className="space-y-3">
                        {currentScene.availableDecisions.map((decision, idx) => {
                          const letter = String.fromCharCode(65 + idx);
                          return (
                            <motion.button
                              key={decision.id}
                              type="button"
                              initial={motionEnabled ? { opacity: 0, y: 6 } : false}
                              animate={{ opacity: 1, y: 0 }}
                              whileHover={{ x: 3 }}
                              whileTap={{ scale: 0.99 }}
                              transition={{ duration: 0.2, delay: idx * 0.04 }}
                              onClick={() => handleSelectDecision(decision)}
                              className="glass-panel group flex w-full items-start gap-3.5 rounded-2xl p-4 text-left transition-colors duration-150 hover:border-amber-300/50 hover:bg-indigo-950/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
                            >
                              <span className="font-mono-tabular mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/12 bg-white/5 text-xs font-semibold text-amber-200 transition-colors group-hover:border-amber-300/50 group-hover:bg-amber-400/15">
                                {letter}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold text-slate-100 group-hover:text-amber-100">
                                  {decision.label}
                                </div>
                                <div className="mt-1 text-xs text-slate-400">
                                  {decision.consequenceHint}
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Custom Action Input (Inspired by Screenshot 2 & 6) */}
                      <form
                        onSubmit={handleSubmitCustomAction}
                        className="rounded-2xl border border-indigo-400/30 bg-[#080D1F]/95 p-4"
                      >
                        <label
                          htmlFor="custom-action-input"
                          className="block text-xs font-semibold text-indigo-200"
                        >
                          Or write your own action, dialogue, or strategy
                        </label>
                        <div className="mt-2 flex flex-col gap-2.5 sm:flex-row">
                          <input
                            id="custom-action-input"
                            type="text"
                            value={customAction}
                            onChange={(e) => setCustomAction(e.target.value)}
                            placeholder="What will you do next? (e.g., I hide the photograph and observe the conductor...)"
                            className="flex-1 rounded-xl border border-white/12 bg-[#04060E] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/60 focus:outline-none"
                          />
                          <button
                            type="submit"
                            disabled={isTransitioning}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
                          >
                            <Send className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Submit Action</span>
                          </button>
                        </div>
                      </form>
                    </section>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Visual Story Panel + Collapsible Real-Time Dashboard */}
            <div
              className={
                showDashboard
                  ? 'space-y-6 lg:col-span-5 xl:col-span-5'
                  : 'space-y-6 lg:col-span-4'
              }
            >
              {/* B. Multi-layer Animated Visual Novel Stage */}
              <AnimatedSceneStage
                sceneImage={currentScene.sceneImage}
                sceneTitle={currentScene.sceneTitle}
                location={currentScene.location}
                atmosphereMood={currentScene.atmosphereMood}
                genreSlug={state.genreSlug}
                activeSpeaker={
                  currentScene.dialogue[0]
                    ? {
                        speaker: currentScene.dialogue[0].speaker,
                        emotion: currentScene.dialogue[0].emotion,
                      }
                    : currentScene.charactersPresent[0]
                      ? { speaker: currentScene.charactersPresent[0], emotion: 'Present' }
                      : undefined
                }
                whatYouKnow={currentScene.whatYouKnow}
                motionEnabled={motionEnabled}
                onToggleMotion={() => setMotionEnabled((prev) => !prev)}
                showVisualDetails={showVisualDetails}
                onToggleDetails={() => setShowVisualDetails((prev) => !prev)}
              />

              {showDashboard && <StoryDashboardPanel state={state} />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
