import { KITCHEN_DESTRUCTION_BLUEPRINT } from './kitchen-destruction-blueprint';

export type KitchenCabinetMode = 'intact' | 'hinge-stressed' | 'hinge-dropped' | 'tier1-terminal' | 'tier2-study' | 'backing-diagnostic';

/** Exact intact cabinet plus a separately authored proposal for its unseen backing. */
export const KITCHEN_CABINET_ARCHITECTURE = {
  zoneId: 'plate-cabinet',
  intactUrl: '/rooms/kitchen/rebuild/truth/cabinet-intact.webp',
  backingUrl: '/rooms/kitchen/rebuild/truth/cabinet-backing-proposal.webp',
  bounds: { x: 565, y: 0, width: 205, height: 173 },
  source: 'approved-master-local-extraction',
  backingStatus: 'proposed',
} as const;

/** A photographed door silhouette and a single static hinge-failure pose. */
export const KITCHEN_CABINET_DOOR = {
  bounds: { x: 694, y: 0, width: 76, height: 150 },
  hinge: { x: 695, y: 74 },
  freeEdgeDrop: 16,
  hiddenSupportSample: { x: 790, y: 0, width: 24, height: 150 },
  source: 'approved-master-cabinet-pixels',
} as const;

/** The remaining photographed stack slides on its shelf in the hanging-door preview. */
export const KITCHEN_CABINET_STACK_SLIDE = { x: 5, y: 1 } as const;

/** Supplemental ceramic cutout; the approved room master is never replaced. */
export const KITCHEN_TIER1_CERAMIC = {
  url: '/rooms/kitchen/rebuild/truth/tier1-ceramic-debris.webp',
  bounds: { x: 510, y: 299, width: 68, height: 40 },
  status: 'stationary-proposal',
} as const;

/** Body-only floor study on the exposed wood to the right of the rug. */
export const KITCHEN_TIER1_FLOOR_CERAMIC_STUDY = {
  url: '/rooms/kitchen/rebuild/truth/tier1-floor-ceramic-study.webp',
  bounds: { x: 750, y: 547, width: 90, height: 47 },
  status: 'visual-study',
} as const;

/** Stationary Tier 1 prop placements relative to their clean local supports. */
export const KITCHEN_TIER1_PROP_POSE = {
  pan: { x: 6, y: 2 },
  panContact: { x: 6, y: 1 },
  toast: { x: 716, y: 290 },
  toastContact: { x: 717, y: 306 },
} as const;

/** Proposed local backsplash residue. It contains no room or replacement tile. */
export const KITCHEN_TIER2_SOOT_STUDY = {
  url: '/rooms/kitchen/rebuild/truth/tier2-soot-study.webp',
  bounds: { x: 390, y: 175, width: 180, height: 120 },
  opacity: .28,
  status: 'visual-study',
} as const;

/** Separate alpha-only underside deposit; no cabinet or tile pixels are baked into this overlay. */
export const KITCHEN_TIER2_CABINET_SOOT_STUDY = {
  url: '/rooms/kitchen/rebuild/truth/tier2-cabinet-soot-edge-study.webp',
  crop: { x: 0, y: 0, width: 450, height: 100 },
  bounds: { x: 350, y: 134, width: 215, height: 36 },
  opacity: .4,
  status: 'visual-study',
} as const;

/** Separate stove-plane residue under props and their independent contacts. */
export const KITCHEN_TIER2_GREASE_STUDY = {
  url: '/rooms/kitchen/rebuild/truth/tier2-grease-study.webp',
  bounds: { x: 445, y: 286, width: 120, height: 55 },
  opacity: .65,
  status: 'visual-study',
} as const;

export function kitchenCabinetHasTerminalProps(mode: KitchenCabinetMode): boolean {
  return mode === 'tier1-terminal' || mode === 'tier2-study';
}

export function kitchenCabinetStackOffset(mode: KitchenCabinetMode): Readonly<{ x: number; y: number }> {
  return mode === 'hinge-dropped' || mode === 'tier2-study' ? KITCHEN_CABINET_STACK_SLIDE : { x: 0, y: 0 };
}

export function kitchenCabinetDoorPose(mode: KitchenCabinetMode): 'rest' | 'dropped' | 'none' {
  if (mode === 'backing-diagnostic') return 'none';
  return mode === 'hinge-dropped' || mode === 'tier2-study' ? 'dropped' : 'rest';
}

export function kitchenCabinetSurface(mode: KitchenCabinetMode, reference: boolean): 'master' | 'cabinet' | 'backing' {
  if (reference) return 'master';
  return mode === 'backing-diagnostic' ? 'backing' : 'cabinet';
}

