import { describe, expect, it } from 'vitest';

import { KITCHEN_DESTRUCTION_BLUEPRINT } from './kitchen-destruction-blueprint';
import { KITCHEN_CABINET_ARCHITECTURE, KITCHEN_CABINET_DOOR, KITCHEN_CABINET_SHELF_FASCIA, kitchenCabinetDoorPose, kitchenCabinetHeroFace, kitchenCabinetShelfPose, kitchenCabinetStackOffset, kitchenCabinetSurface, validateKitchenCabinetArchitecture } from './kitchen-cabinet-architecture';

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

  it('uses an exposed face only in the stationary stressed pose', () => {
    expect(kitchenCabinetHeroFace('intact')).toBe('photographed');
    expect(kitchenCabinetHeroFace('hinge-stressed')).toBe('tilted');
    expect(kitchenCabinetHeroFace('backing-diagnostic')).toBe('none');
    expect(kitchenCabinetHeroFace('hinge-dropped')).toBe('tilted');
  });

  it('keeps the photographed door at rest and limits the drop to the static preview', () => {
    expect(KITCHEN_CABINET_DOOR.source).toBe('approved-master-cabinet-pixels');
    expect(kitchenCabinetDoorPose('intact')).toBe('rest');
    expect(kitchenCabinetDoorPose('hinge-stressed')).toBe('rest');
    expect(kitchenCabinetDoorPose('hinge-dropped')).toBe('dropped');
    expect(kitchenCabinetDoorPose('backing-diagnostic')).toBe('none');
  });

  it('slides the separate photographed stack only with the dropped door', () => {
    expect(kitchenCabinetStackOffset('intact')).toEqual({ x: 0, y: 0 });
    expect(kitchenCabinetStackOffset('hinge-stressed')).toEqual({ x: 0, y: 0 });
    expect(kitchenCabinetStackOffset('hinge-dropped')).toEqual({ x: 5, y: 1 });
    expect(kitchenCabinetStackOffset('shelf-loose')).toEqual({ x: 5, y: 1 });
  });

  it('keeps the shelf surface and dishes supported while only its photographed front strip loosens', () => {
    expect(KITCHEN_CABINET_SHELF_FASCIA.source).toBe('approved-master-cabinet-pixels');
    expect(KITCHEN_CABINET_SHELF_FASCIA.bounds).toEqual({ x: 629, y: 43, width: 55, height: 11 });
    expect(kitchenCabinetShelfPose('intact')).toBe('rest');
    expect(kitchenCabinetShelfPose('hinge-dropped')).toBe('rest');
    expect(kitchenCabinetShelfPose('shelf-loose')).toBe('loose');
    expect(kitchenCabinetShelfPose('backing-diagnostic')).toBe('none');
    expect(kitchenCabinetDoorPose('shelf-loose')).toBe('dropped');
    expect(kitchenCabinetHeroFace('shelf-loose')).toBe('tilted');
  });
});
