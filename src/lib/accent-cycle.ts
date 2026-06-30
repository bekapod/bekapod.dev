import type { Accent } from './accent';

/** A fixed, purely decorative rotation of accents reused across per-item sections. */
export const ACCENT_CYCLE = [
  'pink',
  'purple',
  'teal',
  'coral',
  'yellow',
  'green',
] as const satisfies Accent[];

export const accentAt = (index: number): Accent => ACCENT_CYCLE[index % ACCENT_CYCLE.length];
