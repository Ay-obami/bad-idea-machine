import { describe, expect, it } from 'vitest';

import {
  KITCHEN_PAN_TRUTH,
  KITCHEN_TOAST_TRUTH,
  kitchenPanTruthLayers,
  kitchenToastTruthLayers,
  validateKitchenPanTruth,
  validateKitchenToastTruth,
} from './kitchen-object-truth-proof';

describe('kitchen single-object truth proofs', () => {
  it('uses only repository-local pan assets', () => {
    expect(validateKitchenPanTruth()).toEqual([]);

    for (const url of [
      KITCHEN_PAN_TRUTH.referenceUrl,
      KITCHEN_PAN_TRUTH.supportUrl,
      KITCHEN_PAN_TRUTH.bodyUrl,
      KITCHEN_PAN_TRUTH.shadowUrl,
    ]) {
      expect(url).toMatch(/^\/rooms\/kitchen\/rebuild\/truth\//);
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

  it('always renders pan support first, with shadow and body independently optional', () => {
    expect(kitchenPanTruthLayers(false, false)).toEqual(['support']);
    expect(kitchenPanTruthLayers(false, true)).toEqual(['support', 'shadow']);
    expect(kitchenPanTruthLayers(true, false)).toEqual(['support', 'body']);
    expect(kitchenPanTruthLayers(true, true)).toEqual(['support', 'shadow', 'body']);
  });

  it('registers the hero toast as a repository-local atlas with an exact rest state and a complete airborne face', () => {
    expect(validateKitchenToastTruth()).toEqual([]);
    expect(KITCHEN_TOAST_TRUTH.atlasUrl).toMatch(/^\/rooms\/kitchen\/rebuild\/truth\//);
    expect(KITCHEN_TOAST_TRUTH.atlasUrl).not.toMatch(/creativeclaw|^https?:\/\//i);

    expect(KITCHEN_TOAST_TRUTH.logicalBounds).toEqual({
      x: 585,
      y: 205,
      width: 150,
      height: 130,
    });

    expect(KITCHEN_TOAST_TRUTH.frames.body).toEqual({
      x: 0,
      y: 132,
      width: 37,
      height: 19,
    });
    expect(KITCHEN_TOAST_TRUTH.frames.face.width).toBeGreaterThan(
      KITCHEN_TOAST_TRUTH.frames.body.width,
    );
    expect(KITCHEN_TOAST_TRUTH.frames.face.height).toBeGreaterThan(
      KITCHEN_TOAST_TRUTH.frames.body.height,
    );
  });

  it('keeps the hero toast rest body and shadow independently optional over a support that preserves the remaining toast', () => {
    expect(kitchenToastTruthLayers(false, false)).toEqual(['support']);
    expect(kitchenToastTruthLayers(false, true)).toEqual(['support', 'shadow']);
    expect(kitchenToastTruthLayers(true, false)).toEqual(['support', 'body']);
    expect(kitchenToastTruthLayers(true, true)).toEqual(['support', 'shadow', 'body']);
  });

  it('does not use the reconstructed full toast face in the intact rest stack', () => {
    const layers = kitchenToastTruthLayers(true, true);
    expect(layers).not.toContain('face');
    expect(KITCHEN_TOAST_TRUTH.hiddenFaceSource)
      .toBe('deterministic-local-reconstruction-from-approved-toast-pixels');
  });
});
