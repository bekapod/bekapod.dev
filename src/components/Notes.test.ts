import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Notes from './Notes.astro';
import { accentCycle } from '../lib/accent-cycle';
import type { Note } from '../lib/pds/shapes';

const note = (overrides: Partial<Note> = {}): Note => ({
  text: 'a little thought',
  tag: 'shipped',
  createdAt: '2026-06-30T10:00:00.000Z',
  replies: 12,
  reposts: 18,
  likes: 96,
  uri: 'at://did:plc:abc/app.bsky.feed.post/1',
  ...overrides,
});

const render = (notes: Note[]) =>
  AstroContainer.create().then((container) =>
    container.renderToString(Notes, { props: { notes } }),
  );

describe('Notes', () => {
  it('renders a labelled #notes section with the subtitle', async () => {
    const html = await render([note()]);

    expect(html).toContain('id="notes"');
    expect(html).toContain('aria-labelledby="notes-heading"');
    expect(html).toContain('thinking out loud, intelligent thought not guaranteed.');
  });

  it('lays the feed out as a CSS multi-column masonry', async () => {
    const html = await render([note()]);

    expect(html).toContain('column-width:280px');
    expect(html).toContain('break-inside:avoid');
  });

  it('shows an empty circular accent marker when a note has no tag', async () => {
    const html = await render([note({ tag: '' })]);

    expect(html).toContain('rounded-full');
    expect(html).toContain(`var(--color-${accentCycle('notes')[0]})`);
    // `text-[11px]` is unique to the Tag pill, so its absence confirms none rendered
    expect(html).not.toContain('text-[11px]');
  });

  it('renders each note with its tag, text, and a machine-readable timestamp', async () => {
    const html = await render([note({ tag: 'til', text: 'css nesting is a small joy' })]);

    expect(html).toContain('til');
    expect(html).toContain('css nesting is a small joy');
    expect(html).toContain('<time');
    expect(html).toContain('datetime="2026-06-30T10:00:00.000Z"');
  });

  it('rotates the tag accent by position along the seeded cycle', async () => {
    const html = await render([note(), note(), note()]);
    const cycle = accentCycle('notes');

    expect(html).toContain(`bg-${cycle[0]}`);
    expect(html).toContain(`bg-${cycle[1]}`);
    expect(html).toContain(`bg-${cycle[2]}`);
  });

  it('shows the three engagement counts', async () => {
    const html = await render([note({ replies: 5, reposts: 9, likes: 64 })]);

    expect(html).toContain('5');
    expect(html).toContain('9');
    expect(html).toContain('64');
  });

  it('links to the full Bluesky feed', async () => {
    const html = await render([note()]);

    expect(html).toContain('view full feed on Bluesky');
    expect(html).toContain('https://bsky.app/profile/bekapod.dev');
  });
});
