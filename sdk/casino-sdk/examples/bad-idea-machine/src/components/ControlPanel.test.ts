import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ControlPanel } from './ControlPanel';
import type { RiskMode } from '../lib/badIdea';

function renderMode(riskMode: RiskMode) {
  return renderToStaticMarkup(createElement(ControlPanel, {
    riskMode, onRiskModeChange: () => {}, environment: 'kitchen', onEnvironmentChange: () => {},
    wagerInput: '10.00', onWagerInputChange: () => {}, balanceText: '2500', symbol: 'demo chUSD',
    ctaLabel: 'DO NOT PRESS', disabled: false, reason: null, demoMode: true, muted: true,
    onToggleMuted: () => {}, onPlay: () => {},
  }));
}

describe('risk disclosure', () => {
  for (const [mode, loss, small, top] of [[0, '45%', '1.2×', '8×'], [1, '65%', '1.5×', '12×'], [2, '80%', '2×', '16×']] as const) {
    it(`shows the actual selected-mode paytable for mode ${mode}`, () => {
      const html = renderMode(mode);
      const table = html.match(/<table[\s\S]*?<\/table>/)?.[0] ?? '';
      expect(table).toContain(loss);
      expect(table).toContain(small);
      expect(table).toContain(top);
      expect(table).not.toContain('100×');
      expect(html).toContain('include your stake');
      expect(html).toContain('rounded down');
    });
  }
});
