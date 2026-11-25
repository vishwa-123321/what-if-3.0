import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface ArcNode {
  id: string;
  num: string;
  label: string;
  desc: string;
  detail: string;
  color: string;
}

const ARC_NODES: ArcNode[] = [
  {
    id: 'inciting',
    num: '01',
    label: 'Inciting Incident',
    desc: 'The spark that launches your reality',
    detail: 'Opening chapter sets your location, initial clues, and first turning point.',
    color: 'text-sky-300 border-sky-400/40 bg-sky-500/15',
  },
  {
    id: 'rising',
    num: '02',
    label: 'Rising Action',
    desc: 'Escalating stakes & shifting alliances',
    detail: 'Every preset choice or custom action reshapes character trust and opens new rooms.',
    color: 'text-emerald-300 border-emerald-400/40 bg-emerald-500/15',
  },
  {
    id: 'climax',
    num: '03',
    label: 'Climax',
    desc: 'High-pressure confrontation & secrets',
    detail: 'Pressed witnesses crack under scrutiny and hidden agendas collide.',
    color: 'text-violet-300 border-violet-400/40 bg-violet-500/15',
  },
  {
    id: 'resolution',
    num: '04',
    label: 'Resolution',
    desc: 'Consequences of every remembered move',
    detail: 'Only clues you actually gathered and allies who trust you shape the outcome.',
    color: 'text-amber-200 border-amber-300/45 bg-amber-400/15',
  },
  {
    id: 'aftermath',
    num: '05',
    label: 'Aftermath',
    desc: 'Rewind & fork alternate timelines',
    detail: 'Jump back to any Turning Point in the divergence map to unlock new endings.',
    color: 'text-rose-200 border-rose-400/40 bg-rose-500/15',
  },
];

export function AnimatedStoryOrb() {
  const [selectedId, setSelectedId] = useState<string>('inciting');
  const activeNode = ARC_NODES.find((n) => n.id === selectedId) ?? ARC_NODES[0];

  return (
    <section
      aria-label="Interactive Story Arc Engine"
      className="mt-10 overflow-hidden rounded-2xl border border-indigo-400/20 bg-[#070B1E]/85 p-5 sm:p-6"
    >
      <div className="grid items-center gap-6 lg:grid-cols-12">
        {/* Animated Celestial Narrative Core (Inspired by Story Forge Reference) */}
        <div className="flex items-center gap-5 lg:col-span-4">
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
            <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
              <defs>
                <radialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fde68a" stopOpacity="0.95" />
                  <stop offset="45%" stopColor="#818cf8" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="60" cy="60" r="48" fill="url(#orbGlow)" />
              <g className="orbit-ring-slow" style={{ transformOrigin: '60px 60px' }}>
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#818cf8"
                  strokeOpacity="0.55"
                  strokeWidth="1.4"
                  strokeDasharray="6 6"
                />
                <circle cx="60" cy="8" r="3.5" fill="#fde68a" />
                <circle cx="60" cy="112" r="2.8" fill="#a78bfa" />
              </g>
              <g className="orbit-ring-reverse" style={{ transformOrigin: '60px 60px' }}>
                <circle
                  cx="60"
                  cy="60"
                  r="38"
                  fill="none"
                  stroke="#fbbf24"
                  strokeOpacity="0.55"
                  strokeWidth="1.4"
                  strokeDasharray="4 5"
                />
                <circle cx="98" cy="60" r="3" fill="#38bdf8" />
                <circle cx="22" cy="60" r="3" fill="#f472b6" />
              </g>
              <circle cx="60" cy="60" r="18" fill="#312e81" stroke="#fde68a" strokeWidth="1.8" />
              <path
                d="M52 57 L60 51 L68 57 L68 65 L60 68 L52 65 Z"
                fill="#818cf8"
                fillOpacity="0.45"
                stroke="#fde68a"
                strokeWidth="1.2"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 font-mono-tabular text-[11px] font-semibold tracking-wider text-amber-300 uppercase">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Animated Story Core</span>
            </p>
            <h2 className="font-display mt-1 text-lg font-semibold text-slate-50">
              {activeNode.num} · {activeNode.label}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              {activeNode.detail}
            </p>
            <Link
              to="/generate"
              className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-indigo-300 hover:text-amber-200"
            >
              <span>Open Story Studio</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Interactive Pulsing Arc Timeline Nodes */}
        <div className="grid gap-2.5 sm:grid-cols-5 lg:col-span-8">
          {ARC_NODES.map((node) => {
            const active = node.id === selectedId;
            return (
              <motion.button
                key={node.id}
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedId(node.id)}
                className={`rounded-xl border px-3.5 py-3 text-left transition-colors ${
                  active
                    ? `${node.color} shadow-lg shadow-indigo-950/50`
                    : 'border-white/8 bg-white/[0.02] text-slate-300 hover:border-indigo-400/30 hover:bg-white/[0.05]'
                }`}
              >
                <div className="font-mono-tabular text-[11px] font-semibold text-amber-300">
                  {node.num} · {node.label}
                </div>
                <p className="mt-1 text-xs leading-snug text-slate-300/90">{node.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