export function kitchenCabinetHeroFace(mode: KitchenCabinetMode): 'photographed' | 'tilted' | 'none' {
  if (mode === 'backing-diagnostic' || kitchenCabinetHasTerminalProps(mode)) return 'none';
  // The proposed exposed face visibly hovered above the photographed stack.
  // Keep the approved resting plate seated until a supported pose is authored.
  return 'photographed';
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
  if (!KITCHEN_TIER1_CERAMIC.url.startsWith('/rooms/kitchen/rebuild/truth/') ||
      /creativeclaw|^https?:\/\//i.test(KITCHEN_TIER1_CERAMIC.url)) {
    errors.push('terminal ceramic cutout must be repository-local');
  }
  const soot = KITCHEN_TIER2_SOOT_STUDY;
  const backsplash = KITCHEN_DESTRUCTION_BLUEPRINT.zones.find(item => item.id === 'backsplash');
  if (!soot.url.startsWith('/rooms/kitchen/rebuild/truth/') ||
      /creativeclaw|^https?:\/\//i.test(soot.url) || !backsplash ||
      soot.bounds.x < backsplash.bounds.x || soot.bounds.y < backsplash.bounds.y ||
      soot.bounds.x + soot.bounds.width > backsplash.bounds.x + backsplash.bounds.width ||
      soot.bounds.y + soot.bounds.height > backsplash.bounds.y + backsplash.bounds.height) {
    errors.push('Tier 2 soot study must be repository-local and confined to the backsplash');
  }
  const cabinetSoot = KITCHEN_TIER2_CABINET_SOOT_STUDY.bounds;
  const stoveCabinet = KITCHEN_DESTRUCTION_BLUEPRINT.zones.find(item => item.id === 'upper-stove-cabinet');
  if (!KITCHEN_TIER2_CABINET_SOOT_STUDY.url.startsWith('/rooms/kitchen/rebuild/truth/') ||
      /creativeclaw|^https?:\/\//i.test(KITCHEN_TIER2_CABINET_SOOT_STUDY.url) ||
      !stoveCabinet || cabinetSoot.x < stoveCabinet.bounds.x || cabinetSoot.y < stoveCabinet.bounds.y ||
      cabinetSoot.x + cabinetSoot.width > stoveCabinet.bounds.x + stoveCabinet.bounds.width ||
      cabinetSoot.y + cabinetSoot.height > stoveCabinet.bounds.y + stoveCabinet.bounds.height) {
    errors.push('Tier 2 cabinet soot must stay within the upper-stove-cabinet zone');
  }
  const grease = KITCHEN_TIER2_GREASE_STUDY;
  const stove = KITCHEN_DESTRUCTION_BLUEPRINT.zones.find(item => item.id === 'stove-range');
  if (!grease.url.startsWith('/rooms/kitchen/rebuild/truth/') ||
      /creativeclaw|^https?:\/\//i.test(grease.url) || !stove ||
      grease.bounds.x < stove.bounds.x || grease.bounds.y < stove.bounds.y ||
      grease.bounds.x + grease.bounds.width > stove.bounds.x + stove.bounds.width ||
      grease.bounds.y + grease.bounds.height > stove.bounds.y + stove.bounds.height) {
    errors.push('Tier 2 grease study must be repository-local and confined to the stove');
  }
  const door = KITCHEN_CABINET_DOOR;
  if (door.bounds.x < zone.bounds.x || door.bounds.y < zone.bounds.y ||
      door.bounds.x + door.bounds.width > zone.bounds.x + zone.bounds.width ||
      door.bounds.y + door.bounds.height > zone.bounds.y + zone.bounds.height ||
      door.hinge.x < door.bounds.x || door.hinge.x > door.bounds.x + door.bounds.width ||
      door.hinge.y < door.bounds.y || door.hinge.y > door.bounds.y + door.bounds.height) {
    errors.push('cabinet door silhouette and hinge must remain in the photographed cabinet');
  }
  if (door.hiddenSupportSample.x < zone.bounds.x + zone.bounds.width ||
      door.hiddenSupportSample.x + door.hiddenSupportSample.width > 1000 ||
      door.hiddenSupportSample.y !== door.bounds.y ||
      door.hiddenSupportSample.height !== door.bounds.height) {
    errors.push('door-hidden support must sample the adjacent approved cabinet face');
  }
  if (zone.backingStatus !== 'proposed') errors.push('unphotographed cabinet backing cannot be accepted as master art');
  return errors;
}
