import { GitBranch, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { StoryState } from '../types';

interface BranchingTreePanelProps {
  state: StoryState;
  onRewindScene: (sceneId: string) => void;
}

export function BranchingTreePanel({ state, onRewindScene }: BranchingTreePanelProps) {
  const nodes = Object.values(state.branchNodes).sort(
    (a, b) => a.sceneNumber - b.sceneNumber,
  );

  return (
    <section
      aria-label="Interactive branching story tree"
      className="glass-panel-elevated rounded-2xl border-indigo-400/25 p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-300 uppercase">
            <GitBranch className="h-4 w-4" aria-hidden="true" />
            <span>Turning Points & Branching Tree</span>
          </div>
          <h2 className="font-display mt-1 text-2xl font-semibold text-slate-50">
            Timeline Divergence Map
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Rewind to any earlier turning point to explore alternate paths while preserving discovered branches and endings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
            Active Path
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
            Alternate Branch
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            Ending Reached
          </span>
        </div>
      </div>

      {state.discoveredEndings.length > 0 && (
        <div className="mt-5 rounded-xl border border-amber-300/25 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-200">
            <Trophy className="h-4 w-4" aria-hidden="true" />
            <span>Discovered Endings ({state.discoveredEndings.length})</span>
          </div>
          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            {state.discoveredEndings.map((ending) => (
              <div
                key={ending.sceneId}
                className="rounded-lg border border-amber-300/20 bg-[#070B19]/80 px-3 py-2 text-xs"
              >
                <p className="font-semibold text-amber-100">{ending.title}</p>
                <p className="mt-0.5 capitalize text-slate-400">{ending.type} outcome</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {nodes.map((node) => {
          const isCurrent = node.sceneId === state.currentSceneId;
          const scene = state.scenes[node.sceneId];
          return (
            <div
              key={node.sceneId}
              className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 transition-colors ${
                isCurrent
                  ? 'border-amber-300/50 bg-indigo-950/60'
                  : node.isCurrentPath
                    ? 'border-indigo-400/35 bg-[#0A1026]'
                    : 'border-white/8 bg-white/[0.02] opacity-85'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono-tabular font-semibold text-amber-300">
                    Ch. {node.chapterNumber} · Scene {node.sceneNumber}
                  </span>
                  {isCurrent && (
                    <span className="rounded bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                      Current Position
                    </span>
                  )}
                  {node.isCustomAction && (
                    <span className="inline-flex items-center gap-1 rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] text-indigo-200">
                      <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                      Custom Action
                    </span>
                  )}
                  {node.isEnding && (
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                      Ending ({node.endingType})
                    </span>
                  )}
                </div>

                <h3 className="font-display mt-1 text-base font-semibold text-slate-100">
                  {node.title}
                </h3>

                <p className="mt-1 text-xs text-slate-300">
                  <span className="text-slate-400">Triggered by:</span> {node.decisionLabel}
                </p>

                {scene && (
                  <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                    Location: {scene.location}
                  </p>
                )}
              </div>

              {!isCurrent && (
                <button
                  type="button"
                  onClick={() => onRewindScene(node.sceneId)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-indigo-400/35 bg-indigo-600/20 px-3.5 py-2 text-xs font-semibold text-indigo-100 transition-colors hover:bg-indigo-600/40"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Rewind Here</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
