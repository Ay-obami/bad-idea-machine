import type { Hex } from 'viem';

import type { OutcomeTier } from '../lib/badIdea';
import { getEnvironmentDefinition } from './environments';
import {
  buildGarageSceneScript,
  buildGarageSharedSequence,
  buildGarageTerminalSequence,
} from './garage-scene-script';
import { buildKitchenMeltdownScript } from './kitchen-meltdown-script';
import { KITCHEN_REVEAL_MS } from './kitchen-meltdown';
import type { EnvironmentId, SceneEvent, SceneScript } from './types';

export function buildSharedSequence(environment: EnvironmentId, visualSeed: Hex): readonly SceneEvent[] {
  if (environment === 'kitchen') {
    return buildKitchenMeltdownScript(2, visualSeed).events.filter(event => event.startMs < KITCHEN_REVEAL_MS);
  }
  return buildGarageSharedSequence(visualSeed);
}

export function buildTerminalSequence(environment: EnvironmentId, tier: OutcomeTier, visualSeed: Hex): readonly SceneEvent[] {
  if (environment === 'kitchen') {
    return buildKitchenMeltdownScript(tier, visualSeed).events.filter(event => event.startMs >= KITCHEN_REVEAL_MS);
  }
  return buildGarageTerminalSequence(tier, visualSeed);
}

export function buildSceneScript(environment: EnvironmentId, tier: OutcomeTier, visualSeed: Hex): SceneScript {
  return environment === 'kitchen'
    ? buildKitchenMeltdownScript(tier, visualSeed)
    : buildGarageSceneScript(tier, visualSeed);
}

export function sceneDurationMs(script: SceneScript): number {
  return script.durationMs;
}

export function catastropheSummary(script: SceneScript): readonly string[] {
  const actors = new Map(getEnvironmentDefinition(script.environment).actors.map(actor => [actor.id, actor.assetId] as const));
  return script.events.slice(0, 5).map(event => {
    const assetId = actors.get(event.actorId) ?? event.actorId;
    return `${assetId.replaceAll('-', ' ')} ${event.action.replaceAll('-', ' ')} / ${event.hazard}`;
  });
}
