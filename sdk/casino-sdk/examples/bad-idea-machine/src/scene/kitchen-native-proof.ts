import { compileRoomTimeline } from './room-timeline';
import { roomStateAt } from './room-state';
import type { RoomEvent } from './room-model';

export const KITCHEN_NATIVE_MASTER = 'https://cdn.creativeclaw.co/u/534269cc/images/d48c2325-2071-4642-92a1-5d174d35444a.png';

export const KITCHEN_NATIVE_EVENTS: readonly RoomEvent[] = [
  { id: 'toast-launch', objectId: 'toast', delayMs: 350, durationMs: 480, contact: { x: 687, y: 154 } },
  { id: 'toast-land', objectId: 'toast', after: 'toast-launch', delayMs: 0, durationMs: 440, contact: { x: 660, y: 306 } },
  { id: 'door-recoil', objectId: 'cabinet-door', after: 'toast-launch', delayMs: 0, durationMs: 160, contact: { x: 687, y: 154 } },
  { id: 'door-sag', objectId: 'cabinet-door', after: 'door-recoil', delayMs: 35, durationMs: 480, contact: { x: 651, y: 126 }, damageId: 'lower-hinge-failed' },
  { id: 'plate-1-release', objectId: 'plate-1', after: 'door-sag', delayMs: 0, durationMs: 520, contact: { x: 646, y: 121 } },
  { id: 'plate-1-break', objectId: 'plate-1', after: 'plate-1-release', delayMs: 0, durationMs: 160, contact: { x: 604, y: 306 }, damageId: 'plate-1-broken' },
  { id: 'plate-2-release', objectId: 'plate-2', after: 'plate-1-break', delayMs: 20, durationMs: 580, contact: { x: 638, y: 124 }, damageId: 'plate-stack-displaced' },
] as const;

export const KITCHEN_NATIVE_TIMELINE = compileRoomTimeline(KITCHEN_NATIVE_EVENTS);
export const KITCHEN_NATIVE_DURATION = Math.max(...KITCHEN_NATIVE_TIMELINE.map(event => event.startMs + event.durationMs)) + 600;

type PlateFrame = Readonly<{
  x: number;
  y: number;
  rotation: number;
  visible: boolean;
  progress: number;
}>;

type ShardFrame = Readonly<{
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
}>;

export type KitchenNativeFrame = Readonly<{
  toast: Readonly<{
    x: number;
    y: number;
    rotation: number;
    visible: boolean;
    slotPatchOpacity: number;
    landed: boolean;
  }>;
  door: Readonly<{
    rotation: number;
    recoil: number;
    sag: number;
    gapOpacity: number;
  }>;
  plate1: PlateFrame & Readonly<{ broken: boolean; opacity: number }>;
  plate2: PlateFrame;
  shards: readonly ShardFrame[];
  contactOpacity: number;
  breakFlashOpacity: number;
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

function eventStart(id: string) {
  return KITCHEN_NATIVE_TIMELINE.find(item => item.id === id)?.startMs ?? 0;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function fallingY(start: number, end: number, t: number) {
  const p = clamp(t);
  return lerp(start, end, p * p);
}

const shards = [
  { x: 588, y: 309, rotation: -31, scale: 1.05 },
  { x: 596, y: 305, rotation: 14, scale: .82 },
  { x: 604, y: 311, rotation: 39, scale: .92 },
  { x: 613, y: 307, rotation: -12, scale: .72 },
  { x: 621, y: 312, rotation: 24, scale: .63 },
] as const;

export function kitchenNativeFrameAt(time: number): KitchenNativeFrame {
  const t = Math.max(0, Math.min(KITCHEN_NATIVE_DURATION, Number.isFinite(time) ? time : 0));

  const launchP = smooth(progress('toast-launch', t));
  const landP = smooth(progress('toast-land', t));
  const recoilRaw = progress('door-recoil', t);
  const recoil = recoilRaw > 0 && recoilRaw < 1 ? Math.sin(recoilRaw * Math.PI) : 0;
  const sag = smooth(progress('door-sag', t));
  const plate1P = smooth(progress('plate-1-release', t));
  const breakP = smooth(progress('plate-1-break', t));
  const plate2P = smooth(progress('plate-2-release', t));

  let toastX = 655;
  let toastY = 247;
  let toastRotation = -2;

  if (launchP > 0) {
    toastX = lerp(655, 687, launchP);
    toastY = lerp(247, 154, launchP) - Math.sin(Math.PI * launchP) * 32;
    toastRotation = lerp(-2, 16, launchP);
  }

  if (landP > 0) {
    toastX = lerp(687, 660, landP);
    toastY = lerp(154, 304, landP * landP) - Math.sin(Math.PI * landP) * 12;
    toastRotation = lerp(16, 3, landP);
  }

  const doorRotation = -1.6 * recoil + lerp(0, -9.5, sag);

  const plate1 = {
    x: lerp(644, 604, plate1P),
    y: fallingY(121, 306, plate1P),
    rotation: lerp(-1, -8, plate1P),
    visible: plate1P > 0 && breakP < 1,
    progress: plate1P,
    broken: breakP > 0,
    opacity: breakP > 0 ? 1 - breakP : plate1P > 0 ? 1 : 0,
  };

  const plate2 = {
    x: lerp(638, 626, plate2P),
    y: fallingY(124, 304, plate2P),
    rotation: lerp(1, 7, plate2P),
    visible: plate2P > 0,
    progress: plate2P,
  };

  const shardFrames = shards.map((target, index) => {
    const local = smooth(clamp((breakP - index * .05) / (1 - index * .05)));
    return {
      x: lerp(604, target.x, local),
      y: lerp(306, target.y, local) - Math.sin(Math.PI * local) * (5 + index),
      rotation: lerp(index % 2 ? 5 : -4, target.rotation, local),
      scale: lerp(.45, target.scale, local),
      opacity: breakP > index * .05 ? 1 : 0,
    };
  });

  const doorContactStart = eventStart('plate-1-release');
  const contactDelta = t - doorContactStart;
  const contactOpacity = contactDelta >= -80 && contactDelta <= 170
    ? Math.max(0, 1 - Math.abs(contactDelta - 20) / 120)
    : 0;

  const breakStart = eventStart('plate-1-break');
  const breakDelta = t - breakStart;
  const breakFlashOpacity = breakDelta >= 0 && breakDelta <= 120
    ? Math.max(0, 1 - breakDelta / 120)
    : 0;

  return {
    toast: {
      x: toastX,
      y: toastY,
      rotation: toastRotation,
      visible: launchP > 0 || landP > 0,
      slotPatchOpacity: launchP > 0 || landP > 0 ? 1 : 0,
      landed: landP >= 1,
    },
    door: {
      rotation: doorRotation,
      recoil,
      sag,
      gapOpacity: sag > 0 ? Math.min(1, sag * 1.3) : 0,
    },
    plate1,
    plate2,
    shards: shardFrames,
    contactOpacity,
    breakFlashOpacity,
    damageIds: roomStateAt(KITCHEN_NATIVE_TIMELINE, t).damageIds,
  };
}
