import { describe, expect, it } from 'vitest';
import { relativeTime } from './relative-time';

const NOW = new Date('2026-06-30T12:00:00.000Z');
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

describe('relativeTime', () => {
  it('returns "now" for timestamps under a minute old', () => {
    expect(relativeTime(ago(30 * SECOND), NOW)).toBe('now');
  });

  it('rounds down to whole minutes', () => {
    expect(relativeTime(ago(5 * MINUTE + 40 * SECOND), NOW)).toBe('5m');
  });

  it('rounds down to whole hours', () => {
    expect(relativeTime(ago(2 * HOUR), NOW)).toBe('2h');
  });

  it('rounds down to whole days', () => {
    expect(relativeTime(ago(3 * DAY), NOW)).toBe('3d');
  });

  it('switches to weeks at seven days', () => {
    expect(relativeTime(ago(2 * WEEK), NOW)).toBe('2w');
  });

  it('switches to months past four weeks', () => {
    expect(relativeTime(ago(40 * DAY), NOW)).toBe('1mo');
  });

  it('switches to years past twelve months', () => {
    expect(relativeTime(ago(400 * DAY), NOW)).toBe('1y');
  });

  it('clamps future timestamps to "now"', () => {
    expect(relativeTime(new Date(NOW.getTime() + HOUR).toISOString(), NOW)).toBe('now');
  });

  it('returns an empty string for a missing timestamp', () => {
    expect(relativeTime('', NOW)).toBe('');
  });

  it('returns an empty string for an unparseable timestamp', () => {
    expect(relativeTime('not a date', NOW)).toBe('');
  });
});
