import type { RiskMode } from '../lib/badIdea';

const MODES: Array<{ mode: RiskMode; label: string; sub: string }> = [
  { mode: 0, label: 'CONTROLLED', sub: 'frequent little disasters' },
  { mode: 1, label: 'SEND IT', sub: 'responsibility not included' },
  { mode: 2, label: 'ABSOLUTELY NOT', sub: 'common sense offline' },
];

type Props = {
  riskMode: RiskMode;
  onRiskModeChange: (mode: RiskMode) => void;
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
  // A bad wager should disable the launch button, not trap the player in their
  // current risk selection. Lock configuration only while a round is active.
  const controlsLocked = ctaLabel === 'BAD IDEA IN PROGRESS';

  return (
    <aside className="control-panel">
      <div className="control-panel__topline">
        <div>
          <span className="eyebrow">AVAILABLE {demoMode ? 'DEMO CREDITS' : 'BALANCE'}</span>
          <strong className="balance-readout">{balanceText} {symbol}</strong>
        </div>
        <button className="sound-button" type="button" onClick={onToggleMuted} aria-label={muted ? 'Enable sound' : 'Mute sound'}>
          {muted ? 'SOUND OFF' : 'SOUND ON'}
        </button>
      </div>

      <label className="wager-control">
        <span>WAGER</span>
        <div className="wager-control__input">
          <input
            inputMode="decimal"
            value={wagerInput}
            onChange={event => onWagerInputChange(event.target.value)}
            aria-label="Wager amount"
            disabled={controlsLocked}
          />
          <b>{symbol}</b>
        </div>
      </label>

      <fieldset className="risk-selector">
        <legend>HOW BAD AN IDEA?</legend>
        {MODES.map(option => (
          <button
            key={option.mode}
            type="button"
            className={`risk-card ${riskMode === option.mode ? 'risk-card--selected' : ''}`}
            onClick={() => onRiskModeChange(option.mode)}
            disabled={controlsLocked}
          >
            <span className="risk-card__indicator" />
            <span>
              <strong>{option.label}</strong>
              <small>{option.sub}</small>
            </span>
          </button>
        ))}
      </fieldset>

      <div className={`safety-readout safety-readout--${riskMode}`}>
        <span>{riskMode === 0 ? '●' : '○'} SAFETY SYSTEMS</span>
        <strong>{riskMode === 0 ? 'ENABLED' : riskMode === 1 ? 'OPTIONAL' : 'DISCONNECTED'}</strong>
      </div>

      <button
        className={`do-not-press do-not-press--${riskMode}`}
        type="button"
        onClick={onPlay}
        disabled={disabled}
      >
        <span className="do-not-press__cap" aria-hidden />
        <span>{ctaLabel}</span>
        <small>{riskMode === 2 ? 'SERIOUSLY. DON’T.' : 'MANUFACTURER ADVISES AGAINST THIS'}</small>
      </button>

      <div className="control-panel__reason" role="status">
        {reason ?? (demoMode ? 'Standalone demo — no real funds are used.' : 'Verified Chain VRF settles every round.')}
      </div>
    </aside>
  );
}
