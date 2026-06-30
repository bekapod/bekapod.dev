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
});
