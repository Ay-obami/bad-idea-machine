import { describe, expect, it } from 'vitest';
import { galleryRows } from './gallery-data';

describe('reference gallery data', () => {
  it('locks reference gallery ordering and multiplier labels', () => {
    for (const row of galleryRows) {
      expect(row.cards.map(card => card.multiplier)).toEqual([
        'BEFORE',
        '0.00×',
        '1.20×',
        '3.00×',
        '10.00×',
        '100.00×',
      ]);
    }
  });

  it('locks the approved editorial quotes', () => {
    expect(galleryRows.find(row => row.environment === 'kitchen')?.quote).toBe('Same kitchen. Different levels of regret.');
    expect(galleryRows.find(row => row.environment === 'garage')?.quote).toBe('Same garage. Bigger problems.');
  });

  it('contains exactly two environment rows with six authored cards each', () => {
    expect(galleryRows.map(row => row.environment)).toEqual(['kitchen', 'garage']);
    for (const row of galleryRows) expect(row.cards).toHaveLength(6);
  });
});
