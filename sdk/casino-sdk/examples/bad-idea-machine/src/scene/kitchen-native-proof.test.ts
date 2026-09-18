import { describe, expect, it } from 'vitest';
import { KITCHEN_NATIVE_TIMELINE, kitchenNativeFrameAt } from './kitchen-native-proof';

describe('continuous kitchen realism proof', () => {
  it('does not reveal the moving plate before the cabinet contact completes', () => {
    const release = KITCHEN_NATIVE_TIMELINE.find(event => event.id === 'plate-release')!;
    const before = kitchenNativeFrameAt(release.startMs - 1);
    const at = kitchenNativeFrameAt(release.startMs + 1);

    expect(before.plate.visible).toBe(false);
    expect(before.plate.originPatchOpacity).toBe(0);
    expect(at.plate.visible).toBe(true);
    expect(at.plate.originPatchOpacity).toBe(1);
    expect(Math.abs(at.plate.x - 623)).toBeLessThan(1);
    expect(Math.abs(at.plate.y - 145)).toBeLessThan(1);
  });

  it('lands the toast flat on the counter after a small bounce', () => {
    const end = kitchenNativeFrameAt(10_000);
    expect(end.toast.landed).toBe(true);
    expect(end.toast.y).toBeGreaterThanOrEqual(303);
    expect(end.toast.y).toBeLessThanOrEqual(305);
    expect(end.toast.scaleY).toBeLessThanOrEqual(.37);
  });

  it('keeps the cabinet attached and only swings around its hinge axis', () => {
    const samples = [900, 1000, 1100, 1250].map(kitchenNativeFrameAt);
    expect(samples.every(frame => frame.door.yaw >= -15 && frame.door.yaw <= 0)).toBe(true);
    expect(kitchenNativeFrameAt(10_000).door.yaw).toBeCloseTo(-3.5, 1);
  });

  it('transitions one plate continuously from stack rim to broad ceramic face', () => {
    const release = KITCHEN_NATIVE_TIMELINE.find(event => event.id === 'plate-release')!;
    const early = kitchenNativeFrameAt(release.startMs + 70);
    const middle = kitchenNativeFrameAt(release.startMs + 350);

    expect(early.plate.rimOpacity).toBeGreaterThan(0);
    expect(early.plate.scaleY).toBeLessThan(.65);
    expect(middle.plate.faceOpacity).toBeGreaterThan(.8);
    expect(middle.plate.scaleY).toBeGreaterThan(.7);
  });

  it('fractures only after counter impact and keeps every fragment on the counter', () => {
    const fracture = KITCHEN_NATIVE_TIMELINE.find(event => event.id === 'plate-fracture')!;
    const before = kitchenNativeFrameAt(fracture.startMs - 1);
    const end = kitchenNativeFrameAt(10_000);

    expect(before.fragments.every(fragment => fragment.opacity === 0)).toBe(true);
    expect(end.fragments.every(fragment => fragment.opacity === 1)).toBe(true);
    expect(end.fragments.every(fragment => fragment.y >= 305 && fragment.y <= 313)).toBe(true);
    expect(end.damageIds).toEqual(['cabinet-misaligned', 'plate-broken', 'ceramic-debris']);
  });

  it('reset is the untouched approved master', () => {
    const reset = kitchenNativeFrameAt(0);
    expect(reset.toast.visible).toBe(false);
    expect(reset.door.patchOpacity).toBe(0);
    expect(reset.plate.visible).toBe(false);
    expect(reset.plate.originPatchOpacity).toBe(0);
    expect(reset.fragments.every(fragment => fragment.opacity === 0)).toBe(true);
    expect(reset.damageIds).toEqual([]);
  });
});
