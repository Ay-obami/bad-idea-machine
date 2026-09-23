import { describe, expect, it } from 'vitest';

import { KITCHEN_DESTRUCTION_BLUEPRINT } from './kitchen-destruction-blueprint';
import {
  KITCHEN_INTACT_ATLAS,
  KITCHEN_INTACT_DRAW_ORDER,
  validateKitchenIntactAtlas,
  type KitchenAtlasFrame,
} from './kitchen-intact-atlas';

describe('kitchen intact layer atlas', () => {
  it('covers the permanent shell, every intact architecture zone and every rest-state prop', () => {
    expect(validateKitchenIntactAtlas()).toEqual([]);
    const frames: Readonly<Record<string, KitchenAtlasFrame>> = KITCHEN_INTACT_ATLAS.frames;

    expect(frames['shell/permanent']).toBeDefined();

    for (const zone of KITCHEN_DESTRUCTION_BLUEPRINT.zones.filter(zone => zone.kind === 'destructible')) {
      expect(frames[`zone/${zone.id}/intact`]).toBeDefined();
    }

    for (const prop of KITCHEN_DESTRUCTION_BLUEPRINT.props) {
      expect(frames[`prop/${prop.id}/${prop.defaultState}`]).toBeDefined();
    }
  });

  it('keeps hero toast and hero plate independent from their remaining stacks at rest', () => {
    expect(KITCHEN_INTACT_ATLAS.frames['prop/toast/resting']).toBeDefined();
    expect(KITCHEN_INTACT_ATLAS.frames['prop/toast-stack/stacked']).toBeDefined();
    expect(KITCHEN_INTACT_ATLAS.frames['prop/hero-plate/resting']).toBeDefined();
    expect(KITCHEN_INTACT_ATLAS.frames['prop/plate-stack/stacked']).toBeDefined();

    expect(KITCHEN_INTACT_DRAW_ORDER.indexOf('prop/toast-stack/stacked'))
      .toBeLessThan(KITCHEN_INTACT_DRAW_ORDER.indexOf('prop/toast/resting'));
    expect(KITCHEN_INTACT_DRAW_ORDER.indexOf('prop/plate-stack/stacked'))
      .toBeLessThan(KITCHEN_INTACT_DRAW_ORDER.indexOf('prop/hero-plate/resting'));
  });

  it('keeps the genuine layered reconstruction visually registered to the approved master', () => {
    expect(KITCHEN_INTACT_ATLAS.metrics.mae).toBeLessThan(.2);
    expect(KITCHEN_INTACT_ATLAS.metrics.p99).toBeLessThanOrEqual(4);
    expect(KITCHEN_INTACT_ATLAS.metrics.exactPixelFraction).toBeGreaterThan(.93);
  });

  it('keeps every atlas source frame and destination inside its declared canvas', () => {
    for (const frame of Object.values(KITCHEN_INTACT_ATLAS.frames)) {
      expect(frame.x).toBeGreaterThanOrEqual(0);
      expect(frame.y).toBeGreaterThanOrEqual(0);
      expect(frame.x + frame.width).toBeLessThanOrEqual(KITCHEN_INTACT_ATLAS.width);
      expect(frame.y + frame.height).toBeLessThanOrEqual(KITCHEN_INTACT_ATLAS.height);

      expect(frame.destX).toBeGreaterThanOrEqual(0);
      expect(frame.destY).toBeGreaterThanOrEqual(0);
      expect(frame.destX + frame.width).toBeLessThanOrEqual(1000);
      expect(frame.destY + frame.height).toBeLessThanOrEqual(600);
    }
  });
});
