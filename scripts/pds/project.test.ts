import { describe, expect, it } from 'vitest';
import type { Blob as AtBlob } from '@atcute/lexicons';
import { buildProjectRecord } from './project.ts';

const fm = {
  type: 'software',
  title: 'skyline',
  description: 'A cozy reader for all your favourite RSS feeds.',
  status: 'active',
  startedAt: '2024-03-01T00:00:00.000Z',
  completedAt: '2024-06-15T00:00:00.000Z',
  link: 'https://github.com/bekapod/skyline',
  tags: ['typescript', 'rss'],
};

describe('buildProjectRecord', () => {
  it('maps frontmatter to a dev.bekapod.project record', () => {
    const rec = buildProjectRecord({ frontmatter: fm });
    expect(rec).toMatchObject({
      $type: 'dev.bekapod.project',
      type: 'software',
      title: 'skyline',
      description: 'A cozy reader for all your favourite RSS feeds.',
      status: 'active',
      startedAt: '2024-03-01T00:00:00.000Z',
      completedAt: '2024-06-15T00:00:00.000Z',
      link: 'https://github.com/bekapod/skyline',
      tags: ['typescript', 'rss'],
    });
    expect(rec.image).toBeUndefined();
  });

  it('omits optional fields when absent', () => {
    const rec = buildProjectRecord({ frontmatter: { type: 'knit', title: 'wonky socks' } });
    expect(rec).toEqual({ $type: 'dev.bekapod.project', type: 'knit', title: 'wonky socks' });
  });

  it('includes the image blob when provided', () => {
    const blob: AtBlob = { $type: 'blob', ref: { $link: 'x' }, mimeType: 'image/png', size: 1 };
    const rec = buildProjectRecord({ frontmatter: fm, image: blob });
    expect(rec.image).toBe(blob);
  });

  it('accepts the completed status', () => {
    const rec = buildProjectRecord({ frontmatter: { ...fm, status: 'completed' } });
    expect(rec.status).toBe('completed');
  });

  it('normalizes startedAt and completedAt to ISO datetimes', () => {
    const rec = buildProjectRecord({
      frontmatter: { ...fm, startedAt: '2024-03-01', completedAt: '2024-06-15' },
    });
    expect(rec.startedAt).toBe('2024-03-01T00:00:00.000Z');
    expect(rec.completedAt).toBe('2024-06-15T00:00:00.000Z');
  });

  it('throws on an invalid date', () => {
    expect(() => buildProjectRecord({ frontmatter: { ...fm, startedAt: 'not-a-date' } })).toThrow(
      /Invalid date/,
    );
  });

  it('throws when required fields are missing', () => {
    expect(() => buildProjectRecord({ frontmatter: { type: '', title: '' } })).toThrow(
      /type.*title/s,
    );
  });

  it('throws on an invalid type', () => {
    expect(() => buildProjectRecord({ frontmatter: { ...fm, type: 'sewing' } })).toThrow(/type/);
  });

  it('throws on an invalid status', () => {
    expect(() => buildProjectRecord({ frontmatter: { ...fm, status: 'wip' } })).toThrow(/status/);
  });
});
