import { expect, it } from 'vitest';
import type { RoomEvent, ScheduledRoomEvent } from './room-model';
import { applyRoomEvent, roomStateAt } from './room-state';

const hit: RoomEvent = {
  id: 'cabinet-hit',
  objectId: 'cabinet',
  delayMs: 0,
  durationMs: 250,
  damageId: 'broken-hinge',
};

it('accumulates damage once without mutating the prior room state', () => {
  const initial = { damageIds: ['old-chip'] };
  const once = applyRoomEvent(initial, hit);
  const twice = applyRoomEvent(once, hit);

  expect(once.damageIds).toEqual(['old-chip', 'broken-hinge']);
  expect(twice.damageIds).toEqual(['old-chip', 'broken-hinge']);
  expect(initial.damageIds).toEqual(['old-chip']);
});

it('commits damage at event completion and preserves it after skipped frames', () => {
  const timeline: readonly ScheduledRoomEvent[] = [{ ...hit, startMs: 100 }];

  expect(roomStateAt(timeline, 349).damageIds).toEqual([]);
  expect(roomStateAt(timeline, 350).damageIds).toEqual(['broken-hinge']);
  expect(roomStateAt(timeline, 60_000).damageIds).toEqual(['broken-hinge']);
  expect(roomStateAt(timeline, 0).damageIds).toEqual([]);
});

it('ignores invalid elapsed time instead of accidentally applying damage', () => {
  const timeline: readonly ScheduledRoomEvent[] = [{ ...hit, startMs: 100 }];
  expect(roomStateAt(timeline, Number.NaN).damageIds).toEqual([]);
});
