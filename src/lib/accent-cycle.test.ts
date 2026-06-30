import { describe, expect, it } from 'vitest';
import { accentAt, accentCycle, ACCENT_CYCLE } from './accent-cycle';

describe('accentAt', () => {
  it('walks the canonical sequence by position when unseeded', () => {
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

  it('walks a seeded section shuffle instead of the canonical order', () => {
    const seeded = ACCENT_CYCLE.map((_, i) => accentAt(i, 'projects'));
    expect(seeded).toEqual(accentCycle('projects'));
    expect(seeded).not.toEqual([...ACCENT_CYCLE]);
  });
});

describe('accentCycle', () => {
  it('is deterministic for a given seed', () => {
    expect(accentCycle('notes')).toEqual(accentCycle('notes'));
  });

  it('is a permutation of the palette — same colours, reordered', () => {
    const cycle = accentCycle('blog');
    expect([...cycle].sort()).toEqual([...ACCENT_CYCLE].sort());
  });

  it('gives different sections distinct orders', () => {
    expect(accentCycle('notes')).not.toEqual(accentCycle('blog'));
    expect(accentCycle('blog')).not.toEqual(accentCycle('projects'));
  });
});
