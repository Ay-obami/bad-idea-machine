import { expect, it } from 'vitest';
import { applyRoomEvent, roomStateAt } from './room-state';

const hit = { id: 'cabinet-hit', objectId: 'cabinet', delayMs: 0, durationMs: 250, damageId: 'broken-hinge' };

it('accumulates damage once without mutating prior room state', () => {
  const initial = { damageIds: ['old-chip'] };
  const once = applyRoomEvent(initial, hit);
  expect(applyRoomEvent(once, hit).damageIds).toEqual(['old-chip', 'broken-hinge']);
  expect(initial.damageIds).toEqual(['old-chip']);
});

it('commits damage at contact and retains it after the motion has finished', () => {
  const timeline = [{ ...hit, startMs: 100 }];
  expect(roomStateAt(timeline, 349).damageIds).toEqual([]);
  expect(roomStateAt(timeline, 350).damageIds).toEqual(['broken-hinge']);
  expect(roomStateAt(timeline, 60_000).damageIds).toEqual(['broken-hinge']);
  expect(roomStateAt(timeline, 0).damageIds).toEqual([]);
});
