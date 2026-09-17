import type { ReactNode } from 'react';

import { ControlPanel } from '../components/ControlPanel';
import { EnvironmentStage, type EnvironmentPhase } from '../components/EnvironmentStage';
import type { OutcomeTier, RiskMode } from '../lib/badIdea';
import type { EnvironmentId, SceneScript } from '../scene/types';
import { useAftermathPreload } from './aftermath-preload';

type Props = Readonly<{
  networkLabel: string;
  displayEnvironment: EnvironmentId;
  displayMode: RiskMode;
  environmentPhase: EnvironmentPhase;
  script?: SceneScript;
  tier?: OutcomeTier;
  multiplierBps?: number;
  riskMode: RiskMode;
  onRiskModeChange: (next: RiskMode) => void;
  environment: EnvironmentId;
  onEnvironmentChange: (next: EnvironmentId) => void;
  wagerInput: string;
  onWagerInputChange: (next: string) => void;
  balanceText: string;
  symbol: string;
  ctaLabel: string;
  disabled: boolean;
  reason: string | null;
  demoMode: boolean;
  muted: boolean;
  onToggleMuted: () => void;
  onPlay: () => void;
  settledTier?: OutcomeTier;
  receipt?: ReactNode;
  onBackToGallery?: () => void;
  canLeave: boolean;
}>;

export function GameScreen({
  networkLabel,
  displayEnvironment,
  displayMode,
  environmentPhase,
  script,
  tier,
  multiplierBps,
  riskMode,
  onRiskModeChange,
  environment,
  onEnvironmentChange,
  wagerInput,
  onWagerInputChange,
  balanceText,
  symbol,
  ctaLabel,
  disabled,
  reason,
  demoMode,
  muted,
  onToggleMuted,
  onPlay,
  receipt,
  onBackToGallery,
  canLeave,
}: Props) {
  const aftermathPreload = useAftermathPreload(environment);
  const preloadReason = aftermathPreload === 'loading'
    ? 'Preloading every possible room aftermath before the machine can run…'
    : aftermathPreload === 'error'
      ? 'Room aftermaths failed to preload. Reload before operating the machine.'
      : null;
  const launchDisabled = disabled || aftermathPreload !== 'ready';

  return (
    <main
      className={`app-shell reference-play app-shell--mode-${displayMode} app-shell--environment-${displayEnvironment}`}
      data-aftermath-preload={aftermathPreload}
    >
      <header className="game-header reference-play__header">
        <div className="game-header__brand">
          <span className="brand-badge">BIM</span>
          <div>
            <strong>BAD IDEA MACHINE</strong>
            <small>CHOOSE YOUR ROOM. DESTROY IT RESPONSIBLY.</small>
          </div>
        </div>

        <div className="reference-play__header-actions">
          {onBackToGallery && canLeave && (
            <button type="button" className="reference-play__back" onClick={onBackToGallery}>
              BACK TO ROOMS
            </button>
          )}
          <div className="game-header__network">
            <span className="network-dot" />
            {networkLabel}
          </div>
        </div>
      </header>

      <div className="game-layout game-layout--environment reference-play__layout">
        <EnvironmentStage
          environment={displayEnvironment}
          riskMode={displayMode}
          phase={environmentPhase}
          script={script}
          tier={tier}
          multiplierBps={multiplierBps}
        />

        <ControlPanel
          riskMode={riskMode}
          onRiskModeChange={onRiskModeChange}
          environment={environment}
          onEnvironmentChange={onEnvironmentChange}
          wagerInput={wagerInput}
          onWagerInputChange={onWagerInputChange}
          balanceText={balanceText}
          symbol={symbol}
          ctaLabel={ctaLabel}
          disabled={launchDisabled}
          reason={reason ?? preloadReason}
          demoMode={demoMode}
          muted={muted}
          onToggleMuted={onToggleMuted}
          onPlay={onPlay}
        />
      </div>

      {receipt}

      <footer className="game-footer reference-play__footer">
        <span>96% THEORETICAL RTP · BEFORE ROUNDING</span>
        <span>{demoMode ? 'DEMO · BROWSER RANDOMNESS' : 'CHAIN VRF'}</span>
        <span>2 CHAOS ENVIRONMENTS</span>
        <span>THE ROOM CHANGES. THE MATH DOES NOT.</span>
      </footer>
    </main>
  );
}
