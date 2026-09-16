import type { CSSProperties } from 'react';

import { multiplierBpsForTier, type OutcomeTier, type RiskMode } from '../lib/badIdea';
import { getEnvironmentDefinition } from '../scene/environments';
import { getOutcomePresentation, getScenePlate, SCENE_ATLAS_FRAMES } from '../scene/presentation';
import type { EnvironmentId } from '../scene/types';

const TIERS = [0, 1, 2, 3, 4] as const satisfies readonly OutcomeTier[];

type Props = {
  environment: EnvironmentId;
  riskMode: RiskMode;
  activeTier?: OutcomeTier;
};

function multiplierText(riskMode: RiskMode, tier: OutcomeTier) {
  const bps = multiplierBpsForTier(riskMode, tier);
  const value = bps / 10_000;
  return `${value.toFixed(Number.isInteger(value) ? 0 : 1)}×`;
}

function thumbnailStyle(environment: EnvironmentId, tier: OutcomeTier): CSSProperties {
  const plate = getScenePlate(environment, 'result', tier);
  return {
    backgroundImage: `url(${plate.src})`,
    backgroundSize: `100% ${SCENE_ATLAS_FRAMES * 100}%`,
    backgroundPosition: `center ${plate.frame * 100 / (SCENE_ATLAS_FRAMES - 1)}%`,
  };
}

export function OutcomeStrip({ environment, riskMode, activeTier }: Props) {
  const definition = getEnvironmentDefinition(environment);
  const roomWord = environment === 'kitchen' ? 'kitchen' : 'garage';

  return (
    <section className="outcome-strip" aria-label={`Possible outcomes for ${definition.label}`}>
      <header className="outcome-strip__header">
        <strong>POSSIBLE OUTCOMES</strong>
        <span>({definition.label})</span>
        <em>“Same {roomWord}. Different levels of regret.”</em>
      </header>
      <div className="outcome-strip__cards">
        {TIERS.map(tier => {
          const presentation = getOutcomePresentation(tier);
          const copy = environment === 'kitchen' ? presentation.kitchenCopy : presentation.garageCopy;
          return (
            <article
              key={tier}
              className={`outcome-strip__card outcome-strip__card--${presentation.tone} ${activeTier === tier ? 'outcome-strip__card--active' : ''}`}
              data-outcome-tier={tier}
            >
              <div className="outcome-strip__thumb" style={thumbnailStyle(environment, tier)} aria-hidden="true" />
              <div className="outcome-strip__body">
                <strong>{multiplierText(riskMode, tier)}</strong>
                <span>{presentation.title}</span>
                <small>{copy}</small>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
