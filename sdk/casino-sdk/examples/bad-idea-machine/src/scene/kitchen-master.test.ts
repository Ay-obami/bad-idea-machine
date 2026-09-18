import { describe, expect, it } from 'vitest';

import { KITCHEN_APPROVED_MASTER } from './kitchen-master';

describe('approved Kitchen master reference', () => {
  it('is repository-local and independent of external image hosting', () => {
    expect(KITCHEN_APPROVED_MASTER.sourceUrl).toMatch(/^\/rooms\/kitchen\/rebuild\/reference\//);
    expect(KITCHEN_APPROVED_MASTER.sourceUrl).not.toMatch(/creativeclaw|cdn\./i);
    expect(KITCHEN_APPROVED_MASTER.source).toBe('repository-local-materialized-master');
  });

  it('matches the logical fixed-camera canvas', () => {
    expect(KITCHEN_APPROVED_MASTER.sourceWidth).toBe(1000);
    expect(KITCHEN_APPROVED_MASTER.sourceHeight).toBe(600);
    expect(KITCHEN_APPROVED_MASTER.logicalWidth).toBe(1000);
    expect(KITCHEN_APPROVED_MASTER.logicalHeight).toBe(600);
    expect(KITCHEN_APPROVED_MASTER.originalSourceWidth).toBe(1619);
    expect(KITCHEN_APPROVED_MASTER.originalSourceHeight).toBe(971);
  });
});
