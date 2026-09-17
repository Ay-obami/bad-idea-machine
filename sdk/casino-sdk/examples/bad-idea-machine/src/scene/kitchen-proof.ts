import { kitchenProofObjects as objects } from '../environments/kitchen/proof-manifest';
import { compileRoomTimeline } from './room-timeline';
import { roomStateAt } from './room-state';

export const kitchenProofTimeline = compileRoomTimeline([
  { id: 'spring', objectId: 'toaster', delayMs: 650, durationMs: 100 },
  { id: 'toast-contact', objectId: 'toast', after: 'spring', delayMs: 0, durationMs: 300, contact: { x: 564, y: 173 } },
  { id: 'door-contact', objectId: 'door', after: 'toast-contact', delayMs: 0, durationMs: 450, contact: { x: 492, y: 153 }, damageId: 'loose-hinge' },
  { id: 'toast-fall', objectId: 'toast', after: 'toast-contact', delayMs: 0, durationMs: 950, contact: { x: 650, y: 318 } },
  { id: 'door-settle', objectId: 'door', after: 'door-contact', delayMs: 0, durationMs: 900 },
  { id: 'plates-contact', objectId: 'plates', after: 'door-contact', delayMs: 0, durationMs: 650, contact: { x: 434, y: 311 }, damageId: 'broken-plates' },
  { id: 'fragments-settle', objectId: 'shards', after: 'plates-contact', delayMs: 0, durationMs: 650 },
]);
export const KITCHEN_PROOF_DURATION = 4000;
const events = new Map(kitchenProofTimeline.map(event => [event.id, event]));
const clamp = (value: number) => Math.max(0, Math.min(1, value));
function progress(id: string, time: number): number {
  const event = events.get(id)!;
  return clamp((time - event.startMs) / event.durationMs);
}
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Pure geometry: all coordinates, impacts, and persistent damage share this clock. */
export function kitchenFrame(elapsedMs: number) {
  const time = Number.isFinite(elapsedMs) ? Math.max(0, Math.min(KITCHEN_PROOF_DURATION, elapsedMs)) : 0;
  const spring = progress('spring', time);
  const launch = progress('toast-contact', time);
  const fall = progress('toast-fall', time);
  const door = progress('door-contact', time);
  const settle = progress('door-settle', time);
  const plates = progress('plates-contact', time);
  const fragments = progress('fragments-settle', time);
  const damage = roomStateAt(kitchenProofTimeline, time);
  const shattered = damage.damageIds.includes('broken-plates');
  const toast = fall > 0
    ? { x: 550 + 88 * fall, y: 173 + 132 * fall * fall, rotation: 84 * smooth(fall) }
    : { x: 550, y: 239 - 66 * (1 - (1 - launch) ** 2), rotation: 0 };
  return {
    time,
    toaster: { ...objects.toaster.rest, rotation: spring > 0 && spring < 1 ? -1.5 * Math.sin(spring * Math.PI) : 0 },
    toast,
    door: { ...objects.door.rest, rotation: 15 * smooth(door) + 7 * smooth(settle) + (settle > 0 && settle < 1 ? Math.sin(settle * Math.PI * 3) * 2 * (1 - settle) : 0) },
    plates: { x: objects.plates.rest.x - 37 * plates, y: objects.plates.rest.y + 146 * plates * plates, rotation: -11 * Math.sin(Math.PI * plates) },
    platesVisible: !shattered,
    shardsVisible: shattered,
    fragments,
    damageIds: damage.damageIds,
    label: time < 650 ? 'The cabinet hinge is already loose.' : time < 1050 ? 'The toaster spring releases.' : time < 1500 ? 'Toast catches the loose door.' : time < 2150 ? 'The door knocks the plates off their shelf.' : time < 2800 ? 'Ceramic meets the countertop.' : 'The damage stays until you reset the room.',
  };
}
