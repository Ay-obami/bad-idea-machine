import { KITCHEN_DESTRUCTION_BLUEPRINT } from './kitchen-destruction-blueprint';

/** First exact architecture extraction. The shell behind it remains unknown. */
export const KITCHEN_CABINET_ARCHITECTURE = {
  zoneId: 'plate-cabinet',
  intactUrl: '/rooms/kitchen/rebuild/truth/cabinet-intact.webp',
  bounds: { x: 565, y: 0, width: 205, height: 173 },
  source: 'approved-master-local-extraction',
  backingStatus: 'unfilled',
} as const;

export function validateKitchenCabinetArchitecture(): readonly string[] {
  const zone = KITCHEN_CABINET_ARCHITECTURE;
  const blueprint = KITCHEN_DESTRUCTION_BLUEPRINT.zones.find(item => item.id === zone.zoneId);
  const errors: string[] = [];
  if (!blueprint || blueprint.kind !== 'destructible' ||
      JSON.stringify(blueprint.bounds) !== JSON.stringify(zone.bounds)) {
    errors.push('cabinet extraction differs from approved zone bounds');
  }
  if (!zone.intactUrl.startsWith('/rooms/kitchen/rebuild/truth/') ||
      /creativeclaw|^https?:\/\//i.test(zone.intactUrl)) {
    errors.push('cabinet source must be repository-local');
  }
  if (zone.backingStatus !== 'unfilled') errors.push('unphotographed cabinet backing cannot be accepted');
  return errors;
}
