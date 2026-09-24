import { describe, expect, it } from 'vitest';

import {
  KITCHEN_PAN_TRUTH,
  KITCHEN_TOAST_TRUTH,
  KITCHEN_TOWEL_TRUTH,
  KITCHEN_PLATE_TRUTH,
  KITCHEN_KETTLE_TRUTH,
  KITCHEN_TOASTER_TRUTH,
  kitchenPanTruthLayers,
  kitchenToastTruthLayers,
  kitchenTowelTruthLayers,
  kitchenPlateTruthLayers,
  kitchenKettleTruthLayers,
  kitchenToasterTruthLayers,
  validateKitchenPanTruth,
  validateKitchenToastTruth,
  validateKitchenTowelTruth,
  validateKitchenPlateTruth,
  validateKitchenKettleTruth,
  validateKitchenToasterTruth,
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

  it('separates the remaining slice from the hero and reveals an empty support when both are hidden', () => {
    expect(kitchenToastTruthLayers(false, false, false)).toEqual(['support']);
    expect(kitchenToastTruthLayers(false, false, true)).toEqual(['support', 'remainingBody']);
    expect(kitchenToastTruthLayers(false, true, false)).toEqual(['support', 'shadow']);
    expect(kitchenToastTruthLayers(true, false, false)).toEqual(['support', 'body']);
    expect(kitchenToastTruthLayers(true, true)).toEqual(['support', 'remainingBody', 'shadow', 'body']);
  });

  it('registers the oven towel as a repository-local atlas over a clean oven support', () => {
    expect(validateKitchenTowelTruth()).toEqual([]);
    expect(KITCHEN_TOWEL_TRUTH.atlasUrl).toMatch(/^\/rooms\/kitchen\/rebuild\/truth\//);
    expect(KITCHEN_TOWEL_TRUTH.atlasUrl).not.toMatch(/creativeclaw|^https?:\/\//i);

    expect(KITCHEN_TOWEL_TRUTH.logicalBounds).toEqual({
      x: 430,
      y: 360,
      width: 125,
      height: 175,
    });

    expect(KITCHEN_TOWEL_TRUTH.supportSource)
      .toBe('deterministic-local-oven-reconstruction');
  });

  it('keeps towel body and shadow independently optional over the restored oven front', () => {
    expect(kitchenTowelTruthLayers(false, false)).toEqual(['support']);
    expect(kitchenTowelTruthLayers(false, true)).toEqual(['support', 'shadow']);
    expect(kitchenTowelTruthLayers(true, false)).toEqual(['support', 'body']);
    expect(kitchenTowelTruthLayers(true, true)).toEqual(['support', 'shadow', 'body']);
  });

  it('does not use the reconstructed full toast face in the intact rest stack', () => {
    const layers = kitchenToastTruthLayers(true, true);
    expect(layers).not.toContain('face');
    expect(KITCHEN_TOAST_TRUTH.hiddenFaceSource)
      .toBe('deterministic-local-reconstruction-from-approved-toast-pixels');
  });

  it('keeps a separate hero plate and stationary stack above one local cabinet support', () => {
    expect(validateKitchenPlateTruth()).toEqual([]);
    expect(KITCHEN_PLATE_TRUTH.atlasUrl).toMatch(/^\/rooms\/kitchen\/rebuild\/truth\//);
    expect(KITCHEN_PLATE_TRUTH.atlasUrl).not.toMatch(/creativeclaw|^https?:\/\//i);
    expect(KITCHEN_PLATE_TRUTH.logicalBounds).toEqual({ x: 555, y: 67, width: 135, height: 85 });
    expect(KITCHEN_PLATE_TRUTH.frames.heroBody).not.toEqual(KITCHEN_PLATE_TRUTH.frames.stackBody);
    expect(KITCHEN_PLATE_TRUTH.restPlacement.heroBody.y).toBeLessThan(
      KITCHEN_PLATE_TRUTH.restPlacement.stackBody.y,
    );
  });

  it('lets each plate body and contact shadow toggle independently without spawning an object', () => {
    expect(kitchenPlateTruthLayers(false, false, false, false)).toEqual(['support']);
    expect(kitchenPlateTruthLayers(true, false, false, false)).toEqual(['support', 'stackBody']);
    expect(kitchenPlateTruthLayers(false, true, false, false)).toEqual(['support', 'stackShadow']);
    expect(kitchenPlateTruthLayers(false, false, true, false)).toEqual(['support', 'heroBody']);
    expect(kitchenPlateTruthLayers(false, false, false, true)).toEqual(['support', 'heroShadow']);
    expect(kitchenPlateTruthLayers(true, true, true, true)).toEqual([
      'support', 'stackShadow', 'stackBody', 'heroShadow', 'heroBody',
    ]);
  });

  it('keeps kettle, contact shadow and counter reflection independently removable', () => {
    expect(validateKitchenKettleTruth()).toEqual([]);
    expect(KITCHEN_KETTLE_TRUTH.atlasUrl).toMatch(/^\/rooms\/kitchen\/rebuild\/truth\//);
    expect(KITCHEN_KETTLE_TRUTH.logicalBounds).toEqual({ x: 720, y: 216, width: 120, height: 120 });
    expect(kitchenKettleTruthLayers(false, false, false)).toEqual(['support']);
    expect(kitchenKettleTruthLayers(false, true, false)).toEqual(['support', 'shadow']);
    expect(kitchenKettleTruthLayers(false, false, true)).toEqual(['support', 'reflection']);
    expect(kitchenKettleTruthLayers(true, false, false)).toEqual(['support', 'body']);
    expect(kitchenKettleTruthLayers(true, true, true)).toEqual([
      'support', 'shadow', 'reflection', 'body',
    ]);
  });

  it('separates the toaster, cord, wall shadow, contact shadow and reflection over a clean counter', () => {
    expect(validateKitchenToasterTruth()).toEqual([]);
    expect(KITCHEN_TOASTER_TRUTH.atlasUrl).toMatch(/^\/rooms\/kitchen\/rebuild\/truth\//);
    expect(KITCHEN_TOASTER_TRUTH.logicalBounds).toEqual({ x: 585, y: 205, width: 150, height: 130 });
    expect(kitchenToasterTruthLayers(false, false, false, false, false)).toEqual(['support']);
    expect(kitchenToasterTruthLayers(true, false, false, false, false)).toEqual(['support', 'body']);
    expect(kitchenToasterTruthLayers(false, true, false, false, false)).toEqual(['support', 'cord']);
    expect(kitchenToasterTruthLayers(false, false, true, false, false)).toEqual(['support', 'wallShadow']);
    expect(kitchenToasterTruthLayers(false, false, false, true, false)).toEqual(['support', 'contactShadow']);
    expect(kitchenToasterTruthLayers(false, false, false, false, true)).toEqual(['support', 'reflection']);
    expect(kitchenToasterTruthLayers(true, true, true, true, true)).toEqual([
      'support', 'wallShadow', 'contactShadow', 'reflection', 'body', 'cord',
    ]);
  });
});
