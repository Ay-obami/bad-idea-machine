import { KITCHEN_DESTRUCTION_BLUEPRINT } from './kitchen-destruction-blueprint';

export type KitchenCabinetMode = 'intact' | 'hinge-stressed' | 'hinge-dropped' | 'shelf-loose' | 'backing-diagnostic';

/** Exact intact cabinet plus a separately authored proposal for its unseen backing. */
export const KITCHEN_CABINET_ARCHITECTURE = {
  zoneId: 'plate-cabinet',
  intactUrl: '/rooms/kitchen/rebuild/truth/cabinet-intact.webp',
  backingUrl: '/rooms/kitchen/rebuild/truth/cabinet-backing-proposal.webp',
  bounds: { x: 565, y: 0, width: 205, height: 173 },
  source: 'approved-master-local-extraction',
  backingStatus: 'proposed',
} as const;

/** Unphotographed top face, visible only in the stationary stressed preview. */
export const KITCHEN_PLATE_TILT = {
  atlasUrl: '/rooms/kitchen/rebuild/truth/plate-tilt-atlas.webp',
  atlasWidth: 166,
  atlasHeight: 40,
  frames: {
    face: { x: 0, y: 0, width: 82, height: 40 },
    contact: { x: 84, y: 0, width: 82, height: 40 },
  },
  placement: { x: 575, y: 76 },
  source: 'proposed-local-visible-face-from-approved-ceramic-palette',
} as const;

/** A photographed door silhouette and a single static hinge-failure pose. */
export const KITCHEN_CABINET_DOOR = {
  bounds: { x: 686, y: 0, width: 74, height: 150 },
  hinge: { x: 688, y: 74 },
  freeEdgeDrop: 16,
  source: 'approved-master-cabinet-pixels',
} as const;

/** Photographed upper-shelf front strip; the shelf surface stays in place. */
export const KITCHEN_CABINET_SHELF_FASCIA = {
  bounds: { x: 629, y: 40, width: 55, height: 12 },
  backingSampleOffsetY: 17,
  freeEdgeDrop: 6,
  source: 'approved-master-cabinet-pixels',
} as const;

/** The remaining photographed stack slides on its shelf in the hanging-door preview. */
export const KITCHEN_CABINET_STACK_SLIDE = { x: 5, y: 1 } as const;

export function kitchenCabinetStackOffset(mode: KitchenCabinetMode): Readonly<{ x: number; y: number }> {
  return mode === 'hinge-dropped' || mode === 'shelf-loose' ? KITCHEN_CABINET_STACK_SLIDE : { x: 0, y: 0 };
}

export function kitchenCabinetDoorPose(mode: KitchenCabinetMode): 'rest' | 'dropped' | 'none' {
  if (mode === 'backing-diagnostic') return 'none';
  return mode === 'hinge-dropped' || mode === 'shelf-loose' ? 'dropped' : 'rest';
}

export function kitchenCabinetShelfPose(mode: KitchenCabinetMode): 'rest' | 'loose' | 'none' {
  if (mode === 'backing-diagnostic') return 'none';
  return mode === 'shelf-loose' ? 'loose' : 'rest';
}

export function kitchenCabinetSurface(mode: KitchenCabinetMode, reference: boolean): 'master' | 'cabinet' | 'backing' {
  if (reference) return 'master';
  return mode === 'backing-diagnostic' ? 'backing' : 'cabinet';
}

export function kitchenCabinetHeroFace(mode: KitchenCabinetMode): 'photographed' | 'tilted' | 'none' {
  if (mode === 'backing-diagnostic') return 'none';
  return mode === 'hinge-stressed' || mode === 'hinge-dropped' || mode === 'shelf-loose' ? 'tilted' : 'photographed';
}

export function validateKitchenCabinetArchitecture(): readonly string[] {
  const zone = KITCHEN_CABINET_ARCHITECTURE;
  const blueprint = KITCHEN_DESTRUCTION_BLUEPRINT.zones.find(item => item.id === zone.zoneId);
  const errors: string[] = [];
  if (!blueprint || blueprint.kind !== 'destructible' ||
      JSON.stringify(blueprint.bounds) !== JSON.stringify(zone.bounds)) {
    errors.push('cabinet extraction differs from approved zone bounds');
  }
  if ([zone.intactUrl, zone.backingUrl].some(url =>
      !url.startsWith('/rooms/kitchen/rebuild/truth/') || /creativeclaw|^https?:\/\//i.test(url))) {
    errors.push('cabinet surfaces must be repository-local');
  }
  const tilt = KITCHEN_PLATE_TILT;
  if (!tilt.atlasUrl.startsWith('/rooms/kitchen/rebuild/truth/') ||
      /creativeclaw|^https?:\/\//i.test(tilt.atlasUrl)) errors.push('plate face must be repository-local');
  for (const [id, frame] of Object.entries(tilt.frames)) {
    if (frame.x < 0 || frame.y < 0 || frame.x + frame.width > tilt.atlasWidth ||
        frame.y + frame.height > tilt.atlasHeight) errors.push(`plate tilt frame outside atlas: ${id}`);
  }
  if (tilt.placement.x < zone.bounds.x || tilt.placement.y < zone.bounds.y ||
      tilt.placement.x + tilt.frames.face.width > zone.bounds.x + zone.bounds.width ||
      tilt.placement.y + tilt.frames.face.height > zone.bounds.y + zone.bounds.height) {
    errors.push('stressed plate must remain inside the photographed cabinet');
  }
  const door = KITCHEN_CABINET_DOOR;
  if (door.bounds.x < zone.bounds.x || door.bounds.y < zone.bounds.y ||
      door.bounds.x + door.bounds.width > zone.bounds.x + zone.bounds.width ||
      door.bounds.y + door.bounds.height > zone.bounds.y + zone.bounds.height ||
      door.hinge.x < door.bounds.x || door.hinge.x > door.bounds.x + door.bounds.width ||
      door.hinge.y < door.bounds.y || door.hinge.y > door.bounds.y + door.bounds.height) {
    errors.push('cabinet door silhouette and hinge must remain in the photographed cabinet');
  }
  const shelf = KITCHEN_CABINET_SHELF_FASCIA;
  if (shelf.bounds.x < zone.bounds.x || shelf.bounds.y < zone.bounds.y ||
      shelf.bounds.x + shelf.bounds.width > door.bounds.x ||
      shelf.bounds.y + shelf.bounds.height + shelf.backingSampleOffsetY + shelf.freeEdgeDrop > zone.bounds.y + zone.bounds.height) {
    errors.push('shelf front strip or its backing sample lies outside the photographed cabinet');
  }
  if (zone.backingStatus !== 'proposed') errors.push('unphotographed cabinet backing cannot be accepted as master art');
  return errors;
}
