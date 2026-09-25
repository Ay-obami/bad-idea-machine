import { describe, expect, it } from 'vitest';

import { KITCHEN_DESTRUCTION_BLUEPRINT } from './kitchen-destruction-blueprint';
import { KITCHEN_CABINET_ARCHITECTURE, KITCHEN_CABINET_DOOR, KITCHEN_TIER1_CERAMIC, KITCHEN_TIER1_PROP_POSE, kitchenCabinetDoorPose, kitchenCabinetHeroFace, kitchenCabinetStackOffset, kitchenCabinetSurface, validateKitchenCabinetArchitecture } from './kitchen-cabinet-architecture';

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

  it('keeps the plate seated in cabinet previews until a supported face exists', () => {
    expect(kitchenCabinetHeroFace('intact')).toBe('photographed');
    expect(kitchenCabinetHeroFace('hinge-stressed')).toBe('photographed');
    expect(kitchenCabinetHeroFace('backing-diagnostic')).toBe('none');
    expect(kitchenCabinetHeroFace('hinge-dropped')).toBe('photographed');
  });

  it('keeps the photographed door at rest and limits the drop to the static preview', () => {
    expect(KITCHEN_CABINET_DOOR.source).toBe('approved-master-cabinet-pixels');
    expect(KITCHEN_CABINET_DOOR.bounds).toEqual({ x: 694, y: 0, width: 76, height: 150 });
    expect(KITCHEN_CABINET_DOOR.hiddenSupportSample).toEqual({ x: 790, y: 0, width: 24, height: 150 });
    expect(kitchenCabinetDoorPose('intact')).toBe('rest');
    expect(kitchenCabinetDoorPose('hinge-stressed')).toBe('rest');
    expect(kitchenCabinetDoorPose('hinge-dropped')).toBe('dropped');
    expect(kitchenCabinetDoorPose('backing-diagnostic')).toBe('none');
  });

  it('slides the separate photographed stack only with the dropped door', () => {
    expect(kitchenCabinetStackOffset('intact')).toEqual({ x: 0, y: 0 });
    expect(kitchenCabinetStackOffset('hinge-stressed')).toEqual({ x: 0, y: 0 });
    expect(kitchenCabinetStackOffset('hinge-dropped')).toEqual({ x: 5, y: 1 });
  });

  it('uses local ceramic debris and removes the whole hero plate in the terminal proposal', () => {
    expect(KITCHEN_TIER1_CERAMIC.url).toBe('/rooms/kitchen/rebuild/truth/tier1-ceramic-debris.webp');
    expect(KITCHEN_TIER1_CERAMIC.bounds).toEqual({ x: 530, y: 299, width: 68, height: 40 });
    expect(kitchenCabinetHeroFace('tier1-terminal')).toBe('none');
    expect(kitchenCabinetDoorPose('tier1-terminal')).toBe('dropped');
    expect(kitchenCabinetStackOffset('tier1-terminal')).toEqual({ x: 5, y: 1 });
    expect(kitchenCabinetSurface('tier1-terminal', false)).toBe('cabinet');
  });

  it('places the nudged pan and landed toast on their photographed support surfaces', () => {
    expect(KITCHEN_TIER1_PROP_POSE.pan).toEqual({ x: 6, y: 2 });
    expect(KITCHEN_TIER1_PROP_POSE.panContact).toEqual({ x: 6, y: 1 });
    expect(KITCHEN_TIER1_PROP_POSE.toast).toEqual({ x: 716, y: 290 });
    expect(KITCHEN_TIER1_PROP_POSE.toastContact).toEqual({ x: 717, y: 306 });
  });
});
