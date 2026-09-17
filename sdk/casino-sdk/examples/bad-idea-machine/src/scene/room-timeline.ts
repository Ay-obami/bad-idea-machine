import type { RoomEvent, ScheduledRoomEvent } from './room-model';

/**
 * Resolves a causal event graph into absolute times.
 *
 * A dependent event starts only after its cause has completed plus its own
 * delay. The returned order is deterministic even when siblings start at the
 * same time.
 */
export function compileRoomTimeline(events: readonly RoomEvent[]): readonly ScheduledRoomEvent[] {
  const byId = new Map<string, RoomEvent>();
  const sourceOrder = new Map<string, number>();

  events.forEach((event, index) => {
    if (byId.has(event.id)) throw new Error(`Duplicate room event: ${event.id}`);
    if (![event.delayMs, event.durationMs].every(value => Number.isFinite(value) && value >= 0)) {
      throw new Error(`Invalid timing for room event: ${event.id}`);
    }
    byId.set(event.id, event);
    sourceOrder.set(event.id, index);
  });

  const compiled = new Map<string, ScheduledRoomEvent>();
  const visiting = new Set<string>();

  function visit(id: string): ScheduledRoomEvent {
    const existing = compiled.get(id);
    if (existing) return existing;
    if (visiting.has(id)) throw new Error(`Room event dependency cycle at: ${id}`);

    const event = byId.get(id);
    if (!event) throw new Error(`Missing room event dependency: ${id}`);

    visiting.add(id);
    const cause = event.after ? visit(event.after) : undefined;
    const startMs = (cause ? cause.startMs + cause.durationMs : 0) + event.delayMs;

    if (!Number.isFinite(startMs + event.durationMs)) {
      throw new Error(`Invalid accumulated timing for room event: ${id}`);
    }

    const scheduled = { ...event, startMs };
    compiled.set(id, scheduled);
    visiting.delete(id);
    return scheduled;
  }

  return events
    .map(event => visit(event.id))
    .sort((a, b) => a.startMs - b.startMs || sourceOrder.get(a.id)! - sourceOrder.get(b.id)!);
}
