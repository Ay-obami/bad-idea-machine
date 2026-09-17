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
  expect(final.damageIds).toContain('loose-hinge');
  expect(final.damageIds).toContain('broken-plates');
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
  expect(final.upperHinge.attached).toBe(true);
  expect(final.upperHinge.x).toBe(initial.upperHinge.x);
  expect(final.upperHinge.y).toBe(initial.upperHinge.y);
  expect(final.upperHinge.load).toBeGreaterThan(.5);
  expect(final.hingeScrew.y).toBeGreaterThan(initial.hingeScrew.y + 100);
});

it('makes the lower hinge visibly tear away before the door reaches the plates', () => {
  const intact = kitchenFrame(1100).lowerHinge;
  const released = kitchenFrame(1500).lowerHinge;
  expect(intact.separation).toBeLessThan(1);
  expect(released.separation).toBeGreaterThan(8);
  expect(released.rotation).toBeGreaterThan(8);
  expect(released.shadowOpacity).toBeGreaterThan(.2);
});

it('requires visible door-to-plate contact before any plate begins its flight', () => {
  const before = kitchenFrame(1600);
  expect(before.doorPlateContact.progress).toBe(0);
  expect(before.individualPlates.every(plate => plate.flightProgress === 0)).toBe(true);

  const contact = kitchenFrame(1660);
  expect(contact.doorPlateContact.active).toBe(true);
  expect(contact.doorPlateContact.progress).toBeGreaterThan(0);
  expect(contact.individualPlates.every(plate => plate.flightProgress === 0)).toBe(true);
  expect(contact.individualPlates[3].x).toBeLessThan(471.5);

  const after = kitchenFrame(1720);
  expect(after.doorPlateContact.progress).toBe(1);
  expect(after.individualPlates[3].flightProgress).toBeGreaterThan(0);
});

it('keeps falling plates visibly ceramic instead of collapsing into paper-thin strips', () => {
  const samples = [1760, 1900, 2100]
    .flatMap(time => kitchenFrame(time).individualPlates)
    .filter(plate => !plate.shattered);
  expect(samples.length).toBeGreaterThan(0);
  expect(samples.every(plate => plate.faceHeight >= 11)).toBe(true);
  expect(samples.every(plate => plate.bodyDepth >= 3.5)).toBe(true);
  expect(samples.every(plate => Math.abs(plate.rotation) <= 15)).toBe(true);
});

it('separates the plates before impact and scatters each from its own contact', () => {
  const falling = kitchenFrame(1850).individualPlates;
  expect(falling).toHaveLength(4);
  expect(new Set(falling.map(plate => plate.rotation)).size).toBeGreaterThan(1);
  expect(new Set(falling.map(plate => plate.impactMs)).size).toBe(4);
  expect(new Set(falling.map(plate => plate.faceHeight.toFixed(3))).size).toBeGreaterThan(1);
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

it('keeps the pan grounded on the stove until the ceramic trigger physically reaches it', () => {
  const before = kitchenFrame(2380);
  expect(before.pan.x).toBeCloseTo(142);
  expect(before.pan.y).toBeCloseTo(292);
  expect(before.pan.motion).toBe(0);
  expect(before.panTrigger.visible).toBe(false);

  const inFlight = kitchenFrame(2750);
  expect(inFlight.panTrigger.visible).toBe(true);
  expect(inFlight.panTrigger.progress).toBeGreaterThan(0);
  expect(inFlight.pan.motion).toBe(0);

  const contact = kitchenFrame(3300);
  expect(contact.panTrigger.progress).toBe(1);
  expect(contact.pan.contact).toBeGreaterThan(0);
  expect(contact.pan.motion).toBeGreaterThan(0);
});

it('starts the oil spill only after the pan is displaced, then ignites only after oil reaches the hot burner', () => {
  expect(kitchenFrame(3300).oil.progress).toBe(0);
  const tilted = kitchenFrame(3700);
  expect(tilted.pan.motion).toBeGreaterThan(.4);
  expect(tilted.oil.progress).toBeGreaterThan(0);
  expect(tilted.fire.progress).toBe(0);

  const wetBurner = kitchenFrame(4500);
  expect(wetBurner.oil.progress).toBe(1);
  expect(wetBurner.fire.progress).toBeGreaterThan(0);
  expect(wetBurner.fire.x).toBeCloseTo(wetBurner.oil.to.x);
  expect(wetBurner.fire.y).toBeCloseTo(wetBurner.oil.to.y);
});

it('persists the physical pan displacement, grease mark and localized burner damage until reset', () => {
  const final = kitchenFrame(KITCHEN_PROOF_DURATION);
  expect(final.pan.motion).toBe(1);
  expect(final.oil.progress).toBe(1);
  expect(final.fire.progress).toBe(1);
  expect(final.damageIds).toContain('grease-spill');
  expect(final.damageIds).toContain('localized-burner-fire');
  expect(kitchenFrame(0).pan.motion).toBe(0);
  expect(kitchenFrame(0).oil.progress).toBe(0);
  expect(kitchenFrame(0).fire.progress).toBe(0);
});
