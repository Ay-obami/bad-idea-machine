import type { RandomnessVerificationV1 } from '@chain/casino-sdk';

import { RISK_MODE_LABELS, type RiskMode } from '../lib/badIdea';
import { getEnvironmentDefinition } from '../scene/environments';
import { catastropheSummary } from '../scene/scene-script';
import type { EnvironmentId, SceneScript } from '../scene/types';

type Props = {
  open: boolean;
  onToggle: () => void;
  riskMode: RiskMode;
  environment: EnvironmentId;
  script: SceneScript;
  wagerText: string;
  payoutText: string;
  multiplierText: string;
  symbol: string;
  sessionId?: string;
  requestId?: string;
  settleTransactionHash?: string;
  verification?: RandomnessVerificationV1 | null;
  demoMode: boolean;
};

function shortHash(value?: string): string {
  if (!value) return '—';
  if (value.length <= 20) return value;
  return `${value.slice(0, 10)}…${value.slice(-8)}`;
}

export function FairnessReceipt({
  open,
  onToggle,
  riskMode,
  environment,
  script,
  wagerText,
  payoutText,
  multiplierText,
  symbol,
  sessionId,
  requestId,
  settleTransactionHash,
  verification,
  demoMode,
}: Props) {
  const verified = verification?.supported && verification.requests.length > 0
    ? verification.requests.every(request => request.valid === true)
    : undefined;
  const environmentDefinition = getEnvironmentDefinition(environment);
  const summary = catastropheSummary(script);

  return (
    <section className={`receipt ${open ? 'receipt--open' : ''}`}>
      <button className="receipt__toggle" type="button" onClick={onToggle}>
        <span>WHAT WENT WRONG?</span>
        <b>{open ? 'CLOSE ×' : 'VIEW RECEIPT →'}</b>
      </button>

      {open && (
        <div className="receipt__body">
          <div className="receipt__summary">
            <div><span>MODE</span><strong>{RISK_MODE_LABELS[riskMode]}</strong></div>
            <div><span>CHAOS</span><strong>{environmentDefinition.label}</strong></div>
            <div><span>WAGER</span><strong>{wagerText} {symbol}</strong></div>
            <div><span>RETURN</span><strong>{payoutText} {symbol}</strong></div>
            <div><span>RESULT</span><strong>{multiplierText}</strong></div>
          </div>

          <div className="receipt__route" aria-label="Round catastrophe trace">
            {summary.map((event, index) => (
              <div key={`${event}-${index}`}>
                <span>{event.toUpperCase()}</span>
                {index < summary.length - 1 && <i>↓</i>}
              </div>
            ))}
          </div>

          <div className="receipt__proof">
            <div className="receipt__proof-title">
              <span className={`proof-dot ${verified === false ? 'proof-dot--bad' : ''}`} />
              <strong>
                {demoMode
                  ? 'LOCAL DEMO RANDOMNESS'
                  : verified === true
                    ? 'VRF PROOF VERIFIED'
                    : verification?.supported
                      ? 'VRF VERIFICATION AVAILABLE'
                      : 'CHAIN-SETTLED RANDOMNESS'}
              </strong>
            </div>
            {demoMode ? (
              <p>This standalone round uses browser randomness and demo credits. Real Chain play settles through the casino contract and Chain VRF.</p>
            ) : (
              <dl>
                <div><dt>SESSION</dt><dd title={sessionId}>{shortHash(sessionId)}</dd></div>
                <div><dt>REQUEST</dt><dd title={requestId}>{shortHash(requestId)}</dd></div>
                <div><dt>SETTLEMENT</dt><dd title={settleTransactionHash}>{shortHash(settleTransactionHash)}</dd></div>
                {verification?.requests[0]?.checks && (
                  <>
                    <div><dt>VRF PROOF</dt><dd>{verification.requests[0].checks.vrfProofValid ? 'PASS' : 'FAIL'}</dd></div>
                    <div><dt>ENCLAVE SIGNATURE</dt><dd>{verification.requests[0].checks.enclaveSignatureValid ? 'PASS' : 'FAIL'}</dd></div>
                    <div><dt>COMMITMENT</dt><dd>{verification.requests[0].checks.fulfillmentCommitted ? 'PASS' : 'FAIL'}</dd></div>
                  </>
                )}
              </dl>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
