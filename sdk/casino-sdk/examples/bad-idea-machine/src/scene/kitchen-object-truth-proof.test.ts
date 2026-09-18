import { describe, expect, it } from 'vitest';

import { KITCHEN_INTACT_ATLAS, KITCHEN_INTACT_DRAW_ORDER } from './kitchen-intact-atlas';
import {
  KITCHEN_OBJECT_TRUTH_OBJECTS,
  kitchenObjectTruthDrawOrder,
  validateKitchenObjectTruthProof,
} from './kitchen-object-truth-proof';

describe('kitchen single-object truth proof', () => {
  it('uses only already separated intact-atlas frames', () => {
    expect(validateKitchenObjectTruthProof()).toEqual([]);

    for (const object of KITCHEN_OBJECT_TRUTH_OBJECTS) {
      expect(KITCHEN_INTACT_ATLAS.frames[object.bodyFrame]).toBeDefined();
      expect(KITCHEN_INTACT_ATLAS.frames[object.shadowFrame]).toBeDefined();
    }
  });

  it('can remove each object body and shadow without removing architecture', () => {
    for (const object of KITCHEN_OBJECT_TRUTH_OBJECTS) {
      const supportOnly = kitchenObjectTruthDrawOrder(object.id, false, false);
      expect(supportOnly).not.toContain(object.bodyFrame);
      expect(supportOnly).not.toContain(object.shadowFrame);

      for (const id of KITCHEN_INTACT_DRAW_ORDER.filter(id => !id.startsWith(`prop/${object.id}/`))) {
        expect(supportOnly).toContain(id);
      }
    }
  });

  it('can independently restore shadow and body', () => {
    for (const object of KITCHEN_OBJECT_TRUTH_OBJECTS) {
      const shadowOnly = kitchenObjectTruthDrawOrder(object.id, false, true);
      const bodyOnly = kitchenObjectTruthDrawOrder(object.id, true, false);
      const complete = kitchenObjectTruthDrawOrder(object.id, true, true);

      expect(shadowOnly).toContain(object.shadowFrame);
      expect(shadowOnly).not.toContain(object.bodyFrame);

      expect(bodyOnly).toContain(object.bodyFrame);
      expect(bodyOnly).not.toContain(object.shadowFrame);

      expect(complete).toContain(object.bodyFrame);
      expect(complete).toContain(object.shadowFrame);
    }
  });

  it('contains no mask or generated replacement frame', () => {
    for (const object of KITCHEN_OBJECT_TRUTH_OBJECTS) {
      expect(object.bodyFrame).not.toMatch(/mask|patch|replacement/i);
      expect(object.shadowFrame).not.toMatch(/mask|patch|replacement/i);
    }
  });
});
