import { describe, expect, it } from 'vitest';
import type { RoomEvent } from './room-model';
import { compileRoomTimeline } from './room-timeline';

const event = (id: string, after?: string, delayMs = 20, durationMs = 100): RoomEvent => ({
  id,
  objectId: id,
  after,
  delayMs,
  durationMs,
});

describe('causal room timeline', () => {
  it('starts each dependent event only after its cause completes', () => {
    const timeline = compileRoomTimeline([
      event('plates', 'door'),
      event('toast'),
      event('door', 'toast'),
    ]);

    expect(timeline.map(({ id, startMs }) => [id, startMs])).toEqual([
      ['toast', 20],
      ['door', 140],
      ['plates', 260],
    ]);
  });

  it('keeps sibling ordering deterministic when start times match', () => {
    const timeline = compileRoomTimeline([
      event('cause', undefined, 0, 100),
      event('left', 'cause', 0, 50),
      event('right', 'cause', 0, 50),
    ]);

    expect(timeline.map(event => event.id)).toEqual(['cause', 'left', 'right']);
  });

  it('rejects missing dependencies, cycles and duplicate identities', () => {
    expect(() => compileRoomTimeline([event('plates', 'missing')])).toThrow(/missing/i);
    expect(() => compileRoomTimeline([event('a', 'b'), event('b', 'a')])).toThrow(/cycle/i);
    expect(() => compileRoomTimeline([event('a'), event('a')])).toThrow(/duplicate/i);
  });

  it.each([-1, Infinity, NaN])('rejects invalid timing %s', value => {
    expect(() => compileRoomTimeline([{ ...event('a'), durationMs: value }])).toThrow(/timing/i);
    expect(() => compileRoomTimeline([{ ...event('a'), delayMs: value }])).toThrow(/timing/i);
  });
});
