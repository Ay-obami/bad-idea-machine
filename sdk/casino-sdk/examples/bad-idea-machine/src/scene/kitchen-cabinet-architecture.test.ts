import { describe, expect, it } from 'vitest';

import { KITCHEN_DESTRUCTION_BLUEPRINT } from './kitchen-destruction-blueprint';
import { KITCHEN_CABINET_ARCHITECTURE, validateKitchenCabinetArchitecture } from './kitchen-cabinet-architecture';

describe('approved open-cabinet architecture extraction', () => {
  it('registers exact local geometry and leaves the unseen backing unapproved', () => {
    const blueprint = KITCHEN_DESTRUCTION_BLUEPRINT.zones.find(zone => zone.id === 'plate-cabinet');
    expect(KITCHEN_CABINET_ARCHITECTURE.bounds).toEqual(blueprint?.bounds);
    expect(KITCHEN_CABINET_ARCHITECTURE.intactUrl).toBe('/rooms/kitchen/rebuild/truth/cabinet-intact.webp');
    expect(KITCHEN_CABINET_ARCHITECTURE.backingStatus).toBe('unfilled');
    expect(validateKitchenCabinetArchitecture()).toEqual([]);
  });
});
