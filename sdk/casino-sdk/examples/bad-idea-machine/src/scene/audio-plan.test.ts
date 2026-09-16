import { describe, expect, it } from 'vitest';

import { buildAftermathSoundPlan, buildEventSoundPlan } from './audio-plan';
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
    impacts: [{
      atMs: 738,
      point: { x: 700, y: 300 },
      materialA: 'metal',
      materialB: 'masonry',
      strength: 2,
      effect: 'blast',
      persistentDamage: ['test-zone-blast'],
    }],
    hazard: 'blast',
    intensity: 2,
    decoy: false,
    effectSeed: 123456,
    soundCue: 'rocket-blast',
    ...overrides,
  };
}

describe('sample-driven catastrophe sound plans', () => {
  it('uses different room-native sample palettes for kitchen and garage', () => {
    const kitchen = buildEventSoundPlan('kitchen', event({ soundCue: 'pan-crash' }));
    const garage = buildEventSoundPlan('garage', event({ soundCue: 'hammer-crash' }));

    expect(kitchen.every(layer => layer.kind === 'sample')).toBe(true);
    expect(garage.every(layer => layer.kind === 'sample')).toBe(true);
    expect(kitchen.map(layer => layer.sampleId)).not.toEqual(garage.map(layer => layer.sampleId));
  });

  it('anchors the primary impact sample to the physical impact time and horizontal position', () => {
    const plan = buildEventSoundPlan('garage', event());
    const impact = plan.find(layer => layer.role === 'impact');

    expect(impact).toBeDefined();
    expect(impact?.delayMs).toBe(738);
    expect(impact?.pan).toBeGreaterThan(0);
    expect(impact?.pan).toBeLessThanOrEqual(0.7);
  });

  it('is deterministic for the same environment and event seed', () => {
    const sceneEvent = event({ hazard: 'fire', effectSeed: 987654, soundCue: 'safe-crash' });
    expect(buildEventSoundPlan('kitchen', sceneEvent)).toEqual(buildEventSoundPlan('kitchen', sceneEvent));
  });

  it('adds material aftermath without turning intensity into a global volume multiplier', () => {
    const light = buildEventSoundPlan('garage', event({ intensity: 1 }));
    const critical = buildEventSoundPlan('garage', event({ intensity: 3 }));

    expect(critical.length).toBeGreaterThan(light.length);
    expect(Math.max(...critical.map(layer => layer.gain))).toBeLessThanOrEqual(.82);
    expect(critical.some(layer => layer.role === 'debris')).toBe(true);
  });

  it('keeps event layers inside the event window and playback rates natural', () => {
    for (const environment of ['kitchen', 'garage'] as const) {
      const plan = buildEventSoundPlan(environment, event({ durationMs: 1_050 }));
      expect(plan.every(layer => layer.delayMs >= 0 && layer.delayMs <= 1_050)).toBe(true);
      expect(plan.every(layer => layer.playbackRate >= .88 && layer.playbackRate <= 1.12)).toBe(true);
    }
  });

  it('uses restrained room-specific looping ambience after the authored aftermath appears', () => {
    const kitchen = buildAftermathSoundPlan('kitchen', 4);
    const garage = buildAftermathSoundPlan('garage', 4);

    expect(kitchen).toHaveLength(1);
    expect(garage).toHaveLength(1);
    expect(kitchen[0].loop).toBe(true);
    expect(garage[0].loop).toBe(true);
    expect(kitchen[0].sampleId).not.toBe(garage[0].sampleId);
    expect(kitchen[0].gain).toBeLessThanOrEqual(.2);
    expect(garage[0].gain).toBeLessThanOrEqual(.2);
  });
});
