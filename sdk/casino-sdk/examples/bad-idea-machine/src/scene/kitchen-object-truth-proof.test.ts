import { describe, expect, it } from 'vitest';

import {
  KITCHEN_PAN_TRUTH,
  kitchenPanTruthLayers,
  validateKitchenPanTruth,
} from './kitchen-object-truth-proof';

describe('kitchen pan single-object truth proof', () => {
  it('uses only repository-local source assets', () => {
    expect(validateKitchenPanTruth()).toEqual([]);

    for (const url of [
      KITCHEN_PAN_TRUTH.referenceUrl,
      KITCHEN_PAN_TRUTH.supportUrl,
      KITCHEN_PAN_TRUTH.bodyUrl,
      KITCHEN_PAN_TRUTH.shadowUrl,
    ]) {
      expect(url).toMatch(/^\/rooms\/kitchen\/truth\//);
      expect(url).not.toMatch(/creativeclaw/i);
      expect(url).not.toMatch(/^https?:\/\//i);
    }
  });

  it('keeps every pan layer registered to one 240x110 crop', () => {
    expect(KITCHEN_PAN_TRUTH.width).toBe(240);
    expect(KITCHEN_PAN_TRUTH.height).toBe(110);
    expect(KITCHEN_PAN_TRUTH.logicalBounds).toEqual({
      x: 325,
      y: 235,
      width: 240,
      height: 110,
    });
  });

  it('always renders support first, with shadow and body independently optional', () => {
    expect(kitchenPanTruthLayers(false, false)).toEqual(['support']);
    expect(kitchenPanTruthLayers(false, true)).toEqual(['support', 'shadow']);
    expect(kitchenPanTruthLayers(true, false)).toEqual(['support', 'body']);
    expect(kitchenPanTruthLayers(true, true)).toEqual(['support', 'shadow', 'body']);
  });

  it('does not contain toaster, debris, mask or replacement assets in this gate', () => {
    const serialized = JSON.stringify(KITCHEN_PAN_TRUTH);
    expect(serialized).not.toMatch(/toaster|debris|mask|replacement/i);
  });
});
