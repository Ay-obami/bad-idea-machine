import { describe, expect, it } from 'vitest';

import { KITCHEN_DESTRUCTION_BLUEPRINT } from './kitchen-destruction-blueprint';
import {
  KITCHEN_TERMINAL_LAYER_PLAN,
  kitchenTerminalLayersForTier,
  validateKitchenTerminalLayerPlan,
} from './kitchen-terminal-layer-plan';

describe('kitchen terminal layer plan', () => {
  it('separates architecture, props, debris and hazards for every tier', () => {
    expect(validateKitchenTerminalLayerPlan()).toEqual([]);

    for (const tier of [0, 1, 2, 3, 4] as const) {
      const plan = kitchenTerminalLayersForTier(tier);

      expect(plan.architecture.length).toBe(
        KITCHEN_DESTRUCTION_BLUEPRINT.zones.length,
      );
      expect(plan.props.length).toBe(
        KITCHEN_DESTRUCTION_BLUEPRINT.props.length,
      );
      expect(plan.shadows.length).toBe(
        KITCHEN_DESTRUCTION_BLUEPRINT.props.length,
      );
      expect(plan.debris.length).toBeGreaterThan(0);
      expect(plan.hazards.length).toBeLessThanOrEqual(3);
    }
  });

  it('never allows a terminal prop to be owned by an architecture layer', () => {
    for (const tier of [0, 1, 2, 3, 4] as const) {
      const plan = kitchenTerminalLayersForTier(tier);
      const architectureOwners = new Set(plan.architecture.map(layer => layer.ownerId));

      for (const prop of plan.props) {
        expect(architectureOwners.has(prop.ownerId)).toBe(false);
        expect(prop.kind).toBe('prop');
      }
    }
  });

  it('gives every terminal prop an independently controllable contact shadow', () => {
    for (const tier of [0, 1, 2, 3, 4] as const) {
      const plan = kitchenTerminalLayersForTier(tier);
      const propOwners = plan.props.map(layer => layer.ownerId).sort();
      const shadowOwners = plan.shadows.map(layer => layer.ownerId).sort();
      expect(shadowOwners).toEqual(propOwners);
    }
  });

  it('gives ceramic, cabinet and floor debris separate persistent families', () => {
    for (const tier of [0, 1, 2, 3, 4] as const) {
      const debrisIds = new Set(
        kitchenTerminalLayersForTier(tier).debris.map(layer => layer.ownerId),
      );

      expect(debrisIds.has('ceramic-debris')).toBe(true);
      expect(debrisIds.has('cabinet-debris')).toBe(tier !== 1);
      expect(debrisIds.has('floor-debris')).toBe(true);
    }
  });

  it('keeps fire, smoke and power treatment outside architecture images', () => {
    for (const tier of [0, 1, 2, 3, 4] as const) {
      const hazards = kitchenTerminalLayersForTier(tier).hazards;
      const profile = KITCHEN_DESTRUCTION_BLUEPRINT.tiers[tier].hazards;
      const expected = Object.entries(profile)
        .filter(([, state]) => state !== 'none' && state !== 'normal')
        .map(([owner]) => owner).sort();
      expect(hazards.map(layer => layer.ownerId).sort()).toEqual(expected);
      expect(hazards.every(layer => layer.state !== 'none' && layer.state !== 'normal')).toBe(true);
    }
  });

  it('contains no full-frame aftermath layer of any kind', () => {
    expect(KITCHEN_TERMINAL_LAYER_PLAN.some(layer =>
      layer.kind === 'full-frame',
    )).toBe(false);
  });
});
