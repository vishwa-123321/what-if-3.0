/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { LibraryProvider } from './hooks/useLibrary';
import { MainLayout } from './layouts/MainLayout';
import { ReaderLayout } from './layouts/ReaderLayout';
import { ExplorePage } from './pages/ExplorePage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { GenerateStoryPage } from './pages/GenerateStoryPage';
import { GenresPage } from './pages/GenresPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { MyLibraryPage } from './pages/MyLibraryPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegisterPage } from './pages/RegisterPage';
import { StoryDetailsPage } from './pages/StoryDetailsPage';
import { StoryReaderPage } from './pages/StoryReaderPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <p className="font-mono-tabular text-xs font-semibold text-amber-300">404</p>
      <h1 className="font-display mt-2 text-3xl font-semibold text-slate-100">
        This Branch Does Not Exist
      </h1>
      <p className="mt-3 text-sm text-slate-400">
        The reality you requested could not be found. Return to the main archive to
        continue reading.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <Link
          to="/"
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Go Home
        </Link>
        <Link
          to="/explore"
          className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10"
        >
          Explore Stories
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LibraryProvider>
          <ScrollToTop />
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/genres" element={<GenresPage />} />
              <Route path="/stories/:storyId" element={<StoryDetailsPage />} />
              <Route path="/generate" element={<GenerateStoryPage />} />
              <Route path="/library" element={<MyLibraryPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route element={<ReaderLayout />}>
              <Route path="/read/:storyId" element={<StoryReaderPage />} />
            </Route>
          </Routes>
        </LibraryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
