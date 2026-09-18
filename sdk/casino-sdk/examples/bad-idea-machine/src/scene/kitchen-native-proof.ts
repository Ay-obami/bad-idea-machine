import { compileRoomTimeline } from './room-timeline';
import { roomStateAt } from './room-state';
import type { RoomEvent } from './room-model';

export const KITCHEN_NATIVE_MASTER = 'https://cdn.creativeclaw.co/u/534269cc/images/d48c2325-2071-4642-92a1-5d174d35444a.png';

export const KITCHEN_NATIVE_EVENTS: readonly RoomEvent[] = [
  { id: 'toast-launch', objectId: 'toast', delayMs: 320, durationMs: 430, contact: { x: 687, y: 154 } },
  { id: 'toast-fall', objectId: 'toast', after: 'toast-launch', delayMs: 0, durationMs: 690, contact: { x: 658, y: 304 } },
  { id: 'door-swing', objectId: 'cabinet-door', after: 'toast-launch', delayMs: 0, durationMs: 360, contact: { x: 651, y: 142 }, damageId: 'cabinet-misaligned' },
  { id: 'plate-release', objectId: 'plate-1', after: 'door-swing', delayMs: 80, durationMs: 680, contact: { x: 604, y: 307 } },
  { id: 'plate-fracture', objectId: 'plate-1', after: 'plate-release', delayMs: 0, durationMs: 150, contact: { x: 604, y: 307 }, damageId: 'plate-broken' },
  { id: 'fragments-settle', objectId: 'plate-fragments', after: 'plate-fracture', delayMs: 0, durationMs: 420, damageId: 'ceramic-debris' },
] as const;

export const KITCHEN_NATIVE_TIMELINE = compileRoomTimeline(KITCHEN_NATIVE_EVENTS);
export const KITCHEN_NATIVE_DURATION =
  Math.max(...KITCHEN_NATIVE_TIMELINE.map(event => event.startMs + event.durationMs)) + 650;

type ToastFrame = Readonly<{
  x: number;
  y: number;
  rotation: number;
  scaleY: number;
  visible: boolean;
  sourcePatchOpacity: number;
  landed: boolean;
}>;

type DoorFrame = Readonly<{
  yaw: number;
  settle: number;
  patchOpacity: number;
}>;

type PlateFrame = Readonly<{
  x: number;
  y: number;
  roll: number;
  scaleY: number;
  rimOpacity: number;
  faceOpacity: number;
  visible: boolean;
  originPatchOpacity: number;
  crackOpacity: number;
  bodyOpacity: number;
}>;

type FragmentFrame = Readonly<{
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
}>;

export type KitchenNativeFrame = Readonly<{
  toast: ToastFrame;
  door: DoorFrame;
  plate: PlateFrame;
  fragments: readonly FragmentFrame[];
  doorPlateContactOpacity: number;
  plateImpactOpacity: number;
  damageIds: readonly string[];
}>;

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function smooth(value: number) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function progress(id: string, time: number) {
  const event = KITCHEN_NATIVE_TIMELINE.find(item => item.id === id);
  if (!event) return 0;
  return clamp((time - event.startMs) / event.durationMs);
}

function eventStart(id: string) {
  return KITCHEN_NATIVE_TIMELINE.find(item => item.id === id)?.startMs ?? 0;
}

const fragmentTargets = [
  { x: 589, y: 309, rotation: -38, scale: 1.02 },
  { x: 596, y: 305, rotation: 18, scale: .78 },
  { x: 604, y: 312, rotation: 42, scale: .93 },
  { x: 613, y: 307, rotation: -16, scale: .74 },
  { x: 621, y: 311, rotation: 27, scale: .64 },
  { x: 629, y: 306, rotation: -9, scale: .55 },
] as const;

