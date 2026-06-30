import { describe, expect, it } from 'vitest';
import { nextTheme, resolveInitialTheme } from './theme.ts';

describe('nextTheme', () => {
  it('flips light to dark', () => {
    expect(nextTheme('light')).toBe('dark');
  });
  it('flips dark to light', () => {
    expect(nextTheme('dark')).toBe('light');
  });
});

describe('resolveInitialTheme', () => {
  it('uses a valid stored choice over the system preference', () => {
    expect(resolveInitialTheme('dark', false)).toBe('dark');
    expect(resolveInitialTheme('light', true)).toBe('light');
  });
  it('falls back to the system preference when nothing is stored', () => {
    expect(resolveInitialTheme(null, true)).toBe('dark');
    expect(resolveInitialTheme(null, false)).toBe('light');
  });
  it('falls back to the system preference for an unrecognised stored value', () => {
    expect(resolveInitialTheme('nonsense', true)).toBe('dark');
    expect(resolveInitialTheme('', false)).toBe('light');
  });
});
