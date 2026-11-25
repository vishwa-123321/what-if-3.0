import { DEMO_GENRES } from '../data/demoGenres.ts';
import type {
  AIContinuationPayload,
  BranchTreeNode,
  DynamicScene,
  Genre,
  Story,
  StoryAISource,
  StoryArcStage,
  StoryCharacter,
  StoryClue,
  StoryCustomizationConfig,
  StoryDecisionOption,
  StoryObject,
  StoryState,
} from '../types/story.ts';
import { getTargetSceneRange } from './storySchema.ts';

function computeTrustRelationship(trustScore: number): StoryCharacter['relationship'] {
  if (trustScore >= 60) return 'Devoted';
  if (trustScore >= 20) return 'Ally';
  if (trustScore <= -50) return 'Hostile';
  if (trustScore <= -20) return 'Distrustful';
  if (trustScore < 5) return 'Wary';
  return 'Neutral';
}

export function computeArcStage(
  sceneNumber: number,
  length: StoryCustomizationConfig['length'],
  isEnding: boolean,
): StoryArcStage {
  if (isEnding) return 'Aftermath';
  const range = getTargetSceneRange(length);
  const ratio = sceneNumber / Math.max(1, range.targetScenes);
  if (sceneNumber <= 2) return 'Inciting Incident';
  if (ratio < 0.65) return 'Rising Action';
  if (ratio < 0.9) return 'Climax';
  return 'Resolution';
}

export function computeStoryProgressPercent(
  sceneNumber: number,
  length: StoryCustomizationConfig['length'],
  isEnding: boolean,
): number {
  if (isEnding) return 100;
  const range = getTargetSceneRange(length);
  const raw = Math.round((sceneNumber / Math.max(1, range.targetScenes)) * 92);
  return Math.min(95, Math.max(8, raw));
}

export function resolveGenreBySlugOrName(slugOrName: string): Genre {
  const normalized = slugOrName.trim().toLowerCase();
  return (
    DEMO_GENRES.find(
      (g) =>
        g.slug === normalized ||
        g.name.toLowerCase() === normalized ||
        normalized.includes(g.slug) ||
        g.slug.includes(normalized),
    ) ?? DEMO_GENRES[0]
  );
}

function makeSceneId(sceneNumber: number, suffix?: string): string {
  const tag = suffix ?? Math.random().toString(36).slice(2, 7);
  return `scene-${sceneNumber}-${tag}`;
}

export function createStoryStateFromPayload(
  storyId: string,
  storySlug: string,
  customization: StoryCustomizationConfig,
  payload: AIContinuationPayload,
  aiSource: StoryAISource,
  coverImage?: string,
  accentGradient?: string,
): StoryState {
  const genre = resolveGenreBySlugOrName(customization.genreSlug);
  const template = genre.template;
  const sceneId = makeSceneId(1, 'open');

  const characters: StoryCharacter[] = (template?.characterArchetypes ?? []).map((arch, idx) => ({
    id: `char-${idx + 1}-${arch.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: arch.name,
    role: arch.role,
    personality: arch.personality,
    background: arch.background,
    motivation: arch.motivation,
    relationship: 'Neutral',
    trustScore: 10,
    knowledge: [],
    secret: arch.secret,
    secretRevealed: false,
    dialogueStyle: arch.dialogueStyle,
    isPresent: payload.characters_present.some((n) =>
      n.toLowerCase().includes(arch.name.split(' ')[0].toLowerCase()),
    ),
  }));

  // Apply any additional character updates from payload
  for (const cu of payload.story_state_updates.character_updates ?? []) {
    const existing = characters.find(
      (c) => c.name.toLowerCase() === cu.name.toLowerCase(),
    );
    if (!existing) {
      characters.push({
        id: `char-${characters.length + 1}-${cu.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: cu.name,
        role: cu.role ?? 'Key Figure',
        personality: cu.personality ?? 'Observant and guarded',
        background: cu.background ?? 'Crossed paths with you at a pivotal hour.',
        motivation: cu.motivation ?? 'Protect personal interests as events escalate.',
        relationship: computeTrustRelationship(cu.trust_delta ?? 0),
        trustScore: cu.trust_delta ?? 0,
        knowledge: [],
        secret: cu.new_secret ?? 'Holds undisclosed ties to the unfolding events.',
        secretRevealed: Boolean(cu.reveal_secret),
        dialogueStyle: cu.dialogue_style ?? 'Direct and measured.',
        isPresent: true,
        lastReaction: cu.reaction,
      });
    }
  }

  const clues: StoryClue[] = payload.new_clues.map((c, idx) => ({
    id: `clue-1-${idx + 1}`,
    title: c.title,
    description: c.description,
    discoveredAtScene: 1,
    chapterNumber: payload.chapter_number,
    verified: true,
  }));

  const inventory: StoryObject[] = payload.new_objects.map((o, idx) => ({
    id: `obj-1-${idx + 1}`,
    name: o.name,
    description: o.description,
    acquiredAtScene: 1,
    status: 'held',
  }));

  const arcStage = computeArcStage(1, customization.length, payload.is_ending);
  const firstScene: DynamicScene = {
    id: sceneId,
    parentSceneId: null,
    chapterNumber: payload.chapter_number,
    sceneNumber: 1,
    sceneTitle: payload.scene_title,
    genreName: genre.name,
    location: payload.current_location,
    narrativeParagraphs: payload.narrative,
    dialogue: payload.dialogue,
    situationSummary: payload.current_circumstances,
    whatYouKnow:
      payload.what_character_knows.length > 0
        ? payload.what_character_knows
        : [payload.current_circumstances],
    charactersPresent: payload.characters_present,
    events: payload.events,
    newClues: payload.new_clues.map((c) => c.title),
    newObjects: payload.new_objects.map((o) => o.name),
    consequences: payload.consequences,
    currentObjective: payload.current_objective,
    availableDecisions: payload.available_decisions,
    arcStage,
    sceneImage: coverImage ?? genre.coverImage,
    atmosphereMood: customization.atmosphere,
    isEnding: payload.is_ending,
    endingTitle: payload.ending_title,
    endingType: payload.ending_type,
    createdAt: new Date().toISOString(),
  };

  const rootBranchNode: BranchTreeNode = {
    sceneId,
    parentSceneId: null,
    chapterNumber: payload.chapter_number,
    sceneNumber: 1,
    title: payload.scene_title,
    decisionLabel: 'Opening Scene',
    isCustomAction: false,
    isEnding: payload.is_ending,
    endingType: payload.ending_type,
    isCurrentPath: true,
  };

  return {
    storyId,
    storySlug,
    title: customization.title,
    genreSlug: genre.slug,
    genreName: genre.name,
    coverImage: coverImage ?? genre.coverImage,
    accentGradient: accentGradient ?? genre.accentGradient,
    customization,
    currentChapter: payload.chapter_number,
    currentSceneNumber: 1,
    currentSceneId: sceneId,
    scenes: { [sceneId]: firstScene },
    activePathSceneIds: [sceneId],
    branchNodes: { [sceneId]: rootBranchNode },
    characters,
    clues,
    inventory,
    unresolvedMysteries:
      payload.story_state_updates.new_mysteries &&
      payload.story_state_updates.new_mysteries.length > 0
        ? payload.story_state_updates.new_mysteries
        : [`Uncover the truth behind ${customization.title}`],
    importantEvents: payload.events,
    previousConsequences: payload.consequences,
    currentLocation: payload.current_location,
    currentObjective: payload.current_objective,
    currentCircumstances: payload.current_circumstances,
    decisionHistory: [],
    isEnding: payload.is_ending,
    endingTitle: payload.ending_title,
    endingType: payload.ending_type,
    discoveredEndings: payload.is_ending
      ? [
          {
            sceneId,
            title: payload.ending_title ?? payload.scene_title,
            type: payload.ending_type ?? 'mysterious',
            reachedAt: new Date().toISOString(),
          },
        ]
      : [],
    progressPercent: computeStoryProgressPercent(1, customization.length, payload.is_ending),
    aiSource,
    updatedAt: new Date().toISOString(),
  };
}

