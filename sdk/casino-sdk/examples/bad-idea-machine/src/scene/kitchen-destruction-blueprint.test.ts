import { describe, expect, it } from 'vitest';

import {
  KITCHEN_DESTRUCTION_BLUEPRINT,
  kitchenDamageCount,
  validateKitchenDestructionBlueprint,
} from './kitchen-destruction-blueprint';

describe('kitchen destruction blueprint', () => {
  it('defines a valid complete layered scene contract', () => {
    expect(validateKitchenDestructionBlueprint()).toEqual([]);
  });

  it('gives every destructible zone multiple authored damage states', () => {
    for (const zone of KITCHEN_DESTRUCTION_BLUEPRINT.zones.filter(zone => zone.kind === 'destructible')) {
      expect(zone.states[0]).toBe('intact');
      expect(zone.states.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('keeps every movable prop physically supported at rest', () => {
    const zoneIds = new Set(KITCHEN_DESTRUCTION_BLUEPRINT.zones.map(zone => zone.id));
    for (const prop of KITCHEN_DESTRUCTION_BLUEPRINT.props) {
      expect(zoneIds.has(prop.support.zoneId)).toBe(true);
      expect(prop.rest.x).toBeGreaterThanOrEqual(0);
      expect(prop.rest.x).toBeLessThanOrEqual(1000);
      expect(prop.rest.y).toBeGreaterThanOrEqual(0);
      expect(prop.rest.y).toBeLessThanOrEqual(600);
    }
  });

  it('authors three coherent causal variants before tier-specific terminal damage', () => {
    expect(KITCHEN_DESTRUCTION_BLUEPRINT.variants).toHaveLength(3);

    for (const variant of KITCHEN_DESTRUCTION_BLUEPRINT.variants) {
      expect(variant.beats.length).toBeGreaterThanOrEqual(5);
      expect(variant.sharedUntilBeat).toBeGreaterThanOrEqual(3);
      expect(variant.sharedUntilBeat).toBeLessThan(variant.beats.length);
      expect(variant.beats[0].after).toBeUndefined();

      for (let index = 1; index < variant.beats.length; index += 1) {
        expect(variant.beats[index].after).toBe(variant.beats[index - 1].id);
      }
    }
  });

  it('defines a complete and distinct final composition for all five payout tiers', () => {
    const tiers = KITCHEN_DESTRUCTION_BLUEPRINT.tiers;
    expect(Object.keys(tiers).sort()).toEqual(['0', '1', '2', '3', '4']);

    const destructibleIds = KITCHEN_DESTRUCTION_BLUEPRINT.zones
      .filter(zone => zone.kind === 'destructible')
      .map(zone => zone.id)
      .sort();

    const propIds = KITCHEN_DESTRUCTION_BLUEPRINT.props.map(prop => prop.id).sort();
    const signatures = new Set<string>();

    for (const tier of [0, 1, 2, 3, 4] as const) {
      const composition = tiers[tier];
      expect(Object.keys(composition.zoneStates).sort()).toEqual(destructibleIds);
      expect(Object.keys(composition.propStates).sort()).toEqual(propIds);
      signatures.add(JSON.stringify(composition));
    }

    expect(signatures.size).toBe(5);
  });

  it('reserves tier 1 for localized damage while tier 0 is catastrophic and tier 4 is the broadest wreck', () => {
    expect(kitchenDamageCount(1)).toBeLessThan(kitchenDamageCount(2));
    expect(kitchenDamageCount(2)).toBeLessThan(kitchenDamageCount(3));
    expect(kitchenDamageCount(3)).toBeLessThan(kitchenDamageCount(4));
    expect(kitchenDamageCount(0)).toBeGreaterThanOrEqual(kitchenDamageCount(3));
    expect(KITCHEN_DESTRUCTION_BLUEPRINT.tiers[0]).not.toEqual(KITCHEN_DESTRUCTION_BLUEPRINT.tiers[4]);
  });

  it('does not allow a full-frame aftermath image as a destruction state', () => {
    expect('aftermathImage' in KITCHEN_DESTRUCTION_BLUEPRINT).toBe(false);
    expect('fullFrameReplacement' in KITCHEN_DESTRUCTION_BLUEPRINT).toBe(false);
  });
});
