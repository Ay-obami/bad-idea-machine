import { kitchenProofObjects as objects } from '../environments/kitchen/proof-manifest';
import { compileRoomTimeline } from './room-timeline';
import { roomStateAt } from './room-state';

// Bottom to top: each plate loses support and reaches the counter separately.
const plateFlights = [
  { delay: 135, duration: 660, travel: -24, spin: -17 },
  { delay: 90, duration: 605, travel: -36, spin: 23 },
  { delay: 45, duration: 555, travel: -48, spin: -29 },
  { delay: 0, duration: 505, travel: -60, spin: 34 },
] as const;
export const kitchenProofTimeline = compileRoomTimeline([
  { id: 'spring', objectId: 'toaster', delayMs: 650, durationMs: 100 },
  { id: 'toast-contact', objectId: 'toast', after: 'spring', delayMs: 0, durationMs: 300, contact: { x: 564, y: 173 } },
  { id: 'door-contact', objectId: 'door', after: 'toast-contact', delayMs: 0, durationMs: 450, contact: { x: 492, y: 153 }, damageId: 'loose-hinge' },
  { id: 'toast-fall', objectId: 'toast', after: 'toast-contact', delayMs: 0, durationMs: 950, contact: { x: 652, y: 310 } },
  { id: 'door-settle', objectId: 'door', after: 'door-contact', delayMs: 0, durationMs: 1250 },
  ...plateFlights.map((plate, index) => ({ id: `plate-${index}-contact`, objectId: `plate-${index}`, after: 'door-contact', delayMs: plate.delay, durationMs: plate.duration, damageId: 'broken-plates' })),
]);
export const KITCHEN_PROOF_DURATION = 4000;
const events = new Map(kitchenProofTimeline.map(event => [event.id, event]));
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const radians = (degrees: number) => degrees * Math.PI / 180;
const smooth = (t: number) => t * t * (3 - 2 * t);
function progress(id: string, time: number): number {
  const event = events.get(id)!;
  return clamp((time - event.startMs) / event.durationMs);
}

/** Orthographic yaw plus sag: the attachment stays fixed as the face foreshortens. */
function doorMatrix(rotation: number, yaw: number) {
  const roll = radians(rotation);
  const a = Math.cos(radians(yaw)) * Math.cos(roll);
  const b = Math.cos(radians(yaw)) * Math.sin(roll);
  const c = -Math.sin(roll);
  const d = Math.cos(roll);
  const { x, y } = objects.door.pivot;
  return [a, b, c, d, x - a * x - c * y, y - b * x - d * y] as const;
}

/** Pure geometry: all coordinates, impacts, and persistent damage share this clock. */
export function kitchenFrame(elapsedMs: number) {
  const time = Number.isFinite(elapsedMs) ? Math.max(0, Math.min(KITCHEN_PROOF_DURATION, elapsedMs)) : 0;
  const spring = progress('spring', time);
  const launch = progress('toast-contact', time);
  const fall = progress('toast-fall', time);
  const door = progress('door-contact', time);
  const settle = progress('door-settle', time);
  const damage = roomStateAt(kitchenProofTimeline, time);
  const landing = smooth(clamp((fall - .67) / .33));
  const bounce = clamp((time - 2000) / 280);
  const toast = fall > 0
    ? { x: 550 + 88 * fall + 4 * smooth(bounce), y: 173 + 120 * fall * fall - 5 * Math.sin(bounce * Math.PI), rotation: 100 * fall * (1 - landing) + 8 * landing, scaleY: 1 - .74 * landing, shadowOpacity: .04 + .39 * fall ** 3 }
    : { x: 550, y: 239 - 66 * (1 - (1 - launch) ** 2), rotation: 0, scaleY: 1, shadowOpacity: 0 };
  // Small initial give, then gravity takes over after the lower screw releases.
  const give = clamp(door / .4);
  const sag = clamp((door - .4) / .6);
  const rotation = 1.5 * smooth(give) + 13.5 * sag * sag + 3 * smooth(settle) + Math.sin(settle * Math.PI * 4) * 2.5 * (1 - settle);
  const yaw = 22 * smooth(door) + 10 * smooth(settle);
  const screwFall = clamp((time - 1230) / 580);
  const individualPlates = plateFlights.map((flight, index) => {
    const event = events.get(`plate-${index}-contact`)!;
    const p = progress(event.id, time);
    const angle = flight.spin * p;
    const rx = 33.5, ry = 5.5;
    const support = Math.hypot(rx * Math.sin(radians(flight.spin)), ry * Math.cos(radians(flight.spin)));
    const restY = 159.5 - index * 3;
    const impactX = 471.5 + flight.travel;
    const impactY = 311 - support;
    return {
      id: index, x: 471.5 + flight.travel * p, y: restY + (impactY - restY) * p * p,
      rotation: angle, impactX, impactY, impactMs: event.startMs + event.durationMs,
      shattered: time >= event.startMs + event.durationMs,
    };
  });
  // Pieces start spread across each plate's silhouette, never from one generic burst.
  const ceramicFragments = individualPlates.flatMap(plate => {
    if (!plate.shattered) return [];
    const p = clamp((time - plate.impactMs) / 620);
    const scatter = 1 - (1 - p) ** 3;
    return Array.from({ length: 6 }, (_, shard) => {
      const offset = (shard - 2.5) * 10;
      const angle = radians(plate.rotation);
      const startX = plate.impactX + offset * Math.cos(angle);
      const startY = plate.impactY + offset * Math.sin(angle);
      const endY = 309 + ((shard * 7 + plate.id * 3) % 16);
      return { id: `${plate.id}-${shard}`, sprite: `shard${shard + 1}` as 'shard1' | 'shard2' | 'shard3' | 'shard4' | 'shard5' | 'shard6',
        x: startX + (shard - 2.5) * (9 + plate.id * 2) * scatter,
        y: startY + (endY - startY) * p - Math.sin(p * Math.PI) * (7 + shard * 2),
        rotation: plate.rotation + (shard % 2 ? 95 : -80) * scatter,
        scaleY: 1 - .55 * smooth(p), width: 11 + shard % 3 * 3, shadowY: endY + 1, shadowOpacity: .15 + .2 * p,
      };
    });
  });
  return {
    time,
    toaster: { ...objects.toaster.rest, rotation: spring > 0 && spring < 1 ? -1.5 * Math.sin(spring * Math.PI) : 0 },
    toast,
    door: { ...objects.door.rest, rotation, yaw, matrix: doorMatrix(rotation, yaw) },
    hingeScrew: { x: 608 + 13 * screwFall, y: 149 + 163 * screwFall * screwFall, rotation: 15 + 430 * screwFall, released: time >= 1230 },
    individualPlates, ceramicFragments,
    platesVisible: individualPlates.some(plate => !plate.shattered),
    shardsVisible: ceramicFragments.length > 0,
    damageIds: damage.damageIds,
    label: time < 650 ? 'A backed-out screw is all that holds the lower hinge.' : time < 1050 ? 'The toaster spring releases.' : time < 1500 ? 'The loose screw drops. The door sags on its upper hinge.' : time < 2005 ? 'The door knocks the plates off their shelf.' : time < 2915 ? 'The plates hit one after another.' : 'The damage stays until you reset the room.',
  };
}
