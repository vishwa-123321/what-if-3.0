import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Eye, Sparkles, Wind } from 'lucide-react';
import { AnimatedCharacterAvatar } from './AnimatedCharacterAvatar';

interface AnimatedSceneStageProps {
  sceneImage: string;
  sceneTitle: string;
  location: string;
  atmosphereMood: string;
  genreSlug: string;
  activeSpeaker?: { speaker: string; emotion?: string };
  whatYouKnow: string[];
  motionEnabled: boolean;
  onToggleMotion: () => void;
  showVisualDetails: boolean;
  onToggleDetails: () => void;
}

type EffectMode = 'rain' | 'embers' | 'warp' | 'runes';

function resolveEffectMode(genreSlug: string, mood: string): EffectMode {
  const key = `${genreSlug} ${mood}`.toLowerCase();
  if (
    key.includes('sci') ||
    key.includes('space') ||
    key.includes('time') ||
    key.includes('cyber')
  ) {
    return 'warp';
  }
  if (
    key.includes('mystery') ||
    key.includes('noir') ||
    key.includes('crime') ||
    key.includes('detective') ||
    key.includes('thriller')
  ) {
    return 'rain';
  }
  if (
    key.includes('horror') ||
    key.includes('survival') ||
    key.includes('action') ||
    key.includes('apocalyptic')
  ) {
    return 'embers';
  }
  return 'runes';
}

export function AnimatedSceneStage({
  sceneImage,
  sceneTitle,
  location,
  atmosphereMood,
  genreSlug,
  activeSpeaker,
  whatYouKnow,
  motionEnabled,
  onToggleMotion,
  showVisualDetails,
  onToggleDetails,
}: AnimatedSceneStageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const effectMode = resolveEffectMode(genreSlug, atmosphereMood);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!motionEnabled || reducedMotion) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const width = 480;
    const height = 300;
    canvas.width = width;
    canvas.height = height;

    const particles = Array.from({ length: 34 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 0.6 + Math.random() * 1.8,
      size: 1.2 + Math.random() * 2.5,
      phase: i * 0.7,
    }));

    let rafId = 0;
    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        if (effectMode === 'rain') {
          p.y += p.speed * 3.1;
          p.x -= p.speed * 0.7;
          if (p.y > height) {
            p.y = -12;
            p.x = Math.random() * (width + 40);
          }
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 4, p.y + 14);
          ctx.strokeStyle = 'rgba(186, 230, 253, 0.36)';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (effectMode === 'embers') {
          p.y -= p.speed * 0.9;
          p.x += Math.sin(time * 0.002 + p.phase) * 0.6;
          if (p.y < -8) {
            p.y = height + 8;
            p.x = Math.random() * width;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(251, 146, 60, ${0.35 + 0.35 * Math.sin(time * 0.004 + p.phase)})`;
          ctx.fill();
        } else if (effectMode === 'warp') {
          p.x += p.speed * 2.4;
          if (p.x > width + 20) {
            p.x = -20;
            p.y = Math.random() * height;
          }
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 16 * p.speed, p.y);
          ctx.strokeStyle = 'rgba(125, 211, 252, 0.42)';
          ctx.lineWidth = 1.4;
          ctx.stroke();
        } else {
          // Enchanted floating fireflies / arcane motes
          p.y -= p.speed * 0.45;
          p.x += Math.cos(time * 0.0015 + p.phase) * 0.5;
          if (p.y < -8) {
            p.y = height + 8;
            p.x = Math.random() * width;
          }
          const glow = 0.35 + 0.45 * Math.sin(time * 0.003 + p.phase);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.15, 0, Math.PI * 2);
          ctx.fillStyle =
            p.phase % 2 > 1
              ? `rgba(253, 224, 71, ${glow})`
              : `rgba(167, 139, 250, ${glow})`;
          ctx.fill();
        }
      }

      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(rafId);
  }, [effectMode, motionEnabled]);

  return (
    <div className="glass-panel-elevated overflow-hidden rounded-2xl border-indigo-400/20">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#060916]">
        <motion.img
          key={sceneImage + sceneTitle}
          initial={motionEnabled ? { opacity: 0.72, scale: 1.04 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55 }}
          src={sceneImage}
          alt={`${sceneTitle} animated visual novel stage`}
          referrerPolicy="no-referrer"
          className={`h-full w-full object-cover ${
            motionEnabled ? 'scene-motion-active' : ''
          }`}
        />

        {/* Genre-reactive live particle overlay */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050711]/95 via-[#050711]/25 to-transparent"
        />

        {/* Active animated character portrait cut-in (Visual Novel style) */}
        {activeSpeaker && (
          <motion.div
            key={activeSpeaker.speaker}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute top-3 right-3 flex items-center gap-2 rounded-xl border border-indigo-400/35 bg-[#070B1E]/88 px-2.5 py-1.5 backdrop-blur-md"
          >
            <AnimatedCharacterAvatar
              name={activeSpeaker.speaker}
              emotion={activeSpeaker.emotion}
              size="sm"
              speaking
            />
            <div className="pr-1">
              <p className="text-[11px] font-semibold text-amber-200">
                {activeSpeaker.speaker}
              </p>
              <p className="text-[10px] text-indigo-200/90">
                {activeSpeaker.emotion ?? 'Speaking'}
              </p>
            </div>
          </motion.div>
        )}

        <div className="absolute right-4 bottom-3 left-4 flex items-end justify-between gap-2">
          <div>
            <p className="inline-flex items-center gap-1 font-mono-tabular text-[10px] font-semibold tracking-wider text-amber-300 uppercase">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              <span>{atmosphereMood} Animated Stage</span>
            </p>
            <p className="font-display text-base font-semibold text-slate-50">
              {location}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 bg-[#070B19]/90 px-4 py-2.5">
        <button
          type="button"
          onClick={onToggleDetails}
          aria-expanded={showVisualDetails}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-slate-200 hover:bg-white/10"
        >
          <Eye className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
          <span>{showVisualDetails ? 'Hide details' : 'Reveal details'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleMotion}
          aria-pressed={motionEnabled}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-slate-200 hover:bg-white/10"
        >
          <Wind className="h-3.5 w-3.5 text-indigo-300" aria-hidden="true" />
          <span>{motionEnabled ? 'Disable motion' : 'Enable motion'}</span>
        </button>
      </div>

      {showVisualDetails && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-white/8 bg-[#050711]/80 px-4 py-3 text-xs text-slate-300"
        >
          <p className="font-semibold text-amber-200">What You Currently Know</p>
          <ul className="mt-1.5 space-y-1">
            {whatYouKnow.map((fact, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-indigo-300">•</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
