import { compileRoomTimeline } from './room-timeline';
import { roomStateAt } from './room-state';
import type { RoomEvent } from './room-model';

export const KITCHEN_NATIVE_MASTER = 'https://cdn.creativeclaw.co/u/534269cc/images/d48c2325-2071-4642-92a1-5d174d35444a.png';

export const KITCHEN_NATIVE_EVENTS: readonly RoomEvent[] = [
  { id: 'toast-launch', objectId: 'toast', delayMs: 420, durationMs: 650, contact: { x: 704, y: 135 } },
  { id: 'door-recoil', objectId: 'cabinet-door', after: 'toast-launch', delayMs: 0, durationMs: 220, contact: { x: 704, y: 135 } },
  { id: 'door-sag', objectId: 'cabinet-door', after: 'door-recoil', delayMs: 40, durationMs: 610, contact: { x: 646, y: 128 }, damageId: 'lower-hinge-failed' },
  { id: 'plates-release', objectId: 'plates', after: 'door-sag', delayMs: 0, durationMs: 980, contact: { x: 646, y: 128 }, damageId: 'plates-displaced' },
] as const;

export const KITCHEN_NATIVE_TIMELINE = compileRoomTimeline(KITCHEN_NATIVE_EVENTS);
export const KITCHEN_NATIVE_DURATION = Math.max(...KITCHEN_NATIVE_TIMELINE.map(event => event.startMs + event.durationMs)) + 500;

type PlateFrame = Readonly<{ x: number; y: number; rotation: number; opacity: number; progress: number }>;

export type KitchenNativeFrame = Readonly<{
  toast: Readonly<{ x: number; y: number; rotation: number; opacity: number; patchOpacity: number }>;
  door: Readonly<{ x: number; y: number; rotation: number; patchOpacity: number; load: number }>;
  plates: readonly PlateFrame[];
  platesPatchOpacity: number;
  contactOpacity: number;
  damageIds: readonly string[];
}>;

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function smooth(value: number) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function progress(id: string, time: number) {
  const event = KITCHEN_NATIVE_TIMELINE.find(item => item.id === id);
  if (!event) return 0;
  return clamp((time - event.startMs) / event.durationMs);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const plateTargets = [
  { x: 600, y: 338, rotation: -34, delay: 0 },
  { x: 650, y: 355, rotation: 22, delay: .08 },
  { x: 690, y: 326, rotation: -18, delay: .16 },
  { x: 570, y: 366, rotation: 38, delay: .24 },
] as const;

export function kitchenNativeFrameAt(time: number): KitchenNativeFrame {
  const t = Math.max(0, Math.min(KITCHEN_NATIVE_DURATION, Number.isFinite(time) ? time : 0));
  const toastP = smooth(progress('toast-launch', t));
  const recoilP = progress('door-recoil', t);
  const sagP = smooth(progress('door-sag', t));
  const platesP = progress('plates-release', t);

  const toastX = lerp(649, 704, toastP);
  const toastY = lerp(242, 136, toastP) - Math.sin(Math.PI * toastP) * 62;

  const recoilPulse = recoilP > 0 && recoilP < 1 ? Math.sin(recoilP * Math.PI) : 0;
  const doorRotation = -3.5 * recoilPulse + lerp(0, -29, sagP);
  const doorX = lerp(673, 664, sagP);
  const doorY = lerp(0, 18, sagP);

  const plates = plateTargets.map((target, index) => {
    const local = smooth(clamp((platesP - target.delay) / (1 - target.delay)));
    return {
      x: lerp(628 + index * 1.3, target.x, local),
      y: lerp(121 - index * 2.2, target.y, local) - Math.sin(Math.PI * local) * 12,
      rotation: lerp(index % 2 ? 2 : -2, target.rotation, local),
      opacity: platesP > target.delay ? 1 : 0,
      progress: local,
    };
  });

  const contactStart = KITCHEN_NATIVE_TIMELINE.find(event => event.id === 'plates-release')?.startMs ?? 0;
  const contactDelta = t - contactStart;
  const contactOpacity = contactDelta >= -100 && contactDelta <= 180
    ? Math.max(0, 1 - Math.abs(contactDelta - 30) / 150)
    : 0;

  return {
    toast: {
      x: toastX,
      y: toastY,
      rotation: lerp(-4, 58, toastP),
      opacity: toastP > 0 ? 1 : 0,
      patchOpacity: toastP > 0 ? 1 : 0,
    },
    door: {
      x: doorX,
      y: doorY,
      rotation: doorRotation,
      patchOpacity: recoilP > 0 || sagP > 0 ? 1 : 0,
      load: Math.max(recoilPulse, sagP),
    },
    plates,
    platesPatchOpacity: platesP > 0 ? 1 : 0,
    contactOpacity,
    damageIds: roomStateAt(KITCHEN_NATIVE_TIMELINE, t).damageIds,
  };
}
