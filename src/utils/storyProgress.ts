import { ReadingProgress, Story, StoryChoice, StoryNode } from '../types';

export function getStoryDepthEstimate(story: Story): number {
  const chapters = Object.values(story.nodes).map((n) => n.chapterNumber);
  return Math.max(1, ...chapters);
}

export function computeProgressPercent(
  story: Story,
  node: StoryNode,
  visitedNodeIds: string[],
): number {
  if (node.isEnding) {
    return 100;
  }
  const maxChapters = getStoryDepthEstimate(story);
  const chapterRatio = node.chapterNumber / maxChapters;
  const visitedBonus = Math.min(0.15, visitedNodeIds.length * 0.03);
  const raw = Math.round(Math.min(92, Math.max(15, chapterRatio * 78 + visitedBonus * 100)));
  return raw;
}

export function createInitialProgress(story: Story): ReadingProgress {
  const startNode = story.nodes[story.startNodeId];
  return {
    storyId: story.id,
    currentNodeId: story.startNodeId,
    visitedNodeIds: [story.startNodeId],
    choicesMade: [],
    discoveredEndings: startNode?.isEnding ? [story.startNodeId] : [],
    completed: Boolean(startNode?.isEnding),
    progressPercent: startNode ? computeProgressPercent(story, startNode, [story.startNodeId]) : 10,
    lastReadAt: new Date().toISOString(),
    isDemo: story.isDemo,
  };
}

export function advanceStoryProgress(
  story: Story,
  existing: ReadingProgress | undefined,
  choice: StoryChoice,
): ReadingProgress {
  const base = existing ?? createInitialProgress(story);
  const nextNode = story.nodes[choice.nextNodeId];

  if (!nextNode) {
    throw new Error(`Target story node "${choice.nextNodeId}" does not exist.`);
  }

  const visitedNodeIds = base.visitedNodeIds.includes(nextNode.id)
    ? base.visitedNodeIds
    : [...base.visitedNodeIds, nextNode.id];

  const discoveredEndings =
    nextNode.isEnding && !base.discoveredEndings.includes(nextNode.id)
      ? [...base.discoveredEndings, nextNode.id]
      : base.discoveredEndings;

  const completed = base.completed || nextNode.isEnding;

  return {
    storyId: story.id,
    currentNodeId: nextNode.id,
    visitedNodeIds,
    choicesMade: [
      ...base.choicesMade,
      {
        nodeId: base.currentNodeId,
        choiceId: choice.id,
        choiceLabel: choice.label,
      },
    ],
    discoveredEndings,
    completed,
    progressPercent: completed
      ? 100
      : computeProgressPercent(story, nextNode, visitedNodeIds),
    lastReadAt: new Date().toISOString(),
    isDemo: story.isDemo,
  };
}

export function restartStoryProgress(
  story: Story,
  existing?: ReadingProgress,
): ReadingProgress {
  const fresh = createInitialProgress(story);
  if (!existing) {
    return fresh;
  }
  return {
    ...fresh,
    discoveredEndings: existing.discoveredEndings,
    completed: existing.completed,
  };
}
