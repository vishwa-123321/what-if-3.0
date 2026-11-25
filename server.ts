import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import type { StoryCustomizationConfig, StoryState } from './src/types/story.ts';
import { buildPromptContext, validateAIContinuationPayload } from './src/utils/storySchema.ts';

dotenv.config({ path: '.env.local' });
dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const CONTINUATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    story_id: { type: Type.STRING },
    chapter_number: { type: Type.INTEGER },
    scene_number: { type: Type.INTEGER },
    scene_title: { type: Type.STRING },
    narrative: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Two to three vivid, well-paced paragraphs of narrative prose.',
    },
    dialogue: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          speaker: { type: Type.STRING },
          line: { type: Type.STRING },
          emotion: { type: Type.STRING },
        },
      },
    },
    current_location: { type: Type.STRING },
    current_circumstances: { type: Type.STRING },
    what_character_knows: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    characters_present: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    events: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    new_clues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
        },
      },
    },
    new_objects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
        },
      },
    },
    consequences: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    current_objective: { type: Type.STRING },
    available_decisions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING },
          consequenceHint: { type: Type.STRING },
          riskLevel: { type: Type.STRING },
        },
      },
      description: '3 to 5 contextual decisions directly tied to current scene, clues, and characters.',
    },
    story_state_updates: {
      type: Type.OBJECT,
      properties: {
        character_updates: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              role: { type: Type.STRING },
              personality: { type: Type.STRING },
              background: { type: Type.STRING },
              motivation: { type: Type.STRING },
              dialogue_style: { type: Type.STRING },
              trust_delta: { type: Type.INTEGER },
              reaction: { type: Type.STRING },
              reveal_secret: { type: Type.BOOLEAN },
              new_secret: { type: Type.STRING },
            },
          },
        },
        resolved_mysteries: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        new_mysteries: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        used_objects: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    },
    is_ending: { type: Type.BOOLEAN },
    ending_type: { type: Type.STRING },
    ending_title: { type: Type.STRING },
  },
};

const SYSTEM_INSTRUCTION = `You are the WHAT IF 3.0 Interactive Story Architect.
You craft immersive, consequence-driven interactive fiction where every player decision reshapes characters, clues, locations, and future branches.

CRITICAL RULES:
1. NEVER end stories prematurely or cap stories at 3 decisions. Respect the target pacing (Short: 6-8 scenes, Medium: 11-14 scenes, Long: 18-24 scenes).
2. Always generate 3 to 5 context-aware decisions directly anchored to what is happening RIGHT NOW (never random unrelated questions).
3. Honor custom user actions faithfully. If an action is impossible or contradicts established facts in a Realistic setting, explain naturally inside the story narrative why it fails or triggers a complication, preserve continuity, and present grounded follow-up decisions.
4. Maintain strict continuity across characters (names, personalities, secrets, relationships), clues, inventory objects, locations, and prior consequences.
5. Do not reveal secrets prematurely; escalate tension across chapters cleanly.`;

const MODEL_CASCADE = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'] as const;

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${Math.round(timeoutMs / 1000)}s.`));
    }, timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function callGeminiStructured(
  ai: GoogleGenAI,
  prompt: string,
  fallbackMeta: { storyId: string; expectedChapter: number; expectedSceneNumber: number },
) {
  let lastError: Error | null = null;
  for (let i = 0; i < MODEL_CASCADE.length; i += 1) {
    const model = MODEL_CASCADE[i];
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents:
            i === 0
              ? prompt
              : `${prompt}\n\nIMPORTANT: Return strictly valid JSON matching the schema with non-empty narrative paragraphs and 3-5 available_decisions when is_ending is false.`,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: CONTINUATION_SCHEMA,
          },
        }),
        12000,
        `Gemini (${model})`,
      );
      const text = response.text ?? '';
      return validateAIContinuationPayload(text, fallbackMeta);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(`Gemini (${model}) generation failed.`);
    }
  }
  throw lastError ?? new Error('Failed to obtain valid structured response from Gemini.');
}

function isCapacityError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  return (
    msg.includes('503') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('high demand') ||
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('timed out')
  );
}

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    const ai = getGeminiClient();
    res.json({ ok: true, geminiConfigured: Boolean(ai) });
  });

  app.post('/api/story/start', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(200).json({
        payload: null,
        source: 'fallback-unconfigured',
        error: 'Gemini API key is not configured on the server.',
        code: 'GEMINI_NOT_CONFIGURED',
      });
      return;
    }

    const config = req.body?.config as StoryCustomizationConfig | undefined;
    if (!config || !config.title || !config.genreSlug) {
      res.status(400).json({ error: 'Valid story customization config is required.' });
      return;
    }

    const storyId = `ai-${Date.now().toString(36)}`;
    const prompt = `Generate Scene 1 (Chapter 1) for a brand-new interactive story.
