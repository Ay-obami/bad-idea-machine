import { describe, expect, it } from 'vitest';
import type { Hex } from 'viem';

import { getEnvironmentDefinition } from './environments';
import { visualByte, visualU16 } from './random';

const SEED = `0x${'00112233445566778899aabbccddeeff'.repeat(2)}` as Hex;

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
    const kitchenKinds = new Set(kitchen.actors.map(actor => actor.kind));
    const garageKinds = new Set(garage.actors.map(actor => actor.kind));

    expect(kitchenKinds.has('toaster')).toBe(true);
    expect(kitchenKinds.has('kettle')).toBe(true);
    expect(garageKinds.has('drill')).toBe(true);
    expect(garageKinds.has('tire')).toBe(true);
    expect(kitchenKinds.has('drill')).toBe(false);
    expect(garageKinds.has('kettle')).toBe(false);
  });

  it('places every actor inside the 1000x600 logical stage', () => {
    for (const id of ['kitchen', 'garage'] as const) {
      for (const actor of getEnvironmentDefinition(id).actors) {
        expect(actor.home.x).toBeGreaterThanOrEqual(0);
        expect(actor.home.x).toBeLessThanOrEqual(1000);
        expect(actor.home.y).toBeGreaterThanOrEqual(0);
        expect(actor.home.y).toBeLessThanOrEqual(600);
      }
    }
  });
});
