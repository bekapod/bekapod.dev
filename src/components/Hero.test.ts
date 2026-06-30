import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Hero from './Hero.astro';

const render = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) =>
  AstroContainer.create().then((container) => container.renderToString(Hero, { props, slots }));

describe('Hero', () => {
  it('renders a single <h1> whose accessible name is the wordmark', async () => {
    const html = await render();

    const h1s = html.match(/<h1/g) ?? [];
    expect(h1s).toHaveLength(1);
    expect(html).toContain('bekapod');
  });

  it('tints the trailing full stop pink, kept out of the accessible name', async () => {
    const html = await render();

    expect(html).toMatch(/text-pink[^>]*>\s*\.\s*</);
  });

  it('renders the uppercase eyebrow above the wordmark', async () => {
    const html = await render();

    expect(html).toContain("Hi, I'm");
    expect(html).toContain('uppercase');
  });

  it('renders the lede and the sub paragraph copy', async () => {
    const html = await render();

    expect(html).toContain('Software engineer building delightful things on the web.');
    expect(html).toContain('I write notes, the odd longer post');
    expect(html).toContain('Have a poke around.');
  });

  it('renders the social pills with brand-correct, AA-legible backgrounds', async () => {
    const html = await render();

    expect(html).toContain('GitHub');
    expect(html).toContain('Bluesky');
    expect(html).toContain('Ravelry');
    expect(html).toContain('RSS');

    expect(html).toContain('bg-ink');
    expect(html).toContain('bg-blue');
    expect(html).toContain('bg-coral');
    expect(html).toContain('bg-orange');
  });

  it('labels each social pill with its brand glyph as an inline svg', async () => {
    const html = await render();

    const svgs = html.match(/<svg/g) ?? [];
    expect(svgs.length).toBeGreaterThanOrEqual(4);
    expect(html).toContain('aria-hidden="true"');
  });

  it('exposes the hero as a labelled section', async () => {
    const html = await render();

    expect(html).toContain('id="hero"');
    expect(html).toMatch(/aria-labelledby="[^"]+"/);
  });

  it('stacks into one centred column below md, then splits into two at md', async () => {
    const html = await render();

    expect(html).toContain('grid-cols-1');
    expect(html).toContain('md:grid-cols-2');
    expect(html).toContain('text-center');
    expect(html).toContain('md:text-left');
  });

  it('renders slotted content as the right column', async () => {
    const html = await render({}, { default: '<div data-test="terminal">terminal</div>' });

    expect(html).toContain('data-test="terminal"');
  });

  it('hides the right column below md, where it would duplicate the hero copy', async () => {
    const html = await render({}, { default: '<div data-test="terminal">terminal</div>' });

    expect(html).toContain('hidden md:block');
  });
});
