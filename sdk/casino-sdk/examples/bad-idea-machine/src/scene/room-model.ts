export type Point = Readonly<{ x: number; y: number }>;
export type RoomEvent = Readonly<{
  id: string;
  objectId: string;
  after?: string;
  delayMs: number;
  durationMs: number;
  contact?: Point;
  damageId?: string;
}>;
export type ScheduledRoomEvent = RoomEvent & Readonly<{ startMs: number }>;
export type RoomState = Readonly<{ damageIds: readonly string[] }>;
export type RoomObjectDefinition = Readonly<{
  id: string;
  sprite: string;
  rest: Point;
  size: Readonly<{ width: number; height: number }>;
  pivot: Point;
  depth: number;
  support: string;
  material: 'metal' | 'wood' | 'ceramic' | 'bread';
}>;
