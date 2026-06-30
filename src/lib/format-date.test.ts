import { describe, expect, it } from 'vitest';
import { formatDate } from './format-date';

describe('formatDate', () => {
  it('formats an ISO timestamp as a short, human date', () => {
    expect(formatDate('2026-06-18T09:30:00.000Z')).toBe('Jun 18, 2026');
  });

  it('formats a bare ISO date the same way', () => {
    expect(formatDate('2026-03-02')).toBe('Mar 2, 2026');
  });

  it('ignores the local timezone so the calendar day never drifts', () => {
    // 23:30 UTC must stay on the 31st regardless of the runner's offset.
    expect(formatDate('2025-12-31T23:30:00.000Z')).toBe('Dec 31, 2025');
  });

  it('returns an empty string for a missing or unparseable date', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate('not-a-date')).toBe('');
  });
});
