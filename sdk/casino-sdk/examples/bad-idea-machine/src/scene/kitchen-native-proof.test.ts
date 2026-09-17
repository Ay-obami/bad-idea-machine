import { describe, expect, it } from 'vitest';
import { KITCHEN_NATIVE_TIMELINE, kitchenNativeFrameAt } from './kitchen-native-proof';

describe('master-first kitchen proof', () => {
  it('keeps the interaction causally ordered', () => {
    const byId = new Map(KITCHEN_NATIVE_TIMELINE.map(event => [event.id, event]));
    const toast = byId.get('toast-launch')!;
    const recoil = byId.get('door-recoil')!;
    const sag = byId.get('door-sag')!;
    const plates = byId.get('plates-release')!;

    expect(recoil.startMs).toBe(toast.startMs + toast.durationMs);
    expect(sag.startMs).toBe(recoil.startMs + recoil.durationMs + 55);
    expect(plates.startMs).toBe(sag.startMs + sag.durationMs);
  });

  it('does not move later actors before their physical cause', () => {
    const intact = kitchenNativeFrameAt(0);
    expect(intact.toast.opacity).toBe(0);
    expect(intact.door.rotation).toBe(0);
    expect(intact.plates.every(plate => plate.opacity === 0)).toBe(true);

    const toastOnly = kitchenNativeFrameAt(850);
    expect(toastOnly.toast.opacity).toBe(1);
    expect(toastOnly.door.rotation).toBe(0);
    expect(toastOnly.plates.every(plate => plate.opacity === 0)).toBe(true);
  });

  it('keeps the hanging door restrained instead of turning it into a flying slab', () => {
    const aftermath = kitchenNativeFrameAt(10_000);
    expect(aftermath.door.rotation).toBeGreaterThanOrEqual(-14.01);
    expect(aftermath.door.rotation).toBeLessThanOrEqual(-13.9);
    expect(Math.abs(aftermath.door.x - 676)).toBeLessThanOrEqual(6.01);
    expect(aftermath.door.y).toBeLessThanOrEqual(9.01);
  });

  it('keeps ceramic plates broad with restrained roll', () => {
    const aftermath = kitchenNativeFrameAt(10_000);
    expect(aftermath.plates.every(plate => Math.abs(plate.rotation) <= 11)).toBe(true);
    expect(aftermath.plates.every(plate => plate.scale >= .95 && plate.scale <= 1.02)).toBe(true);
  });

  it('persists hinge and plate damage after the cascade completes', () => {
    const aftermath = kitchenNativeFrameAt(10_000);
    expect(aftermath.damageIds).toEqual(['lower-hinge-failed', 'plates-displaced']);
    expect(aftermath.plates.every(plate => plate.progress === 1)).toBe(true);
  });

  it('reconstructs a clean reset deterministically', () => {
    const reset = kitchenNativeFrameAt(0);
    expect(reset.damageIds).toEqual([]);
    expect(reset.toast.patchOpacity).toBe(0);
    expect(reset.door.patchOpacity).toBe(0);
    expect(reset.platesPatchOpacity).toBe(0);
  });
});
