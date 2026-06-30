import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import BaseLayout from './BaseLayout.astro';

const render = (slots: Record<string, string> = {}) =>
  AstroContainer.create().then((container) => container.renderToString(BaseLayout, { slots }));

describe('BaseLayout', () => {
  it('renders the default slot inside the centered max-width container', async () => {
    const html = await render({ default: '<main data-test-body></main>' });

    const containerIdx = html.indexOf('max-width');
    const bodyIdx = html.indexOf('data-test-body');

    expect(containerIdx).toBeGreaterThan(-1);
    expect(bodyIdx).toBeGreaterThan(containerIdx);
  });

  it('renders the header slot full-bleed, outside the centered container', async () => {
    const html = await render({
      header: '<header data-test-header></header>',
      default: '<main data-test-body></main>',
    });

    const headerIdx = html.indexOf('data-test-header');
    const containerIdx = html.indexOf('max-width');

    expect(headerIdx).toBeGreaterThan(-1);
    // the header lands before the max-width wrapper, so it spans the viewport
    expect(headerIdx).toBeLessThan(containerIdx);
  });

  it('paints three decorative gradient blobs hidden from assistive tech', async () => {
    const html = await render();

    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('bg-pink');
    expect(html).toContain('bg-purple');
    expect(html).toContain('bg-teal');
    expect(html).toContain('blur-');
    expect(html).toContain('rounded-full');
  });

  it('keeps the blob layer behind content and clips its horizontal bleed', async () => {
    const html = await render({ default: '<main data-test-body></main>' });

    // a relative, x-clipped body so off-canvas blobs cannot cause sideways scroll
    expect(html).toMatch(/<body[^>]*overflow-x-hidden/);
    expect(html).toContain('-z-10');
  });
});
