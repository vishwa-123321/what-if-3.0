import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Compass,
  Play,
  Search,
  Sparkles,
  Trophy,
  User,
} from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedStoryOrb } from '../components/AnimatedStoryOrb';
import { ANIME_CHARACTER_GUIDE, DEMO_HERO_IMAGE } from '../data/demoGenres';
import { ErrorState, LoadingState } from '../components/StateFeedback';
import { StoryCard } from '../components/StoryCard';
import { useAuth } from '../hooks/useAuth';
import { useLibrary } from '../hooks/useLibrary';

export function HomePage() {
  const { user } = useAuth();
  const {
    stories,
    genres,
    progressMap,
    storyStates,
    isLoading,
    error,
    refreshData,
  } = useLibrary();

  const featuredStories = stories.filter((s) => s.isFeatured).slice(0, 3);
  const popularStories = [...stories]
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, 6);
  const trendingGenres = genres.slice(0, 5);

  const activeProgressEntries = stories
    .map((story) => ({
      story,
      progress: progressMap[story.id],
      dynamicState: storyStates[story.id],
    }))
    .filter((item) => Boolean(item.progress || item.dynamicState))
    .sort((a, b) => {
      const timeA = a.dynamicState?.updatedAt ?? a.progress?.lastReadAt ?? '';
      const timeB = b.dynamicState?.updatedAt ?? b.progress?.lastReadAt ?? '';
      return timeB.localeCompare(timeA);
    })
    .slice(0, 3);

  const totalScenesExplored = Object.values(storyStates).reduce(
    (acc, s) => acc + Object.keys(s.scenes).length,
    0,
  );
  const totalCluesFound = Object.values(storyStates).reduce(
    (acc, s) => acc + s.clues.length,
    0,
  );
  const totalEndingsUnlocked = stories.reduce((acc, s) => {
    const p = progressMap[s.id];
    return acc + (p?.discoveredEndings.length ?? 0);
  }, 0);

  return (
    <div>
      {/* Animated Cinematic Hero Section */}
      <section className="relative overflow-hidden border-b border-white/8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-indigo-600/18 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-500/8 blur-3xl"
        />

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="flex flex-col justify-center lg:col-span-6"
            >
              <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-amber-300/25 bg-amber-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-amber-200">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>WHAT IF 3.0 · INTERACTIVE STORY UNIVERSE</span>
              </div>

              <h1
                className="font-display mt-4 text-[clamp(2.25rem,4.2vw,3.75rem)] font-semibold leading-[1.06] tracking-tight text-slate-50"
                style={{ textWrap: 'balance' }}
              >
                One Story. Infinite Possibilities. Every Decision Matters.
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Step inside living fictional worlds across twenty genres. Shape alliances,
                uncover clues, type any custom action you can imagine, and watch every scene
                evolve around your choices.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/generate"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/50 transition-all hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 whitespace-nowrap"
                >
                  <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                  <span>Start Your Adventure</span>
                </Link>

                <Link
                  to="/explore"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-100 transition-colors hover:border-amber-300/40 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 whitespace-nowrap"
                >
                  <Compass className="h-4 w-4 text-amber-300" aria-hidden="true" />
                  <span>Explore Stories</span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="lg:col-span-6"
            >
              <div className="relative h-full min-h-[360px] sm:min-h-[380px] overflow-hidden rounded-2xl border border-indigo-400/30 bg-[#0A0F22] shadow-2xl shadow-indigo-950/60">
                <img
                  src={DEMO_HERO_IMAGE}
                  alt="Stylized anime astral library dome with glowing narrative core and floating storybooks"
                  referrerPolicy="no-referrer"
                  className="scene-motion-active h-full w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#050711] via-[#050711]/75 to-[#050711]/10"
                />

                {/* Animated anime story guide floating card */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-3 right-3 flex items-center gap-2 rounded-2xl border border-indigo-400/40 bg-[#070B1E]/90 p-1.5 shadow-xl backdrop-blur-md sm:top-4 sm:right-4 sm:gap-3 sm:p-2.5"
                >
                  <img
                    src={ANIME_CHARACTER_GUIDE}
                    alt="Chronicle Navigator anime companion"
                    referrerPolicy="no-referrer"
                    className="h-9 w-9 rounded-xl border border-amber-300/40 object-cover sm:h-12 sm:w-12"
                  />
                  <div className="pr-1">
                    <p className="font-mono-tabular text-[9px] font-semibold text-amber-300 uppercase sm:text-[10px]">
                      Story Companion
                    </p>
                    <p className="text-[11px] font-semibold text-slate-100 sm:text-xs">
                      Kael · Rift Guide
                    </p>
                  </div>
                </motion.div>

                <div className="absolute right-4 bottom-4 left-4 flex flex-wrap items-end justify-between gap-3 sm:right-5 sm:bottom-5 sm:left-5 sm:gap-4">
                  <div className="max-w-md drop-shadow-[0_2px_8px_rgba(5,7,17,0.95)]">
                    <p className="font-mono-tabular text-[11px] font-semibold tracking-wider text-amber-300 uppercase">
                      Featured Animated Universe
                    </p>
                    <p className="font-display mt-0.5 text-lg font-semibold text-slate-50 sm:text-xl">
                      The Glass Observatory · Time Paradox
                    </p>
                    <p className="mt-1 text-xs text-slate-200">
                      Interactive Anime Stage · Custom Actions & Dynamic Character Memory
                    </p>
                  </div>
                  <Link
                    to="/read/the-glass-observatory"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300/45 bg-amber-400/20 px-3.5 py-2 text-xs font-semibold text-amber-100 backdrop-blur-md transition-colors hover:bg-amber-400/30 whitespace-nowrap"
                  >
                    <span>Enter Scene 1</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          <AnimatedStoryOrb />
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 lg:px-8">
        {/* User Dashboard Overview */}
        <section aria-labelledby="dashboard-heading">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2
                id="dashboard-heading"
                className="font-display text-xl font-semibold text-slate-100 sm:text-2xl"
              >
                {user ? `${user.name}’s Adventure Dashboard` : 'Your Adventure Dashboard'}
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Live progress, clues uncovered, and endings across your interactive journeys.
              </p>
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-amber-300/40 hover:text-amber-200"
            >
              <User className="h-3.5 w-3.5" aria-hidden="true" />
              <span>View Profile</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="glass-panel rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Active Adventures</span>
                <BookOpen className="h-4 w-4 text-indigo-300" aria-hidden="true" />
              </div>
              <div className="font-mono-tabular mt-2 text-2xl font-semibold text-slate-100">
                {activeProgressEntries.length}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Saved locally & synced</p>
            </div>

            <div className="glass-panel rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Scenes Explored</span>
                <Compass className="h-4 w-4 text-amber-300" aria-hidden="true" />
              </div>
              <div className="font-mono-tabular mt-2 text-2xl font-semibold text-amber-200">
                {totalScenesExplored || Object.keys(progressMap).length}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Continuous narrative nodes</p>
            </div>

            <div className="glass-panel rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Clues Uncovered</span>
                <Search className="h-4 w-4 text-violet-300" aria-hidden="true" />
              </div>
              <div className="font-mono-tabular mt-2 text-2xl font-semibold text-slate-100">
                {totalCluesFound}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Stored in story memory</p>
            </div>

            <div className="glass-panel rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Endings Unlocked</span>
                <Trophy className="h-4 w-4 text-amber-300" aria-hidden="true" />
              </div>
              <div className="font-mono-tabular mt-2 text-2xl font-semibold text-slate-100">
                {totalEndingsUnlocked}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Across {genres.length} genres</p>
            </div>
          </div>
        </section>

        {/* Continue Your Story & Recently Played */}
        {activeProgressEntries.length > 0 && (
          <section aria-labelledby="continue-heading">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2
                  id="continue-heading"
                  className="font-display text-2xl font-semibold text-slate-100 sm:text-3xl"
                >
                  Continue Your Story
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Recently played stories ready to resume at your exact turning point.
                </p>
              </div>
              <Link
                to="/library"
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-indigo-300 hover:text-amber-200 whitespace-nowrap"
              >
                <span>My Library</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {activeProgressEntries.map(({ story, progress, dynamicState }) => {
                const chapter = dynamicState?.currentChapter ?? 1;
                const sceneNum = dynamicState?.currentSceneNumber ?? 1;
                const pct = dynamicState?.progressPercent ?? progress?.progressPercent ?? 15;
                const loc = dynamicState?.currentLocation ?? story.genreName;
                return (
                  <div
                    key={story.id}
                    className="glass-panel-elevated flex flex-col justify-between rounded-2xl border-indigo-400/20 p-5"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-amber-300">{story.genreName}</span>
                        <span className="font-mono-tabular text-slate-400">
                          Ch. {chapter} · Scene {sceneNum}
                        </span>
                      </div>
                      <h3 className="font-display mt-2 text-lg font-semibold text-slate-100">
                        {story.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                        Location: {loc}
                      </p>
                    </div>

                    <div className="mt-5">
                      <div className="mb-1.5 flex items-center justify-between text-[11px] text-slate-300">
                        <span>{dynamicState?.isEnding ? 'Completed' : 'In Progress'}</span>
                        <span className="font-mono-tabular text-amber-200">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-amber-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <Link
                        to={`/read/${story.slug}`}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600/90 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
                      >
                        <span>Resume Story</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Trending Genres Showcase (Matching Glowing Vertical Card Reference) */}
        <section aria-labelledby="trending-genres-heading">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2
                id="trending-genres-heading"
                className="font-display text-2xl font-semibold text-slate-100 sm:text-3xl"
              >
                Trending Genres
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Select a world style to launch a custom AI story or browse its library.
              </p>
            </div>
            <Link
              to="/genres"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-indigo-300 hover:text-amber-200 whitespace-nowrap"
            >
              <span>All {genres.length} genres</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {trendingGenres.map((genre, idx) => (
              <motion.div
                key={genre.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 transition-colors duration-200 ${
                  idx === 0
                    ? 'border-indigo-400/55 bg-[#0D1430] genre-card-glow'
                    : 'border-white/10 bg-[#0A0F22] hover:border-indigo-400/45'
                }`}
              >
                <div>
                  <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl border border-white/10">
                    <img
                      src={genre.coverImage}
                      alt={`${genre.name} stylized anime artwork`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#050711]/90 via-transparent to-transparent"
                    />
                  </div>
                  <h3 className="font-display text-base font-semibold tracking-wide text-slate-50 uppercase">
                    {genre.name}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-400">
                    {genre.description}
                  </p>
                </div>

                <Link
                  to={`/generate?genre=${encodeURIComponent(genre.slug)}`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-xs font-semibold text-slate-100 transition-colors hover:border-amber-300/50 hover:bg-indigo-600 hover:text-white"
                >
                  Select
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {isLoading && stories.length === 0 ? (
          <LoadingState />
        ) : error && stories.length === 0 ? (
          <ErrorState description={error} onRetry={refreshData} />
        ) : (
          <>
            {/* Featured AI Stories */}
            <section aria-labelledby="featured-heading">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <h2
                    id="featured-heading"
                    className="font-display text-2xl font-semibold text-slate-100 sm:text-3xl"
                  >
                    Featured AI Stories
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Deep interactive narratives with evolving character trust, clues, and custom actions.
                  </p>
                </div>
                <Link
                  to="/explore"
                  className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-indigo-300 hover:text-amber-200 whitespace-nowrap"
                >
                  <span>View all</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredStories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            </section>

            {/* Popular Stories */}
            <section aria-labelledby="popular-heading">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <h2
                    id="popular-heading"
                    className="font-display text-2xl font-semibold text-slate-100 sm:text-3xl"
                  >
                    Popular Stories
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Top replayed adventures across mystery, survival, time travel, and intrigue.
                  </p>
                </div>
                <Link
                  to="/explore?sort=popular"
                  className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-indigo-300 hover:text-amber-200 whitespace-nowrap"
                >
                  <span>See all popular</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {popularStories.map((story) => (
                  <StoryCard key={story.id} story={story} compact />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
