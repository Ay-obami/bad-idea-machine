import { describe, expect, it } from 'vitest';
import type { Hex } from 'viem';

import {
  KITCHEN_MELTDOWN_DURATION,
  KITCHEN_REVEAL_MS,
  kitchenFinalDamage,
  kitchenMeltdownFrame,
  kitchenVariantFromSeed,
} from './kitchen-meltdown';
import { buildKitchenMeltdownScript } from './kitchen-meltdown-script';

function seed(firstByte: number): Hex {
  return `0x${firstByte.toString(16).padStart(2, '0')}${'00'.repeat(31)}` as Hex;
}

describe('complete kitchen meltdown', () => {
  it('keeps the complete shared accident payout-blind until the explicit reveal beat', () => {
    const visualSeed = seed(19);
    const fixtures = [0, 1, 2, 3, 4].map(tier => buildKitchenMeltdownScript(tier as 0 | 1 | 2 | 3 | 4, visualSeed));
    const shared = fixtures.map(script => script.events.filter(event => event.startMs < KITCHEN_REVEAL_MS));

    for (const events of shared.slice(1)) expect(events).toEqual(shared[0]);
    expect(fixtures.every(script => script.revealStartMs === KITCHEN_REVEAL_MS)).toBe(true);
    expect(fixtures.every(script => script.durationMs === KITCHEN_MELTDOWN_DURATION)).toBe(true);
  });

  it('selects exactly three coherent kitchen variants from the visual seed', () => {
    expect([seed(0), seed(1), seed(2)].map(kitchenVariantFromSeed)).toEqual([
      'grease-fire',
      'steam-short',
      'pan-spark',
    ]);
  });

  it('orders each variant as a visible cause chain instead of shuffling unrelated actors', () => {
    const expected = {
      'grease-fire': ['proof-toaster', 'proof-hinge', 'proof-door-plate', 'proof-ceramic', 'grease-pan-hit', 'grease-spill', 'grease-ignite', 'shared-smoke'],
      'steam-short': ['proof-toaster', 'proof-hinge', 'proof-door-plate', 'proof-ceramic', 'steam-kettle-hit', 'steam-spill', 'steam-short', 'shared-smoke'],
      'pan-spark': ['proof-toaster', 'proof-hinge', 'proof-door-plate', 'proof-ceramic', 'pan-shard-hit', 'pan-cord-hit', 'pan-ignite', 'shared-smoke'],
    } as const;

    for (const visualSeed of [seed(0), seed(1), seed(2)]) {
      const script = buildKitchenMeltdownScript(2, visualSeed);
      const sharedIds = script.events.filter(event => event.startMs < KITCHEN_REVEAL_MS).map(event => event.id);
      expect(sharedIds).toEqual(expected[script.variant as keyof typeof expected]);
      for (let index = 1; index < sharedIds.length; index += 1) {
        const previous = script.events.find(event => event.id === sharedIds[index - 1])!;
        const current = script.events.find(event => event.id === sharedIds[index])!;
        expect(current.startMs).toBeGreaterThanOrEqual(previous.startMs);
      }
    }
  });

  it('does not allow payout tier to alter visible room state before reveal', () => {
    const visualSeed = seed(1);
    const variant = kitchenVariantFromSeed(visualSeed);
    const time = KITCHEN_REVEAL_MS - 1;
    const low = kitchenMeltdownFrame(time, variant, 0);
    const high = kitchenMeltdownFrame(time, variant, 4);

    expect(high.sharedDamageIds).toEqual(low.sharedDamageIds);
    expect(high.spill).toEqual(low.spill);
    expect(high.ignition).toEqual(low.ignition);
    expect(high.smoke).toEqual(low.smoke);
    expect(high.outcomeProgress).toBe(0);
  });

  it('gives all five outcomes structurally distinct persistent room states', () => {
    const profiles = [0, 1, 2, 3, 4].map(tier => kitchenFinalDamage(tier as 0 | 1 | 2 | 3 | 4));
    expect(new Set(profiles.map(profile => profile.structuralSignature)).size).toBe(5);
    expect(profiles[0].catastrophic).toBe(true);
    expect(profiles[1].severity).toBe(1);
    expect(profiles[4].severity).toBe(5);
    expect(profiles[4].rocket).toBe(true);
  });

  it('preserves shared damage through the final frame and resets deterministically at time zero', () => {
    const variant = 'grease-fire' as const;
    const clean = kitchenMeltdownFrame(0, variant, 3);
    const final = kitchenMeltdownFrame(KITCHEN_MELTDOWN_DURATION, variant, 3);

    expect(clean.sharedDamageIds).toEqual([]);
    expect(clean.outcomeProgress).toBe(0);
    expect(final.sharedDamageIds).toContain('broken-plates');
    expect(final.sharedDamageIds).toContain('localized-fire');
    expect(final.outcomeProgress).toBe(1);
    expect(final.finalDamage.structuralSignature).toBe(kitchenFinalDamage(3).structuralSignature);
  });
});
