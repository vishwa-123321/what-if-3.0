import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_STORIES } from '../data/demoStories';
import { StoryCustomizationConfig } from '../types/story';
import {
  applyContinuationToState,
  createStoryStateFromPayload,
  createStoryStateFromStory,
  generateLocalContinuation,
  generateLocalOpening,
  generateRandomStoryConfig,
  rewindStoryToScene,
} from './storyEngine';
import { buildPromptContext, validateAIContinuationPayload } from './storySchema';

const SAMPLE_CONFIG: StoryCustomizationConfig = {
  genreSlug: 'mystery',
  genreName: 'Mystery',
  title: 'The Midnight Express',
  topicOrPremise: 'A diplomatic passenger vanishes from Compartment 7 leaving an unlocked suitcase.',
  mainCharacterName: 'Inspector Clara',
  characterPersonality: 'Analytical & Skeptical',
  characterBackground: 'Former railway investigator.',
  difficulty: 'Balanced',
  length: 'Medium',
  pov: 'First-person',
  atmosphere: 'Mysterious',
  settingType: 'Realistic',
};

test('validateAIContinuationPayload parses valid JSON and rejects malformed or under-branched payloads', () => {
  assert.throws(() => validateAIContinuationPayload('{bad json'));
  assert.throws(() =>
    validateAIContinuationPayload({
      story_id: 's1',
      narrative: ['Valid prose'],
      available_decisions: [{ id: '1', label: 'Only one option' }],
      is_ending: false,
    }),
  );

  const valid = validateAIContinuationPayload(
    JSON.stringify({
      story_id: 's1',
      chapter_number: 2,
      scene_number: 4,
      scene_title: 'Locked Vestibule',
      narrative: ['Rain hits the frosted glass.'],
      current_location: 'Car 4',
      current_circumstances: 'Standing beside the conductor.',
      available_decisions: [
        { id: 'd1', label: 'Inspect the latch' },
        { id: 'd2', label: 'Question the conductor' },
        { id: 'd3', label: 'Search the luggage' },
      ],
      is_ending: false,
    }),
  );
  assert.equal(valid.scene_number, 4);
  assert.equal(valid.available_decisions.length, 3);
});

test('continuous story engine supports 12+ consecutive decisions without ending prematurely at 3', () => {
  const opening = generateLocalOpening(SAMPLE_CONFIG);
  let state = createStoryStateFromPayload(
    opening.story_id,
    'midnight-express',
    SAMPLE_CONFIG,
    opening,
    'local-engine',
  );

  assert.equal(state.currentSceneNumber, 1);
  assert.equal(state.isEnding, false);
  assert.ok(state.scenes[state.currentSceneId].availableDecisions.length >= 3);

  for (let turn = 1; turn <= 12; turn += 1) {
    const currentScene = state.scenes[state.currentSceneId];
    assert.equal(currentScene.isEnding, false, `Should not end prematurely before turn ${turn}`);
    const choice = currentScene.availableDecisions[0];
    const nextPayload = generateLocalContinuation(state, choice.label, false);
    const validated = validateAIContinuationPayload(nextPayload, {
      storyId: state.storyId,
      expectedSceneNumber: state.currentSceneNumber + 1,
    });
    state = applyContinuationToState(
      state,
      validated,
      choice.id,
      choice.label,
      false,
      'local-engine',
    );
  }

  assert.equal(state.currentSceneNumber, 13);
  assert.equal(state.decisionHistory.length, 12);
  assert.ok(state.clues.length >= 2);
});

test('custom user action integrates naturally and updates character trust & clues', () => {
  const opening = generateLocalOpening(SAMPLE_CONFIG);
  let state = createStoryStateFromPayload(
    opening.story_id,
    'midnight-express',
    SAMPLE_CONFIG,
    opening,
    'local-engine',
  );

  const customAction =
    'I hide the photograph, pretend I know nothing and secretly observe the employee.';
  const cont = generateLocalContinuation(state, customAction, true);
  state = applyContinuationToState(state, cont, 'custom', customAction, true, 'local-engine');

  assert.equal(state.decisionHistory[0].isCustomAction, true);
  assert.equal(state.decisionHistory[0].decisionLabel, customAction);
  assert.ok(
    state.scenes[state.currentSceneId].narrativeParagraphs.join(' ').includes(customAction),
  );
  assert.ok(state.clues.some((c) => c.title.includes('Covert Hand Signal')));
});

test('impossible action in realistic setting is handled naturally in-world without breaking story', () => {
  const opening = generateLocalOpening(SAMPLE_CONFIG);
  const state = createStoryStateFromPayload(
    opening.story_id,
    'midnight-express',
    SAMPLE_CONFIG,
    opening,
    'local-engine',
  );

  const impossiblePayload = generateLocalContinuation(
    state,
    'I teleport out of the locked carriage into the sky.',
    true,
  );
  assert.equal(impossiblePayload.is_ending, false);
  assert.ok(impossiblePayload.available_decisions.length >= 3);
  assert.ok(
    impossiblePayload.consequences[0].toLowerCase().includes('impossible') ||
      impossiblePayload.narrative[0].toLowerCase().includes('grounded'),
  );
});

test('branching rewind preserves discovered branch nodes and lets player diverge', () => {
  const story = DEMO_STORIES[0];
  let state = createStoryStateFromStory(story);
  const rootId = state.currentSceneId;

  const branchADecision = state.scenes[rootId].availableDecisions[0];
  const payloadA = generateLocalContinuation(state, branchADecision.label, false);
  state = applyContinuationToState(
    state,
    payloadA,
    branchADecision.id,
    branchADecision.label,
    false,
    'local-engine',
  );
  const branchASceneId = state.currentSceneId;

  // Rewind to root turning point and pick Branch B
  state = rewindStoryToScene(state, rootId);
  assert.equal(state.currentSceneId, rootId);
  assert.ok(state.branchNodes[branchASceneId], 'Previously explored branch must stay in tree');

  const branchBDecision = state.scenes[rootId].availableDecisions[1];
  const payloadB = generateLocalContinuation(state, branchBDecision.label, false);
  state = applyContinuationToState(
    state,
    payloadB,
    branchBDecision.id,
    branchBDecision.label,
    false,
    'local-engine',
  );

  assert.equal(Object.keys(state.branchNodes).length, 3);
  assert.equal(state.branchNodes[branchASceneId].isCurrentPath, false);
  assert.equal(state.branchNodes[state.currentSceneId].isCurrentPath, true);
});

test('buildPromptContext summarizes older history cleanly and random generator returns full config', () => {
  const randomCfg = generateRandomStoryConfig('mystery');
  assert.equal(randomCfg.genreSlug, 'mystery');
  assert.ok(randomCfg.mainCharacterName.length > 0);

  const opening = generateLocalOpening(randomCfg);
  const state = createStoryStateFromPayload(
    opening.story_id,
    'rand-story',
    randomCfg,
    opening,
    'local-engine',
  );
  const ctx = buildPromptContext(state, 'Examine clue', false);
  assert.equal(ctx.title, randomCfg.title);
  assert.ok(ctx.memory);
});
