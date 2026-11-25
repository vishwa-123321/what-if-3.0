import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bookmark, RotateCcw } from 'lucide-react';
import { MediaCover } from '../components/MediaCover';
import { DemoModeNotice, EmptyState } from '../components/StateFeedback';
import { useLibrary } from '../hooks/useLibrary';

export function StoryDetailsPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const {
    getStoryByIdOrSlug,
    isFavorite,
    toggleFavorite,
    getProgress,
    storyStates,
    resetDynamicStory,
    restartStory,
    startOrResumeStory,
  } = useLibrary();

  const story = storyId ? getStoryByIdOrSlug(storyId) : undefined;

  if (!story) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Story not found"
          description="This narrative could not be located in the current library."
          actionLabel="Back to Explore"
          onAction={() => navigate('/explore')}
        />
      </div>
    );
  }

  const saved = isFavorite(story.id);
  const progress = getProgress(story.id);

  const handleBeginOrResume = () => {
    startOrResumeStory(story);
    navigate(`/read/${story.slug}`);
  };

  const handleRestart = () => {
    restartStory(story);
    resetDynamicStory(story);
    navigate(`/read/${story.slug}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/explore"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-amber-200"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Back to Story Library</span>
      </Link>

      <div className="glass-panel-elevated mt-6 overflow-hidden rounded-3xl p-6 sm:p-10">
        <div className="grid items-start gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <MediaCover
              src={story.coverImage}
              alt={`Cover art for ${story.title}`}
              accentGradient={story.accentGradient}
              aspectClassName="aspect-[3/4]"
              className="rounded-2xl border border-white/10"
              fallbackTitle={story.title}
            />
          </div>

          <div className="flex flex-col lg:col-span-7">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-slate-300">
              <Link
                to={`/explore?genre=${encodeURIComponent(story.genreSlug)}`}
                className="text-amber-300 hover:underline"
              >
                {story.genreName}
              </Link>
              <span aria-hidden="true">·</span>
              <span>{story.tone}</span>
              <span aria-hidden="true">·</span>
              <span>{story.difficulty}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular">{story.estimatedMinutes} min read</span>
            </div>

            <h1 className="font-display mt-3 text-3xl font-semibold leading-tight text-slate-50 sm:text-4xl">
              {story.title}
            </h1>
            <p className="mt-2 text-lg text-indigo-200/90">{story.subtitle}</p>
            <p className="mt-1 text-xs text-slate-400">By {story.author}</p>

            <p className="mt-6 text-base leading-relaxed text-slate-300">
              {story.description}
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4 border-y border-white/10 py-5">
              <div>
                <div className="font-mono-tabular text-xl font-semibold text-slate-100">
                  {story.totalPaths}
                </div>
                <div className="mt-0.5 text-xs text-slate-400">Branching Paths</div>
              </div>
              <div>
                <div className="font-mono-tabular text-xl font-semibold text-amber-200">
                  {story.totalEndings}
                </div>
                <div className="mt-0.5 text-xs text-slate-400">Possible Endings</div>
              </div>
              <div>
                <div className="font-mono-tabular text-xl font-semibold text-slate-100">
                  {progress ? `${progress.progressPercent}%` : '0%'}
                </div>
                <div className="mt-0.5 text-xs text-slate-400">Your Progress</div>
              </div>
            </div>

            {progress && (
              <div className="mt-6 rounded-xl border border-indigo-400/20 bg-indigo-950/30 p-4 text-sm text-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-amber-200">
                    {progress.completed
                      ? 'Story Completed'
                      : 'Active Reading Bookmark'}
                  </span>
                  <span className="font-mono-tabular text-xs text-slate-300">
                    {progress.discoveredEndings.length} / {story.totalEndings} endings
                    discovered
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Current scene:{' '}
                  {storyStates[story.id]?.scenes[storyStates[story.id].currentSceneId]?.sceneTitle ??
                    story.nodes[progress.currentNodeId]?.chapterTitle ??
                    'Opening Scene'}
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleBeginOrResume}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/50 transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
              >
                <span>{progress ? 'Continue Reading' : 'Begin Story'}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              {progress && (
                <button
                  type="button"
                  onClick={handleRestart}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-medium text-slate-100 transition-colors hover:bg-white/10"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>Restart</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => toggleFavorite(story.id)}
                aria-pressed={saved}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3.5 text-sm font-medium transition-colors ${
                  saved
                    ? 'border-amber-300/50 bg-amber-500/15 text-amber-200'
                    : 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
                }`}
              >
                <Bookmark
                  className="h-4 w-4"
                  fill={saved ? 'currentColor' : 'none'}
                  aria-hidden="true"
                />
                <span>{saved ? 'Saved in Favorites' : 'Save to Favorites'}</span>
              </button>
            </div>

            {story.isDemo && (
              <div className="mt-6">
                <DemoModeNotice message="This is an interactive demo story. Your reading progress and favorites are saved locally in your browser." />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
