import { describe, expect, it } from 'vitest';

import { KITCHEN_AFTERMATH_AUTHORING } from './kitchen-aftermath-authoring';

describe('kitchen aftermath authoring plates', () => {
  it('records exactly one registered authoring plate for every payout tier', () => {
    expect(Object.keys(KITCHEN_AFTERMATH_AUTHORING).sort()).toEqual(['0', '1', '2', '3', '4']);

    for (const tier of [0, 1, 2, 3, 4] as const) {
      const plate = KITCHEN_AFTERMATH_AUTHORING[tier];
      expect(plate.tier).toBe(tier);
      expect(plate.url).toMatch(/^https:\/\/cdn\.creativeclaw\.co\//);
      expect(plate.runtimeRole).toBe('authoring-reference-only');
      expect(plate.allowedAsFullFrameOutcome).toBe(false);
    }
  });

  it('keeps the five art directions distinct instead of treating tiers as one smoke slider', () => {
    const directions = new Set(
      Object.values(KITCHEN_AFTERMATH_AUTHORING).map(plate => plate.artDirection),
    );
    expect(directions.size).toBe(5);
  });
});
