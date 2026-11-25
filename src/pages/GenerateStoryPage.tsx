import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Dices, Loader2, Play, Sparkles } from 'lucide-react';
import { ErrorState } from '../components/StateFeedback';
import { useLibrary } from '../hooks/useLibrary';
import {
  checkServerGeminiStatus,
  generateOpeningStoryState,
} from '../services/aiStoryService';
import {
  StoryAtmosphere,
  StoryCustomizationConfig,
  StoryDifficulty,
  StoryLength,
  StoryPOV,
  StorySettingType,
} from '../types';
import {
  generateRandomStoryConfig,
  resolveGenreBySlugOrName,
} from '../utils/storyEngine';

const ATMOSPHERES: StoryAtmosphere[] = [
  'Mysterious',
  'Suspenseful',
  'Noir',
  'Cinematic',
  'Epic',
  'Eerie',
  'Intimate',
  'Hopeful',
];

const DIFFICULTIES: StoryDifficulty[] = ['Casual', 'Balanced', 'Intricate'];
const LENGTHS: Array<{ value: StoryLength; label: string; hint: string }> = [
  { value: 'Short', label: 'Short', hint: '6–9 scenes' },
  { value: 'Medium', label: 'Medium', hint: '11–15 scenes' },
  { value: 'Long', label: 'Long', hint: '18–24+ scenes' },
];
const POVS: StoryPOV[] = ['First-person', 'Third-person'];
const SETTINGS: StorySettingType[] = ['Realistic', 'Imaginative'];

const PERSONALITIES = [
  'Analytical & Skeptical',
  'Bold & Impulsive',
  'Empathetic & Observant',
  'Cunning & Guarded',
  'Stoic & Disciplined',
];

