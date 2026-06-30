import type { Accent } from './accent';

export const NOTE_ACCENTS = [
  'pink',
  'purple',
  'teal',
  'coral',
  'yellow',
  'green',
] as const satisfies Accent[];

export const noteAccent = (index: number): Accent => NOTE_ACCENTS[index % NOTE_ACCENTS.length];
