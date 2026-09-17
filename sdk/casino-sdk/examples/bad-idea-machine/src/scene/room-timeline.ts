import type { RoomEvent, ScheduledRoomEvent } from './room-model';

/** A dependent event begins only after its cause reaches contact/completion. */
export function compileRoomTimeline(events: readonly RoomEvent[]): readonly ScheduledRoomEvent[] {
  const byId = new Map<string, RoomEvent>();
  for (const event of events) {
    if (byId.has(event.id)) throw new Error(`Duplicate room event: ${event.id}`);
    if (![event.delayMs, event.durationMs].every(value => Number.isFinite(value) && value >= 0)) {
      throw new Error(`Invalid timing for room event: ${event.id}`);
    }
    byId.set(event.id, event);
  }
  const compiled = new Map<string, ScheduledRoomEvent>();
  const visiting = new Set<string>();
  function visit(id: string): ScheduledRoomEvent {
    const prior = compiled.get(id);
    if (prior) return prior;
    if (visiting.has(id)) throw new Error(`Room event cycle at: ${id}`);
    const event = byId.get(id);
    if (!event) throw new Error(`Missing room event dependency: ${id}`);
    visiting.add(id);
    const cause = event.after ? visit(event.after) : undefined;
    const startMs = (cause ? cause.startMs + cause.durationMs : 0) + event.delayMs;
    if (!Number.isFinite(startMs + event.durationMs)) throw new Error(`Invalid accumulated timing: ${id}`);
    const result = { ...event, startMs };
    compiled.set(id, result);
    visiting.delete(id);
    return result;
  }
  return events.map(event => visit(event.id)).sort((a, b) => a.startMs - b.startMs);
}