Genre: ${config.genreName ?? config.genreSlug}
Title: ${config.title}
Premise / Topic: ${config.topicOrPremise}
Protagonist: ${config.mainCharacterName} (${config.characterPersonality})
Background: ${config.characterBackground || 'None specified'}
POV: ${config.pov}
Atmosphere: ${config.atmosphere}
Setting Realism: ${config.settingType}
Difficulty: ${config.difficulty}
Target Length: ${config.length}

Introduce the location, central conflict, at least 2 distinct supporting characters (with hidden secrets & motivations), 1 starting clue, 1 starting item, dialogue, and 4 contextual decisions. Set is_ending to false.`;

    try {
      const payload = await callGeminiStructured(ai, prompt, {
        storyId,
        expectedChapter: 1,
        expectedSceneNumber: 1,
      });
      res.json({ payload, source: 'gemini' });
    } catch (err) {
      const capacity = isCapacityError(err);
      if (capacity) {
        res.status(200).json({
          payload: null,
          source: 'fallback-capacity',
          error: err instanceof Error ? err.message : 'Gemini capacity limit reached.',
          code: 'GEMINI_HIGH_DEMAND',
        });
        return;
      }
      res.status(502).json({
        error: err instanceof Error ? err.message : 'Unable to start story via Gemini.',
        code: 'GEMINI_UPSTREAM_ERROR',
      });
    }
  });

  app.post('/api/story/continue', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(200).json({
        payload: null,
        source: 'fallback-unconfigured',
        error: 'Gemini API key is not configured on the server.',
        code: 'GEMINI_NOT_CONFIGURED',
      });
      return;
    }

    const state = req.body?.state as StoryState | undefined;
    const actionLabel = typeof req.body?.actionLabel === 'string' ? req.body.actionLabel.trim() : '';
    const isCustomAction = Boolean(req.body?.isCustomAction);
    const forceFinish = Boolean(req.body?.forceFinish);

    if (!state || !actionLabel) {
      res.status(400).json({ error: 'Story state and user action are required.' });
      return;
    }

    const context = buildPromptContext(state, actionLabel, isCustomAction);
    const nextSceneNumber = state.currentSceneNumber + 1;
    const prompt = `Continue the interactive story based on the structured state below.
${JSON.stringify(context, null, 2)}

${forceFinish ? 'The player chose to resolve the story now. Deliver a deeply satisfying, consequence-earned ending reflecting all tracked clues and character trust, and set is_ending: true.' : `Do NOT end prematurely unless pacingGuide.canConcludeNaturallyNow is true AND the user action clearly resolves the climax. Otherwise set is_ending: false and provide 3 to 5 contextual available_decisions tied directly to the new circumstances.`}
Generate Scene ${nextSceneNumber}.`;

    try {
      const payload = await callGeminiStructured(ai, prompt, {
        storyId: state.storyId,
        expectedChapter: state.currentChapter,
        expectedSceneNumber: nextSceneNumber,
      });
      res.json({ payload, source: 'gemini' });
    } catch (err) {
      const capacity = isCapacityError(err);
      if (capacity) {
        res.status(200).json({
          payload: null,
          source: 'fallback-capacity',
          error: err instanceof Error ? err.message : 'Gemini capacity limit reached.',
          code: 'GEMINI_HIGH_DEMAND',
        });
        return;
      }
      res.status(502).json({
        error: err instanceof Error ? err.message : 'Unable to generate next scene via Gemini.',
        code: 'GEMINI_UPSTREAM_ERROR',
      });
    }
  });

  if (IS_PROD) {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) {
        next();
        return;
      }
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let html = fs.readFileSync(indexPath, 'utf-8');
        html = await vite.transformIndexHtml(req.originalUrl, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (err) {
        vite.ssrFixStacktrace(err as Error);
        next(err);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WHAT IF 3.0 server running on http://localhost:${PORT}`);
  });
}

createApp();
