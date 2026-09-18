import { compileRoomTimeline } from './room-timeline';
import { roomStateAt } from './room-state';
import type { RoomEvent } from './room-model';

export const KITCHEN_NATIVE_EVENTS: readonly RoomEvent[] = [
  { id: 'toast-eject', objectId: 'toast', delayMs: 350, durationMs: 650, contact: { x: 517, y: 285 } },
  { id: 'handle-contact', objectId: 'toast', after: 'toast-eject', delayMs: 0, durationMs: 80, contact: { x: 517, y: 285 } },
  { id: 'pan-contact', objectId: 'toast', after: 'handle-contact', delayMs: 0, durationMs: 400, contact: { x: 420, y: 288 } },
  { id: 'toast-settle', objectId: 'toast', after: 'pan-contact', delayMs: 0, durationMs: 480, contact: { x: 414, y: 289 }, damageId: 'toast-in-pan' },
  { id: 'grease-splash', objectId: 'grease', after: 'pan-contact', delayMs: 0, durationMs: 420, contact: { x: 420, y: 288 } },
] as const;

export const KITCHEN_NATIVE_TIMELINE = compileRoomTimeline(KITCHEN_NATIVE_EVENTS);
export const KITCHEN_NATIVE_DURATION =
  Math.max(...KITCHEN_NATIVE_TIMELINE.map(event => event.startMs + event.durationMs)) + 550;

type GreaseDrop = Readonly<{ x: number; y: number; scale: number; opacity: number }>;

export type KitchenNativeFrame = Readonly<{
  toast: Readonly<{
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    visible: boolean;
    landed: boolean;
    shadowOpacity: number;
    shadowScale: number;
  }>;
  toastSourcePatchOpacity: number;
  handleContactOpacity: number;
  panContactOpacity: number;
  panLipOpacity: number;
  greaseDroplets: readonly GreaseDrop[];
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

function quadratic(
  start: Readonly<{ x: number; y: number }>,
  control: Readonly<{ x: number; y: number }>,
  end: Readonly<{ x: number; y: number }>,
  t: number,
) {
  const p = clamp(t);
  const one = 1 - p;
  return {
    x: one * one * start.x + 2 * one * p * control.x + p * p * end.x,
    y: one * one * start.y + 2 * one * p * control.y + p * p * end.y,
  };
}

const greaseTargets = [
  { x: 392, y: 263, scale: .55 },
  { x: 406, y: 252, scale: .42 },
  { x: 427, y: 248, scale: .48 },
  { x: 444, y: 260, scale: .38 },
  { x: 457, y: 271, scale: .31 },
] as const;

export function kitchenNativeFrameAt(time: number): KitchenNativeFrame {
  const t = Math.max(0, Math.min(KITCHEN_NATIVE_DURATION, Number.isFinite(time) ? time : 0));

  const eject = smooth(progress('toast-eject', t));
  const handle = smooth(progress('handle-contact', t));
  const pan = smooth(progress('pan-contact', t));
  const settleRaw = progress('toast-settle', t);
  const settle = smooth(settleRaw);
  const splash = progress('grease-splash', t);

  let x = 661;
  let y = 247;
  let rotation = -4;
  let scaleX = 1;
  let scaleY = 1;

  if (eject > 0) {
    const point = quadratic({ x: 661, y: 247 }, { x: 598, y: 135 }, { x: 517, y: 285 }, eject);
    x = point.x;
    y = point.y;
    rotation = -4 + 31 * eject;
  }

  if (handle > 0) {
    x = 517 - 12 * handle;
    y = 285 - 10 * Math.sin(Math.PI * handle);
    rotation = 27 - 34 * handle;
    scaleX = 1 - .06 * Math.sin(Math.PI * handle);
    scaleY = 1 + .08 * Math.sin(Math.PI * handle);
  }

  if (pan > 0) {
    const point = quadratic({ x: 505, y: 285 }, { x: 463, y: 230 }, { x: 420, y: 288 }, pan);
    x = point.x;
    y = point.y;
    rotation = -7 + 19 * pan;
    scaleX = 1 - .05 * pan;
    scaleY = 1 - .18 * pan;
  }

  if (settle > 0) {
    if (settleRaw < .48) {
      const p = smooth(settleRaw / .48);
      x = 420 - 5 * p;
      y = 288 - Math.sin(Math.PI * p) * 10;
      rotation = 12 - 8 * p;
      scaleX = .95 - .04 * p;
      scaleY = .82 - .12 * p;
    } else {
      const p = smooth((settleRaw - .48) / .52);
      x = 415 - 1 * p;
      y = 288 + 1 * p;
      rotation = 4 - 2 * p;
      scaleX = .91 - .02 * p;
      scaleY = .70 - .04 * p;
    }
  }

  const handleDelta = t - eventStart('handle-contact');
  const handleContactOpacity =
    handleDelta >= -55 && handleDelta <= 135
      ? Math.max(0, 1 - Math.abs(handleDelta - 25) / 100)
      : 0;

  const panDelta = t - (eventStart('pan-contact') + 340);
  const panContactOpacity =
    panDelta >= -60 && panDelta <= 120
      ? Math.max(0, 1 - Math.abs(panDelta - 10) / 95)
      : 0;

  const greaseDroplets = greaseTargets.map((target, index) => {
    const delay = index * .07;
    const local = smooth(clamp((splash - delay) / Math.max(.01, 1 - delay)));
    const fade = clamp(1 - Math.max(0, local - .62) / .38);
    return {
      x: 420 + (target.x - 420) * local,
      y: 288 + (target.y - 288) * local - Math.sin(Math.PI * local) * (9 + index * 2.5),
      scale: .42 + (target.scale - .42) * local,
      opacity: splash > delay ? fade * .72 : 0,
    };
  });

  const toastVisible = eject > 0 || handle > 0 || pan > 0 || settle > 0;
  const nearPan = pan > .46 || settle > 0;

  return {
    toast: {
      x,
      y,
      rotation,
      scaleX,
      scaleY,
      visible: toastVisible,
      landed: settleRaw >= 1,
      shadowOpacity: toastVisible ? clamp((y - 150) / 155) * .34 : 0,
      shadowScale: toastVisible ? .45 + clamp((y - 150) / 155) * .55 : 0,
    },
    toastSourcePatchOpacity: toastVisible ? 1 : 0,
    handleContactOpacity,
    panContactOpacity,
    panLipOpacity: nearPan ? 1 : 0,
    greaseDroplets,
    damageIds: roomStateAt(KITCHEN_NATIVE_TIMELINE, t).damageIds,
  };
}
