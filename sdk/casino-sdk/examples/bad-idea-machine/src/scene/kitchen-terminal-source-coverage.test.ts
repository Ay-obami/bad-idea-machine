import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { KITCHEN_TERMINAL_LAYER_PLAN } from './kitchen-terminal-layer-plan';
import { KITCHEN_TERMINAL_SOURCE_EVIDENCE, kitchenTerminalSourceEvidence } from './kitchen-terminal-source-coverage';
import {
  KITCHEN_KETTLE_TRUTH, KITCHEN_PLATE_TRUTH, KITCHEN_TOASTER_TRUTH,
  KITCHEN_TOAST_TRUTH, KITCHEN_TOWEL_TRUTH,
} from './kitchen-object-truth-proof';

const framesByUrl = new Map<string, Record<string, unknown>>([
  [KITCHEN_KETTLE_TRUTH.atlasUrl, KITCHEN_KETTLE_TRUTH.frames],
  [KITCHEN_PLATE_TRUTH.atlasUrl, KITCHEN_PLATE_TRUTH.frames],
  [KITCHEN_TOASTER_TRUTH.atlasUrl, KITCHEN_TOASTER_TRUTH.frames],
  [KITCHEN_TOAST_TRUTH.atlasUrl, KITCHEN_TOAST_TRUTH.frames],
  [KITCHEN_TOWEL_TRUTH.atlasUrl, KITCHEN_TOWEL_TRUTH.frames],
]);

describe('Kitchen terminal source evidence', () => {
  it('names existing local files and real atlas frames for active plan states', () => {
    const active = new Set(KITCHEN_TERMINAL_LAYER_PLAN.map(layer => `${layer.kind}/${layer.ownerId}/${layer.state}`));
    for (const [key, evidence] of Object.entries(KITCHEN_TERMINAL_SOURCE_EVIDENCE)) {
      expect(active.has(key), key).toBe(true);
      expect(evidence.url.startsWith('/rooms/kitchen/rebuild/truth/'), key).toBe(true);
      expect(existsSync(new URL(`../../public${evidence.url}`, import.meta.url)), key).toBe(true);
      if (evidence.frame) {
        const frames = framesByUrl.get(evidence.url);
        expect(frames, key).toBeDefined();
        for (const frame of evidence.frame.split('+')) expect(frames, key).toHaveProperty(frame);
      }
    }
  });

  it('does not promote a visual study or a whole hero plate to completed shattered art', () => {
    for (const layer of KITCHEN_TERMINAL_LAYER_PLAN) {
      if (layer.kind === 'prop' && layer.ownerId === 'hero-plate' && layer.state === 'shattered') {
        expect(kitchenTerminalSourceEvidence(layer)).toBeUndefined();
      }
      if (layer.kind === 'architecture' && layer.state === 'smoke-stained') {
        expect(kitchenTerminalSourceEvidence(layer)?.status).not.toBe('direct');
      }
    }
  });
});
