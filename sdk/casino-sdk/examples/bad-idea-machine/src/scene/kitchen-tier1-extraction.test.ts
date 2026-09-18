import { describe, expect, it } from 'vitest';

import { KITCHEN_DESTRUCTION_BLUEPRINT } from './kitchen-destruction-blueprint';
import {
  KITCHEN_TIER1_EXTRACTION_SPECS,
  validateKitchenTier1ExtractionSpecs,
} from './kitchen-tier1-extraction';

describe('kitchen tier 1 terminal extraction', () => {
  it('covers every terminal prop exactly once', () => {
    expect(validateKitchenTier1ExtractionSpecs()).toEqual([]);

    const owners = KITCHEN_TIER1_EXTRACTION_SPECS
      .filter(spec => spec.kind === 'prop')
      .map(spec => spec.ownerId)
      .sort();

    expect(owners).toEqual(
      KITCHEN_DESTRUCTION_BLUEPRINT.props.map(prop => prop.id).sort(),
    );
  });

  it('keeps every extraction footprint inside its declared support zone', () => {
    const zoneById = new Map(
      KITCHEN_DESTRUCTION_BLUEPRINT.zones.map(zone => [zone.id, zone]),
    );

    for (const spec of KITCHEN_TIER1_EXTRACTION_SPECS) {
      const zone = zoneById.get(spec.sourceZoneId)!;
      expect(spec.bounds.x).toBeGreaterThanOrEqual(zone.bounds.x);
      expect(spec.bounds.y).toBeGreaterThanOrEqual(zone.bounds.y);
      expect(spec.bounds.x + spec.bounds.width)
        .toBeLessThanOrEqual(zone.bounds.x + zone.bounds.width);
      expect(spec.bounds.y + spec.bounds.height)
        .toBeLessThanOrEqual(zone.bounds.y + zone.bounds.height);
    }
  });

  it('separates body, shadow and persistent debris ownership', () => {
    expect(KITCHEN_TIER1_EXTRACTION_SPECS.some(spec => spec.kind === 'shadow')).toBe(true);
    expect(KITCHEN_TIER1_EXTRACTION_SPECS.some(spec => spec.kind === 'debris')).toBe(true);
    expect(KITCHEN_TIER1_EXTRACTION_SPECS.some(spec => spec.ownerId === 'ceramic-debris')).toBe(true);
  });
});
