export type StoryDifficulty = 'Casual' | 'Balanced' | 'Intricate';

export type StoryTone =
  | 'Cinematic'
  | 'Suspenseful'
  | 'Philosophical'
  | 'Poetic'
  | 'Gritty'
  | 'Hopeful';

export type StoryLength = 'Short' | 'Medium' | 'Long';

export type StoryPOV = 'First-person' | 'Third-person';

export type StorySettingType = 'Realistic' | 'Imaginative';

export type StoryAtmosphere =
  | 'Mysterious'
  | 'Suspenseful'
  | 'Noir'
  | 'Epic'
  | 'Eerie'
  | 'Intimate'
  | 'Cinematic'
  | 'Hopeful';

export type StoryArcStage =
  | 'Inciting Incident'
  | 'Rising Action'
  | 'Climax'
  | 'Resolution'
  | 'Aftermath';

export type StorySortOption = 'latest' | 'popular' | 'updated';

export type GenreCategory =
  | 'All'
  | 'Speculative'
  | 'Mystery & Noir'
  | 'Fantasy & Myth'
  | 'Drama & History';

export interface GenreTemplate {
  narrativeStyle: string;
  defaultAtmosphere: StoryAtmosphere;
  locationSeeds: string[];
  characterArchetypes: Array<{
    name: string;
    role: string;
    personality: string;
    background: string;
    motivation: string;
    secret: string;
    dialogueStyle: string;
  }>;
  eventPatterns: string[];
  decisionPatterns: string[];
  clueSeeds: Array<{ title: string; description: string }>;
  objectSeeds: Array<{ name: string; description: string }>;
  starterHook: string;
}

export interface Genre {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: Exclude<GenreCategory, 'All'>;
  coverImage: string;
  accentGradient: string;
  storyCount: number;
  template?: GenreTemplate;
  isDemo?: boolean;
}

export interface StoryChoice {
  id: string;
  label: string;
  consequenceHint: string;
  nextNodeId: string;
}

export interface StoryNode {
  id: string;
  chapterNumber: number;
  chapterTitle: string;
  sceneLabel: string;
  content: string[];
  isEnding: boolean;
  endingTitle?: string;
  endingType?: 'triumphant' | 'bittersweet' | 'mysterious' | 'tragic';
  choices: StoryChoice[];
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  author: string;
  genreId: string;
  genreSlug: string;
  genreName: string;
  coverImage: string;
  accentGradient: string;
  difficulty: StoryDifficulty;
  tone: StoryTone;
  estimatedMinutes: number;
  totalPaths: number;
  totalEndings: number;
  popularityScore: number;
  publishedAt: string;
  updatedAt: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isRecentlyAdded?: boolean;
  isDemo: boolean;
  startNodeId: string;
  nodes: Record<string, StoryNode>;
  defaultCustomization?: Partial<StoryCustomizationConfig>;
}

export interface StoryCustomizationConfig {
  genreSlug: string;
  genreName?: string;
  title: string;
  topicOrPremise: string;
  mainCharacterName: string;
  characterPersonality: string;
  characterBackground?: string;
  difficulty: StoryDifficulty;
  length: StoryLength;
  pov: StoryPOV;
  atmosphere: StoryAtmosphere;
  settingType: StorySettingType;
}

export interface StoryCharacter {
  id: string;
  name: string;
  role: string;
  personality: string;
  background: string;
  motivation: string;
  relationship: 'Ally' | 'Neutral' | 'Wary' | 'Distrustful' | 'Hostile' | 'Devoted';
  trustScore: number; // -100 to 100
  knowledge: string[];
  secret: string;
  secretRevealed: boolean;
  dialogueStyle: string;
  isPresent: boolean;
  lastReaction?: string;
}

export interface StoryClue {
  id: string;
  title: string;
  description: string;
  discoveredAtScene: number;
  chapterNumber: number;
  verified: boolean;
}

export interface StoryObject {
  id: string;
  name: string;
  description: string;
  acquiredAtScene: number;
  status: 'held' | 'used' | 'lost';
}

