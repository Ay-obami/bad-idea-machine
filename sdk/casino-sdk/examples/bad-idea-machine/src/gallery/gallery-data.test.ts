import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GalleryScreen } from './GalleryScreen';

describe('room selection', () => {
  it('offers only two intact-room choices instead of selectable destruction outcomes', () => {
    const html = renderToStaticMarkup(createElement(GalleryScreen, { onChoose: () => {} }));
    expect(html.match(/<button\b/g)).toHaveLength(2);
    expect(html).toContain('Choose Kitchen');
    expect(html).toContain('Choose Garage');
    expect(html).not.toContain('100.00');
    expect(html).not.toContain('LEGENDARY CHAOS');
  });
  it('provides rules without unavailable wallet or leaderboard actions', () => {
    const html = renderToStaticMarkup(createElement(GalleryScreen, { onChoose: () => {} }));
    expect(html).toContain('How to play');
    expect(html).not.toContain('href="#leaderboard"');
    expect(html).not.toContain('Wallet status');
  });
});
