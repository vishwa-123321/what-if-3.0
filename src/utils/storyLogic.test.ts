import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_GENRES } from '../data/demoGenres';
import { DEMO_STORIES } from '../data/demoStories';
import { filterAndSortStories, filterGenres } from './storyFilters';
import {
  advanceStoryProgress,
  createInitialProgress,
  restartStoryProgress,
} from './storyProgress';
import { validateLoginForm, validateRegisterForm } from './authValidation';
import { buildDemoGeneratedStory } from './demoStoryBuilder';
import { resolveSupabaseUrl } from '../services/supabaseClient';
import { mapSupabaseGenreRow } from '../services/genreService';

test('mapSupabaseGenreRow derives slug and category from genre name when missing', () => {
  const mapped = mapSupabaseGenreRow(
    { id: 12, name: 'Science Fiction', description: 'Discover futuristic technology' },
    4,
  );
  assert.equal(mapped.slug, 'science-fiction');
  assert.equal(mapped.category, 'Speculative');
  assert.equal(mapped.isDemo, false);
});

test('resolveSupabaseUrl derives URL from project ID or preserves explicit URL', () => {
  assert.equal(
    resolveSupabaseUrl('', 'my-project-ref'),
    'https://my-project-ref.supabase.co',
  );
  assert.equal(
    resolveSupabaseUrl('https://custom.supabase.co', 'ignored-id'),
    'https://custom.supabase.co',
  );
  assert.equal(
    resolveSupabaseUrl('https://rhochmacxcvvlvbjgkpf.supabase.co/', ''),
    'https://rhochmacxcvvlvbjgkpf.supabase.co',
  );
  assert.equal(
    resolveSupabaseUrl('https://rhochmacxcvvlvbjgkpf.supabase.co/rest/v1/', ''),
    'https://rhochmacxcvvlvbjgkpf.supabase.co',
  );
  assert.equal(resolveSupabaseUrl('', ''), '');
});

test('DEMO_GENRES exposes 20 distinct genres', () => {
  assert.equal(DEMO_GENRES.length, 20);
  const slugs = new Set(DEMO_GENRES.map((g) => g.slug));
  assert.equal(slugs.size, 20);
});

test('filterGenres narrows by search query and category', () => {
  const sciFi = filterGenres(DEMO_GENRES, { query: 'science fiction', category: 'All' });
  assert.equal(sciFi.length, 1);
  assert.equal(sciFi[0].slug, 'science-fiction');

  const mystery = filterGenres(DEMO_GENRES, {
    query: '',
    category: 'Mystery & Noir',
  });
  assert.ok(mystery.every((g) => g.category === 'Mystery & Noir'));
  assert.ok(mystery.length >= 4);
});

test('filterAndSortStories filters by title/genre and sorts correctly', () => {
  const byTitle = filterAndSortStories(DEMO_STORIES, {
    query: 'observatory',
    genreSlug: 'all',
    sortBy: 'latest',
  });
  assert.equal(byTitle.length, 1);
  assert.equal(byTitle[0].id, 'story-glass-observatory');

  const popular = filterAndSortStories(DEMO_STORIES, {
    query: '',
    genreSlug: 'all',
    sortBy: 'popular',
  });
  assert.ok(popular[0].popularityScore >= popular[1].popularityScore);
});

test('every demo story has 3 choices on normal nodes and 0 choices on ending nodes', () => {
  for (const story of DEMO_STORIES) {
    const nodes = Object.values(story.nodes);
    const endings = nodes.filter((n) => n.isEnding);
    assert.ok(endings.length >= 2, `${story.title} must have at least 2 endings`);

    for (const node of nodes) {
      if (node.isEnding) {
        assert.equal(node.choices.length, 0, `Ending node ${node.id} must have 0 choices`);
      } else {
        assert.equal(node.choices.length, 3, `Normal node ${node.id} must have 3 choices`);
      }
    }
  }
});

test('story progress advances cleanly to ending and preserves discovered endings on restart', () => {
  const story = DEMO_STORIES[0];
  let progress = createInitialProgress(story);
  assert.equal(progress.completed, false);

  const firstChoice = story.nodes[progress.currentNodeId].choices[0];
  progress = advanceStoryProgress(story, progress, firstChoice);
  assert.equal(progress.choicesMade.length, 1);

  const secondChoice = story.nodes[progress.currentNodeId].choices[0];
  progress = advanceStoryProgress(story, progress, secondChoice);
  assert.equal(progress.completed, true);
  assert.equal(progress.progressPercent, 100);
  assert.equal(progress.discoveredEndings.length, 1);

  const restarted = restartStoryProgress(story, progress);
  assert.equal(restarted.currentNodeId, story.startNodeId);
  assert.equal(restarted.discoveredEndings.length, 1);
  assert.equal(restarted.completed, true);
});

test('auth validation catches invalid emails, short passwords, and mismatched confirmation', () => {
  const badLogin = validateLoginForm('not-an-email', 'short');
  assert.ok(badLogin.email);
  assert.ok(badLogin.password);

  const badReg = validateRegisterForm('A', 'ok@example.com', 'password123', 'different');
  assert.ok(badReg.name);
  assert.equal(badReg.email, undefined);
  assert.equal(badReg.password, undefined);
  assert.ok(badReg.confirmPassword);
});

test('buildDemoGeneratedStory builds a valid playable branching demo story', () => {
  const story = buildDemoGeneratedStory({
    genreSlug: 'sci-fi',
    title: 'Solaris Drift',
    scenario: 'A lone lighthouse keeper hears satellites whispering.',
    tone: 'Cinematic',
    difficulty: 'Balanced',
  });
  assert.equal(story.isDemo, true);
  assert.equal(story.nodes[story.startNodeId].choices.length, 3);
  const endings = Object.values(story.nodes).filter((n) => n.isEnding);
  assert.equal(endings.length, 3);
});
