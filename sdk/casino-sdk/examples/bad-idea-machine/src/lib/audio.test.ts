import { describe, expect, it } from 'vitest';

import type { RouteStep } from './route';
import { soundPlanForStep } from './audio';

function step(overrides: Partial<RouteStep> = {}): RouteStep {
  return {
    station: 'rocket',
    variant: 'sideways',
    durationMs: 620,
    intensity: 1,
    hazard: 'sparks',
    decoys: ['safe'],
    effectSeed: 12345,
    terminal: false,
    ...overrides,
  };
}

describe('chaos sound plans', () => {
  it('gets denser as visual intensity increases', () => {
    const light = soundPlanForStep(step({ intensity: 1 }));
    const critical = soundPlanForStep(step({ intensity: 3 }));
    expect(critical.length).toBeGreaterThan(light.length);
  });

  it('adds broadband impact/noise layers for fire and blasts', () => {
    expect(soundPlanForStep(step({ hazard: 'fire' })).some(event => event.kind === 'noise')).toBe(true);
    expect(soundPlanForStep(step({ hazard: 'blast', intensity: 3 })).filter(event => event.kind === 'noise').length).toBeGreaterThanOrEqual(2);
  });

  it('is deterministic for the same settled choreography step', () => {
    const chaosStep = step({ station: 'core', hazard: 'alarm', intensity: 3, effectSeed: 987654 });
    expect(soundPlanForStep(chaosStep)).toEqual(soundPlanForStep(chaosStep));
  });
});
