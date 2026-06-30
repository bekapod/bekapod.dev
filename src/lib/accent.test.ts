import { describe, expect, it } from 'vitest';
import { accentBg, accentTextColor, type Accent } from './accent';

const ACCENTS: Accent[] = [
  'pink',
  'coral',
  'teal',
  'yellow',
  'purple',
  'green',
  'orange',
  'blue',
  'ink',
];

describe('accentBg', () => {
  it('maps each accent to its background utility class', () => {
    for (const accent of ACCENTS) {
      expect(accentBg(accent)).toBe(`bg-${accent}`);
    }
  });
});

describe('accentTextColor', () => {
  it('returns ink for every bright accent', () => {
    const brights: Accent[] = [
      'pink',
      'coral',
      'teal',
      'yellow',
      'purple',
      'green',
      'orange',
      'blue',
    ];

    for (const accent of brights) {
      expect(accentTextColor(accent)).toBe('ink');
    }
  });

  it('returns white for the dark ink accent', () => {
    expect(accentTextColor('ink')).toBe('white');
  });
});
