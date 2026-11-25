import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Footer() {
  const { isSupabaseReady } = useAuth();

  return (
    <footer className="mt-20 border-t border-white/8 bg-[#04060F]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link
              to="/"
              className="font-display text-xl font-semibold tracking-tight text-slate-100"
            >
              WHAT IF 3.0
            </Link>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
              An interactive storytelling platform where every narrative choice shapes
              a distinct reality, branching chapters, and multiple endings.
            </p>
            <p className="mt-4 text-xs text-slate-500">
              {isSupabaseReady
                ? 'Connected to configured Supabase project.'
                : 'Currently running in Demo Preview mode with local browser persistence.'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-200">Discover</h4>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/explore" className="transition-colors hover:text-amber-200">
                  Explore Stories
                </Link>
              </li>
              <li>
                <Link to="/genres" className="transition-colors hover:text-amber-200">
                  20 Genres
                </Link>
              </li>
              <li>
                <Link to="/generate" className="transition-colors hover:text-amber-200">
                  AI Story Studio
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-200">Reader Space</h4>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/library" className="transition-colors hover:text-amber-200">
                  My Library
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="transition-colors hover:text-amber-200">
                  Favorites
                </Link>
              </li>
              <li>
                <Link to="/profile" className="transition-colors hover:text-amber-200">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/login" className="transition-colors hover:text-amber-200">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/8 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <span>WHAT IF 3.0 Interactive Fiction Platform</span>
          <span>Every choice creates a different reality.</span>
        </div>
      </div>
    </footer>
  );
}
