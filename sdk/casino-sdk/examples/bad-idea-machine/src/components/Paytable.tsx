import { PAYTABLES, RISK_MODE_LABELS, type RiskMode } from '../lib/badIdea';

export function Paytable({ riskMode }: Readonly<{ riskMode: RiskMode }>) {
  const table = PAYTABLES[riskMode];
  return (
    <details className="paytable">
      <summary>Odds &amp; payouts</summary>
      <table>
        <caption>{RISK_MODE_LABELS[riskMode]} · per round</caption>
        <thead><tr><th scope="col">Total return</th><th scope="col">Chance</th></tr></thead>
        <tbody>{table.map((row, index) => (
          <tr key={row.maxExclusive}>
            <td>{`${row.multiplierBps / 10_000}×`}{index === 0 ? ' (lose stake)' : ''}</td>
            <td>{`${(row.maxExclusive - (table[index - 1]?.maxExclusive ?? 0)) / 100}%`}</td>
          </tr>
        ))}</tbody>
      </table>
      <p>Returns include your stake. A 2× return on 10 gives back 20: a profit of 10.</p>
      <p>96% theoretical RTP before rounding is a long-run average, not a promise for your session. Payouts are rounded down to the token’s smallest unit; very small wagers can have a lower RTP.</p>
    </details>
  );
}
