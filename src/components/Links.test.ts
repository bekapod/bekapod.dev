import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Links from './Links.astro';
import { links } from '../data/links';

const render = (entries = links) =>
  AstroContainer.create().then((container) =>
    container.renderToString(Links, { props: { links: entries } }),
  );

describe('Links', () => {
  it('renders a labelled #links section with the subtitle', async () => {
    const html = await render();

    expect(html).toContain('id="links"');
    expect(html).toContain('aria-labelledby="links-heading"');
    expect(html).toContain('find me everywhere');
  });

  it('uses the yellow section accent', async () => {
    const html = await render();

    expect(html).toContain('bg-yellow');
  });

  it('stacks the rows in a 13px-gap column', async () => {
    const html = await render();

    expect(html).toContain('gap-[13px]');
  });

  it('renders a row per entry with its label and sub', async () => {
    const html = await render();

    expect(html).toContain('GitHub');
    expect(html).toContain('code &amp; experiments');
    expect(html).toContain('Bluesky');
    expect(html).toContain('@bekapod.dev');
    expect(html).toContain('RSS feed');
    expect(html).toContain('Ravelry');
  });

  it('links each row to its outbound home', async () => {
    const html = await render();

    expect(html).toContain('href="https://github.com/bekapod"');
    expect(html).toContain('href="https://bsky.app/profile/bekapod.dev"');
  });

  it('paints each row in its brand accent', async () => {
    const html = await render();

    expect(html).toContain('bg-ink');
    expect(html).toContain('bg-blue');
    expect(html).toContain('bg-orange');
    expect(html).toContain('bg-coral');
  });

  it('labels each row with a brand glyph instead of the outlined square', async () => {
    const html = await render();

    const svgs = html.match(/<svg/g) ?? [];
    expect(svgs.length).toBeGreaterThanOrEqual(links.length);
  });

  it('keeps ink text on the blue and coral brands for AA contrast', async () => {
    const html = await render([
      { label: 'Bluesky', sub: '', href: '#', color: 'blue', icon: links[1].icon },
    ]);

    expect(html).toContain('text-ink');
    expect(html).not.toContain('text-white');
  });
});
