import { describe, expect, it } from 'vitest';

import { buildEventSoundPlan } from './audio-plan';
import type { SceneEvent } from './types';

function event(overrides: Partial<SceneEvent> = {}): SceneEvent {
  return {
    id: 'test-event',
    actorId: 'test-actor',
    action: 'launch',
    startMs: 0,
    durationMs: 900,
    path: [
      { at: 0, x: 100, y: 100, rotation: 0 },
      { at: 1, x: 700, y: 300, rotation: 240 },
    ],
    impact: { x: 700, y: 300 },
    hazard: 'blast',
    intensity: 2,
    decoy: false,
    effectSeed: 123456,
    soundCue: 'rocket-blast',
    ...overrides,
  };
}

function aggregateGain(plan: ReturnType<typeof buildEventSoundPlan>) {
  return plan.reduce((sum, layer) => sum + layer.gain, 0);
}

describe('environment catastrophe sound plans', () => {
  it('uses different palettes for kitchen and garage', () => {
    const kitchen = buildEventSoundPlan('kitchen', event());
    const garage = buildEventSoundPlan('garage', event());
    expect(kitchen).not.toEqual(garage);
  });

  it('gets denser and at least as loud at intensity three', () => {
    const light = buildEventSoundPlan('garage', event({ intensity: 1 }));
    const critical = buildEventSoundPlan('garage', event({ intensity: 3 }));
    expect(critical.length).toBeGreaterThan(light.length);
    expect(aggregateGain(critical)).toBeGreaterThanOrEqual(aggregateGain(light));
  });

  it('is deterministic for the same environment and event', () => {
    const sceneEvent = event({ hazard: 'fire', effectSeed: 987654, soundCue: 'safe-crash' });
    expect(buildEventSoundPlan('kitchen', sceneEvent)).toEqual(buildEventSoundPlan('kitchen', sceneEvent));
  });

  it('includes broadband noise for fire, blast, smoke and debris impacts', () => {
    for (const hazard of ['fire', 'blast', 'smoke', 'debris'] as const) {
      expect(buildEventSoundPlan('garage', event({ hazard })).some(layer => layer.kind === 'noise')).toBe(true);
    }
  });
});
