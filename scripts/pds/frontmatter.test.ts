import { describe, expect, it } from 'vitest';
import { requireFields, toIsoDatetime } from './frontmatter.ts';

describe('requireFields', () => {
  it('passes when every required field is present and truthy', () => {
    expect(() => requireFields({ title: 'x', date: 'y' }, ['title', 'date'])).not.toThrow();
  });

  it('throws listing every missing or empty field', () => {
    expect(() =>
      requireFields({ title: '', date: undefined, extra: 'ok' }, ['title', 'date']),
    ).toThrow(/title, date/);
  });
});

describe('toIsoDatetime', () => {
  it('normalizes a date-only string to an ISO datetime', () => {
    expect(toIsoDatetime('2020-01-02')).toBe('2020-01-02T00:00:00.000Z');
  });

  it('throws on an invalid date', () => {
    expect(() => toIsoDatetime('not-a-date')).toThrow(/Invalid date/);
  });
});