export function kitchenNativeFrameAt(time: number): KitchenNativeFrame {
  const t = Math.max(0, Math.min(KITCHEN_NATIVE_DURATION, Number.isFinite(time) ? time : 0));

  const launchP = smooth(progress('toast-launch', t));
  const fallRaw = progress('toast-fall', t);
  const fallP = smooth(fallRaw);
  const doorP = smooth(progress('door-swing', t));
  const plateP = smooth(progress('plate-release', t));
  const fractureP = smooth(progress('plate-fracture', t));
  const settleP = smooth(progress('fragments-settle', t));

  let toastX = 649;
  let toastY = 246;
  let toastRotation = -2;
  let toastScaleY = 1;

  if (launchP > 0) {
    toastX = lerp(649, 687, launchP);
    toastY = lerp(246, 154, launchP) - Math.sin(Math.PI * launchP) * 35;
    toastRotation = lerp(-2, 13, launchP);
  }

  if (fallP > 0) {
    if (fallRaw < .72) {
      const p = smooth(fallRaw / .72);
      toastX = lerp(687, 664, p);
      toastY = lerp(154, 304, p * p) - Math.sin(Math.PI * p) * 8;
      toastRotation = lerp(13, 5, p);
      toastScaleY = lerp(1, .62, p);
    } else {
      const p = smooth((fallRaw - .72) / .28);
      toastX = lerp(664, 658, p);
      toastY = 304 - Math.sin(Math.PI * p) * 7 * (1 - p);
      toastRotation = lerp(5, 2, p);
      toastScaleY = lerp(.62, .36, p);
    }
  }

  const yawPulse = Math.sin(Math.PI * doorP);
  const doorYaw = -11 * yawPulse - 3.5 * doorP;

  const plateX = lerp(623, 604, plateP);
  const plateY = lerp(145, 307, plateP * plateP);
  const plateScaleY = lerp(.34, .96, Math.sin((Math.PI / 2) * plateP));
  const plateRoll = lerp(-1.5, -7, plateP);

  const crackOpacity = fractureP > 0 && fractureP < 1
    ? Math.sin(Math.PI * fractureP)
    : 0;

  const fragmentFrames = fragmentTargets.map((target, index) => {
    const start = index * .055;
    const local = smooth(clamp((settleP - start) / (1 - start)));
    return {
      x: lerp(604, target.x, local),
      y: lerp(307, target.y, local) - Math.sin(Math.PI * local) * (5 + index * .7),
      rotation: lerp(index % 2 ? 4 : -4, target.rotation, local),
      scale: lerp(.56, target.scale, local),
      opacity: settleP > start ? 1 : 0,
    };
  });

  const doorContactDelta = t - eventStart('plate-release');
  const doorPlateContactOpacity =
    doorContactDelta >= -90 && doorContactDelta <= 170
      ? Math.max(0, 1 - Math.abs(doorContactDelta - 20) / 125)
      : 0;

  const impactDelta = t - eventStart('plate-fracture');
  const plateImpactOpacity =
    impactDelta >= 0 && impactDelta <= 120
      ? Math.max(0, 1 - impactDelta / 120)
      : 0;

  return {
    toast: {
      x: toastX,
      y: toastY,
      rotation: toastRotation,
      scaleY: toastScaleY,
      visible: launchP > 0 || fallP > 0,
      sourcePatchOpacity: launchP > 0 || fallP > 0 ? 1 : 0,
      landed: fallRaw >= 1,
    },
    door: {
      yaw: doorYaw,
      settle: doorP,
      patchOpacity: doorP > 0 ? 1 : 0,
    },
    plate: {
      x: plateX,
      y: plateY,
      roll: plateRoll,
      scaleY: plateScaleY,
      rimOpacity: plateP > 0 ? Math.max(0, 1 - plateP * 3.2) : 0,
      faceOpacity: plateP > 0 ? clamp((plateP - .08) / .30) : 0,
      visible: plateP > 0 && fractureP < 1,
      originPatchOpacity: plateP > 0 || fractureP > 0 || settleP > 0 ? 1 : 0,
      crackOpacity,
      bodyOpacity: fractureP > 0 ? 1 - fractureP : plateP > 0 ? 1 : 0,
    },
    fragments: fragmentFrames,
    doorPlateContactOpacity,
    plateImpactOpacity,
    damageIds: roomStateAt(KITCHEN_NATIVE_TIMELINE, t).damageIds,
  };
}
