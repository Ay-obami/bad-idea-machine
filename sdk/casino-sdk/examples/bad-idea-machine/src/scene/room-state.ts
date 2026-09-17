import type { RoomEvent, RoomState, ScheduledRoomEvent } from './room-model';

export function applyRoomEvent(state: RoomState, event: RoomEvent): RoomState {
  if (!event.damageId || state.damageIds.includes(event.damageId)) return state;
  return { damageIds: [...state.damageIds, event.damageId] };
}

/**
 * Reconstructs durable room damage from absolute time.
 *
 * Damage commits when the event that caused it completes. Rebuilding from the
 * timeline keeps seeking, tab suspension and reset deterministic.
 */
export function roomStateAt(events: readonly ScheduledRoomEvent[], elapsedMs: number): RoomState {
  const time = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
  return events.reduce<RoomState>(
    (state, event) => time >= event.startMs + event.durationMs ? applyRoomEvent(state, event) : state,
    { damageIds: [] },
  );
}