export interface StoryDecisionOption {
  id: string;
  label: string;
  consequenceHint: string;
  intentTag?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface StoryDialogueLine {
  speaker: string;
  line: string;
  emotion: string;
  isPlayer?: boolean;
}

export interface StoryDecisionRecord {
  sceneId: string;
  sceneNumber: number;
  chapterNumber: number;
  decisionId: string;
  decisionLabel: string;
  isCustomAction: boolean;
  consequenceSummary: string;
  timestamp: string;
}

export interface DynamicScene {
  id: string;
  parentSceneId: string | null;
  triggeredByDecisionLabel?: string;
  isCustomAction?: boolean;
  chapterNumber: number;
  sceneNumber: number;
  sceneTitle: string;
  genreName: string;
  location: string;
  narrativeParagraphs: string[];
  dialogue: StoryDialogueLine[];
  situationSummary: string;
  whatYouKnow: string[];
  charactersPresent: string[];
  events: string[];
  newClues: string[];
  newObjects: string[];
  consequences: string[];
  currentObjective: string;
  availableDecisions: StoryDecisionOption[];
  arcStage: StoryArcStage;
  sceneImage: string;
  atmosphereMood: string;
  isEnding: boolean;
  endingTitle?: string;
  endingType?: 'triumphant' | 'bittersweet' | 'mysterious' | 'tragic';
  createdAt: string;
}

export interface BranchTreeNode {
  sceneId: string;
  parentSceneId: string | null;
  chapterNumber: number;
  sceneNumber: number;
  title: string;
  decisionLabel: string;
  isCustomAction: boolean;
  isEnding: boolean;
  endingType?: 'triumphant' | 'bittersweet' | 'mysterious' | 'tragic';
  isCurrentPath: boolean;
}

export type StoryAISource = 'gemini' | 'supabase-edge' | 'local-engine';

export interface StoryState {
  storyId: string;
  storySlug: string;
  title: string;
  genreSlug: string;
  genreName: string;
  coverImage: string;
  accentGradient: string;
  customization: StoryCustomizationConfig;
  currentChapter: number;
  currentSceneNumber: number;
  currentSceneId: string;
  scenes: Record<string, DynamicScene>;
  activePathSceneIds: string[];
  branchNodes: Record<string, BranchTreeNode>;
  characters: StoryCharacter[];
  clues: StoryClue[];
  inventory: StoryObject[];
  unresolvedMysteries: string[];
  importantEvents: string[];
  previousConsequences: string[];
  currentLocation: string;
  currentObjective: string;
  currentCircumstances: string;
  decisionHistory: StoryDecisionRecord[];
  isEnding: boolean;
  endingTitle?: string;
  endingType?: 'triumphant' | 'bittersweet' | 'mysterious' | 'tragic';
  discoveredEndings: Array<{
    sceneId: string;
    title: string;
    type: 'triumphant' | 'bittersweet' | 'mysterious' | 'tragic';
    reachedAt: string;
  }>;
  progressPercent: number;
  aiSource: StoryAISource;
  updatedAt: string;
}

export interface AIContinuationPayload {
  story_id: string;
  chapter_number: number;
  scene_number: number;
  scene_title: string;
  narrative: string[];
  dialogue: StoryDialogueLine[];
  current_location: string;
  current_circumstances: string;
  what_character_knows: string[];
  characters_present: string[];
  events: string[];
  new_clues: Array<{ title: string; description: string }>;
  new_objects: Array<{ name: string; description: string }>;
  consequences: string[];
  current_objective: string;
  available_decisions: StoryDecisionOption[];
  story_state_updates: {
    character_updates?: Array<{
      name: string;
      role?: string;
      personality?: string;
      background?: string;
      motivation?: string;
      dialogue_style?: string;
      trust_delta?: number;
      reaction?: string;
      reveal_secret?: boolean;
      new_secret?: string;
    }>;
    resolved_mysteries?: string[];
    new_mysteries?: string[];
    used_objects?: string[];
  };
  is_ending: boolean;
  ending_type?: 'triumphant' | 'bittersweet' | 'mysterious' | 'tragic';
  ending_title?: string;
}

export interface ReadingProgress {
  storyId: string;
  currentNodeId: string;
  visitedNodeIds: string[];
  choicesMade: Array<{
    nodeId: string;
    choiceId: string;
    choiceLabel: string;
  }>;
  discoveredEndings: string[];
  completed: boolean;
  progressPercent: number;
  lastReadAt: string;
  isDemo: boolean;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  bio: string;
  favoriteGenreIds: string[];
  joinedAt: string;
  isDemo: boolean;
}

export interface StoryGenerationInput {
  genreSlug: string;
  title: string;
  scenario: string;
  tone: StoryTone;
  difficulty: StoryDifficulty;
  customization?: StoryCustomizationConfig;
}

export interface StoryGenerationConfig {
  functionName: string;
  endpointOverride?: string;
  payloadMapper?: (input: StoryGenerationInput) => Record<string, unknown>;
  responseMapper?: (raw: unknown, input: StoryGenerationInput) => Story;
}

export interface StoryGenerationResult {
  story: Story;
  initialState?: StoryState;
  source: 'supabase-edge' | 'gemini' | 'demo-simulator';
  message: string;
}
