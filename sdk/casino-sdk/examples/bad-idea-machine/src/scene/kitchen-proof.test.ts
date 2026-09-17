import { expect, it } from 'vitest';
import { kitchenFrame, KITCHEN_PROOF_DURATION } from './kitchen-proof';

it('keeps the toaster supported and places toast contact on the cabinet lower edge', () => {
  expect(kitchenFrame(0).toaster).toEqual({ x: 535, y: 248, rotation: 0 });
  const contact = kitchenFrame(1050);
  expect(contact.toast.y).toBe(173);
  expect(contact.toast.x).toBe(550);
  expect(contact.door.rotation).toBe(0);
  expect(kitchenFrame(1200).door.rotation).toBeGreaterThan(0);
  expect(kitchenFrame(1200).individualPlates.map(plate => plate.y)).toEqual([159.5, 156.5, 153.5, 150.5]);
});

it('leaves broken ceramic and a displaced door until reset, including after a skipped frame', () => {
  const final = kitchenFrame(KITCHEN_PROOF_DURATION);
  expect(final.damageIds).toEqual(['loose-hinge', 'broken-plates']);
  expect(final.platesVisible).toBe(false);
  expect(final.shardsVisible).toBe(true);
  expect(final.door.rotation).toBeGreaterThan(0);
  expect(kitchenFrame(60_000)).toEqual(final);
  expect(kitchenFrame(0).damageIds).toEqual([]);
  expect(kitchenFrame(0).shardsVisible).toBe(false);
});

it('lays the toast flat on the counter after a bounce, with a persistent contact shadow', () => {
  const final = kitchenFrame(4000);
  expect(final.toast.scaleY).toBeLessThan(.4);
  expect(final.toast.y + 17).toBeCloseTo(310);
  expect(final.toast.shadowOpacity).toBeGreaterThan(.3);
  expect(final.toast.rotation).toBeLessThan(20);
});

it('keeps the upper hinge anchored while the door turns in depth and the loose screw falls', () => {
  const initial = kitchenFrame(0);
  const final = kitchenFrame(4000);
  expect(initial.door.yaw).toBe(0);
  expect(final.door.yaw).toBeGreaterThan(20);
  expect(final.door.matrix[0]).toBeLessThan(Math.cos(final.door.rotation * Math.PI / 180));
  const [a, b, c, d, e, f] = final.door.matrix;
  expect(a * 606 + c * 14 + e).toBeCloseTo(606);
  expect(b * 606 + d * 14 + f).toBeCloseTo(14);
  expect(final.hingeScrew.y).toBeGreaterThan(initial.hingeScrew.y + 100);
});

it('separates the plates before impact and scatters each from its own contact', () => {
  const falling = kitchenFrame(1850).individualPlates;
  expect(falling).toHaveLength(4);
  expect(new Set(falling.map(plate => plate.rotation)).size).toBeGreaterThan(1);
  expect(new Set(falling.map(plate => plate.impactMs)).size).toBe(4);
  const firstImpact = Math.min(...falling.map(plate => plate.impactMs));
  expect(kitchenFrame(firstImpact - 1).individualPlates.filter(plate => plate.shattered)).toHaveLength(0);
  const contact = kitchenFrame(firstImpact + 1);
  expect(contact.individualPlates.filter(plate => plate.shattered)).toHaveLength(1);
  expect(contact.ceramicFragments.length).toBeGreaterThan(0);
  expect(kitchenFrame(4000).individualPlates.every(plate => plate.shattered)).toBe(true);
  expect(kitchenFrame(0).ceramicFragments).toEqual([]);
});

it('settles the fragments flat instead of leaving upright shard cutouts', () => {
  const pieces = kitchenFrame(4000).ceramicFragments;
  expect(pieces).toHaveLength(24);
  expect(pieces.every(piece => piece.scaleY <= .5)).toBe(true);
});