export function createStoryStateFromStory(story: Story): StoryState {
  const genre = resolveGenreBySlugOrName(story.genreSlug || story.genreName);
  const startNode = story.nodes[story.startNodeId] ?? Object.values(story.nodes)[0];
  const template = genre.template;

  const customization: StoryCustomizationConfig = {
    genreSlug: genre.slug,
    genreName: story.genreName || genre.name,
    title: story.title,
    topicOrPremise: story.description,
    mainCharacterName: story.defaultCustomization?.mainCharacterName ?? 'Morgan',
    characterPersonality:
      story.defaultCustomization?.characterPersonality ?? 'Observant & Determined',
    characterBackground:
      story.defaultCustomization?.characterBackground ?? story.subtitle,
    difficulty: story.difficulty,
    length: story.defaultCustomization?.length ?? 'Medium',
    pov: story.defaultCustomization?.pov ?? 'Second/First-person',
    atmosphere:
      story.defaultCustomization?.atmosphere ?? template?.defaultAtmosphere ?? 'Cinematic',
    settingType: story.defaultCustomization?.settingType ?? 'Realistic',
  } as StoryCustomizationConfig;

  // Normalize POV to valid enum union
  if (customization.pov !== 'First-person' && customization.pov !== 'Third-person') {
    customization.pov = 'First-person';
  }

  const openingPayload: AIContinuationPayload = {
    story_id: story.id,
    chapter_number: startNode?.chapterNumber ?? 1,
    scene_number: 1,
    scene_title: startNode?.chapterTitle ?? story.title,
    narrative: startNode?.content ?? [story.description],
    dialogue: [],
    current_location: startNode?.sceneLabel ?? template?.locationSeeds[0] ?? 'Opening Scene',
    current_circumstances: story.subtitle || story.description.slice(0, 160),
    what_character_knows: [story.subtitle || story.description.slice(0, 140)],
    characters_present: (template?.characterArchetypes ?? []).slice(0, 2).map((c) => c.name),
    events: [`You arrive at ${startNode?.sceneLabel ?? 'the threshold'} as the core conflict begins.`],
    new_clues: (template?.clueSeeds ?? []).slice(0, 1),
    new_objects: (template?.objectSeeds ?? []).slice(0, 1),
    consequences: ['Your arrival puts every witness on edge.'],
    current_objective: `Investigate the opening mystery in ${story.title}`,
    available_decisions:
      startNode?.choices.map((c, idx) => ({
        id: c.id,
        label: c.label,
        consequenceHint: c.consequenceHint,
        riskLevel: idx === 0 ? 'medium' : idx === 1 ? 'high' : 'low',
      })) ?? [],
    story_state_updates: {
      new_mysteries: [`What sparked the crisis in ${story.title}?`],
    },
    is_ending: false,
  };

  return createStoryStateFromPayload(
    story.id,
    story.slug,
    customization,
    openingPayload,
    'local-engine',
    story.coverImage,
    story.accentGradient,
  );
}

