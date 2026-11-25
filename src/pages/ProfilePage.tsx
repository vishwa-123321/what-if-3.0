import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Edit3,
  LogOut,
  User,
} from 'lucide-react';
import { DemoModeNotice } from '../components/StateFeedback';
import { useAuth } from '../hooks/useAuth';
import { useLibrary } from '../hooks/useLibrary';

export function ProfilePage() {
  const { user, isSupabaseReady, logout, toggleFavoriteGenre, updateProfileBio } =
    useAuth();
  const { stories, genres, favoriteIds, progressMap } = useLibrary();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? 'Guest Reader');
  const [editBio, setEditBio] = useState(
    user?.bio ?? 'Exploring branching stories across genres.',
  );

  const favoriteStories = stories.filter((s) => favoriteIds.includes(s.id));
  const historyEntries = stories
    .map((story) => ({ story, progress: progressMap[story.id] }))
    .filter((entry) => Boolean(entry.progress))
    .sort((a, b) =>
      (b.progress?.lastReadAt ?? '').localeCompare(a.progress?.lastReadAt ?? ''),
    );
  const completedEntries = historyEntries.filter((e) => e.progress?.completed);
  const activeGenreIds = user?.favoriteGenreIds ?? ['genre-sci-fi', 'genre-time-paradox'];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileBio(editName, editBio);
    setIsEditing(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {!isSupabaseReady && (
        <div className="mb-6">
          <DemoModeNotice message="Profile details, reading history, and saved preferences are local demo records until your Supabase project is connected." />
        </div>
      )}

      <section className="glass-panel-elevated rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-300/30 bg-gradient-to-br from-indigo-900/70 to-violet-900/70 text-amber-200">
              <User className="h-7 w-7" aria-hidden="true" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <h1 className="font-display text-2xl font-semibold text-slate-50 sm:text-3xl">
                  {user ? user.name : 'Guest Reader (Demo)'}
                </h1>
                <span className="text-xs text-amber-300/90">
                  {user?.isDemo !== false ? 'Demo Session' : 'Verified Member'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                {user ? user.email : 'Not signed in · Local preview mode'}
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
                {user?.bio ??
                  'Sign in to personalize your reader profile, favorite genres, and saved reading history.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditName(user.name);
                    setEditBio(user.bio);
                    setIsEditing((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-100 hover:bg-white/10"
                >
                  <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-400/25 bg-rose-950/30 px-4 py-2.5 text-xs font-medium text-rose-200 hover:bg-rose-950/50"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-medium text-slate-200 hover:bg-white/10"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>

        {isEditing && user && (
          <form
            onSubmit={handleSaveProfile}
            className="mt-6 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2"
          >
            <div>
              <label
                htmlFor="profile-name"
                className="block text-xs font-medium text-slate-300"
              >
                Display Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#070B19] px-3.5 py-2.5 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="profile-bio"
                className="block text-xs font-medium text-slate-300"
              >
                Reader Bio
              </label>
              <input
                id="profile-bio"
                type="text"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#070B19] px-3.5 py-2.5 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
          <div>
            <div className="font-mono-tabular text-2xl font-semibold text-slate-100">
              {historyEntries.length}
            </div>
            <div className="mt-0.5 text-xs text-slate-400">Stories Started</div>
          </div>
          <div>
            <div className="font-mono-tabular text-2xl font-semibold text-amber-200">
              {completedEntries.length}
            </div>
            <div className="mt-0.5 text-xs text-slate-400">Completed</div>
          </div>
          <div>
            <div className="font-mono-tabular text-2xl font-semibold text-slate-100">
              {favoriteStories.length}
            </div>
            <div className="mt-0.5 text-xs text-slate-400">Saved Stories</div>
          </div>
          <div>
            <div className="font-mono-tabular text-2xl font-semibold text-indigo-300">
              {activeGenreIds.length}
            </div>
            <div className="mt-0.5 text-xs text-slate-400">Favorite Genres</div>
          </div>
        </div>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        <section
          aria-labelledby="reading-history-heading"
          className="glass-panel rounded-2xl p-6 lg:col-span-7"
        >
          <div className="flex items-center justify-between">
            <h2
              id="reading-history-heading"
              className="font-display text-xl font-semibold text-slate-100"
            >
              Reading History & Progress
            </h2>
            <Link
              to="/library"
              className="text-xs font-medium text-indigo-300 hover:text-amber-200"
            >
              Open Library
            </Link>
          </div>

          {historyEntries.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              You have not started any stories yet.{' '}
              <Link to="/explore" className="text-indigo-300 hover:underline">
                Explore stories
              </Link>{' '}
              to begin your reading history.
            </p>
          ) : (
            <div className="mt-5 divide-y divide-white/8">
              {historyEntries.map(({ story, progress }) => {
                if (!progress) return null;
                return (
                  <div
                    key={story.id}
                    className="flex flex-col justify-between gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="text-amber-300">{story.genreName}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {progress.completed ? 'Completed' : 'In progress'}
                        </span>
                      </div>
                      <Link
                        to={`/stories/${story.slug}`}
                        className="mt-1 block truncate font-display text-base font-medium text-slate-100 hover:text-amber-200"
                      >
                        {story.title}
                      </Link>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-mono-tabular text-xs text-slate-300">
                        {progress.progressPercent}%
                      </span>
                      <Link
                        to={`/read/${story.slug}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-white/8 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-indigo-600"
                      >
                        <span>{progress.completed ? 'Replay' : 'Continue'}</span>
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section
          aria-labelledby="saved-stories-heading"
          className="glass-panel rounded-2xl p-6 lg:col-span-5"
        >
          <div className="flex items-center justify-between">
            <h2
              id="saved-stories-heading"
              className="font-display text-xl font-semibold text-slate-100"
            >
              Saved Stories
            </h2>
            <Link
              to="/favorites"
              className="text-xs font-medium text-indigo-300 hover:text-amber-200"
            >
              Manage Favorites
            </Link>
          </div>

          {favoriteStories.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              No saved stories yet. Bookmark any story to access it quickly here.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {favoriteStories.map((story) => (
                <Link
                  key={story.id}
                  to={`/stories/${story.slug}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 transition-colors hover:border-amber-300/35"
                >
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-medium text-slate-100">
                      {story.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{story.genreName}</p>
                  </div>
                  <Bookmark
                    className="h-4 w-4 shrink-0 text-amber-300"
                    fill="currentColor"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <section
        aria-labelledby="favorite-genres-heading"
        className="glass-panel mt-8 rounded-2xl p-6"
      >
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2
              id="favorite-genres-heading"
              className="font-display text-xl font-semibold text-slate-100"
            >
              Favorite Genres
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Select genres you enjoy most to personalize your demo reader profile.
            </p>
          </div>
          <span className="font-mono-tabular text-xs text-amber-200">
            {activeGenreIds.length} selected
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {genres.map((genre) => {
            const active = activeGenreIds.includes(genre.id);
            return (
              <button
                key={genre.id}
                type="button"
                onClick={() => toggleFavoriteGenre(genre.id)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  active
                    ? 'border-amber-300/45 bg-indigo-600/30 text-amber-100'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:text-white'
                }`}
              >
                {active && (
                  <CheckCircle2
                    className="h-3.5 w-3.5 text-amber-300"
                    aria-hidden="true"
                  />
                )}
                <span>{genre.name}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
