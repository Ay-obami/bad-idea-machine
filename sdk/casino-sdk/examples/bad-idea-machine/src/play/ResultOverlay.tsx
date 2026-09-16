import type { OutcomeTier } from '../lib/badIdea';
import { multiplierDisplay } from '../scene/visual-state';

type Props = Readonly<{
  tier: OutcomeTier;
  multiplierBps: number;
  label: string;
  flavor: string;
  visualUnavailable?: boolean;
}>;

export function ResultOverlay({ tier, multiplierBps, label, flavor, visualUnavailable = false }: Props) {
  return (
    <div
      className={`result-overlay result-overlay--tier-${tier}`}
      data-result-overlay="true"
      data-result-tier={tier}
    >
      <span>{label}</span>
      <strong>{multiplierDisplay(multiplierBps)}</strong>
      <small>{flavor}</small>
      {visualUnavailable && (
        <em>AFTERMATH VISUAL UNAVAILABLE — SETTLEMENT REMAINS AUTHORITATIVE.</em>
      )}
    </div>
  );
}
