import { KITCHEN_DESTRUCTION_BLUEPRINT } from './kitchen-destruction-blueprint';

export type KitchenCabinetMode = 'intact' | 'hinge-stressed' | 'backing-diagnostic';

/** Exact intact cabinet plus a separately authored proposal for its unseen backing. */
export const KITCHEN_CABINET_ARCHITECTURE = {
  zoneId: 'plate-cabinet',
  intactUrl: '/rooms/kitchen/rebuild/truth/cabinet-intact.webp',
  backingUrl: '/rooms/kitchen/rebuild/truth/cabinet-backing-proposal.webp',
  bounds: { x: 565, y: 0, width: 205, height: 173 },
  source: 'approved-master-local-extraction',
  backingStatus: 'proposed',
} as const;

export function kitchenCabinetSurface(mode: KitchenCabinetMode, reference: boolean): 'master' | 'cabinet' | 'backing' {
  if (reference) return 'master';
  return mode === 'backing-diagnostic' ? 'backing' : 'cabinet';
}

export function kitchenCabinetPlatePose(mode: KitchenCabinetMode): Readonly<{ x: number; y: number; rotation: number }> {
  return mode === 'hinge-stressed'
    ? { x: 3, y: 2, rotation: 0.09 }
    : { x: 0, y: 0, rotation: 0 };
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
  if (zone.backingStatus !== 'proposed') errors.push('unphotographed cabinet backing cannot be accepted as master art');
  return errors;
}
