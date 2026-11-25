import type {
  AIContinuationPayload,
  StoryDecisionOption,
  StoryDialogueLine,
  StoryLength,
  StoryState,
} from '../types/story.ts';

export function getTargetSceneRange(length: StoryLength): {
  minScenes: number;
  targetScenes: number;
  maxScenes: number;
  chapters: number;
} {
  if (length === 'Short') {
    return { minScenes: 6, targetScenes: 8, maxScenes: 10, chapters: 3 };
  }
  if (length === 'Long') {
    return { minScenes: 16, targetScenes: 20, maxScenes: 28, chapters: 6 };
  }
  return { minScenes: 10, targetScenes: 13, maxScenes: 17, chapters: 4 };
}

function asStringArray(value: unknown, fallback: string[] = []): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }
  return fallback;
}

function normalizeDecisions(raw: unknown, sceneNumber: number): StoryDecisionOption[] {
  if (!Array.isArray(raw)) return [];
  const clean: StoryDecisionOption[] = [];
  for (let i = 0; i < raw.length; i += 1) {
    const item = raw[i];
    if (typeof item === 'string' && item.trim()) {
      clean.push({
        id: `dec-${sceneNumber}-${i + 1}`,
        label: item.trim(),
        consequenceHint: 'Advance along this line of action.',
        riskLevel: i === 0 ? 'medium' : i === 1 ? 'high' : 'low',
      });
    } else if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>;
      const label =
        typeof obj.label === 'string'
          ? obj.label.trim()
          : typeof obj.text === 'string'
            ? obj.text.trim()
            : '';
      if (!label) continue;
      const riskRaw = String(obj.riskLevel ?? obj.risk_level ?? 'medium').toLowerCase();
      const riskLevel: StoryDecisionOption['riskLevel'] =
        riskRaw === 'low' || riskRaw === 'high' ? riskRaw : 'medium';
      clean.push({
        id:
          typeof obj.id === 'string' && obj.id.trim()
            ? obj.id.trim()
            : `dec-${sceneNumber}-${i + 1}`,
        label,
        consequenceHint:
          typeof obj.consequenceHint === 'string' && obj.consequenceHint.trim()
            ? obj.consequenceHint.trim()
            : typeof obj.consequence_hint === 'string' && obj.consequence_hint.trim()
              ? obj.consequence_hint.trim()
              : 'Shape how the situation unfolds next.',
        intentTag:
          typeof obj.intentTag === 'string' ? obj.intentTag.trim() : undefined,
        riskLevel,
      });
    }
  }
  return clean.slice(0, 6);
}

function normalizeDialogue(raw: unknown): StoryDialogueLine[] {
  if (!Array.isArray(raw)) return [];
  const lines: StoryDialogueLine[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const obj = item as Record<string, unknown>;
    const speaker = typeof obj.speaker === 'string' ? obj.speaker.trim() : '';
    const line = typeof obj.line === 'string' ? obj.line.trim() : '';
    if (!speaker || !line) continue;
    lines.push({
      speaker,
      line,
      emotion: typeof obj.emotion === 'string' && obj.emotion.trim() ? obj.emotion.trim() : 'Measured',
      isPlayer: Boolean(obj.isPlayer),
    });
  }
  return lines.slice(0, 5);
}

