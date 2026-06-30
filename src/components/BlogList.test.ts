import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import BlogList from './BlogList.astro';
import { accentCycle } from '../lib/accent-cycle';
import type { BlogPost } from '../lib/pds/shapes';

const post = (overrides: Partial<BlogPost> = {}): BlogPost => ({
  slug: 'first-post',
  title: 'Post Title',
  excerpt: 'An excerpt.',
  date: '2026-06-18T09:30:00.000Z',
  tags: ['tag-one'],
  readTime: 6,
  ...overrides,
});

const render = (posts: BlogPost[]) =>
  AstroContainer.create().then((container) =>
    container.renderToString(BlogList, { props: { posts } }),
  );

describe('BlogList', () => {
  it('renders a labelled #blog section with the subtitle', async () => {
    const html = await render([post()]);

    expect(html).toContain('id="blog"');
    expect(html).toContain('aria-labelledby="blog-heading"');
    expect(html).toContain('longer reads, when a note isn&#39;t enough.');
  });

  it('constrains the column to the narrower 1000px reading width', async () => {
    const html = await render([post()]);

    expect(html).toContain('max-w-[1000px]');
  });

  it('makes each row a link to its post route', async () => {
    const html = await render([post({ slug: 'second-post' })]);

    expect(html).toContain('href="/blog/second-post"');
  });

  it('numbers the rows by position, zero-padded', async () => {
    const html = await render([post({ slug: 'a' }), post({ slug: 'b' })]);

    expect(html).toContain('>01<');
    expect(html).toContain('>02<');
  });

  it('rotates the badge accent and keeps AA-safe ink text on it', async () => {
    const html = await render([post({ slug: 'a' }), post({ slug: 'b' })]);
    const cycle = accentCycle('blog');

    // The palette excludes `ink`, so every accent takes ink text via accentTextColor.
    expect(html).toContain(`bg-${cycle[0]}`);
    expect(html).toContain(`bg-${cycle[1]}`);
    expect(html).toContain('text-ink');
    expect(html).not.toContain('text-white');
  });

  it('renders the first tag as an inverted category chip', async () => {
    const html = await render([post({ tags: ['tag-one'] })]);

    expect(html).toContain('tag-one');
    expect(html).toContain('bg-text');
    expect(html).toContain('text-surface');
    expect(html).toContain('uppercase');
  });

  it('omits the category chip when the post has no tags', async () => {
    const html = await render([post({ tags: [] })]);

    expect(html).not.toContain('bg-text');
  });

  it('shows the title, excerpt, and a machine-readable mono meta line', async () => {
    const html = await render([post()]);

    expect(html).toContain('Post Title');
    expect(html).toContain('An excerpt.');
    expect(html).toContain('<time');
    expect(html).toContain('datetime="2026-06-18T09:30:00.000Z"');
    expect(html).toContain('Jun 18, 2026');
    expect(html).toContain('6 min read');
  });

  it('omits the excerpt when the post has none', async () => {
    const html = await render([post({ excerpt: undefined })]);

    expect(html).toContain('Post Title');
    expect(html).not.toContain('text-soft');
  });
});
