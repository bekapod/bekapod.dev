import { describe, expect, it } from 'vitest';
import { noteAccent, NOTE_ACCENTS } from './note-accent';

describe('noteAccent', () => {
  it('walks the decorative sequence by position', () => {
    expect(NOTE_ACCENTS.map((_, i) => noteAccent(i))).toEqual([
      'pink',
      'purple',
      'teal',
      'coral',
      'yellow',
      'green',
    ]);
  });

  it('wraps back to the start once the sequence is exhausted', () => {
    expect(noteAccent(NOTE_ACCENTS.length)).toBe('pink');
    expect(noteAccent(NOTE_ACCENTS.length + 1)).toBe('purple');
  });
});
