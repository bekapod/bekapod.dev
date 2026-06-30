import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import StickerCard from './StickerCard.astro';

const render = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) =>
  AstroContainer.create().then((container) =>
    container.renderToString(StickerCard, { props, slots }),
  );

describe('StickerCard', () => {
  it('renders a surface card with ink border and hard shadow by default', async () => {
    const html = await render({}, { default: 'hello' });

    expect(html).toContain('<div');
    expect(html).toContain('bg-surface');
    expect(html).toContain('border-[1.5px]');
    expect(html).toContain('border-line');
    expect(html).toContain('shadow-sticker');
    expect(html).toContain('rounded-card');
    expect(html).toContain('hello');
  });

  it('renders the element named by `as` and forwards extra attributes', async () => {
    const html = await render({ as: 'a', href: '/blog/hi' });

    expect(html).toContain('<a');
    expect(html).toContain('href="/blog/hi"');
  });

  it('is static (no hover or transition) unless interactive', async () => {
    const html = await render();

    expect(html).not.toContain('hover:');
    expect(html).not.toContain('data-interactive');
    expect(html).not.toContain('focus-visible:');
  });

  it('adds hover-lift, a deeper shadow step, and a focus ring when interactive', async () => {
    const html = await render({ interactive: true });

    expect(html).toContain('data-interactive');
    expect(html).toContain('hover:-translate-y');
    expect(html).toContain('hover:shadow-sticker-hover');
    expect(html).toContain('focus-visible:outline-line');
  });

  it('maps the radius prop to a static token class', async () => {
    const html = await render({ radius: 'card-lg' });

    expect(html).toContain('rounded-card-lg');
    expect(html).not.toContain('rounded-card"');
  });

  it('maps the shadow prop to matching base and hover token classes', async () => {
    const html = await render({ shadow: 'lg', interactive: true });

    expect(html).toContain('shadow-sticker-lg');
    expect(html).toContain('hover:shadow-sticker-lg-hover');
  });

  it('merges a passthrough class', async () => {
    const html = await render({ class: 'overflow-hidden' });

    expect(html).toContain('overflow-hidden');
  });
});
