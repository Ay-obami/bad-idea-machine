import { expect, it } from 'vitest';
import { kitchenFrame, KITCHEN_PROOF_DURATION } from './kitchen-proof';

it('keeps the toaster supported and places toast contact on the cabinet lower edge', () => {
  expect(kitchenFrame(0).toaster).toEqual({ x: 535, y: 248, rotation: 0 });
  const contact = kitchenFrame(1050);
  expect(contact.toast.y).toBe(173);
  expect(contact.toast.x).toBe(550);
  expect(contact.door.rotation).toBe(0);
  expect(kitchenFrame(1200).door.rotation).toBeGreaterThan(0);
  expect(kitchenFrame(1200).plates.y).toBe(145);
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
