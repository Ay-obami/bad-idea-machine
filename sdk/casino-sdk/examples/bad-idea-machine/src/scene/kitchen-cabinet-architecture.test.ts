import { describe, expect, it } from 'vitest';

import { KITCHEN_DESTRUCTION_BLUEPRINT } from './kitchen-destruction-blueprint';
import { KITCHEN_CABINET_ARCHITECTURE, kitchenCabinetSurface, validateKitchenCabinetArchitecture } from './kitchen-cabinet-architecture';

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
  it('uses the new backing only when the cabinet is hidden in the layered view', () => {
    expect(kitchenCabinetSurface(false, false)).toBe('backing');
    expect(kitchenCabinetSurface(true, false)).toBe('cabinet');
    expect(kitchenCabinetSurface(false, true)).toBe('master');
  });
});