export function applyContinuationToState(
  prev: StoryState,
  payload: AIContinuationPayload,
  decisionId: string,
  decisionLabel: string,
  isCustomAction: boolean,
  aiSource: StoryAISource,
): StoryState {
  const nextSceneNumber = prev.currentSceneNumber + 1;
  const chapterNumber = Math.max(prev.currentChapter, payload.chapter_number);
  const newSceneId = makeSceneId(nextSceneNumber);

  // Merge character updates with continuity
  const nextCharacters: StoryCharacter[] = prev.characters.map((char) => {
    const isNowPresent = payload.characters_present.some((p) =>
      p.toLowerCase().includes(char.name.split(' ')[0].toLowerCase()),
    );
    const update = (payload.story_state_updates.character_updates ?? []).find((u) =>
      u.name.toLowerCase().includes(char.name.split(' ')[0].toLowerCase()),
    );

    if (!update) {
      return {
        ...char,
        isPresent: isNowPresent,
      };
    }

    const nextTrust = Math.max(
      -100,
      Math.min(100, char.trustScore + (update.trust_delta ?? 0)),
    );
    return {
      ...char,
      role: update.role || char.role,
      personality: update.personality || char.personality,
      motivation: update.motivation || char.motivation,
      trustScore: nextTrust,
      relationship: computeTrustRelationship(nextTrust),
      secretRevealed: char.secretRevealed || Boolean(update.reveal_secret),
      secret: update.new_secret || char.secret,
      isPresent: isNowPresent || true,
      lastReaction: update.reaction || char.lastReaction,
      knowledge: update.reaction
        ? [...char.knowledge.slice(-4), `Scene ${nextSceneNumber}: ${update.reaction}`]
        : char.knowledge,
    };
  });

  // Add newly introduced characters
  for (const cu of payload.story_state_updates.character_updates ?? []) {
    const exists = nextCharacters.some(
      (c) =>
        c.name.toLowerCase() === cu.name.toLowerCase() ||
        c.name.toLowerCase().includes(cu.name.split(' ')[0].toLowerCase()),
    );
    if (!exists) {
      const trust = cu.trust_delta ?? 0;
      nextCharacters.push({
        id: `char-${nextCharacters.length + 1}-${cu.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: cu.name,
        role: cu.role ?? 'Encountered Witness',
        personality: cu.personality ?? 'Alert and cautious',
        background: cu.background ?? 'Stepped into the unfolding chain of events.',
        motivation: cu.motivation ?? 'Protect their own stake in the outcome.',
        relationship: computeTrustRelationship(trust),
        trustScore: trust,
        knowledge: cu.reaction ? [cu.reaction] : [],
        secret: cu.new_secret ?? 'Has yet to reveal their full involvement.',
        secretRevealed: Boolean(cu.reveal_secret),
        dialogueStyle: cu.dialogue_style ?? 'Direct.',
        isPresent: true,
        lastReaction: cu.reaction,
      });
    }
  }

  // Deduplicate clues
  const existingClueTitles = new Set(prev.clues.map((c) => c.title.toLowerCase()));
  const addedClues: StoryClue[] = [];
  for (const rawClue of payload.new_clues) {
    if (!existingClueTitles.has(rawClue.title.toLowerCase())) {
      existingClueTitles.add(rawClue.title.toLowerCase());
      addedClues.push({
        id: `clue-${nextSceneNumber}-${addedClues.length + 1}`,
        title: rawClue.title,
        description: rawClue.description,
        discoveredAtScene: nextSceneNumber,
        chapterNumber,
        verified: true,
      });
    }
  }
  const nextClues = [...prev.clues, ...addedClues];

  // Update inventory objects (new + used)
  const usedNames = new Set(
    (payload.story_state_updates.used_objects ?? []).map((n) => n.toLowerCase()),
  );
  const existingObjNames = new Set(prev.inventory.map((o) => o.name.toLowerCase()));
  const updatedInventory: StoryObject[] = prev.inventory.map((item) =>
    usedNames.has(item.name.toLowerCase()) ? { ...item, status: 'used' } : item,
  );
  for (const rawObj of payload.new_objects) {
    if (!existingObjNames.has(rawObj.name.toLowerCase())) {
      existingObjNames.add(rawObj.name.toLowerCase());
      updatedInventory.push({
        id: `obj-${nextSceneNumber}-${updatedInventory.length + 1}`,
        name: rawObj.name,
        description: rawObj.description,
        acquiredAtScene: nextSceneNumber,
        status: 'held',
      });
    }
  }

  // Mysteries
  const resolvedSet = new Set(
    (payload.story_state_updates.resolved_mysteries ?? []).map((m) => m.toLowerCase()),
  );
  const remainingMysteries = prev.unresolvedMysteries.filter(
    (m) => !resolvedSet.has(m.toLowerCase()),
  );
  for (const nm of payload.story_state_updates.new_mysteries ?? []) {
    if (!remainingMysteries.some((m) => m.toLowerCase() === nm.toLowerCase())) {
      remainingMysteries.push(nm);
    }
  }

  const arcStage = computeArcStage(
    nextSceneNumber,
    prev.customization.length,
    payload.is_ending,
  );

  const newScene: DynamicScene = {
    id: newSceneId,
    parentSceneId: prev.currentSceneId,
    triggeredByDecisionLabel: decisionLabel,
    isCustomAction,
    chapterNumber,
    sceneNumber: nextSceneNumber,
    sceneTitle: payload.scene_title,
    genreName: prev.genreName,
    location: payload.current_location,
    narrativeParagraphs: payload.narrative,
    dialogue: payload.dialogue,
    situationSummary: payload.current_circumstances,
    whatYouKnow:
      payload.what_character_knows.length > 0
        ? payload.what_character_knows
        : [payload.current_circumstances],
    charactersPresent: payload.characters_present,
    events: payload.events,
    newClues: addedClues.map((c) => c.title),
    newObjects: payload.new_objects.map((o) => o.name),
    consequences: payload.consequences,
    currentObjective: payload.current_objective,
    availableDecisions: payload.is_ending ? [] : payload.available_decisions,
    arcStage,
    sceneImage: prev.coverImage,
    atmosphereMood: prev.customization.atmosphere,
    isEnding: payload.is_ending,
    endingTitle: payload.ending_title,
    endingType: payload.ending_type,
    createdAt: new Date().toISOString(),
  };

  const nextActivePath = [...prev.activePathSceneIds, newSceneId];
  const nextActiveSet = new Set(nextActivePath);
  const updatedBranchNodes: Record<string, BranchTreeNode> = {};
  for (const [id, node] of Object.entries(prev.branchNodes)) {
    updatedBranchNodes[id] = {
      ...node,
      isCurrentPath: nextActiveSet.has(id),
    };
  }
  updatedBranchNodes[newSceneId] = {
    sceneId: newSceneId,
    parentSceneId: prev.currentSceneId,
    chapterNumber,
    sceneNumber: nextSceneNumber,
    title: payload.scene_title,
    decisionLabel,
    isCustomAction,
    isEnding: payload.is_ending,
    endingType: payload.ending_type,
    isCurrentPath: true,
  };

  const discoveredEndings = [...prev.discoveredEndings];
  if (
    payload.is_ending &&
    !discoveredEndings.some((e) => e.title === (payload.ending_title ?? payload.scene_title))
  ) {
    discoveredEndings.push({
      sceneId: newSceneId,
      title: payload.ending_title ?? payload.scene_title,
      type: payload.ending_type ?? 'mysterious',
      reachedAt: new Date().toISOString(),
    });
  }

  return {
    ...prev,
    currentChapter: chapterNumber,
    currentSceneNumber: nextSceneNumber,
    currentSceneId: newSceneId,
    scenes: {
      ...prev.scenes,
      [newSceneId]: newScene,
    },
    activePathSceneIds: nextActivePath,
    branchNodes: updatedBranchNodes,
    characters: nextCharacters,
    clues: nextClues,
    inventory: updatedInventory,
    unresolvedMysteries: remainingMysteries,
    importantEvents: [...prev.importantEvents, ...payload.events].slice(-25),
    previousConsequences: payload.consequences,
    currentLocation: payload.current_location,
    currentObjective: payload.current_objective,
    currentCircumstances: payload.current_circumstances,
    decisionHistory: [
      ...prev.decisionHistory,
      {
        sceneId: prev.currentSceneId,
        sceneNumber: prev.currentSceneNumber,
        chapterNumber: prev.currentChapter,
        decisionId,
        decisionLabel,
        isCustomAction,
        consequenceSummary: payload.consequences[0] ?? 'The story shifted direction.',
        timestamp: new Date().toISOString(),
      },
    ],
    isEnding: payload.is_ending,
    endingTitle: payload.ending_title,
    endingType: payload.ending_type,
    discoveredEndings,
    progressPercent: computeStoryProgressPercent(
      nextSceneNumber,
      prev.customization.length,
      payload.is_ending,
    ),
    aiSource,
    updatedAt: new Date().toISOString(),
  };
}

export function rewindStoryToScene(state: StoryState, targetSceneId: string): StoryState {
  const target = state.scenes[targetSceneId];
  if (!target) {
    return state;
  }

  // Reconstruct path from root to targetSceneId via parentSceneId links
  const pathIds: string[] = [];
  let cursor: DynamicScene | undefined = target;
  const guard = new Set<string>();
  while (cursor && !guard.has(cursor.id)) {
    guard.add(cursor.id);
    pathIds.unshift(cursor.id);
    cursor = cursor.parentSceneId ? state.scenes[cursor.parentSceneId] : undefined;
  }

  const activeSet = new Set(pathIds);
  const updatedBranchNodes: Record<string, BranchTreeNode> = {};
  for (const [id, node] of Object.entries(state.branchNodes)) {
    updatedBranchNodes[id] = {
      ...node,
      isCurrentPath: activeSet.has(id),
    };
  }

  // Trim decision history & clues back to target.sceneNumber while preserving branchNodes
  const trimmedDecisions = state.decisionHistory.filter(
    (d) => d.sceneNumber < target.sceneNumber,
  );
  const trimmedClues = state.clues.filter(
    (c) => c.discoveredAtScene <= target.sceneNumber,
  );
  const trimmedInventory = state.inventory.filter(
    (o) => o.acquiredAtScene <= target.sceneNumber,
  );

  return {
    ...state,
    currentChapter: target.chapterNumber,
    currentSceneNumber: target.sceneNumber,
    currentSceneId: target.id,
    activePathSceneIds: pathIds,
    branchNodes: updatedBranchNodes,
    clues: trimmedClues,
    inventory: trimmedInventory,
    currentLocation: target.location,
    currentObjective: target.currentObjective,
    currentCircumstances: target.situationSummary,
    decisionHistory: trimmedDecisions,
    isEnding: target.isEnding,
    endingTitle: target.endingTitle,
    endingType: target.endingType,
    progressPercent: computeStoryProgressPercent(
      target.sceneNumber,
      state.customization.length,
      target.isEnding,
    ),
    updatedAt: new Date().toISOString(),
  };
}

// ---------- Context-Aware Local Interactive Story Engine (Offline / Fallback Mode) ----------

const IMPOSSIBLE_PATTERNS = [
  /\b(teleport|fly away|spawn a tank|summon aliens|cast fireball|laser rifle|time machine)\b/i,
  /\b(use superpowers|become invisible|turn into a dragon)\b/i,
];

function isActionImpossibleInRealisticWorld(
  actionText: string,
  settingType: StoryCustomizationConfig['settingType'],
  genreSlug: string,
): boolean {
  if (settingType === 'Imaginative') return false;
  if (
    genreSlug.includes('fantasy') ||
    genreSlug.includes('sci') ||
    genreSlug.includes('supernatural') ||
    genreSlug.includes('time') ||
    genreSlug.includes('myth') ||
    genreSlug.includes('space')
  ) {
    return false;
  }
  return IMPOSSIBLE_PATTERNS.some((rx) => rx.test(actionText));
}

function formatPerspective(
  pov: StoryCustomizationConfig['pov'],
  characterName: string,
  secondPersonClause: string,
  thirdPersonClause: string,
): string {
  if (pov === 'Third-person') {
    return `${characterName} ${thirdPersonClause}`;
  }
  return secondPersonClause;
}

export function generateLocalOpening(config: StoryCustomizationConfig): AIContinuationPayload {
  const genre = resolveGenreBySlugOrName(config.genreSlug);
  const template = genre.template!;
  const hero = config.mainCharacterName.trim() || 'Alex';
  const charA = template.characterArchetypes[0];
  const charB = template.characterArchetypes[1];
  const location = template.locationSeeds[0];
  const premise = config.topicOrPremise.trim() || template.starterHook;
  const firstClue = template.clueSeeds[0] ?? {
    title: 'Sealed Field Note',
    description: 'An urgent hand-addressed note pointing to midnight.',
  };
  const firstObj = template.objectSeeds[0] ?? {
    name: 'Pocket Notebook',
    description: 'Leather-bound notebook for tracking evidence and names.',
  };

  const p1 = `${premise} Set against a ${config.atmosphere.toLowerCase()} backdrop, ${formatPerspective(
    config.pov,
    hero,
    `you step into ${location} carrying your reputation for being ${config.characterPersonality.toLowerCase()}.`,
    `steps into ${location}, guided by instincts known as ${config.characterPersonality.toLowerCase()}.`,
  )}`;

  const p2 = `${charA.name} (${charA.role}) watches the entrance nervously while ${charB.name} (${charB.role}) stands near the far alcove. On the central desk rests ${firstClue.title.toLowerCase()}—placed deliberately where someone expected you to look first.`;

  return {
    story_id: `local-${genre.slug}-${Date.now().toString(36)}`,
    chapter_number: 1,
    scene_number: 1,
    scene_title: `Threshold of ${config.title}`,
    narrative: [p1, p2],
    dialogue: [
      {
        speaker: charA.name,
        line: `"You didn't get the message by coincidence, ${hero}. Whatever happens next in ${location}, think carefully who hears your first move."`,
        emotion: 'Guarded',
      },
    ],
    current_location: location,
    current_circumstances: `${hero} stands in ${location} alongside ${charA.name} and ${charB.name}, facing the opening incident of ${config.title}.`,
    what_character_knows: [
      `You are inside ${location}.`,
      `${charA.name} knows more about the missing piece than they admit.`,
      `${firstClue.title} appears freshly placed.`,
    ],
    characters_present: [charA.name, charB.name],
    events: [`You arrived at ${location} and spotted ${firstClue.title}.`],
    new_clues: [firstClue],
    new_objects: [firstObj],
    consequences: ['Everyone in the room is measuring your opening move.'],
    current_objective: `Uncover why ${firstClue.title} was left at ${location}.`,
    available_decisions: [
      {
        id: 'open-d1',
        label: `Examine ${firstClue.title} closely before anyone intercepts it`,
        consequenceHint: 'Prioritize physical evidence while risking an immediate confrontation.',
        intentTag: 'investigate',
        riskLevel: 'medium',
      },
      {
        id: 'open-d2',
        label: `Question ${charA.name} directly about what happened before you arrived`,
        consequenceHint: 'Test their composure and see if their story holds.',
        intentTag: 'question',
        riskLevel: 'low',
      },
      {
        id: 'open-d3',
        label: `Observe ${charB.name} silently and check the exits around ${location}`,
        consequenceHint: 'Wait before committing and watch for hidden signals.',
        intentTag: 'observe',
        riskLevel: 'low',
      },
      {
        id: 'open-d4',
        label: `Bluff boldly to draw out whoever is concealing the truth`,
        consequenceHint: 'Force an immediate reaction, though trust may fracture.',
        intentTag: 'confront',
        riskLevel: 'high',
      },
    ],
    story_state_updates: {
      character_updates: [
        {
          name: charA.name,
          role: charA.role,
          personality: charA.personality,
          background: charA.background,
          motivation: charA.motivation,
          dialogue_style: charA.dialogueStyle,
          trust_delta: 0,
          reaction: 'Watches closely to gauge whether you can be trusted.',
          new_secret: charA.secret,
        },
        {
          name: charB.name,
          role: charB.role,
          personality: charB.personality,
          background: charB.background,
          motivation: charB.motivation,
          dialogue_style: charB.dialogueStyle,
          trust_delta: -5,
          reaction: 'Keeps a measured distance near the far corridor.',
          new_secret: charB.secret,
        },
      ],
      new_mysteries: [
        `Who placed ${firstClue.title} inside ${location}?`,
        `What is ${charB.name} hiding from the rest of the group?`,
      ],
    },
    is_ending: false,
  };
}

export function generateLocalContinuation(
  state: StoryState,
  actionLabel: string,
  isCustomAction: boolean,
  forceFinish = false,
): AIContinuationPayload {
  const genre = resolveGenreBySlugOrName(state.genreSlug);
  const template = genre.template!;
  const hero = state.customization.mainCharacterName.trim() || 'Alex';
  const nextSceneNumber = state.currentSceneNumber + 1;
  const range = getTargetSceneRange(state.customization.length);
  const scenesPerChapter = Math.max(2, Math.ceil(range.targetScenes / range.chapters));
  const chapterNumber = Math.min(
    range.chapters,
    Math.floor((nextSceneNumber - 1) / scenesPerChapter) + 1,
  );

  const primaryChar = state.characters[0] ?? {
    id: 'c1',
    name: 'Elena Voss',
    role: 'Witness',
    personality: 'Observant',
    background: 'Archive insider',
    motivation: 'Protect the truth',
    relationship: 'Neutral' as const,
    trustScore: 10,
    knowledge: [],
    secret: 'Altered the log.',
    secretRevealed: false,
    dialogueStyle: 'Measured',
    isPresent: true,
  };
  const secondaryChar = state.characters[1] ?? primaryChar;

  const lowerAction = actionLabel.toLowerCase();
  const isImpossible = isActionImpossibleInRealisticWorld(
    actionLabel,
    state.customization.settingType,
    state.genreSlug,
  );

  const locations = template.locationSeeds;
  const locationIndex = (nextSceneNumber - 1) % locations.length;
  const nextLocation =
    lowerAction.includes('follow') ||
    lowerAction.includes('leave') ||
    lowerAction.includes('search') ||
    lowerAction.includes('enter') ||
    lowerAction.includes('move') ||
    nextSceneNumber % 2 === 0
      ? locations[locationIndex]
      : state.currentLocation;

  // Handle natural impossibility inside realistic story worlds without breaking immersion
  if (isImpossible) {
    return {
      story_id: state.storyId,
      chapter_number: chapterNumber,
      scene_number: nextSceneNumber,
      scene_title: `Reality Checks in ${state.currentLocation}`,
      narrative: [
        `${formatPerspective(
          state.customization.pov,
          hero,
          `You brace yourself and attempt to "${actionLabel}", but the grounded laws of this world offer no impossible shortcuts inside ${state.currentLocation}.`,
          `braces to attempt "${actionLabel}", yet the physical reality of ${state.currentLocation} offers no impossible escape.`,
        )} Only ordinary tools, sharp observation, and the people standing in front of you can move the situation forward.`,
        `${primaryChar.name} blinks at your sudden tension and gestures back toward the unresolved evidence on the table. The moment to act decisively is still yours.`,
      ],
      dialogue: [
        {
          speaker: primaryChar.name,
          line: `"No miracles are walking through that door, ${hero}. Tell me what you actually want to try with what we have right here."`,
          emotion: 'Grounded',
        },
      ],
      current_location: state.currentLocation,
      current_circumstances: `Your impossible attempt yielded no effect; the standoff in ${state.currentLocation} remains tense.`,
      what_character_knows: [
        ...state.clues.slice(-2).map((c) => c.title),
        'Only practical actions grounded in the current room will shift events.',
      ],
      characters_present: [primaryChar.name, secondaryChar.name],
      events: [`Tried an unworkable approach in ${state.currentLocation}; tensions held steady.`],
      new_clues: [],
      new_objects: [],
      consequences: [
        `The impossible action ("${actionLabel}") failed naturally within this ${state.customization.settingType.toLowerCase()} setting, giving you another chance to act.`,
      ],
      current_objective: state.currentObjective,
      available_decisions: [
        {
          id: `dec-${nextSceneNumber}-1`,
          label: `Use ${state.inventory[0]?.name ?? 'your field notebook'} to inspect the room systematically`,
          consequenceHint: 'Ground your next move in tangible evidence.',
          riskLevel: 'low',
        },
        {
          id: `dec-${nextSceneNumber}-2`,
          label: `Question ${primaryChar.name} calmly to regain leverage`,
          consequenceHint: 'Rebuild rapport and extract a concrete lead.',
          riskLevel: 'low',
        },
        {
          id: `dec-${nextSceneNumber}-3`,
          label: `Move toward ${locations[(locationIndex + 1) % locations.length]} before the window closes`,
          consequenceHint: 'Change venue and seek fresh witnesses.',
          riskLevel: 'medium',
        },
      ],
      story_state_updates: {
        character_updates: [
          {
            name: primaryChar.name,
            trust_delta: -2,
            reaction: 'Looks momentarily puzzled by your hesitation.',
          },
        ],
      },
      is_ending: false,
    };
  }

  // Should we conclude naturally? NEVER before minScenes unless explicitly requested via forceFinish
  const canNaturallyEnd =
    forceFinish ||
    (nextSceneNumber >= range.targetScenes &&
      (lowerAction.includes('conclude') ||
        lowerAction.includes('expose') ||
        lowerAction.includes('seal') ||
        lowerAction.includes('escape') ||
        lowerAction.includes('resolve') ||
        nextSceneNumber >= range.maxScenes - 2));

  if (canNaturallyEnd) {
    const trustworthyAlly = primaryChar.trustScore >= 20;
    const endingType: AIContinuationPayload['ending_type'] = trustworthyAlly
      ? 'triumphant'
      : state.clues.length >= 3
        ? 'bittersweet'
        : 'mysterious';

    const endingTitle =
      endingType === 'triumphant'
        ? `Dawn Over ${nextLocation}`
        : endingType === 'bittersweet'
          ? 'Truth Bought at Quiet Cost'
          : 'Unfinished Echoes';

    return {
      story_id: state.storyId,
      chapter_number: chapterNumber,
      scene_number: nextSceneNumber,
      scene_title: `Finale: ${endingTitle}`,
      narrative: [
        `${isCustomAction ? `Choosing your own path—"${actionLabel}"—` : `Following your decision to "${actionLabel}", `}${formatPerspective(
          state.customization.pov,
          hero,
          `you bring every thread gathered across ${state.decisionHistory.length} pivotal moments into the open inside ${nextLocation}.`,
          `brings every thread gathered across ${state.decisionHistory.length} pivotal moments into the open inside ${nextLocation}.`,
        )}`,
        trustworthyAlly
          ? `${primaryChar.name} steps beside you without hesitation, backing up the ${state.clues.length} clues you uncovered. With ${secondaryChar.name}'s motives laid bare, the crisis settles into a hard-won resolution.`
          : `Though ${primaryChar.name} keeps a guarded distance after earlier friction, the evidence you assembled forces the truth to surface. As morning breaks beyond ${nextLocation}, you walk out knowing every consequence bears your mark.`,
      ],
      dialogue: [
        {
          speaker: primaryChar.name,
          line: trustworthyAlly
            ? `"You earned my trust back when it mattered, ${hero}. Nobody can rewrite what we proved tonight."`
            : `"You played a dangerous hand, ${hero}. It ended the standoff—even if some questions will outlive us both."`,
          emotion: trustworthyAlly ? 'Resolute' : 'Reflective',
        },
      ],
      current_location: nextLocation,
      current_circumstances: `All active threads in ${state.title} converged at ${nextLocation}.`,
      what_character_knows: [
        ...state.clues.slice(-3).map((c) => `${c.title} confirmed`),
        `The central mystery in ${state.title} reached resolution.`,
      ],
      characters_present: [primaryChar.name, secondaryChar.name],
      events: [`Resolved the core conflict of ${state.title} at ${nextLocation}.`],
      new_clues: [],
      new_objects: [],
      consequences: [
        `Concluded after ${nextSceneNumber} scenes shaped by ${state.decisionHistory.length + 1} choices.`,
      ],
      current_objective: 'Story concluded — compare branches or replay from any turning point.',
      available_decisions: [],
      story_state_updates: {
        character_updates: [
          {
            name: primaryChar.name,
            trust_delta: trustworthyAlly ? 10 : 0,
            reaction: 'Acknowledges the outcome of your final move.',
            reveal_secret: true,
          },
        ],
        resolved_mysteries: state.unresolvedMysteries.slice(0, 2),
      },
      is_ending: true,
      ending_type: endingType,
      ending_title: endingTitle,
    };
  }

  // Analyze user choice / custom action intent to produce meaningfully divergent outcomes
  const isHideOrStealth = /\b(hide|conceal|secret|quiet|observe|pretend|sneak|slip|pocket)\b/i.test(
    lowerAction,
  );
  const isConfrontOrPress = /\b(confront|accuse|demand|question|ask|interrogate|press|bluff|expose)\b/i.test(
    lowerAction,
  );
  const isAllyOrHelp = /\b(help|trust|ally|share|protect|rescue|save|assist|cooperate|warn)\b/i.test(
    lowerAction,
  );
  const isInvestigate = /\b(inspect|examine|search|investigate|photograph|read|decode|open|unlock|check)\b/i.test(
    lowerAction,
  );

  let trustDeltaA = 4;
  let trustDeltaB = -3;
  let consequenceLine = `Your action ("${actionLabel}") shifted the balance inside ${nextLocation}.`;
  let sceneHeadline = `Consequences in ${nextLocation}`;
  let narrativeBeat1 = '';
  let narrativeBeat2 = '';
  let dialogueLine = '';
  let dialogueEmotion = 'Alert';
  let newClue: { title: string; description: string } | null = null;
  let newObject: { name: string; description: string } | null = null;
  let revealSecret = false;

  const cluePool = [
    ...template.clueSeeds,
    {
      title: 'Torn Margin Note',
      description: `Handwritten coordinates connecting ${secondaryChar.name} to ${nextLocation}.`,
    },
    {
      title: 'Unlogged Access Stamp',
      description: `An off-hours entry log tied directly to ${nextLocation}.`,
    },
    {
      title: 'Whispered Alias',
      description: `${primaryChar.name} reacted noticeably when an unfamiliar alias surfaced.`,
    },
    {
      title: 'Tampered Seal Fragment',
      description: `A broken wax or digital seal proving someone reached ${nextLocation} first.`,
    },
    {
      title: 'Conflicting Timeline Entry',
      description: `Timestamps inside ${nextLocation} contradict the official account.`,
    },
  ];
  const rotatedClue = cluePool[(nextSceneNumber - 1) % cluePool.length];
  const sceneHeadlines = [
    `Shadows Over ${nextLocation}`,
    `Crossroads at ${nextLocation}`,
    `Quiet Shift Inside ${nextLocation}`,
    `Fractured Trust in ${nextLocation}`,
    `Hidden Ledger at ${nextLocation}`,
    `Echoes Beneath ${nextLocation}`,
    `Convergence at ${nextLocation}`,
    `Closing Circle in ${nextLocation}`,
  ];

  if (isHideOrStealth) {
    trustDeltaA = -6;
    trustDeltaB = 5;
    sceneHeadline = `Unseen Maneuver at ${nextLocation}`;
    consequenceLine =
      'By concealing your discovery and acting covertly, you kept suspects off guard—though allies sense you are withholding facts.';
    narrativeBeat1 = `${isCustomAction ? `Acting with quiet calculation ("${actionLabel}"), ` : ''}${formatPerspective(
      state.customization.pov,
      hero,
      `you keep your composure carefully masked as you move through ${nextLocation}. ${primaryChar.name} scans the room without realizing what you noticed seconds ago.`,
      `keeps every expression carefully masked inside ${nextLocation}, leaving ${primaryChar.name} unsure of what was just discovered.`,
    )}`;
    narrativeBeat2 = `From your vantage point, you catch ${secondaryChar.name} exchanging a terse hand signal toward the service door—confirming someone inside ${nextLocation} knows far more than the official log admits.`;
    dialogueLine = `"Funny," ${primaryChar.name} murmurs, eyeing your coat pocket. "You suddenly look like someone who found something worth keeping to yourself."`;
    dialogueEmotion = 'Suspicious';
    newClue = {
      title: 'Covert Hand Signal',
      description: `${secondaryChar.name} signaled an accomplice inside ${nextLocation} while unaware you were watching.`,
    };
  } else if (isConfrontOrPress) {
    trustDeltaA = -4;
    trustDeltaB = -8;
    revealSecret = nextSceneNumber >= 4 && !primaryChar.secretRevealed;
    sceneHeadline = `Cross-Examination at ${nextLocation}`;
    consequenceLine = revealSecret
      ? `${primaryChar.name} cracked under pressure and let slip a concealed truth.`
      : `Pressing the issue forced ${secondaryChar.name} onto the defensive inside ${nextLocation}.`;
    narrativeBeat1 = `${formatPerspective(
      state.customization.pov,
      hero,
      `You step directly into ${primaryChar.name}'s path at ${nextLocation}, laying down the implications of "${actionLabel}" before anyone can rehearse an excuse.`,
      `steps directly into ${primaryChar.name}'s path at ${nextLocation}, pressing the implications of "${actionLabel}".`,
    )}`;
    narrativeBeat2 = revealSecret
      ? `Silence stretches across ${nextLocation}. At last ${primaryChar.name} exhales sharply: "${primaryChar.secret}" The admission reframes everything that happened since Scene 1.`
      : `${secondaryChar.name} tightens their grip on a leather case and steps toward the threshold, dropping a folded receipt in haste.`;
    dialogueLine = revealSecret
      ? `"Alright—stop pressing and listen. ${primaryChar.secret} Keep your voice down before ${secondaryChar.name} hears."`
      : `"Careful with accusations in ${nextLocation}, ${hero}. Ask the wrong question here and doors start locking from the outside."`;
    dialogueEmotion = revealSecret ? 'Shaken' : 'Defensive';
    newClue = {
      title: revealSecret
        ? `${primaryChar.name}'s Confession`
        : 'Dropped Transfer Receipt',
      description: revealSecret
        ? primaryChar.secret
        : `Timestamped transfer slip linking ${secondaryChar.name} to ${nextLocation}.`,
    };
  } else if (isAllyOrHelp) {
    trustDeltaA = 14;
    trustDeltaB = 4;
    sceneHeadline = `Fragile Alliance in ${nextLocation}`;
    consequenceLine = `${primaryChar.name} remembers your willingness to extend trust when pressure spiked.`;
    narrativeBeat1 = `${formatPerspective(
      state.customization.pov,
      hero,
      `You choose solidarity over suspicion ("${actionLabel}"). Inside ${nextLocation}, ${primaryChar.name}'s posture softens as the immediate tension eases.`,
      `chooses solidarity over suspicion ("${actionLabel}"), easing ${primaryChar.name}'s guarded posture inside ${nextLocation}.`,
    )}`;
    narrativeBeat2 = `In return, ${primaryChar.name} slides a small safeguard across to you—something meant only for someone who would not abandon them when the next turn hits.`;
    dialogueLine = `"I won't forget you backed me up here, ${hero}. When the next crisis hits, look my way first."`;
    dialogueEmotion = 'Grateful';
    newObject =
      state.inventory.length < 4
        ? {
            name: `${primaryChar.name.split(' ')[0]}'s Passkey`,
            description: `Trusted access token shared by ${primaryChar.name} in Scene ${nextSceneNumber}.`,
          }
        : null;
  } else if (isInvestigate) {
    trustDeltaA = 5;
    sceneHeadline = `Discovery Beneath ${nextLocation}`;
    consequenceLine = `Careful inspection uncovered concrete evidence hidden inside ${nextLocation}.`;
    narrativeBeat1 = `${formatPerspective(
      state.customization.pov,
      hero,
      `Focusing cleanly on the physical facts ("${actionLabel}"), you inspect every seam and margin inside ${nextLocation}.`,
      `focuses cleanly on the physical facts ("${actionLabel}"), inspecting every seam and margin inside ${nextLocation}.`,
    )}`;
    const clueTitle = rotatedClue.title;
    const clueDesc = rotatedClue.description;
    narrativeBeat2 = `Beneath a false liner near the corner fixture, your fingers catch on ${clueTitle.toLowerCase()}—proving the timeline you were given earlier was deliberately staged.`;
    dialogueLine = `"Wait—how did you spot that?" ${primaryChar.name} leans closer, reading the markings over your shoulder.`;
    dialogueEmotion = 'Intrigued';
    newClue = { title: clueTitle, description: clueDesc };
  } else {
    sceneHeadline = sceneHeadlines[(nextSceneNumber - 1) % sceneHeadlines.length];
    consequenceLine = `Your move ("${actionLabel}") propelled the story into ${nextLocation} with higher stakes.`;
    narrativeBeat1 = `${formatPerspective(
      state.customization.pov,
      hero,
      `Moving deliberately on "${actionLabel}", you reshape the momentum around ${nextLocation}.`,
      `moves deliberately on "${actionLabel}", reshaping momentum around ${nextLocation}.`,
    )}`;
    narrativeBeat2 = `A sudden commotion along the side corridor forces both ${primaryChar.name} and ${secondaryChar.name} to react at once—opening a brief window before the situation locks down.`;
    dialogueLine = `"The clock just sped up, ${hero}," ${primaryChar.name} warns. "Whatever your next play is, commit to it now."`;
    dialogueEmotion = 'Urgent';
    newClue = {
      title: rotatedClue.title,
      description: rotatedClue.description,
    };
  }

  // Generate 4 contextual decisions anchored to current location, characters, clues, and depth
  const nextAltLocation = locations[(locationIndex + 1) % locations.length];
  const latestClueTitle = newClue?.title ?? state.clues[state.clues.length - 1]?.title ?? 'the latest lead';
  const heldItem = state.inventory.find((i) => i.status === 'held')?.name;
  const moveVerbs = ['Trace', 'Cross-check', 'Pursue', 'Investigate'];
  const leadVerb = moveVerbs[nextSceneNumber % moveVerbs.length];

  const decisions: StoryDecisionOption[] = [
    {
      id: `dec-${nextSceneNumber}-a`,
      label: `${leadVerb} ${latestClueTitle} inside ${nextAltLocation}`,
      consequenceHint: 'Push the central thread forward into a new location.',
      intentTag: 'investigate',
      riskLevel: 'medium',
    },
    {
      id: `dec-${nextSceneNumber}-b`,
      label: `Press ${secondaryChar.name} about their connection to ${latestClueTitle}`,
      consequenceHint: 'Force an uncomfortable truth out into the open.',
      intentTag: 'confront',
      riskLevel: 'high',
    },
    {
      id: `dec-${nextSceneNumber}-c`,
      label:
        primaryChar.trustScore >= 20
          ? `Coordinate a joint plan with ${primaryChar.name} using your shared trust`
          : `Offer ${primaryChar.name} an honest truce to combine what you both know`,
      consequenceHint: 'Strengthen your primary alliance before the stakes escalate.',
      intentTag: 'ally',
      riskLevel: 'low',
    },
    {
      id: `dec-${nextSceneNumber}-d`,
      label: heldItem
        ? `Use ${heldItem} quietly while watching ${nextLocation} from cover`
        : `Slip aside and monitor who approaches ${nextLocation} next`,
      consequenceHint: 'Maintain stealth and gather intelligence without alerting rivals.',
      intentTag: 'observe',
      riskLevel: 'low',
    },
  ];

  // Near target end, add a high-stakes resolution option so player controls ending timing
  if (nextSceneNumber >= range.minScenes) {
    decisions.push({
      id: `dec-${nextSceneNumber}-e`,
      label: `Execute a decisive endgame move to expose the truth and resolve ${state.title}`,
      consequenceHint: 'Steer the story toward a culminating climax.',
      intentTag: 'resolve',
      riskLevel: 'high',
    });
  }

  return {
    story_id: state.storyId,
    chapter_number: chapterNumber,
    scene_number: nextSceneNumber,
    scene_title: sceneHeadline,
    narrative: [narrativeBeat1, narrativeBeat2],
    dialogue: [
      {
        speaker: primaryChar.name,
        line: dialogueLine,
        emotion: dialogueEmotion,
      },
    ],
    current_location: nextLocation,
    current_circumstances: `Chapter ${chapterNumber}, Scene ${nextSceneNumber}: Inside ${nextLocation} with ${primaryChar.name} (${primaryChar.relationship}) following "${actionLabel.slice(0, 110)}".`,
    what_character_knows: [
      `Active lead: ${latestClueTitle}.`,
      `${primaryChar.name} currently regards you as ${primaryChar.relationship} (trust ${primaryChar.trustScore + trustDeltaA}).`,
      `Chapter ${chapterNumber} of ~${range.chapters} (${state.customization.length} campaign).`,
    ],
    characters_present: [primaryChar.name, secondaryChar.name],
    events: [consequenceLine],
    new_clues: newClue ? [newClue] : [],
    new_objects: newObject ? [newObject] : [],
    consequences: [consequenceLine],
    current_objective:
      nextSceneNumber >= range.minScenes
        ? `Prepare your culminating move across ${nextAltLocation} and resolve ${state.title}.`
        : `Test ${latestClueTitle} and determine ${secondaryChar.name}'s real motive.`,
    available_decisions: decisions,
    story_state_updates: {
      character_updates: [
        {
          name: primaryChar.name,
          trust_delta: trustDeltaA,
          reaction: dialogueEmotion === 'Grateful' ? 'Appreciates your loyalty.' : 'Reacts directly to your choice.',
          reveal_secret: revealSecret,
        },
        {
          name: secondaryChar.name,
          trust_delta: trustDeltaB,
          reaction: 'Adjusts strategy in response to your movement.',
        },
      ],
      new_mysteries:
        nextSceneNumber % 4 === 0
          ? [`Who controls the unseen access route beyond ${nextAltLocation}?`]
          : [],
    },
    is_ending: false,
  };
}

