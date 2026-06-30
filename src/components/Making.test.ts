import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Making from './Making.astro';
import { accentCycle } from '../lib/accent-cycle';
import type { MakingItem } from '../lib/pds/shapes';

const item = (overrides: Partial<MakingItem> = {}): MakingItem => ({
  kind: 'knit',
  title: 'wonky socks, mk II',
  caption: 'self-striping merino, very warm.',
  link: 'https://www.ravelry.com/projects/bekapod/wonky-socks',
  ...overrides,
});

const render = (making: MakingItem[]) =>
  AstroContainer.create().then((container) =>
    container.renderToString(Making, { props: { making } }),
  );

describe('Making', () => {
  it('renders a labelled #making section with the subtitle', async () => {
    const html = await render([item()]);

    expect(html).toContain('id="making"');
    expect(html).toContain('aria-labelledby="making-heading"');
    expect(html).toContain('things I make with my hands, away from the keyboard');
  });

  it('uses the green section accent', async () => {
    const html = await render([item()]);

    expect(html).toContain('bg-green');
  });

  it('lays the cards out in an auto-fill grid', async () => {
    const html = await render([item()]);

    expect(html).toContain('repeat(auto-fill,minmax(250px,1fr))');
  });

  it('shows the title and caption', async () => {
    const html = await render([item()]);

    expect(html).toContain('wonky socks, mk II');
    expect(html).toContain('self-striping merino, very warm.');
  });

  it('gives the image banner the prototype height', async () => {
    const html = await render([item()]);

    expect(html).toContain('h-[180px]');
  });

  it('tags a knit card with the coral kind chip', async () => {
    const html = await render([item({ kind: 'knit' })]);

    expect(html).toContain('knit');
    expect(html).toContain('bg-coral');
  });

  it('tags a grow card with the green kind chip, never coral', async () => {
    const html = await render([item({ kind: 'grow', title: 'tomatoes' })]);

    expect(html).toContain('grow');
    expect(html).not.toContain('bg-coral');
  });

  it('rotates the banner accent across cards along the seeded cycle', async () => {
    const html = await render([item({ title: 'a' }), item({ title: 'b' })]);
    const cycle = accentCycle('making');

    expect(html).toContain(`var(--color-${cycle[0]})`);
    expect(html).toContain(`var(--color-${cycle[1]})`);
  });

  it('links each card to its outbound home', async () => {
    const html = await render([item({ link: 'https://example.com/socks' })]);

    expect(html).toContain('href="https://example.com/socks"');
  });

  it('renders a card without a link as a non-interactive element', async () => {
    const html = await render([item({ link: undefined })]);

    expect(html).not.toContain('href');
  });
});
