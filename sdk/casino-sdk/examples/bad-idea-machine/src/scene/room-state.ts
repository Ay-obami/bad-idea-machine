import type { RoomEvent, RoomState, ScheduledRoomEvent } from './room-model';

export function applyRoomEvent(state: RoomState, event: RoomEvent): RoomState {
  if (!event.damageId || state.damageIds.includes(event.damageId)) return state;
  return { damageIds: [...state.damageIds, event.damageId] };
}

/** Reconstructible state makes seeking, tab suspension, and replay deterministic. */
export function roomStateAt(events: readonly ScheduledRoomEvent[], elapsedMs: number): RoomState {
  return events.reduce<RoomState>((state, event) => elapsedMs >= event.startMs + event.durationMs
    ? applyRoomEvent(state, event) : state, { damageIds: [] });
}
