import { DEMO_GENRES } from '../data/demoGenres';
import { Story, StoryGenerationInput } from '../types';

export function buildDemoGeneratedStory(input: StoryGenerationInput): Story {
  const matchedGenre =
    DEMO_GENRES.find((g) => g.slug === input.genreSlug) ?? DEMO_GENRES[0];
  const cleanTitle = input.title.trim() || 'Untitled Divergence';
  const cleanScenario =
    input.scenario.trim() ||
    'A quiet crossroads alters the trajectory of everything you believed was settled.';
  const slugBase = cleanTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const id = `demo-gen-${slugBase || 'story'}-${Date.now().toString(36)}`;
  const today = new Date().toISOString().slice(0, 10);

  return {
    id,
    slug: `${slugBase || 'story'}-${Date.now().toString(36)}`,
    title: cleanTitle,
    subtitle: `${input.tone} ${matchedGenre.name} · Demo Preview`,
    description: `${cleanScenario} (Demo story generated locally until your Supabase Edge Function "generate_story" is connected.)`,
    author: 'Demo Story Studio',
    genreId: matchedGenre.id,
    genreSlug: matchedGenre.slug,
    genreName: matchedGenre.name,
    coverImage: matchedGenre.coverImage,
    accentGradient: matchedGenre.accentGradient,
    difficulty: input.difficulty,
    tone: input.tone,
    estimatedMinutes: input.difficulty === 'Intricate' ? 12 : 8,
    totalPaths: 6,
    totalEndings: 3,
    popularityScore: 85,
    publishedAt: today,
    updatedAt: today,
    isRecentlyAdded: true,
    isDemo: true,
    startNodeId: 'gen-1',
    nodes: {
      'gen-1': {
        id: 'gen-1',
        chapterNumber: 1,
        chapterTitle: 'The Opening Divergence',
        sceneLabel: `${matchedGenre.name} · Scene 1`,
        content: [
          cleanScenario,
          `Framed in a ${input.tone.toLowerCase()} atmosphere, the room falls quiet as every eye waits for your first deliberate move.`,
        ],
        isEnding: false,
        choices: [
          {
            id: 'gen-c1',
            label: 'Investigate the hidden motive directly',
            consequenceHint: 'Pursue clarity immediately, even if it disrupts the room.',
            nextNodeId: 'gen-2a',
          },
          {
            id: 'gen-c2',
            label: 'Forge a quiet alliance before showing your hand',
            consequenceHint: 'Trade trust cautiously with someone nearby.',
            nextNodeId: 'gen-2b',
          },
          {
            id: 'gen-c3',
            label: 'Step back and alter the conditions from the margins',
            consequenceHint: 'Choose patience and subtle leverage.',
            nextNodeId: 'gen-2c',
          },
        ],
      },
      'gen-2a': {
        id: 'gen-2a',
        chapterNumber: 2,
        chapterTitle: 'Unveiled Intent',
        sceneLabel: 'Turning Point · Scene 2A',
        content: [
          'Pressing forward peels back the surface illusion. What seemed like an isolated incident turns out to be part of a wider pattern stretching back years.',
          'With time running thin, you have one decisive lever left to pull.',
        ],
        isEnding: false,
        choices: [
          {
            id: 'gen-c2a-1',
            label: 'Publish the full truth openly',
            consequenceHint: 'Accept upheaval in exchange for honesty.',
            nextNodeId: 'gen-end-dawn',
          },
          {
            id: 'gen-c2a-2',
            label: 'Contain the fallout quietly to protect those involved',
            consequenceHint: 'Bear the secret alone.',
            nextNodeId: 'gen-end-ember',
          },
          {
            id: 'gen-c2a-3',
            label: 'Walk away with the key evidence intact',
            consequenceHint: 'Leave the final verdict for tomorrow.',
            nextNodeId: 'gen-end-horizon',
          },
        ],
      },
      'gen-2b': {
        id: 'gen-2b',
        chapterNumber: 2,
        chapterTitle: 'The Shared Ledger',
        sceneLabel: 'Turning Point · Scene 2B',
        content: [
          'Your quiet offer finds an unexpected ally. Together you piece together fragments neither of you could read alone—revealing a narrow window to reshape the outcome.',
        ],
        isEnding: false,
        choices: [
          {
            id: 'gen-c2b-1',
            label: 'Honor the pact and rewrite the rules together',
            consequenceHint: 'Share both the victory and the risk.',
            nextNodeId: 'gen-end-dawn',
          },
          {
            id: 'gen-c2b-2',
            label: 'Shield your ally and take sole responsibility',
            consequenceHint: 'Protect their name at personal cost.',
            nextNodeId: 'gen-end-ember',
          },
          {
            id: 'gen-c2b-3',
            label: 'Part ways cleanly before dawn breaks',
            consequenceHint: 'Preserve freedom over permanence.',
            nextNodeId: 'gen-end-horizon',
          },
        ],
      },
      'gen-2c': {
        id: 'gen-2c',
        chapterNumber: 2,
        chapterTitle: 'Shadows in Balance',
        sceneLabel: 'Turning Point · Scene 2C',
        content: [
          'By waiting until the clamor subsides, you notice the single overlooked detail everyone else missed. One quiet adjustment shifts the entire balance of the evening.',
        ],
        isEnding: false,
        choices: [
          {
            id: 'gen-c2c-1',
            label: 'Reset the balance toward an open horizon',
            consequenceHint: 'Begin anew without old debts.',
            nextNodeId: 'gen-end-horizon',
          },
          {
            id: 'gen-c2c-2',
            label: 'Claim rightful stewardship over what remains',
            consequenceHint: 'Step into lasting leadership.',
            nextNodeId: 'gen-end-dawn',
          },
          {
            id: 'gen-c2c-3',
            label: 'Seal the record before history repeats itself',
            consequenceHint: 'Choose quiet closure.',
            nextNodeId: 'gen-end-ember',
          },
        ],
      },
      'gen-end-dawn': {
        id: 'gen-end-dawn',
        chapterNumber: 3,
        chapterTitle: 'Ending I: Clarity at First Light',
        sceneLabel: 'Final Chapter',
        content: [
          `Against all odds in "${cleanTitle}", every hidden thread resolves into daylight. The choices you made reshaped not just the outcome, but everyone who witnessed the turning point.`,
        ],
        isEnding: true,
        endingTitle: 'Clarity at First Light',
        endingType: 'triumphant',
        choices: [],
      },
      'gen-end-ember': {
        id: 'gen-end-ember',
        chapterNumber: 3,
        chapterTitle: 'Ending II: Quiet Embers',
        sceneLabel: 'Final Chapter',
        content: [
          'Some truths are carried softly rather than shouted. As night settles, you keep watch over an imperfect peace earned through difficult restraint.',
        ],
        isEnding: true,
        endingTitle: 'Quiet Embers',
        endingType: 'bittersweet',
        choices: [],
      },
      'gen-end-horizon': {
        id: 'gen-end-horizon',
        chapterNumber: 3,
        chapterTitle: 'Ending III: Beyond the Crossroads',
        sceneLabel: 'Final Chapter',
        content: [
          'No single chapter holds the whole answer. Stepping past the threshold into uncharted territory, you carry forward the knowledge that another path is always waiting.',
        ],
        isEnding: true,
        endingTitle: 'Beyond the Crossroads',
        endingType: 'mysterious',
        choices: [],
      },
    },
  };
}
