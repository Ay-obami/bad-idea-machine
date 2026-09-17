import { expect, it } from 'vitest';
import { greaseFireFrame, KITCHEN_GREASE_FIRE_DURATION } from './kitchen-grease-fire';

it('keeps the pan supported until a real ceramic fragment reaches its handle', () => {
  const before = greaseFireFrame(2350);
  expect(before.triggerShard.visible).toBe(true);
  expect(before.triggerShard.contactProgress).toBeLessThan(1);
  expect(before.pan.motion).toBe(0);
  expect(before.pan.supported).toBe(true);

  const contact = greaseFireFrame(2820);
  expect(contact.triggerShard.contactProgress).toBe(1);
  expect(contact.pan.contactPulse).toBeGreaterThan(0);
  expect(contact.pan.motion).toBeGreaterThan(0);
  expect(contact.pan.supported).toBe(true);
});

it('tips and slides the pan instead of launching it through the room', () => {
  const rest = greaseFireFrame(0).pan;
  const displaced = greaseFireFrame(3600).pan;
  expect(Math.abs(displaced.x - rest.x)).toBeLessThanOrEqual(18);
  expect(Math.abs(displaced.y - rest.y)).toBeLessThanOrEqual(6);
  expect(Math.abs(displaced.rotation - rest.rotation)).toBeLessThanOrEqual(16);
  expect(displaced.supported).toBe(true);
});

it('does not ignite until oil physically reaches the hot burner', () => {
  const tipped = greaseFireFrame(3420);
  expect(tipped.oil.progress).toBeGreaterThan(0);
  expect(tipped.ignition.progress).toBe(0);

  const almostThere = greaseFireFrame(4180);
  expect(almostThere.oil.progress).toBeGreaterThan(.75);
  expect(almostThere.ignition.progress).toBe(0);

  const ignited = greaseFireFrame(4480);
  expect(ignited.oil.progress).toBe(1);
  expect(ignited.ignition.progress).toBeGreaterThan(0);
  expect(ignited.ignition.x).toBeCloseTo(176);
  expect(ignited.ignition.y).toBeCloseTo(307);
});

it('roots smoke and scorch at the same localized burner contact point', () => {
  const burning = greaseFireFrame(5600);
  expect(burning.fire.root).toEqual({ x: burning.ignition.x, y: burning.ignition.y });
  expect(burning.smoke.root).toEqual(burning.fire.root);
  expect(burning.scorch.center).toEqual(burning.fire.root);
  expect(burning.fire.intensity).toBeGreaterThan(0);
  expect(burning.smoke.opacity).toBeGreaterThan(0);
});

it('persists the physical aftermath until reset without changing the accepted proof opening', () => {
  const final = greaseFireFrame(KITCHEN_GREASE_FIRE_DURATION);
  expect(final.damageIds).toEqual(['pan-displaced', 'oil-spill', 'localized-grease-fire', 'burner-scorch']);
  expect(final.pan.motion).toBe(1);
  expect(final.oil.progress).toBe(1);
  expect(final.fire.intensity).toBeGreaterThan(0);
  expect(greaseFireFrame(60_000)).toEqual(final);
  expect(greaseFireFrame(0).damageIds).toEqual([]);
  expect(greaseFireFrame(0).pan.motion).toBe(0);
});
