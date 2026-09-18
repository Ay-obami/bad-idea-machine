import { describe, expect, it } from 'vitest';

import {
  KITCHEN_OBJECT_TRUTH_ATLAS,
  KITCHEN_OBJECT_TRUTH_OBJECTS,
  kitchenObjectTruthDrawOrder,
  validateKitchenObjectTruthProof,
} from './kitchen-object-truth-proof';

describe('kitchen single-object truth proof', () => {
  it('uses a repository-local atlas produced from the approved master', () => {
    expect(validateKitchenObjectTruthProof()).toEqual([]);
    expect(KITCHEN_OBJECT_TRUTH_ATLAS.url).toMatch(/^\/rooms\//);
    expect(KITCHEN_OBJECT_TRUTH_ATLAS.url).not.toMatch(/creativeclaw/i);
    expect(KITCHEN_OBJECT_TRUTH_ATLAS.source).toBe('container-extracted-approved-master');
  });

  it('gives each object a real support, shadow and body layer', () => {
    for (const object of KITCHEN_OBJECT_TRUTH_OBJECTS) {
      expect(KITCHEN_OBJECT_TRUTH_ATLAS.frames[object.supportFrame].kind).toBe('support');
      expect(KITCHEN_OBJECT_TRUTH_ATLAS.frames[object.shadowFrame].kind).toBe('shadow');
      expect(KITCHEN_OBJECT_TRUTH_ATLAS.frames[object.bodyFrame].kind).toBe('body');
    }
  });

  it('always restores support before optionally adding shadow and body', () => {
    for (const object of KITCHEN_OBJECT_TRUTH_OBJECTS) {
      const supportOnly = kitchenObjectTruthDrawOrder(object.id, false, false);
      const shadowOnly = kitchenObjectTruthDrawOrder(object.id, false, true);
      const bodyOnly = kitchenObjectTruthDrawOrder(object.id, true, false);
      const complete = kitchenObjectTruthDrawOrder(object.id, true, true);

      expect(supportOnly).toEqual([object.supportFrame]);
      expect(shadowOnly).toEqual([object.supportFrame, object.shadowFrame]);
      expect(bodyOnly).toEqual([object.supportFrame, object.bodyFrame]);
      expect(complete).toEqual([object.supportFrame, object.shadowFrame, object.bodyFrame]);
    }
  });

  it('uses no browser ownership masks or Tier 1 debris in this gate', () => {
    for (const id of Object.keys(KITCHEN_OBJECT_TRUTH_ATLAS.frames)) {
      expect(id).not.toMatch(/mask|tier1|debris|replacement/i);
    }
  });
});
