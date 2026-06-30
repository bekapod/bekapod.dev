import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Footer from './Footer.astro';

const render = () => AstroContainer.create().then((container) => container.renderToString(Footer));

describe('Footer', () => {
  it('is a <footer> landmark anchored at #contact', async () => {
    const html = await render();

    expect(html).toMatch(/<footer[^>]*id="contact"/);
  });

  it('stays dark in both themes by painting ink, not the theme bg token', async () => {
    const html = await render();

    expect(html).toContain('bg-ink');
    expect(html).not.toContain('bg-bg');
  });

  it('names the landmark with the yellow "say hello!" heading', async () => {
    const html = await render();

    expect(html).toMatch(/<h2[^>]*id="contact-heading"/);
    expect(html).toMatch(/aria-labelledby="contact-heading"/);
    expect(html).toMatch(/text-yellow[^>]*>\s*say hello!/);
  });

  it('renders the blue Bluesky CTA with a cream border and pink hard shadow', async () => {
    const html = await render();

    expect(html).toMatch(/<a[^>]*>\s*find me on Bluesky\s*<svg/);
    const cta = html.match(/<a[^>]*bsky\.app[^>]*>/)?.[0] ?? '';
    expect(cta).toContain('href="https://bsky.app/profile/bekapod.dev"');
    expect(cta).toContain('bg-blue');
    expect(cta).toContain('text-white');
    expect(cta).toContain('border-[#FBF4E9]');
    expect(cta).toContain('#FF6BD6');
  });

  it('renders the four outline social pills with their outbound homes', async () => {
    const html = await render();

    expect(html).toContain('GitHub');
    expect(html).toContain('Bluesky');
    expect(html).toContain('Ravelry');
    expect(html).toContain('RSS');
    expect(html).toContain('href="https://github.com/bekapod"');
    expect(html).toContain('href="https://www.ravelry.com/people/CraftyBekapod"');
    expect(html).toContain('href="/rss.xml"');
  });

  it('outlines the social pills in #4A413A and recolours each to its brand on hover', async () => {
    const html = await render();

    expect(html).toContain('border-[#4A413A]');
    // GitHub's ink brand is invisible on the dark footer, so it brightens to cream
    expect(html).toContain('hover:border-[#FBF4E9]');
    expect(html).toContain('hover:border-blue');
    expect(html).toContain('hover:border-coral');
    expect(html).toContain('hover:border-orange');
  });

  it('signs off with a muted mono colophon', async () => {
    const html = await render();

    expect(html).toContain('font-mono');
    expect(html).toContain('text-[#7A6F62]');
    expect(html).toContain('bekapod.dev');
    expect(html).toContain('2026');
  });
});
