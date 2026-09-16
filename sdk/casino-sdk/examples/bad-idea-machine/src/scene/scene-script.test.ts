import { describe, expect, it } from 'vitest';
import type { Hex } from 'viem';

import type { OutcomeTier } from '../lib/badIdea';
import { getEnvironmentDefinition } from './environments';
import { visualByte, visualU16 } from './random';
import { buildSceneScript, sceneDurationMs } from './scene-script';
import type { EnvironmentId, SceneEvent } from './types';

const SEED = `0x${'00112233445566778899aabbccddeeff'.repeat(2)}` as Hex;
const ZERO_SEED = `0x${'00'.repeat(32)}` as Hex;
const ENVIRONMENTS: readonly EnvironmentId[] = ['kitchen', 'garage'];
const TIERS: readonly OutcomeTier[] = [0, 1, 2, 3, 4];
const SEEDS: readonly Hex[] = Array.from({ length: 64 }, (_, index) =>
  `0x${(BigInt(index + 1) * 0x9e3779b97f4a7c15n).toString(16).padStart(64, '0').slice(-64)}` as Hex,
);

function travel(event: SceneEvent) {
  const first = event.path[0];
  const last = event.path.at(-1)!;
  return { dx: Math.abs(last.x - first.x), dy: Math.abs(last.y - first.y) };
}

describe('scene visual randomness helpers', () => {
  it('reads visual bytes deterministically with wrapping', () => {
    expect(visualByte(SEED, 0)).toBe(0x00);
    expect(visualByte(SEED, 1)).toBe(0x11);
    expect(visualByte(SEED, 32)).toBe(0x00);
  });

  it('builds deterministic unsigned 16-bit values', () => {
    expect(visualU16(SEED, 0)).toBe(0x0011);
    expect(visualU16(SEED, 2)).toBe(0x2233);
  });
});

describe('scene environment definitions', () => {
  it('uses materially different kitchen and garage actor sets', () => {
    const kitchen = getEnvironmentDefinition('kitchen');
    const garage = getEnvironmentDefinition('garage');
    const kitchenAssets = new Set(kitchen.actors.map(actor => actor.assetId));
    const garageAssets = new Set(garage.actors.map(actor => actor.assetId));

    expect(kitchenAssets.has('toaster')).toBe(true);
    expect(kitchenAssets.has('kettle')).toBe(true);
    expect(garageAssets.has('drill')).toBe(true);
    expect(garageAssets.has('tire')).toBe(true);
    expect(kitchenAssets.has('drill')).toBe(false);
    expect(garageAssets.has('kettle')).toBe(false);
  });

  it('places every actor inside the 1000x600 logical stage', () => {
    for (const id of ENVIRONMENTS) {
      for (const actor of getEnvironmentDefinition(id).actors) {
        expect(actor.home.x).toBeGreaterThanOrEqual(0);
        expect(actor.home.x).toBeLessThanOrEqual(1000);
        expect(actor.home.y).toBeGreaterThanOrEqual(0);
        expect(actor.home.y).toBeLessThanOrEqual(600);
      }
    }
  });
});

describe('deterministic environment catastrophe scripts', () => {
  it('is deterministic for a fixed environment, tier and visual seed', () => {
    const first = buildSceneScript('kitchen', 2, SEED);
    const second = buildSceneScript('kitchen', 2, SEED);
    expect(second).toEqual(first);
  });

  it('terminates and assigns a decoy even for an all-zero visual seed', () => {
    const script = buildSceneScript('kitchen', 0, ZERO_SEED);
    expect(script.events.length).toBeGreaterThanOrEqual(8);
    expect(script.events.some(event => event.decoy)).toBe(true);
  });

  it('keeps every tested catastrophe within the spectacle contract', () => {
    for (const environment of ENVIRONMENTS) {
      for (const tier of TIERS) {
        for (const seed of SEEDS) {
          const script = buildSceneScript(environment, tier, seed);
          expect(script.durationMs).toBeGreaterThanOrEqual(4_700);
          expect(script.durationMs).toBeLessThanOrEqual(6_200);
          expect(sceneDurationMs(script)).toBe(script.durationMs);
          expect(script.events.length).toBeGreaterThanOrEqual(8);
          expect(script.events.length).toBeLessThanOrEqual(12);
          expect(new Set(script.events.map(event => event.actorId)).size).toBeGreaterThanOrEqual(4);
          expect(script.events.some(event => event.decoy)).toBe(true);
          expect(script.events.some(event => event.hazard === 'fire' || event.hazard === 'blast')).toBe(true);
          expect(script.events.some(event => ['debris', 'smoke', 'steam', 'shards'].includes(event.hazard))).toBe(true);
          expect(script.events.some(event => {
            const { dx, dy } = travel(event);
            return dx >= 350 || dy >= 180;
          })).toBe(true);
          expect(Math.max(...script.events.map(event => event.startMs + event.durationMs))).toBeLessThanOrEqual(script.durationMs);
        }
      }
    }
  });

  it('does not encode payout tier in the visible choreography', () => {
    for (const environment of ENVIRONMENTS) {
      for (const seed of SEEDS) {
        const failure = buildSceneScript(environment, 0, seed);
        const huge = buildSceneScript(environment, 4, seed);
        expect(failure.events).toEqual(huge.events);
        expect(failure.durationMs).toBe(huge.durationMs);
        expect(failure.finalizer.tier).toBe(0);
        expect(huge.finalizer.tier).toBe(4);
      }
    }
  });

  it('uses distinct choreography pools for kitchen and garage', () => {
    for (const seed of SEEDS.slice(0, 16)) {
      const kitchen = buildSceneScript('kitchen', 2, seed);
      const garage = buildSceneScript('garage', 2, seed);
      expect(kitchen.events.map(event => event.actorId)).not.toEqual(garage.events.map(event => event.actorId));
    }
  });
});