const RANDOM_PROTAGONISTS = [
  { name: 'Clara Rowan', personality: 'Analytical & Skeptical', bg: 'Former archival investigator with sharp recall.' },
  { name: 'Julian Mercer', personality: 'Empathetic & Observant', bg: 'Field specialist drawn into an unexpected conspiracy.' },
  { name: 'Nadia Chen', personality: 'Bold & Resourceful', bg: 'Telemetry officer trained for zero-margin emergencies.' },
  { name: 'Soren Halstead', personality: 'Cunning & Measured', bg: 'Diplomatic courier carrying an unsigned cipher.' },
  { name: 'Leila Mansour', personality: 'Curious & Tenacious', bg: 'Cartographer chasing a map erased from public records.' },
];

export function generateRandomStoryConfig(preferredGenreSlug?: string): StoryCustomizationConfig {
  const genre = preferredGenreSlug
    ? resolveGenreBySlugOrName(preferredGenreSlug)
    : DEMO_GENRES[Math.floor(Math.random() * DEMO_GENRES.length)];
  const hero = RANDOM_PROTAGONISTS[Math.floor(Math.random() * RANDOM_PROTAGONISTS.length)];
  const lengths: StoryCustomizationConfig['length'][] = ['Short', 'Medium', 'Long'];
  const difficulties: StoryCustomizationConfig['difficulty'][] = ['Casual', 'Balanced', 'Intricate'];
  const povs: StoryCustomizationConfig['pov'][] = ['First-person', 'Third-person'];

  return {
    genreSlug: genre.slug,
    genreName: genre.name,
    title: `${genre.name}: The ${genre.template?.locationSeeds[0].split(' ')[0] ?? 'Midnight'} Divergence`,
    topicOrPremise: genre.template?.starterHook ?? genre.description,
    mainCharacterName: hero.name,
    characterPersonality: hero.personality,
    characterBackground: hero.bg,
    difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
    length: lengths[1], // Default to Medium (~10-14 scenes)
    pov: povs[Math.floor(Math.random() * povs.length)],
    atmosphere: genre.template?.defaultAtmosphere ?? 'Cinematic',
    settingType:
      genre.category === 'Speculative' || genre.category === 'Fantasy & Myth'
        ? 'Imaginative'
        : 'Realistic',
  };
}
