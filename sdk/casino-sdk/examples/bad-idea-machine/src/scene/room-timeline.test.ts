import { describe, expect, it } from 'vitest';
import { compileRoomTimeline } from './room-timeline';
import type { RoomEvent } from './room-model';

const event = (id: string, after?: string): RoomEvent => ({ id, objectId: id, after, delayMs: 20, durationMs: 100 });

describe('causal room timeline', () => {
  it('waits for contact to finish even when the input is not dependency ordered', () => {
    expect(compileRoomTimeline([event('plates', 'door'), event('toast'), event('door', 'toast')])
      .map(({ id, startMs }) => [id, startMs])).toEqual([['toast', 20], ['door', 140], ['plates', 260]]);
  });
  it('rejects a missing cause, cycles, and duplicate event identities', () => {
    expect(() => compileRoomTimeline([event('plates', 'missing')])).toThrow(/missing/i);
    expect(() => compileRoomTimeline([event('a', 'b'), event('b', 'a')])).toThrow(/cycle/i);
    expect(() => compileRoomTimeline([event('a'), event('a')])).toThrow(/duplicate/i);
  });
  it.each([-1, Infinity, NaN])('rejects invalid timing %s instead of running early or waiting forever', value => {
    expect(() => compileRoomTimeline([{ ...event('a'), durationMs: value }])).toThrow(/timing/i);
    expect(() => compileRoomTimeline([{ ...event('a'), delayMs: value }])).toThrow(/timing/i);
  });
});
