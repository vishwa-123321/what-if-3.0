import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, RotateCcw } from 'lucide-react';
import { MediaCover } from '../components/MediaCover';
import { DemoModeNotice, EmptyState } from '../components/StateFeedback';
import { useLibrary } from '../hooks/useLibrary';

export function MyLibraryPage() {
  const navigate = useNavigate();
  const { stories, progressMap, restartStory, dataSource } = useLibrary();

  const trackedEntries = stories
    .map((story) => ({
      story,
      progress: progressMap[story.id],
    }))
    .filter((item) => Boolean(item.progress))
    .sort((a, b) =>
      (b.progress?.lastReadAt ?? '').localeCompare(a.progress?.lastReadAt ?? ''),
    );

  const inProgress = trackedEntries.filter((e) => !e.progress?.completed);
  const completed = trackedEntries.filter((e) => e.progress?.completed);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-amber-300/90">Reading Progress</p>
          <h1 className="font-display mt-2 text-3xl font-semibold text-slate-100 sm:text-4xl">
            My Library
          </h1>
          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            Resume active chapters, track your reading progress, and revisit completed
            endings.
          </p>
        </div>

        <Link
          to="/explore"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-100 transition-colors hover:bg-white/10"
        >
          <span>Browse All Stories</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {dataSource === 'demo' && (
        <div className="mt-6">
          <DemoModeNotice message="Reading progress shown here is saved locally in your browser as demo data until your Supabase backend is connected." />
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="glass-panel rounded-2xl p-5">
          <div className="font-mono-tabular text-2xl font-semibold text-slate-100">
            {inProgress.length}
          </div>
          <div className="mt-1 text-xs text-slate-400">Currently Reading</div>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <div className="font-mono-tabular text-2xl font-semibold text-amber-200">
            {completed.length}
          </div>
          <div className="mt-1 text-xs text-slate-400">Completed Stories</div>
        </div>
        <div className="glass-panel col-span-2 rounded-2xl p-5 sm:col-span-1">
          <div className="font-mono-tabular text-2xl font-semibold text-indigo-300">
            {trackedEntries.reduce(
              (acc, item) => acc + (item.progress?.discoveredEndings.length ?? 0),
              0,
            )}
          </div>
          <div className="mt-1 text-xs text-slate-400">Endings Unlocked</div>
        </div>
      </div>

      {trackedEntries.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Your reading shelf is empty"
            description="Start any interactive story to track your chapter bookmarks, choices, and discovered endings here."
            actionLabel="Explore Stories"
            onAction={() => navigate('/explore')}
            icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
          />
        </div>
      ) : (
        <div className="mt-12 space-y-12">
          {inProgress.length > 0 && (
            <section aria-labelledby="active-reads-heading">
              <h2
                id="active-reads-heading"
                className="font-display mb-5 text-2xl font-semibold text-slate-100"
              >
                Continue Reading
              </h2>
              <div className="grid gap-5 md:grid-cols-2">
                {inProgress.map(({ story, progress }) => {
                  if (!progress) return null;
                  const node = story.nodes[progress.currentNodeId];
                  return (
                    <article
                      key={story.id}
                      className="glass-panel flex flex-col gap-5 rounded-2xl p-5 sm:flex-row"
                    >
                      <div className="w-full shrink-0 sm:w-32">
                        <MediaCover
                          src={story.coverImage}
                          alt={story.title}
                          accentGradient={story.accentGradient}
                          aspectClassName="aspect-[3/4]"
                          className="rounded-xl"
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="text-amber-300">{story.genreName}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-tabular">
                            Chapter {node?.chapterNumber ?? 1}
                          </span>
                        </div>
                        <h3 className="font-display mt-1.5 text-xl font-semibold text-slate-100">
                          {story.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                          Current scene: {node?.chapterTitle ?? 'Opening'}
                        </p>

                        <div className="mt-4">
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-slate-400">Progress</span>
                            <span className="font-mono-tabular text-amber-200">
                              {progress.progressPercent}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-amber-300"
                              style={{ width: `${progress.progressPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-auto flex flex-wrap items-center gap-3 pt-4">
                          <Link
                            to={`/read/${story.slug}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
                          >
                            <span>Continue Reading</span>
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              restartStory(story);
                              navigate(`/read/${story.slug}`);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10"
                          >
                            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Restart</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section aria-labelledby="completed-reads-heading">
              <h2
                id="completed-reads-heading"
                className="font-display mb-5 text-2xl font-semibold text-slate-100"
              >
                Completed Stories
              </h2>
              <div className="grid gap-5 md:grid-cols-2">
                {completed.map(({ story, progress }) => {
                  if (!progress) return null;
                  return (
                    <article
                      key={story.id}
                      className="glass-panel flex flex-col justify-between rounded-2xl p-5"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-amber-300">{story.genreName}</span>
                          <span className="inline-flex items-center gap-1 text-emerald-300">
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Completed</span>
                          </span>
                        </div>
                        <h3 className="font-display mt-2 text-xl font-semibold text-slate-100">
                          {story.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-400 font-mono-tabular">
                          {progress.discoveredEndings.length} of {story.totalEndings}{' '}
                          endings discovered
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/8 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            restartStory(story);
                            navigate(`/read/${story.slug}`);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white/8 px-4 py-2 text-xs font-medium text-slate-100 hover:bg-white/14"
                        >
                          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Replay Another Path</span>
                        </button>
                        <Link
                          to={`/stories/${story.slug}`}
                          className="text-xs font-medium text-indigo-300 hover:text-amber-200"
                        >
                          Story Details
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
