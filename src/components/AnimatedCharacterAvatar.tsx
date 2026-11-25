import { motion } from 'motion/react';

interface AnimatedCharacterAvatarProps {
  name: string;
  emotion?: string;
  trustScore?: number;
  size?: 'sm' | 'md' | 'lg';
  speaking?: boolean;
}

const PALETTES = [
  { bg: 'from-indigo-600/35 to-violet-700/40', ring: 'border-indigo-400/60', stroke: '#a5b4fc', accent: '#fbbf24' },
  { bg: 'from-violet-600/35 to-fuchsia-700/35', ring: 'border-violet-400/60', stroke: '#ddd6fe', accent: '#38bdf8' },
  { bg: 'from-amber-500/30 to-orange-700/35', ring: 'border-amber-300/60', stroke: '#fde68a', accent: '#818cf8' },
  { bg: 'from-cyan-500/30 to-indigo-700/35', ring: 'border-cyan-300/60', stroke: '#a5f3fc', accent: '#f472b6' },
];

function getPaletteForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 997;
  }
  return PALETTES[hash % PALETTES.length];
}

export function AnimatedCharacterAvatar({
  name,
  emotion,
  trustScore,
  size = 'md',
  speaking = false,
}: AnimatedCharacterAvatarProps) {
  const palette = getPaletteForName(name || 'Character');
  const lowerEmotion = (emotion ?? '').toLowerCase();

  const auraClass =
    lowerEmotion.includes('suspicious') || lowerEmotion.includes('defensive') || (trustScore ?? 0) <= -20
      ? 'border-rose-400/65 shadow-rose-500/25'
      : lowerEmotion.includes('grateful') || lowerEmotion.includes('resolute') || (trustScore ?? 0) >= 20
        ? 'border-emerald-400/65 shadow-emerald-500/25'
        : `${palette.ring} shadow-indigo-500/25`;

  const sizeClass =
    size === 'lg' ? 'h-14 w-14' : size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';

  // Stylized anime character silhouette SVG (hooded/collared anime profile + luminous eyes, zero photo realism)
  return (
    <motion.div
      initial={speaking ? { scale: 0.92, opacity: 0.7 } : false}
      animate={speaking ? { scale: [1, 1.04, 1], opacity: 1 } : { opacity: 1 }}
      transition={{ duration: 0.45 }}
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 bg-gradient-to-br ${palette.bg} ${auraClass} shadow-lg ${sizeClass}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" className="h-full w-full" fill="none">
        {/* Background celestial halo */}
        <circle cx="32" cy="32" r="24" stroke={palette.accent} strokeOpacity="0.28" strokeWidth="1.2" strokeDasharray="3 3" />
        {/* Stylized anime cloak / shoulders */}
        <path
          d="M12 58 C14 44, 22 40, 32 40 C42 40, 50 44, 52 58"
          fill="#0f172a"
          stroke={palette.stroke}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* High collar */}
        <path
          d="M21 43 L26 35 L32 39 L38 35 L43 43"
          fill="#1e1b4b"
          stroke={palette.accent}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {/* Stylized anime head & swept hair */}
        <path
          d="M22 25 C22 16, 42 16, 42 25 C42 32, 37 37, 32 37 C27 37, 22 32, 22 25 Z"
          fill="#1e293b"
          stroke={palette.stroke}
          strokeWidth="1.6"
        />
        {/* Anime hair bangs */}
        <path
          d="M19 25 C19 14, 29 10, 34 11 C40 12, 46 17, 45 25 C43 21, 39 19, 36 22 C33 18, 28 20, 25 24 C23 21, 20 23, 19 25 Z"
          fill="#312e81"
          stroke={palette.stroke}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {/* Glowing anime eyes */}
        <ellipse cx="27.5" cy="27.5" rx="2.1" ry="1.4" fill={palette.accent} />
        <ellipse cx="36.5" cy="27.5" rx="2.1" ry="1.4" fill={palette.accent} />
      </svg>
    </motion.div>
  );
}