export function validateAIContinuationPayload(
  raw: unknown,
  fallbackMeta?: {
    storyId: string;
    expectedChapter?: number;
    expectedSceneNumber?: number;
  },
): AIContinuationPayload {
  let parsed: unknown = raw;
  if (typeof raw === 'string') {
    const trimmed = raw
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '');
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error('Story engine returned malformed JSON data.');
    }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Story engine response was not a valid structured object.');
  }

  const obj = parsed as Record<string, unknown>;

  const narrative = asStringArray(obj.narrative);
  if (narrative.length === 0) {
    throw new Error('Story engine response is missing narrative prose.');
  }

  const sceneNumber =
    typeof obj.scene_number === 'number' && obj.scene_number >= 1
      ? Math.floor(obj.scene_number)
      : (fallbackMeta?.expectedSceneNumber ?? 1);

  const chapterNumber =
    typeof obj.chapter_number === 'number' && obj.chapter_number >= 1
      ? Math.floor(obj.chapter_number)
      : (fallbackMeta?.expectedChapter ?? 1);

  const sceneTitle =
    typeof obj.scene_title === 'string' && obj.scene_title.trim()
      ? obj.scene_title.trim()
      : `Scene ${sceneNumber}`;

  const currentLocation =
    typeof obj.current_location === 'string' && obj.current_location.trim()
      ? obj.current_location.trim()
      : 'Uncharted Location';

  const currentCircumstances =
    typeof obj.current_circumstances === 'string' && obj.current_circumstances.trim()
      ? obj.current_circumstances.trim()
      : narrative[0].slice(0, 180);

  const currentObjective =
    typeof obj.current_objective === 'string' && obj.current_objective.trim()
      ? obj.current_objective.trim()
      : 'Navigate the immediate crisis and uncover the truth.';

  const isEnding = Boolean(obj.is_ending);
  const availableDecisions = normalizeDecisions(obj.available_decisions, sceneNumber);

  if (!isEnding && availableDecisions.length < 3) {
    throw new Error(
      `Story engine returned ${availableDecisions.length} decisions; at least 3 contextual decisions are required for an active scene.`,
    );
  }

  const endingRaw = String(obj.ending_type ?? 'mysterious').toLowerCase();
  const endingType: AIContinuationPayload['ending_type'] =
    endingRaw === 'triumphant' ||
    endingRaw === 'bittersweet' ||
    endingRaw === 'tragic' ||
    endingRaw === 'mysterious'
      ? endingRaw
      : 'mysterious';

  const newClues = Array.isArray(obj.new_clues)
    ? obj.new_clues
        .filter((c): c is Record<string, unknown> => Boolean(c && typeof c === 'object'))
        .map((c) => ({
          title: String(c.title ?? '').trim(),
          description: String(c.description ?? '').trim(),
        }))
        .filter((c) => c.title.length > 0)
    : [];

  const newObjects = Array.isArray(obj.new_objects)
    ? obj.new_objects
        .filter((o): o is Record<string, unknown> => Boolean(o && typeof o === 'object'))
        .map((o) => ({
          name: String(o.name ?? '').trim(),
          description: String(o.description ?? '').trim(),
        }))
        .filter((o) => o.name.length > 0)
    : [];

  const rawUpdates =
    obj.story_state_updates && typeof obj.story_state_updates === 'object'
      ? (obj.story_state_updates as Record<string, unknown>)
      : {};

  const characterUpdates = Array.isArray(rawUpdates.character_updates)
    ? rawUpdates.character_updates
        .filter((cu): cu is Record<string, unknown> => Boolean(cu && typeof cu === 'object'))
        .map((cu) => ({
          name: String(cu.name ?? '').trim(),
          role: typeof cu.role === 'string' ? cu.role.trim() : undefined,
          personality: typeof cu.personality === 'string' ? cu.personality.trim() : undefined,
          background: typeof cu.background === 'string' ? cu.background.trim() : undefined,
          motivation: typeof cu.motivation === 'string' ? cu.motivation.trim() : undefined,
          dialogue_style:
            typeof cu.dialogue_style === 'string' ? cu.dialogue_style.trim() : undefined,
          trust_delta: typeof cu.trust_delta === 'number' ? cu.trust_delta : 0,
          reaction: typeof cu.reaction === 'string' ? cu.reaction.trim() : undefined,
          reveal_secret: Boolean(cu.reveal_secret),
          new_secret: typeof cu.new_secret === 'string' ? cu.new_secret.trim() : undefined,
        }))
        .filter((cu) => cu.name.length > 0)
    : [];

  return {
    story_id:
      typeof obj.story_id === 'string' && obj.story_id.trim()
        ? obj.story_id.trim()
        : (fallbackMeta?.storyId ?? 'story-session'),
    chapter_number: chapterNumber,
    scene_number: sceneNumber,
    scene_title: sceneTitle,
    narrative,
    dialogue: normalizeDialogue(obj.dialogue),
    current_location: currentLocation,
    current_circumstances: currentCircumstances,
    what_character_knows: asStringArray(obj.what_character_knows),
    characters_present: asStringArray(obj.characters_present),
    events: asStringArray(obj.events),
    new_clues: newClues,
    new_objects: newObjects,
    consequences: asStringArray(obj.consequences),
    current_objective: currentObjective,
    available_decisions: isEnding ? [] : availableDecisions,
    story_state_updates: {
      character_updates: characterUpdates,
      resolved_mysteries: asStringArray(rawUpdates.resolved_mysteries),
      new_mysteries: asStringArray(rawUpdates.new_mysteries),
      used_objects: asStringArray(rawUpdates.used_objects),
    },
    is_ending: isEnding,
    ending_type: isEnding ? endingType : undefined,
    ending_title:
      isEnding && typeof obj.ending_title === 'string' && obj.ending_title.trim()
        ? obj.ending_title.trim()
        : undefined,
  };
}

