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
    expect(sag.startMs).toBe(recoil.startMs + recoil.durationMs + 40);
    expect(plates.startMs).toBe(sag.startMs + sag.durationMs);
  });

  it('does not move later actors before their physical cause', () => {
    const intact = kitchenNativeFrameAt(0);
    expect(intact.toast.opacity).toBe(0);
    expect(intact.door.rotation).toBe(0);
    expect(intact.plates.every(plate => plate.opacity === 0)).toBe(true);

    const toastOnly = kitchenNativeFrameAt(800);
    expect(toastOnly.toast.opacity).toBe(1);
    expect(toastOnly.door.rotation).toBe(0);
    expect(toastOnly.plates.every(plate => plate.opacity === 0)).toBe(true);
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
