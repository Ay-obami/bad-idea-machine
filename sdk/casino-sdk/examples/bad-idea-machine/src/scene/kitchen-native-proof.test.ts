import { describe, expect, it } from 'vitest';
import { KITCHEN_NATIVE_TIMELINE, kitchenNativeFrameAt } from './kitchen-native-proof';

describe('master-first kitchen realism proof', () => {
  it('keeps door and plates causally ordered', () => {
    const byId = new Map(KITCHEN_NATIVE_TIMELINE.map(event => [event.id, event]));
    const launch = byId.get('toast-launch')!;
    const recoil = byId.get('door-recoil')!;
    const sag = byId.get('door-sag')!;
    const firstPlate = byId.get('plate-1-release')!;
    const breakEvent = byId.get('plate-1-break')!;
    const secondPlate = byId.get('plate-2-release')!;

    expect(recoil.startMs).toBe(launch.startMs + launch.durationMs);
    expect(sag.startMs).toBe(recoil.startMs + recoil.durationMs + 35);
    expect(firstPlate.startMs).toBe(sag.startMs + sag.durationMs);
    expect(breakEvent.startMs).toBe(firstPlate.startMs + firstPlate.durationMs);
    expect(secondPlate.startMs).toBe(breakEvent.startMs + breakEvent.durationMs + 20);
  });

  it('lands the toast instead of leaving it suspended', () => {
    const aftermath = kitchenNativeFrameAt(10_000);
    expect(aftermath.toast.landed).toBe(true);
    expect(aftermath.toast.y).toBeGreaterThanOrEqual(300);
    expect(aftermath.toast.y).toBeLessThanOrEqual(306);
  });

  it('keeps the cabinet door constrained to a small upper-hinge sag', () => {
    const aftermath = kitchenNativeFrameAt(10_000);
    expect(aftermath.door.rotation).toBeGreaterThanOrEqual(-9.51);
    expect(aftermath.door.rotation).toBeLessThanOrEqual(-9.49);
  });

  it('does not materialize either hero plate before door contact', () => {
    const firstRelease = KITCHEN_NATIVE_TIMELINE.find(event => event.id === 'plate-1-release')!;
    const before = kitchenNativeFrameAt(firstRelease.startMs - 1);
    expect(before.plate1.visible).toBe(false);
    expect(before.plate2.visible).toBe(false);
  });

  it('breaks the first plate and keeps shards on the counter', () => {
    const aftermath = kitchenNativeFrameAt(10_000);
    expect(aftermath.plate1.opacity).toBe(0);
    expect(aftermath.shards.every(shard => shard.opacity === 1)).toBe(true);
    expect(aftermath.shards.every(shard => shard.y >= 305 && shard.y <= 313)).toBe(true);
    expect(aftermath.damageIds).toContain('plate-1-broken');
  });

  it('settles the second plate on the counter and preserves the aftermath', () => {
    const aftermath = kitchenNativeFrameAt(10_000);
    expect(aftermath.plate2.visible).toBe(true);
    expect(aftermath.plate2.y).toBeGreaterThanOrEqual(303);
    expect(aftermath.plate2.y).toBeLessThanOrEqual(305);
    expect(aftermath.damageIds).toEqual([
      'lower-hinge-failed',
      'plate-1-broken',
      'plate-stack-displaced',
    ]);
  });

  it('resets to the untouched master state', () => {
    const reset = kitchenNativeFrameAt(0);
    expect(reset.toast.visible).toBe(false);
    expect(reset.door.rotation).toBe(0);
    expect(reset.plate1.visible).toBe(false);
    expect(reset.plate2.visible).toBe(false);
    expect(reset.shards.every(shard => shard.opacity === 0)).toBe(true);
    expect(reset.damageIds).toEqual([]);
  });
});
