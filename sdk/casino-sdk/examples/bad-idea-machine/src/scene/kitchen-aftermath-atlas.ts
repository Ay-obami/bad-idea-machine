import type { OutcomeTier } from '../lib/badIdea';
import {
  KITCHEN_DESTRUCTION_BLUEPRINT,
  type KitchenZoneId,
} from './kitchen-destruction-blueprint';

export type KitchenAftermathZoneFrame = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
  destX: number;
  destY: number;
}>;

const TIERS = [0, 1, 2, 3, 4] as const satisfies readonly OutcomeTier[];
const ATLAS_WIDTH = 2048;
const PADDING = 3;

function buildFrames(): Readonly<Record<string, KitchenAftermathZoneFrame>> {
  const source = TIERS.flatMap(tier =>
    KITCHEN_DESTRUCTION_BLUEPRINT.zones.map(zone => ({
      tier,
      zoneId: zone.id,
      destX: zone.bounds.x,
      destY: zone.bounds.y,
      width: zone.bounds.width,
      height: zone.bounds.height,
    })),
  ).sort((a, b) => b.height - a.height);

  let cursorX = PADDING;
  let cursorY = PADDING;
  let rowHeight = 0;
  const frames: Record<string, KitchenAftermathZoneFrame> = {};

  for (const item of source) {
    if (cursorX + item.width + PADDING > ATLAS_WIDTH) {
      cursorY += rowHeight + PADDING;
      cursorX = PADDING;
      rowHeight = 0;
    }

    frames[`${item.tier}/${item.zoneId}`] = {
      x: cursorX,
      y: cursorY,
      width: item.width,
      height: item.height,
      destX: item.destX,
      destY: item.destY,
    };

    cursorX += item.width + PADDING;
    rowHeight = Math.max(rowHeight, item.height);
  }

  return frames;
}

const frames = buildFrames();

export const KITCHEN_AFTERMATH_ZONE_ATLAS = {
  url: 'https://cdn.creativeclaw.co/u/534269cc/images/5da39fb6-ac5d-410c-8560-3fb4be81b60a.png',
  width: ATLAS_WIDTH,
  height: 1897,
  role: 'registered-local-zone-source' as const,
  packaging: 'durable-cdn-pending-repo-copy' as const,
  frames,
} as const;

export function kitchenAftermathZoneFrame(
  tier: OutcomeTier,
  zoneId: KitchenZoneId,
): KitchenAftermathZoneFrame {
  const frame = KITCHEN_AFTERMATH_ZONE_ATLAS.frames[`${tier}/${zoneId}`];
  if (!frame) throw new Error(`Missing Kitchen aftermath atlas frame: ${tier}/${zoneId}`);
  return frame;
}

export function validateKitchenAftermathZoneAtlas(): readonly string[] {
  const errors: string[] = [];
  const expected = TIERS.length * KITCHEN_DESTRUCTION_BLUEPRINT.zones.length;

  if (Object.keys(frames).length !== expected) {
    errors.push(`aftermath frame count is ${Object.keys(frames).length}; expected ${expected}`);
  }

  for (const tier of TIERS) {
    for (const zone of KITCHEN_DESTRUCTION_BLUEPRINT.zones) {
      const frame = frames[`${tier}/${zone.id}`];
      if (!frame) {
        errors.push(`missing frame: ${tier}/${zone.id}`);
        continue;
      }

      if (frame.destX !== zone.bounds.x ||
          frame.destY !== zone.bounds.y ||
          frame.width !== zone.bounds.width ||
          frame.height !== zone.bounds.height) {
        errors.push(`registration mismatch: ${tier}/${zone.id}`);
      }

      if (frame.x < 0 ||
          frame.y < 0 ||
          frame.x + frame.width > KITCHEN_AFTERMATH_ZONE_ATLAS.width ||
          frame.y + frame.height > KITCHEN_AFTERMATH_ZONE_ATLAS.height) {
        errors.push(`frame outside atlas: ${tier}/${zone.id}`);
      }

      if (frame.width === 1000 && frame.height === 600) {
        errors.push(`forbidden full-frame aftermath: ${tier}/${zone.id}`);
      }
    }
  }

  return errors;
}