export function GenerateStoryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { genres, addGeneratedStory } = useLibrary();

  const preselectedGenre = searchParams.get('genre');
  const initialGenre = resolveGenreBySlugOrName(
    preselectedGenre || genres[0]?.slug || 'mystery',
  );

  const [genreSlug, setGenreSlug] = useState(initialGenre.slug);
  const [title, setTitle] = useState('');
  const [topicOrPremise, setTopicOrPremise] = useState('');
  const [mainCharacterName, setMainCharacterName] = useState('Clara Rowan');
  const [characterPersonality, setCharacterPersonality] = useState(PERSONALITIES[0]);
  const [characterBackground, setCharacterBackground] = useState('');
  const [difficulty, setDifficulty] = useState<StoryDifficulty>('Balanced');
  const [length, setLength] = useState<StoryLength>('Medium');
  const [pov, setPov] = useState<StoryPOV>('First-person');
  const [atmosphere, setAtmosphere] = useState<StoryAtmosphere>(
    initialGenre.template?.defaultAtmosphere ?? 'Mysterious',
  );
  const [settingType, setSettingType] = useState<StorySettingType>('Realistic');

  const [geminiReady, setGeminiReady] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    void checkServerGeminiStatus().then(setGeminiReady);
  }, []);

  useEffect(() => {
    if (preselectedGenre) {
      const matched = resolveGenreBySlugOrName(preselectedGenre);
      setGenreSlug(matched.slug);
      if (matched.template) {
        setAtmosphere(matched.template.defaultAtmosphere);
      }
    }
  }, [preselectedGenre]);

  const activeGenre = resolveGenreBySlugOrName(genreSlug);

  const handleGenreSelect = (slug: string) => {
    const matched = resolveGenreBySlugOrName(slug);
    setGenreSlug(matched.slug);
    if (matched.template) {
      setAtmosphere(matched.template.defaultAtmosphere);
    }
    setSettingType(
      matched.category === 'Speculative' || matched.category === 'Fantasy & Myth'
        ? 'Imaginative'
        : 'Realistic',
    );
  };

  const handleRandomStory = () => {
    const random = generateRandomStoryConfig();
    setGenreSlug(random.genreSlug);
    setTitle(random.title);
    setTopicOrPremise(random.topicOrPremise);
    setMainCharacterName(random.mainCharacterName);
    setCharacterPersonality(random.characterPersonality);
    setCharacterBackground(random.characterBackground ?? '');
    setDifficulty(random.difficulty);
    setLength(random.length);
    setPov(random.pov);
    setAtmosphere(random.atmosphere);
    setSettingType(random.settingType);
    setValidationError(null);
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setApiError(null);

    if (title.trim().length < 3) {
      setValidationError('Please enter a story title of at least 3 characters (or click Random Story).');
      return;
    }
    if (topicOrPremise.trim().length < 12) {
      setValidationError(
        'Please describe your starting topic or scenario in at least 12 characters.',
      );
      return;
    }
    if (!mainCharacterName.trim()) {
      setValidationError('Please provide your main character’s name.');
      return;
    }

    const config: StoryCustomizationConfig = {
      genreSlug: activeGenre.slug,
      genreName: activeGenre.name,
      title: title.trim(),
      topicOrPremise: topicOrPremise.trim(),
      mainCharacterName: mainCharacterName.trim(),
      characterPersonality: characterPersonality.trim(),
      characterBackground: characterBackground.trim() || undefined,
      difficulty,
      length,
      pov,
      atmosphere,
      settingType,
    };

    setIsGenerating(true);
    try {
      const result = await generateOpeningStoryState(config);
      addGeneratedStory(result.story, result.initialState);
      navigate(`/read/${result.story.slug}`);
    } catch (err) {
      setApiError(
        err instanceof Error
          ? err.message
          : 'Unable to start story. Please check your connection and retry.',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartWithLocalEngine = async () => {
    setApiError(null);
    setIsGenerating(true);
    try {
      const config: StoryCustomizationConfig = {
        genreSlug: activeGenre.slug,
        genreName: activeGenre.name,
        title: title.trim(),
        topicOrPremise: topicOrPremise.trim(),
        mainCharacterName: mainCharacterName.trim(),
        characterPersonality: characterPersonality.trim(),
        characterBackground: characterBackground.trim() || undefined,
        difficulty,
        length,
        pov,
        atmosphere,
        settingType,
      };
      const result = await generateOpeningStoryState(config, { preferLocalFallback: true });
      addGeneratedStory(result.story, result.initialState);
      navigate(`/read/${result.story.slug}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-amber-300 uppercase">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Story Customization Studio</span>
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold text-slate-50 sm:text-4xl">
            Forge Your Interactive Universe
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
            Configure your protagonist, genre rules, narrative perspective, and story length.
            {geminiReady === true
              ? ' Connected to server-side Gemini AI for continuous scene generation.'
              : ' Powered by the dynamic WHAT IF 3.0 continuous story engine.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRandomStory}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-300/35 bg-amber-400/10 px-4 py-2.5 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-400/20"
        >
          <Dices className="h-4 w-4" aria-hidden="true" />
          <span>Random Story</span>
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="glass-panel-elevated mt-8 space-y-8 rounded-2xl p-6 sm:p-8"
      >
        {validationError && (
          <div
            role="alert"
            className="rounded-xl border border-rose-400/35 bg-rose-950/40 px-4 py-3 text-sm text-rose-200"
          >
            {validationError}
          </div>
        )}

        {apiError && (
          <div className="space-y-3">
            <ErrorState description={apiError} />
            <button
              type="button"
              onClick={() => void handleStartWithLocalEngine()}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300/35 bg-amber-400/15 px-4 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-400/25"
            >
              Launch with Interactive Story Engine
            </button>
          </div>
        )}

        {/* Genre Selection + Template Preview */}
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <label
              htmlFor="studio-genre"
              className="block text-sm font-medium text-slate-200"
            >
              Genre (20 Interactive Worlds)
            </label>
            <select
              id="studio-genre"
              value={genreSlug}
              onChange={(e) => handleGenreSelect(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/12 bg-[#070B19] px-3.5 py-3 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
            >
              {genres.map((genre) => (
                <option key={genre.id} value={genre.slug}>
                  {genre.name} ({genre.category})
                </option>
              ))}
            </select>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['mystery', 'fantasy', 'science-fiction', 'thriller', 'survival', 'time-travel'].map(
                (quickSlug) => {
                  const g = resolveGenreBySlugOrName(quickSlug);
                  const active = genreSlug === g.slug;
                  return (
                    <button
                      key={quickSlug}
                      type="button"
                      onClick={() => handleGenreSelect(g.slug)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                        active
                          ? 'border-indigo-400/50 bg-indigo-600/25 text-amber-200'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {g.name}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          <div className="rounded-xl border border-indigo-400/20 bg-[#070B19]/90 p-4 lg:col-span-5">
            <p className="font-mono-tabular text-[11px] font-semibold text-amber-300 uppercase">
              {activeGenre.name} Narrative Style
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
              {activeGenre.template?.narrativeStyle ?? activeGenre.description}
            </p>
            <button
              type="button"
              onClick={() => {
                if (!title) setTitle(`${activeGenre.name}: Echoes at Midnight`);
                if (!topicOrPremise) {
                  setTopicOrPremise(
                    activeGenre.template?.starterHook ?? activeGenre.description,
                  );
                }
              }}
              className="mt-3 text-xs font-medium text-indigo-300 transition-colors hover:text-amber-200"
            >
              Use {activeGenre.name} starter hook →
            </button>
          </div>
        </div>

        {/* Title + Topic/Premise */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="studio-title"
              className="block text-sm font-medium text-slate-200"
            >
              Story Title
            </label>
            <input
              id="studio-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Vanishing in Compartment Seven"
              className="mt-2 w-full rounded-xl border border-white/12 bg-[#070B19] px-3.5 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="studio-character"
              className="block text-sm font-medium text-slate-200"
            >
              Main Character Name
            </label>
            <input
              id="studio-character"
              type="text"
              value={mainCharacterName}
              onChange={(e) => setMainCharacterName(e.target.value)}
              placeholder="e.g., Clara Rowan"
              className="mt-2 w-full rounded-xl border border-white/12 bg-[#070B19] px-3.5 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="studio-premise"
            className="block text-sm font-medium text-slate-200"
          >
            Custom Topic or Starting Situation
          </label>
          <textarea
            id="studio-premise"
            rows={3}
            value={topicOrPremise}
            onChange={(e) => setTopicOrPremise(e.target.value)}
            placeholder="Describe where the story opens, the first mystery or conflict, and what is at stake..."
            className="mt-2 w-full rounded-xl border border-white/12 bg-[#070B19] px-3.5 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          />
        </div>

        {/* Character Personality & Background */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="studio-personality"
              className="block text-sm font-medium text-slate-200"
            >
              Character Personality
            </label>
            <select
              id="studio-personality"
              value={characterPersonality}
              onChange={(e) => setCharacterPersonality(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/12 bg-[#070B19] px-3.5 py-3 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
            >
              {PERSONALITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="studio-background"
              className="block text-sm font-medium text-slate-200"
            >
              Character Background <span className="text-slate-400">(Optional)</span>
            </label>
            <input
              id="studio-background"
              type="text"
              value={characterBackground}
              onChange={(e) => setCharacterBackground(e.target.value)}
              placeholder="e.g., Ex-archivist returning after five years abroad"
              className="mt-2 w-full rounded-xl border border-white/12 bg-[#070B19] px-3.5 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Length, Difficulty, POV, Atmosphere, Setting */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <span className="block text-sm font-medium text-slate-200">
              Story Length (Continuous Multi-Chapter Arc)
            </span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {LENGTHS.map((opt) => {
                const active = length === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLength(opt.value)}
                    aria-pressed={active}
                    className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                      active
                        ? 'border-indigo-400/60 bg-indigo-600/25 text-white'
                        : 'border-white/10 bg-[#070B19] text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className="mt-0.5 text-[11px] text-slate-400">{opt.hint}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-200">
              Story Difficulty
            </span>
            <div className="mt-2 grid grid-cols-3 gap-2 rounded-xl border border-white/12 bg-[#070B19] p-1">
              {DIFFICULTIES.map((level) => {
                const active = difficulty === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    aria-pressed={active}
                    className={`rounded-lg py-2.5 text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <span className="block text-sm font-medium text-slate-200">
              Narration POV
            </span>
            <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-white/12 bg-[#070B19] p-1">
              {POVS.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPov(mode)}
                  aria-pressed={pov === mode}
                  className={`rounded-lg py-2 text-xs font-medium transition-colors ${
                    pov === mode
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="studio-atmosphere"
              className="block text-sm font-medium text-slate-200"
            >
              Story Atmosphere
            </label>
            <select
              id="studio-atmosphere"
              value={atmosphere}
              onChange={(e) => setAtmosphere(e.target.value as StoryAtmosphere)}
              className="mt-2 w-full rounded-xl border border-white/12 bg-[#070B19] px-3.5 py-2.5 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
            >
              {ATMOSPHERES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-200">
              World Setting
            </span>
            <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-white/12 bg-[#070B19] p-1">
              {SETTINGS.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSettingType(mode)}
                  aria-pressed={settingType === mode}
                  className={`rounded-lg py-2 text-xs font-medium transition-colors ${
                    settingType === mode
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="text-xs text-slate-400">
            Includes contextual choices (3–6 per scene), custom free-text actions, and live character memory.
          </p>

          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/50 transition-opacity hover:opacity-95 disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Launching Opening Scene...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                <span>Begin Adventure</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
