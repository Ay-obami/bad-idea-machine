import { describe, expect, it } from 'vitest';

import { KITCHEN_DESTRUCTION_BLUEPRINT } from './kitchen-destruction-blueprint';
import { KITCHEN_CABINET_ARCHITECTURE, kitchenCabinetPlatePose, kitchenCabinetSurface, validateKitchenCabinetArchitecture } from './kitchen-cabinet-architecture';

describe('approved open-cabinet architecture extraction', () => {
  it('registers exact local geometry and keeps the unseen backing proposed', () => {
    const blueprint = KITCHEN_DESTRUCTION_BLUEPRINT.zones.find(zone => zone.id === 'plate-cabinet');
    expect(KITCHEN_CABINET_ARCHITECTURE.bounds).toEqual(blueprint?.bounds);
    expect(KITCHEN_CABINET_ARCHITECTURE.intactUrl).toBe('/rooms/kitchen/rebuild/truth/cabinet-intact.webp');
    expect(KITCHEN_CABINET_ARCHITECTURE.backingUrl).toBe('/rooms/kitchen/rebuild/truth/cabinet-backing-proposal.webp');
    expect(KITCHEN_CABINET_ARCHITECTURE.backingStatus).toBe('proposed');
    expect(validateKitchenCabinetArchitecture()).toEqual([]);
  });
});

describe('cabinet surface selection', () => {
  it('retains the photographed cabinet for hinge stress and reserves the wall for diagnostics', () => {
    expect(kitchenCabinetSurface('hinge-stressed', false)).toBe('cabinet');
    expect(kitchenCabinetSurface('backing-diagnostic', false)).toBe('backing');
    expect(kitchenCabinetSurface('intact', true)).toBe('master');
  });

  it('moves only the hero plate in the first damage proof', () => {
    expect(kitchenCabinetPlatePose('intact')).toEqual({ x: 0, y: 0, rotation: 0 });
    const stress = kitchenCabinetPlatePose('hinge-stressed');
    expect(stress.x).toBeGreaterThan(0);
    expect(stress.y).toBeGreaterThan(0);
    expect(stress.rotation).toBeGreaterThan(0);
  });
});
