import { describe, expect, it } from 'vitest';

import {
  ACTOR_ATLAS_SRC,
  getActorSprite,
  getOutcomePresentation,
  getScenePlate,
  OUTCOME_PRESENTATIONS,
  SCENE_ATLAS_SRC,
} from './presentation';

const ENVIRONMENTS = ['kitchen', 'garage'] as const;
const TIERS = [0, 1, 2, 3, 4] as const;

describe('cinematic scene presentation', () => {
  it('uses the approved photographic scene atlas for both rooms', () => {
    for (const environment of ENVIRONMENTS) {
      const idle = getScenePlate(environment, 'idle');
      const chaos = getScenePlate(environment, 'revealing');
      expect(idle.src).toBe(SCENE_ATLAS_SRC);
      expect(chaos.src).toBe(SCENE_ATLAS_SRC);
      expect(idle.frame).not.toBe(chaos.frame);
    }
  });

  it('maps every payout tier to a distinct damaged room frame', () => {
    for (const environment of ENVIRONMENTS) {
      const resultPlates = TIERS.map(tier => getScenePlate(environment, 'result', tier));
      expect(new Set(resultPlates.map(plate => plate.frame)).size).toBe(5);
      expect(resultPlates.every(plate => plate.src === SCENE_ATLAS_SRC)).toBe(true);
    }
  });

  it('describes five escalating outcome states without depending on risk mode', () => {
    expect(OUTCOME_PRESENTATIONS).toHaveLength(5);
    expect(OUTCOME_PRESENTATIONS.map(item => item.tier)).toEqual(TIERS);
    expect(OUTCOME_PRESENTATIONS.map(item => item.damageLevel)).toEqual([1, 2, 3, 4, 5]);
    expect(getOutcomePresentation(0).title).toBe('TOTAL FAILURE');
    expect(getOutcomePresentation(4).title).toBe('LEGENDARY CHAOS');
  });

  it('uses photographic actor atlas sprites for the signature moving objects', () => {
    for (const actorId of ['kitchen-toaster', 'kitchen-rocket', 'garage-hammer', 'garage-tire', 'garage-rocket']) {
      const sprite = getActorSprite(actorId);
      expect(sprite?.src).toBe(ACTOR_ATLAS_SRC);
      expect(sprite?.column).toBeGreaterThanOrEqual(0);
      expect(sprite?.row).toBeGreaterThanOrEqual(0);
    }
  });
});
