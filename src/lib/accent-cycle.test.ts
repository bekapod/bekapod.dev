import { describe, expect, it } from 'vitest';
import { accentAt, ACCENT_CYCLE } from './accent-cycle';

describe('accentAt', () => {
  it('walks the decorative sequence by position', () => {
    expect(ACCENT_CYCLE.map((_, i) => accentAt(i))).toEqual([
      'pink',
      'purple',
      'teal',
      'coral',
      'yellow',
      'green',
    ]);
  });

  it('wraps back to the start once the sequence is exhausted', () => {
    expect(accentAt(ACCENT_CYCLE.length)).toBe('pink');
    expect(accentAt(ACCENT_CYCLE.length + 1)).toBe('purple');
  });
});
