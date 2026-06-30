import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { faArrowRight, faStar } from '@fortawesome/free-solid-svg-icons';
import { describe, expect, it } from 'vitest';
import LinkRow from './LinkRow.astro';

const render = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) =>
  AstroContainer.create().then((container) => container.renderToString(LinkRow, { props, slots }));

describe('LinkRow', () => {
  it('renders a full-width anchor carrying the href, label, and sub', async () => {
    const html = await render({
      href: 'https://github.com/bekapod',
      label: 'GitHub',
      sub: 'code & experiments',
    });

    expect(html).toContain('<a');
    expect(html).toContain('href="https://github.com/bekapod"');
    expect(html).toContain('w-full');
    expect(html).toContain('GitHub');
    expect(html).toContain('code &amp; experiments');
  });

  it('wears the sticker chrome: 1.5px ink border, 16px radius, hard shadow', async () => {
    const html = await render({ href: '#' });

    expect(html).toContain('border-[1.5px]');
    expect(html).toContain('border-line');
    expect(html).toContain('rounded-chip-lg');
    expect(html).toContain('shadow-link');
  });

  it('maps the color and textColor props to accent and text-colour token classes', async () => {
    const html = await render({ href: '#', color: 'blue', textColor: 'white' });

    expect(html).toContain('bg-blue');
    expect(html).toContain('text-white');
  });

  it('derives ink text on a bright accent and white text on the ink accent by default', async () => {
    const bright = await render({ href: '#', color: 'coral' });
    expect(bright).toContain('text-ink');
    expect(bright).not.toContain('text-white');

    const ink = await render({ href: '#', color: 'ink' });
    expect(ink).toContain('text-white');
  });

  it('slides right and deepens its shadow on hover', async () => {
    const html = await render({ href: '#' });

    expect(html).toContain('hover:translate-x-[6px]');
    expect(html).toContain('hover:shadow-link-hover');
  });

  it('renders an outlined square glyph in the current text colour by default', async () => {
    const html = await render({ href: '#' });

    expect(html).toContain('size-[14px]');
    expect(html).toContain('border-current');
  });

  it('renders the given icon instead of the square glyph', async () => {
    const html = await render({ href: '#', icon: faStar });
    const pathData = faStar.icon[4] as string;

    expect(html).toContain('<svg');
    expect(html).toContain(pathData);
    expect(html).not.toContain('border-current');
  });

  it('renders a decorative trailing arrow glyph', async () => {
    const html = await render({ href: '#' });
    const arrowPath = faArrowRight.icon[4] as string;

    expect(html).toContain(arrowPath);
    expect(html).toContain('aria-hidden="true"');
  });

  it('keeps a focus-visible ring for keyboard users', async () => {
    const html = await render({ href: '#' });

    expect(html).toContain('focus-visible:outline-line');
  });

  it('forwards extra attributes and merges a passthrough class', async () => {
    const html = await render({
      href: 'https://bsky.app/profile/bekapod.dev',
      'aria-label': 'find me on Bluesky',
      class: 'mt-2',
    });

    expect(html).toContain('aria-label="find me on Bluesky"');
    expect(html).toContain('mt-2');
  });
});
