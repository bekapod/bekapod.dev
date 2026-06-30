import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import PillButton from './PillButton.astro';

const render = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) =>
  AstroContainer.create().then((container) =>
    container.renderToString(PillButton, { props, slots }),
  );

describe('PillButton', () => {
  it('renders an anchor with the pill shape when given an href', async () => {
    const html = await render({ href: '/blog' }, { default: 'view full feed' });

    expect(html).toContain('<a');
    expect(html).toContain('href="/blog"');
    expect(html).toContain('rounded-pill');
    expect(html).toContain('border-[1.5px]');
    expect(html).toContain('border-line');
    expect(html).toContain('view full feed');
  });

  it('renders a button defaulting to type="button" when given no href', async () => {
    const html = await render({}, { default: 'say hi' });

    expect(html).toContain('<button');
    expect(html).toContain('type="button"');
    expect(html).not.toContain('href');
    expect(html).toContain('say hi');
  });

  it('maps the color and textColor props to accent and text-colour token classes', async () => {
    const html = await render({ href: '#', color: 'blue', textColor: 'white' });

    expect(html).toContain('bg-blue');
    expect(html).toContain('text-white');
  });

  it('defaults to the medium size: standard shadow step and a -3px hover lift', async () => {
    const html = await render({ href: '#' });

    expect(html).toContain('shadow-sticker');
    expect(html).toContain('hover:shadow-sticker-hover');
    expect(html).toContain('hover:-translate-y-[3px]');
  });

  it('maps each size to matching padding, shadow, and hover-lift token classes', async () => {
    const sm = await render({ href: '#', size: 'sm' });
    expect(sm).toContain('shadow-sticker-sm');
    expect(sm).toContain('hover:shadow-sticker-sm-hover');
    expect(sm).toContain('hover:-translate-y-0.5');

    const lg = await render({ href: '#', size: 'lg' });
    expect(lg).toContain('shadow-sticker-lg');
    expect(lg).toContain('hover:shadow-sticker-lg-hover');
    expect(lg).toContain('hover:-translate-y-[3px]');
  });

  it('lays out as a bold, inline-flex pill with a focus-visible ring', async () => {
    const html = await render({ href: '#' });

    expect(html).toContain('inline-flex');
    expect(html).toContain('font-bold');
    expect(html).toContain('focus-visible:outline-line');
  });

  it('forwards extra attributes and merges a passthrough class', async () => {
    const html = await render({
      href: 'https://bsky.app',
      'aria-label': 'find me on Bluesky',
      class: 'mx-auto',
    });

    expect(html).toContain('aria-label="find me on Bluesky"');
    expect(html).toContain('mx-auto');
  });

  it('respects an explicit button type over the default', async () => {
    const html = await render({ type: 'submit' });

    expect(html).toContain('<button');
    expect(html).toContain('type="submit"');
  });
});
