import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  BookOpen,
  Compass,
  Grid2x2,
  Home,
  LogOut,
  Menu,
  Plus,
  Search,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/', label: 'Home Hub', icon: Home, end: true },
  { to: '/explore', label: 'Explore Stories', icon: Compass },
  { to: '/genres', label: '20 Genres', icon: Grid2x2 },
  { to: '/generate', label: 'Story Studio', icon: Sparkles },
  { to: '/library', label: 'My Library', icon: BookOpen },
  { to: '/favorites', label: 'Favorites', icon: Bookmark },
  { to: '/profile', label: 'Profile', icon: User },
];

export function SidebarRail() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside
      aria-label="Workspace navigation rail"
      className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-white/8 lg:bg-[#060916]/90 lg:backdrop-blur-xl"
    >
      <div className="flex h-16 items-center gap-3 border-b border-white/8 px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-slate-100 transition-colors hover:text-amber-200"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-md shadow-indigo-950/60">
            W3
          </span>
          <span className="font-display text-lg font-semibold tracking-tight whitespace-nowrap">
            WHAT IF 3.0
          </span>
        </Link>
      </div>

      <nav aria-label="Sidebar primary navigation" className="flex-1 space-y-1.5 px-3 py-5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex min-h-[42px] items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'border border-indigo-400/30 bg-indigo-600/20 text-amber-200 shadow-sm shadow-indigo-950/50'
                    : 'border border-transparent text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/8 p-4">
        {user ? (
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-100">{user.name}</p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log Out"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-amber-300/40 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              to="/login"
              className="flex w-full items-center justify-center rounded-xl bg-indigo-600/90 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Sign In to Sync Progress
            </Link>
            <Link
              to="/register"
              className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10"
            >
              Create Account
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    navigate(q ? `/explore?q=${encodeURIComponent(q)}` : '/explore');
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#050711]/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-slate-100 whitespace-nowrap shrink-0 transition-colors hover:text-amber-200 lg:hidden"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-[11px] font-bold text-white">
            W3
          </span>
          <span>WHAT IF 3.0</span>
        </Link>

        <form
          onSubmit={handleSearchSubmit}
          role="search"
          aria-label="Search stories and genres"
          className="hidden flex-1 max-w-md sm:flex items-center"
        >
          <div className="relative w-full">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search stories, genres, or worlds..."
              aria-label="Search stories, genres, or worlds"
              className="w-full rounded-xl border border-white/10 bg-[#0A0F22]/90 py-2 pr-4 pl-10 text-xs text-slate-100 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none sm:text-sm"
            />
          </div>
        </form>

        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <Link
            to="/generate"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-950/50 transition-opacity hover:opacity-95 whitespace-nowrap sm:px-4"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Create Story</span>
          </Link>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `hidden sm:inline-flex lg:hidden items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-amber-300/40 bg-amber-400/10 text-amber-200'
                  : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
              }`
            }
          >
            {user ? user.name : 'Profile'}
          </NavLink>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 lg:hidden hover:bg-white/10"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-white/8 bg-[#070B19]/98 px-4 py-5 lg:hidden"
        >
          <form onSubmit={handleSearchSubmit} className="mb-4 sm:hidden">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search stories or genres..."
                aria-label="Search stories or genres"
                className="w-full rounded-xl border border-white/10 bg-[#0A0F22] py-2.5 pr-4 pl-10 text-sm text-slate-100 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </form>

          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600/20 text-amber-200'
                        : 'text-slate-200 hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <div className="mt-3 border-t border-white/8 pt-3">
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex min-h-[44px] w-full items-center justify-center rounded-lg border border-white/15 bg-white/5 px-4 text-sm font-medium text-slate-100"
                >
                  Log Out ({user.name})
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex min-h-[44px] items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex min-h-[44px] items-center justify-center rounded-lg border border-white/15 bg-white/5 px-4 text-sm font-medium text-slate-200"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
