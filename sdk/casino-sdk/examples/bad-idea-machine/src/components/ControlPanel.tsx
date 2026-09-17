import { PAYTABLES, maxMultiplierX, type RiskMode } from '../lib/badIdea';
import type { EnvironmentId } from '../scene/types';
import '../styles/cinematic-controls.css';
import { Paytable } from './Paytable';
import { EnvironmentSelector } from './EnvironmentSelector';

const MODES: Array<{ mode: RiskMode; label: string }> = [
  { mode: 0, label: 'CONTROLLED' },
  { mode: 1, label: 'SEND IT' },
  { mode: 2, label: 'ABSOLUTELY NOT' },
];

const WAGER_PRESETS = ['1.00', '5.00', '10.00', '50.00', '100.00'] as const;

type Props = {
  riskMode: RiskMode;
  onRiskModeChange: (mode: RiskMode) => void;
  environment: EnvironmentId;
  onEnvironmentChange: (environment: EnvironmentId) => void;
  wagerInput: string;
  onWagerInputChange: (value: string) => void;
  balanceText: string;
  symbol: string;
  ctaLabel: string;
  disabled: boolean;
  reason: string | null;
  demoMode: boolean;
  muted: boolean;
  onToggleMuted: () => void;
  onPlay: () => void;
};

export function ControlPanel({
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
}: Props) {
  const controlsLocked = ctaLabel === 'BAD IDEA IN PROGRESS';

  return (
    <aside className="control-panel cinematic-controls">
      <div className="control-panel__topline">
        <div>
          <span className="eyebrow">AVAILABLE {demoMode ? 'DEMO CREDITS' : 'BALANCE'}</span>
          <strong className="balance-readout">{balanceText}</strong>
          <span className="balance-symbol">{symbol}</span>
        </div>
        <button className="sound-button" type="button" onClick={onToggleMuted} aria-label={muted ? 'Enable sound' : 'Mute sound'}>
          <span aria-hidden>{muted ? '×' : '◖))'}</span>
          {muted ? 'SOUND OFF' : 'SOUND ON'}
        </button>
      </div>

      <div className="wager-control cinematic-wager">
        <label htmlFor="wager-amount">WAGER</label>
        <div className="wager-control__input">
          <input
            id="wager-amount"
            inputMode="decimal"
            value={wagerInput}
            onChange={event => onWagerInputChange(event.target.value)}
            aria-label="Wager amount"
            disabled={controlsLocked}
          />
          <b>{symbol}</b>
        </div>
        <div className="wager-presets" aria-label="Quick wager amounts">
          {WAGER_PRESETS.map(value => (
            <button
              key={value}
              type="button"
              onClick={() => onWagerInputChange(value)}
              className={Number(wagerInput) === Number(value) ? 'wager-preset wager-preset--selected' : 'wager-preset'}
              disabled={controlsLocked}
              aria-pressed={Number(wagerInput) === Number(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <fieldset className="risk-selector cinematic-risk-selector">
        <legend>HOW BAD AN IDEA?</legend>
        {MODES.map(option => (
          <button
            key={option.mode}
            type="button"
            className={`risk-card ${riskMode === option.mode ? 'risk-card--selected' : ''}`}
            onClick={() => onRiskModeChange(option.mode)}
            aria-pressed={riskMode === option.mode}
            disabled={controlsLocked}
          >
            <span className="risk-card__indicator" aria-hidden>{riskMode === option.mode && option.mode === 2 ? '☠' : ''}</span>
            <span>
              <strong>{option.label}</strong>
              <small>{PAYTABLES[option.mode][0].maxExclusive / 100}% lose stake · up to {maxMultiplierX(option.mode)}×</small>
            </span>
          </button>
        ))}
      </fieldset>

      <Paytable riskMode={riskMode} />

      <EnvironmentSelector value={environment} onChange={onEnvironmentChange} disabled={controlsLocked} />

      <button
        className={`do-not-press do-not-press--${riskMode} cinematic-launch`}
        type="button"
        onClick={onPlay}
        disabled={disabled}
      >
        <span className="cinematic-launch__icon" aria-hidden>◈</span>
        <span>{ctaLabel}</span>
        <small>{environment === 'kitchen' ? 'SAME BUTTON. DIFFERENT DISASTER.' : 'POWER TOOLS HAVE BEEN UNSUPERVISED'}</small>
      </button>

      <div className="control-panel__reason" role="status">
        {reason ?? (demoMode ? 'Standalone demo — no real funds are used.' : 'Chain-hosted play. Review the odds before placing a wager.')}
      </div>
    </aside>
  );
}
