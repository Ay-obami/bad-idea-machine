import { useEffect, useMemo, useRef, useState } from 'react';
import type { Hex } from 'viem';

import { EnvironmentStage, type EnvironmentPhase } from '../components/EnvironmentStage';
import { primeAudio } from '../lib/audio';
import { multiplierBpsForTier, type OutcomeTier } from '../lib/badIdea';
import { buildKitchenMeltdownScript } from '../scene/kitchen-meltdown-script';
import type { KitchenVariant } from '../scene/kitchen-meltdown';
import '../styles/kitchen-proof.css';

const VARIANTS: readonly KitchenVariant[] = ['grease-fire', 'steam-short', 'pan-spark'];
const TIERS: readonly OutcomeTier[] = [0, 1, 2, 3, 4];

function seedForVariant(variant: KitchenVariant): Hex {
  const first = VARIANTS.indexOf(variant);
  return `0x${first.toString(16).padStart(2, '0')}${'00'.repeat(31)}` as Hex;
}

export default function KitchenMeltdownPreview() {
  const [variant, setVariant] = useState<KitchenVariant>('grease-fire');
  const [tier, setTier] = useState<OutcomeTier>(2);
  const [phase, setPhase] = useState<EnvironmentPhase>('idle');
  const timer = useRef<number | null>(null);
  const script = useMemo(() => buildKitchenMeltdownScript(tier, seedForVariant(variant)), [tier, variant]);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  function play() {
    if (timer.current !== null) window.clearTimeout(timer.current);
    primeAudio();
    setPhase('idle');
    requestAnimationFrame(() => {
      setPhase('revealing');
      timer.current = window.setTimeout(() => setPhase('result'), script.durationMs);
    });
  }

  return <main className="kitchen-proof">
    <header><a href={import.meta.env.BASE_URL}>← Back to game</a><span>CHECKPOINT 3 · COMPLETE KITCHEN</span></header>
    <div className="kitchen-proof__intro">
      <div><p className="kitchen-proof__eyebrow">KITCHEN MELTDOWN</p><h1>One room. Three causes. Five endings.</h1></div>
      <p>This fixture drives the production Kitchen renderer and production foley. Shared destruction is payout-blind until the final reveal beat.</p>
    </div>

    <div className="kitchen-proof__frame">
      <EnvironmentStage
        environment="kitchen"
        riskMode={1}
        phase={phase}
        script={phase === 'idle' ? undefined : script}
        tier={phase === 'idle' ? undefined : tier}
        multiplierBps={phase === 'idle' ? undefined : multiplierBpsForTier(1, tier)}
      />
    </div>

    <div className="kitchen-proof__caption" role="status">
      {phase === 'idle' ? 'Choose a deterministic chain and outcome, then run the complete production sequence.' : phase === 'revealing' ? `Running ${variant.replaceAll('-', ' ')} · tier ${tier}` : `Final persistent room state · tier ${tier}`}
    </div>

    <div className="kitchen-proof__controls">
      <button className="kitchen-proof__play" onClick={play}>{phase === 'revealing' ? 'Restart sequence' : phase === 'result' ? 'Replay sequence' : 'Run full kitchen'}</button>
      <label>Chain
        <select value={variant} onChange={event => { setPhase('idle'); setVariant(event.target.value as KitchenVariant); }}>
          {VARIANTS.map(value => <option key={value} value={value}>{value.replaceAll('-', ' ')}</option>)}
        </select>
      </label>
      <label>Outcome
        <select value={tier} onChange={event => { setPhase('idle'); setTier(Number(event.target.value) as OutcomeTier); }}>
          {TIERS.map(value => <option key={value} value={value}>Tier {value} · {(multiplierBpsForTier(1, value) / 10_000).toFixed(1)}× SEND IT</option>)}
        </select>
      </label>
    </div>

    <div className="kitchen-proof__inspection">
      <label>Required review <output>3 × 5 deterministic fixtures</output></label>
      <div>
        {TIERS.map(value => <button key={value} onClick={() => { setPhase('idle'); setTier(value); }}>Tier {value}</button>)}
        {VARIANTS.map(value => <button key={value} onClick={() => { setPhase('idle'); setVariant(value); }}>{value.replaceAll('-', ' ')}</button>)}
      </div>
    </div>

    <p className="kitchen-proof__note">This preview is visual/audio QA only: no wager is opened. It uses the same Kitchen scene clock, causal scripts, synchronized foley, and persistent result renderer as normal gameplay. Garage remains on its previous renderer until Checkpoint 4.</p>
  </main>;
}
