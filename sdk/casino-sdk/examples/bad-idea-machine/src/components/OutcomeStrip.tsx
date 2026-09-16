import type { OutcomeTier, RiskMode } from '../lib/badIdea';
import type { EnvironmentId } from '../scene/types';
import { multiplierDisplay, outcomeCardsForMode } from '../scene/visual-state';
import { CinematicBackdrop } from './CinematicBackdrop';

type Props = {
  environment: EnvironmentId;
  riskMode: RiskMode;
  settledTier?: OutcomeTier;
};

export function OutcomeStrip({ environment, riskMode, settledTier }: Props) {
  const cards = outcomeCardsForMode(riskMode);
  const room = environment === 'kitchen' ? 'KITCHEN MELTDOWN' : 'GARAGE MAYHEM';

  return (
    <section className="outcome-strip" aria-label={`Possible outcomes for ${room}`}>
      <div className="outcome-strip__heading">
        <strong>POSSIBLE OUTCOMES</strong>
        <span>({room})</span>
        <em>{environment === 'kitchen' ? 'Same kitchen. Different levels of regret.' : 'Same garage. Bigger problems.'}</em>
      </div>
      <div className="outcome-strip__rail">
        {cards.map(card => {
          const selected = settledTier === card.tier;
          return (
            <article
              key={card.tier}
              className={`outcome-preview outcome-preview--tier-${card.tier} ${selected ? 'outcome-preview--selected' : ''}`}
              data-outcome-tier={card.tier}
            >
              <div className="outcome-preview__scene">
                <CinematicBackdrop environment={environment} phase="result" tier={card.tier} compact />
              </div>
              <div className="outcome-preview__copy">
                <strong>{multiplierDisplay(card.multiplierBps)}</strong>
                <b>{card.label}</b>
                <small>{card.shortCopy}</small>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
