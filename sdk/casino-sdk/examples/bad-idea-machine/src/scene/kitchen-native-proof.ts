import { compileRoomTimeline } from './room-timeline';
import { roomStateAt } from './room-state';
import type { RoomEvent } from './room-model';

export const KITCHEN_NATIVE_MASTER = 'https://cdn.creativeclaw.co/u/534269cc/images/d48c2325-2071-4642-92a1-5d174d35444a.png';

export const KITCHEN_NATIVE_EVENTS: readonly RoomEvent[] = [
  { id: 'toast-launch', objectId: 'toast', delayMs: 420, durationMs: 720, contact: { x: 684, y: 154 } },
  { id: 'door-recoil', objectId: 'cabinet-door', after: 'toast-launch', delayMs: 0, durationMs: 240, contact: { x: 684, y: 154 } },
  { id: 'door-sag', objectId: 'cabinet-door', after: 'door-recoil', delayMs: 55, durationMs: 720, contact: { x: 662, y: 155 }, damageId: 'lower-hinge-failed' },
  { id: 'plates-release', objectId: 'plates', after: 'door-sag', delayMs: 0, durationMs: 1050, contact: { x: 662, y: 155 }, damageId: 'plates-displaced' },
] as const;

export const KITCHEN_NATIVE_TIMELINE = compileRoomTimeline(KITCHEN_NATIVE_EVENTS);
export const KITCHEN_NATIVE_DURATION = Math.max(...KITCHEN_NATIVE_TIMELINE.map(event => event.startMs + event.durationMs)) + 550;

type PlateFrame = Readonly<{ x: number; y: number; rotation: number; opacity: number; progress: number; scale: number }>;

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
  { x: 610, y: 304, rotation: -9, delay: 0, scale: .97 },
  { x: 632, y: 318, rotation: 7, delay: .10, scale: 1.02 },
  { x: 654, y: 301, rotation: -6, delay: .20, scale: .95 },
  { x: 672, y: 324, rotation: 11, delay: .30, scale: 1.00 },
] as const;

export function kitchenNativeFrameAt(time: number): KitchenNativeFrame {
  const t = Math.max(0, Math.min(KITCHEN_NATIVE_DURATION, Number.isFinite(time) ? time : 0));
  const toastP = smooth(progress('toast-launch', t));
  const recoilP = progress('door-recoil', t);
  const sagP = smooth(progress('door-sag', t));
  const platesP = progress('plates-release', t);

  const toastX = lerp(646, 684, toastP);
  const toastY = lerp(251, 154, toastP) - Math.sin(Math.PI * toastP) * 58;

  const recoilPulse = recoilP > 0 && recoilP < 1 ? Math.sin(recoilP * Math.PI) : 0;
  const doorRotation = -2.5 * recoilPulse + lerp(0, -14, sagP);
  const doorX = lerp(676, 670, sagP);
  const doorY = lerp(0, 9, sagP);

  const plates = plateTargets.map((target, index) => {
    const local = smooth(clamp((platesP - target.delay) / (1 - target.delay)));
    return {
      x: lerp(624 + index * 1.2, target.x, local),
      y: lerp(143 + index * 1.6, target.y, local) - Math.sin(Math.PI * local) * (18 + index * 2),
      rotation: lerp(index % 2 ? 1.5 : -1.5, target.rotation, local),
      opacity: platesP > target.delay ? 1 : 0,
      progress: local,
      scale: lerp(1, target.scale, local),
    };
  });

  const contactStart = KITCHEN_NATIVE_TIMELINE.find(event => event.id === 'plates-release')?.startMs ?? 0;
  const contactDelta = t - contactStart;
  const contactOpacity = contactDelta >= -90 && contactDelta <= 170
    ? Math.max(0, 1 - Math.abs(contactDelta - 25) / 130)
    : 0;

  return {
    toast: {
      x: toastX,
      y: toastY,
      rotation: lerp(-3, 24, toastP),
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
