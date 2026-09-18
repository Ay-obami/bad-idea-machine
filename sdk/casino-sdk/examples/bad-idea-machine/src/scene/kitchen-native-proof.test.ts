import { describe, expect, it } from 'vitest';
import {
  KITCHEN_NATIVE_TIMELINE,
  kitchenNativeFrameAt,
} from './kitchen-native-proof';

describe('layered toaster-to-pan kitchen proof', () => {
  it('keeps the contact chain ordered: toaster -> handle -> pan -> settle', () => {
    const byId = new Map(KITCHEN_NATIVE_TIMELINE.map(event => [event.id, event]));
    const eject = byId.get('toast-eject')!;
    const handle = byId.get('handle-contact')!;
    const pan = byId.get('pan-contact')!;
    const settle = byId.get('toast-settle')!;

    expect(handle.startMs).toBe(eject.startMs + eject.durationMs);
    expect(pan.startMs).toBe(handle.startMs + handle.durationMs);
    expect(settle.startMs).toBe(pan.startMs + pan.durationMs);
  });

  it('starts from the exact source position with the source patch hidden', () => {
    const frame = kitchenNativeFrameAt(0);
    expect(frame.toast.visible).toBe(false);
    expect(frame.toastSourcePatchOpacity).toBe(0);
    expect(frame.panLipOpacity).toBe(0);
    expect(frame.greaseDroplets.every(drop => drop.opacity === 0)).toBe(true);
  });

  it('reveals the real source patch as soon as the toast leaves the toaster', () => {
    const eject = KITCHEN_NATIVE_TIMELINE.find(event => event.id === 'toast-eject')!;
    const frame = kitchenNativeFrameAt(eject.startMs + 1);

    expect(frame.toast.visible).toBe(true);
    expect(frame.toastSourcePatchOpacity).toBe(1);
    expect(Math.abs(frame.toast.x - 661)).toBeLessThan(2);
    expect(Math.abs(frame.toast.y - 247)).toBeLessThan(2);
  });

  it('reaches the real pan handle before the pan bowl', () => {
    const handle = KITCHEN_NATIVE_TIMELINE.find(event => event.id === 'handle-contact')!;
    const atHandle = kitchenNativeFrameAt(handle.startMs + 1);
    expect(Math.abs(atHandle.toast.x - 517)).toBeLessThan(4);
    expect(Math.abs(atHandle.toast.y - 267)).toBeLessThan(4);
    expect(atHandle.handleContactOpacity).toBeGreaterThan(0);

    const pan = KITCHEN_NATIVE_TIMELINE.find(event => event.id === 'pan-contact')!;
    const beforePan = kitchenNativeFrameAt(pan.startMs - 1);
    expect(beforePan.panContactOpacity).toBe(0);
  });

  it('occludes the toast with the photographic pan lip once it enters the bowl', () => {
    const pan = KITCHEN_NATIVE_TIMELINE.find(event => event.id === 'pan-contact')!;
    const inside = kitchenNativeFrameAt(pan.startMs + pan.durationMs / 2);

    expect(inside.panLipOpacity).toBe(1);
    expect(inside.toast.y).toBeGreaterThanOrEqual(282);
    expect(inside.toast.y).toBeLessThanOrEqual(296);
  });

  it('starts grease only at pan contact and keeps the splash small', () => {
    const pan = KITCHEN_NATIVE_TIMELINE.find(event => event.id === 'pan-contact')!;
    const before = kitchenNativeFrameAt(pan.startMs - 1);
    const after = kitchenNativeFrameAt(pan.startMs + 80);

    expect(before.greaseDroplets.every(drop => drop.opacity === 0)).toBe(true);
    expect(after.greaseDroplets.some(drop => drop.opacity > 0)).toBe(true);
    expect(after.greaseDroplets.every(drop => Math.abs(drop.x - 420) < 60)).toBe(true);
  });

  it('settles the toast inside the pan instead of hanging in the air', () => {
    const end = kitchenNativeFrameAt(10_000);
    expect(end.toast.landed).toBe(true);
    expect(end.toast.x).toBeGreaterThanOrEqual(404);
    expect(end.toast.x).toBeLessThanOrEqual(424);
    expect(end.toast.y).toBeGreaterThanOrEqual(284);
    expect(end.toast.y).toBeLessThanOrEqual(292);
    expect(end.toast.scaleY).toBeLessThanOrEqual(.68);
    expect(end.panLipOpacity).toBe(1);
    expect(end.damageIds).toEqual(['toast-in-pan']);
  });

  it('reset restores the untouched approved master', () => {
    const frame = kitchenNativeFrameAt(0);
    expect(frame.damageIds).toEqual([]);
    expect(frame.toast.visible).toBe(false);
    expect(frame.toastSourcePatchOpacity).toBe(0);
    expect(frame.panLipOpacity).toBe(0);
  });
});
