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
      for (const related of evidence.relatedUrls ?? []) {
        expect(related.startsWith('/rooms/kitchen/rebuild/truth/'), key).toBe(true);
        expect(existsSync(new URL(`../../public${related}`, import.meta.url)), key).toBe(true);
      }
      if (evidence.frame) {
        const frames = framesByUrl.get(evidence.url);
        expect(frames, key).toBeDefined();
        for (const frame of evidence.frame.split('+')) expect(frames, key).toHaveProperty(frame);
      }
    }
  });

  it('keeps the shattered hero and debris on one physical study, not two plate bodies', () => {
    const hero = KITCHEN_TERMINAL_LAYER_PLAN.find(layer => layer.kind === 'prop' && layer.ownerId === 'hero-plate' && layer.state === 'shattered');
    const debris = KITCHEN_TERMINAL_LAYER_PLAN.find(layer => layer.kind === 'debris' && layer.ownerId === 'ceramic-debris' && layer.state === 'one-plate-shards');
    expect(hero).toBeDefined();
    expect(debris).toBeDefined();
    const heroEvidence = kitchenTerminalSourceEvidence(hero!);
    const debrisEvidence = kitchenTerminalSourceEvidence(debris!);
    expect(heroEvidence?.status).toBe('study');
    expect(heroEvidence?.sharedPhysicalDebris).toBe(true);
    expect(debrisEvidence?.sharedPhysicalDebris).toBe(true);
    expect(heroEvidence?.url).toBe(debrisEvidence?.url);
    expect(heroEvidence?.relatedUrls).toEqual(debrisEvidence?.relatedUrls);
    for (const layer of KITCHEN_TERMINAL_LAYER_PLAN) {
      if (layer.kind === 'architecture' && layer.state === 'smoke-stained') {
        expect(kitchenTerminalSourceEvidence(layer)?.status).not.toBe('direct');
      }
    }
  });
});
