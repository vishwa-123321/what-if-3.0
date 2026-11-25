import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Briefcase,
  Compass,
  FileSearch,
  History,
  KeyRound,
  MapPin,
  Shield,
  Users,
} from 'lucide-react';
import { StoryState } from '../types';
import { AnimatedCharacterAvatar } from './AnimatedCharacterAvatar';

interface StoryDashboardPanelProps {
  state: StoryState;
}

type DashboardTab = 'overview' | 'characters' | 'clues' | 'history';

export function StoryDashboardPanel({ state }: StoryDashboardPanelProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const currentScene = state.scenes[state.currentSceneId];

  return (
    <aside
      aria-label="Real-time story dashboard"
      className="glass-panel-elevated flex flex-col overflow-hidden rounded-2xl border-indigo-400/20"
    >
      <div className="border-b border-white/8 bg-[#070B19]/75 px-4 py-3.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="font-mono-tabular text-[11px] font-semibold tracking-wider text-amber-300 uppercase">
              Live Story Memory
            </p>
            <h2 className="font-display text-base font-semibold text-slate-100">
              Story Dashboard
            </h2>
          </div>
          <span className="font-mono-tabular rounded-lg border border-indigo-400/30 bg-indigo-500/15 px-2.5 py-1 text-xs font-semibold text-indigo-200">
            {state.progressPercent}%
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Story dashboard sections"
          className="mt-3 grid grid-cols-4 gap-1 rounded-xl border border-white/8 bg-[#050711] p-1"
        >
          {[
            { id: 'overview', label: 'Status', icon: Compass },
            { id: 'characters', label: `Cast (${state.characters.length})`, icon: Users },
            {
              id: 'clues',
              label: `Clues (${state.clues.length})`,
              icon: FileSearch,
            },
            {
              id: 'history',
              label: `Log (${state.decisionHistory.length})`,
              icon: History,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(tab.id as DashboardTab)}
                className={`flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                  selected
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-h-[540px] space-y-4 overflow-y-auto p-4 text-xs">
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                <p className="text-[11px] text-slate-400">Chapter & Scene</p>
                <p className="font-mono-tabular mt-1 text-sm font-semibold text-slate-100">
                  Ch. {state.currentChapter} · Scene {state.currentSceneNumber}
                </p>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                <p className="text-[11px] text-slate-400">Story Status</p>
                <p className="mt-1 text-sm font-semibold text-amber-200">
                  {state.isEnding ? 'Resolved' : currentScene?.arcStage ?? 'Active'}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 uppercase">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Current Location</span>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-100">
                {state.currentLocation}
              </p>
            </div>

            <div className="rounded-xl border border-amber-300/20 bg-amber-500/[0.06] p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 uppercase">
                <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Main Objective</span>
              </div>
              <p className="mt-1 leading-relaxed text-slate-200">
                {state.currentObjective}
              </p>
            </div>

            {state.unresolvedMysteries.length > 0 && (
              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
                <p className="text-[11px] font-semibold text-slate-300 uppercase">
                  Open Threads
                </p>
                <ul className="mt-2 space-y-1.5 text-slate-300">
                  {state.unresolvedMysteries.map((mystery, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-amber-300">•</span>
                      <span>{mystery}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
              <p className="text-[11px] font-semibold text-slate-300 uppercase">
                Protagonist Profile
              </p>
              <p className="mt-1 font-medium text-slate-100">
                {state.customization.mainCharacterName} ({state.customization.characterPersonality})
              </p>
              <p className="mt-1 text-slate-400">
                {state.customization.length} Campaign · {state.customization.pov} ·{' '}
                {state.customization.settingType}
              </p>
            </div>
          </>
        )}

        {activeTab === 'characters' && (
          <div className="space-y-3">
            {state.characters.length === 0 ? (
              <p className="text-slate-400">No recurring characters recorded yet.</p>
            ) : (
              state.characters.map((char) => {
                const trustWidth = Math.max(5, Math.min(100, Math.round((char.trustScore + 100) / 2)));
                return (
                  <div
                    key={char.id}
                    className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <AnimatedCharacterAvatar
                          name={char.name}
                          trustScore={char.trustScore}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-100">
                            {char.name}
                          </p>
                          <p className="truncate text-[11px] text-indigo-300">{char.role}</p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                          char.trustScore >= 20
                            ? 'bg-emerald-500/20 text-emerald-200'
                            : char.trustScore <= -20
                              ? 'bg-rose-500/20 text-rose-200'
                              : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {char.relationship}
                      </span>
                    </div>

                    <div className="mt-2.5">
                      <div className="mb-1 flex justify-between text-[10px] text-slate-400">
                        <span>Trust & Memory</span>
                        <span className="font-mono-tabular">{char.trustScore}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${trustWidth}%` }}
                          transition={{ duration: 0.45 }}
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-amber-300"
                        />
                      </div>
                    </div>

                    <p className="mt-2 text-slate-300">
                      <span className="text-slate-400">Personality:</span> {char.personality}
                    </p>
                    <p className="mt-1 text-slate-300">
                      <span className="text-slate-400">Motivation:</span> {char.motivation}
                    </p>
                    {char.lastReaction && (
                      <p className="mt-1 text-amber-200/90">
                        <span className="text-slate-400">Recent reaction:</span> {char.lastReaction}
                      </p>
                    )}
                    {char.secretRevealed && (
                      <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-amber-300/25 bg-amber-400/10 p-2 text-amber-100">
                        <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden="true" />
                        <span>Uncovered Secret: {char.secret}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'clues' && (
          <div className="space-y-4">
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 uppercase">
                <FileSearch className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Discovered Clues ({state.clues.length})</span>
              </p>
              {state.clues.length === 0 ? (
                <p className="text-slate-400">No clues uncovered yet. Inspect objects and question witnesses.</p>
              ) : (
                <div className="space-y-2">
                  {state.clues.map((clue) => (
                    <div
                      key={clue.id}
                      className="rounded-xl border border-white/8 bg-white/[0.03] p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-100">{clue.title}</span>
                        <span className="font-mono-tabular text-[10px] text-slate-400">
                          Scene {clue.discoveredAtScene}
                        </span>
                      </div>
                      <p className="mt-1 leading-relaxed text-slate-300">{clue.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 uppercase">
                <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Inventory & Important Objects ({state.inventory.length})</span>
              </p>
              {state.inventory.length === 0 ? (
                <p className="text-slate-400">No items held yet.</p>
              ) : (
                <div className="space-y-2">
                  {state.inventory.map((obj) => (
                    <div
                      key={obj.id}
                      className="rounded-xl border border-white/8 bg-white/[0.03] p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-100">{obj.name}</span>
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase text-slate-300">
                          {obj.status}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-300">{obj.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2.5">
            {state.decisionHistory.length === 0 ? (
              <p className="text-slate-400">
                Make your first choice or enter a custom action to begin logging decisions.
              </p>
            ) : (
              [...state.decisionHistory].reverse().map((entry, idx) => (
                <div
                  key={`${entry.sceneId}-${idx}`}
                  className="rounded-xl border border-white/8 bg-white/[0.03] p-3"
                >
                  <div className="flex items-center justify-between text-[10px] text-amber-300">
                    <span className="font-mono-tabular">
                      Ch. {entry.chapterNumber} · Scene {entry.sceneNumber}
                    </span>
                    {entry.isCustomAction && (
                      <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-indigo-200">
                        Custom Action
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-semibold text-slate-100">{entry.decisionLabel}</p>
                  <p className="mt-1 text-slate-400">{entry.consequenceSummary}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
