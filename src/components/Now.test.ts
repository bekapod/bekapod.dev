import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Now from './Now.astro';
import { now } from '../data/now';

const render = (rows = now) =>
  AstroContainer.create().then((container) => container.renderToString(Now, { props: { rows } }));

describe('Now', () => {
  it('renders a labelled #now section with the subtitle', async () => {
    const html = await render();

    expect(html).toContain('id="now"');
    expect(html).toContain('aria-labelledby="now-heading"');
    expect(html).toContain('up to lately');
  });

  it('uses the purple section accent', async () => {
    const html = await render();

    expect(html).toContain('bg-purple');
  });

  it('holds the rows in a single large-radius sticker card', async () => {
    const html = await render();

    expect(html).toContain('rounded-card-lg');
  });

  it('opens with the "currently…" heading', async () => {
    const html = await render();

    expect(html).toContain('currently');
  });

  it('renders a row per entry with its label and value', async () => {
    const html = await render();

    expect(html).toContain('building');
    expect(html).toContain('my own shell in rust (still unnamed)');
    expect(html).toContain('based in');
    expect(html).toContain('Liverpool, UK');
  });

  it('sets each label in uppercase mono', async () => {
    const html = await render();

    expect(html).toContain('font-mono');
    expect(html).toContain('uppercase');
  });

  it('gives each row its own accent swatch', async () => {
    const html = await render();

    expect(html).toContain('bg-coral');
    expect(html).toContain('bg-green');
    expect(html).toContain('bg-pink');
    expect(html).toContain('bg-yellow');
  });
});
