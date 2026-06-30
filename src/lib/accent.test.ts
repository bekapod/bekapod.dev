import { describe, expect, it } from 'vitest';
import { accentTextColor, type Accent } from './accent';

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
