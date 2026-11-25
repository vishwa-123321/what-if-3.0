import { useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { DemoModeNotice, EmptyState } from '../components/StateFeedback';
import { StoryCard } from '../components/StoryCard';
import { useLibrary } from '../hooks/useLibrary';

export function FavoritesPage() {
  const navigate = useNavigate();
  const { stories, favoriteIds, dataSource } = useLibrary();

  const favoriteStories = stories.filter((s) => favoriteIds.includes(s.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-amber-300/90">Saved Collection</p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-slate-100 sm:text-4xl">
          Favorite Stories
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
          Your bookmarked realities—save or remove stories anytime as you explore
          new genres.
        </p>
      </div>

      {dataSource === 'demo' && (
        <div className="mt-6">
          <DemoModeNotice message="Favorites are saved in your browser for this demo preview until Supabase user collections are connected." />
        </div>
      )}

      <div className="mt-8">
        {favoriteStories.length === 0 ? (
          <EmptyState
            title="No favorite stories saved yet"
            description="Tap the bookmark icon on any story card or story details page to keep it in your personal favorites."
            actionLabel="Explore Stories"
            onAction={() => navigate('/explore')}
            icon={<Bookmark className="h-5 w-5" aria-hidden="true" />}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
