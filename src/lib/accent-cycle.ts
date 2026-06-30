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

function seedFrom(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function accentCycle(seed: string): Accent[] {
  const next = mulberry32(seedFrom(seed));
  const cycle = [...ACCENT_CYCLE];
  for (let i = cycle.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [cycle[i], cycle[j]] = [cycle[j], cycle[i]];
  }
  return cycle;
}

export const accentAt = (index: number, seed?: string): Accent => {
  const cycle = seed === undefined ? ACCENT_CYCLE : accentCycle(seed);
  return cycle[index % cycle.length];
};