export function buildPromptContext(
  state: StoryState,
  userActionLabel: string,
  isCustomAction: boolean,
): Record<string, unknown> {
  const range = getTargetSceneRange(state.customization.length);
  const nextSceneNumber = state.currentSceneNumber + 1;
  const recentSceneIds = state.activePathSceneIds.slice(-3);
  const olderSceneIds = state.activePathSceneIds.slice(0, -3);

  const olderSummary = olderSceneIds
    .map((id) => {
      const s = state.scenes[id];
      return s
        ? `S${s.sceneNumber} (Ch.${s.chapterNumber} ${s.sceneTitle} @ ${s.location}): ${s.situationSummary}`
        : '';
    })
    .filter(Boolean);

  const recentScenes = recentSceneIds
    .map((id) => state.scenes[id])
    .filter(Boolean)
    .map((s) => ({
      sceneNumber: s.sceneNumber,
      chapterNumber: s.chapterNumber,
      sceneTitle: s.sceneTitle,
      location: s.location,
      triggeredByDecision: s.triggeredByDecisionLabel,
      narrative: s.narrativeParagraphs.join(' '),
      consequences: s.consequences,
    }));

  return {
    storyId: state.storyId,
    title: state.title,
    genre: state.genreName,
    customization: state.customization,
    nextSceneNumber,
    currentChapter: state.currentChapter,
    pacingGuide: {
      length: state.customization.length,
      minScenesBeforeNaturalEnding: range.minScenes,
      targetScenes: range.targetScenes,
      canConcludeNaturallyNow: nextSceneNumber >= range.minScenes,
    },
    protagonist: {
      name: state.customization.mainCharacterName,
      personality: state.customization.characterPersonality,
      background: state.customization.characterBackground ?? '',
    },
    memory: {
      currentLocation: state.currentLocation,
      currentObjective: state.currentObjective,
      currentCircumstances: state.currentCircumstances,
      characters: state.characters.map((c) => ({
        name: c.name,
        role: c.role,
        personality: c.personality,
        relationship: c.relationship,
        trustScore: c.trustScore,
        motivation: c.motivation,
        secretRevealed: c.secretRevealed,
        secret: c.secret,
        isPresent: c.isPresent,
      })),
      clues: state.clues.map((c) => `${c.title}: ${c.description}`),
      inventory: state.inventory.map((o) => `${o.name} (${o.status}): ${o.description}`),
      unresolvedMysteries: state.unresolvedMysteries,
      importantEvents: state.importantEvents.slice(-8),
      previousConsequences: state.previousConsequences.slice(-6),
      decisionHistory: state.decisionHistory.slice(-10).map((d) => d.decisionLabel),
    },
    olderSummary,
    recentScenes,
    userAction: {
      actionText: userActionLabel,
      isCustomAction,
    },
  };
}
