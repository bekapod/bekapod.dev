import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Tag from './Tag.astro';

const render = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) =>
  AstroContainer.create().then((container) => container.renderToString(Tag, { props, slots }));

describe('Tag', () => {
  it('renders an inline mono chip with a 1px ink border and the chip background by default', async () => {
    const html = await render({ label: 'astro' });

    expect(html).toContain('<span');
    expect(html).toContain('inline-block');
    expect(html).toContain('font-mono');
    expect(html).toContain('font-medium');
    expect(html).toContain('border-line');
    expect(html).not.toContain('border-[1.5px]');
    expect(html).toContain('bg-chip');
    expect(html).toContain('astro');
  });

  it('defaults to the small 6px chip radius and maps `radius` to the 16px step', async () => {
    const sm = await render({ label: 'astro' });
    expect(sm).toContain('rounded-chip');
    expect(sm).not.toContain('rounded-chip-lg');

    const lg = await render({ label: 'astro', radius: 'lg' });
    expect(lg).toContain('rounded-chip-lg');
  });

  it('maps the color prop to a static accent background token', async () => {
    const html = await render({ label: 'shipped', color: 'pink' });

    expect(html).toContain('bg-pink');
    expect(html).not.toContain('bg-chip');
  });

  it('inherits the theme text colour on the neutral chip, but derives ink on a bright accent', async () => {
    const chip = await render({ label: 'astro' });
    expect(chip).toContain('text-text');

    const accent = await render({ label: 'shipped', color: 'pink' });
    expect(accent).toContain('text-ink');
    expect(accent).not.toContain('text-text');
  });

  it('honours an explicit textColor override over the derived default', async () => {
    const white = await render({ label: 'shipped', color: 'pink', textColor: 'white' });
    expect(white).toContain('text-white');
    expect(white).not.toContain('text-text');

    const ink = await render({ label: 'knit', color: 'green', textColor: 'ink' });
    expect(ink).toContain('text-ink');
  });

  it('renders the element named by `as` and forwards extra attributes', async () => {
    const html = await render({ as: 'li', id: 'tech-astro', label: 'astro' });

    expect(html).toContain('<li');
    expect(html).toContain('id="tech-astro"');
    expect(html).not.toContain('<span');
  });

  it('lets a slot override the label', async () => {
    const html = await render({ label: 'astro' }, { default: 'custom' });

    expect(html).toContain('custom');
    expect(html).not.toContain('astro');
  });

  it('merges a passthrough class', async () => {
    const html = await render({ label: 'knit', class: 'shadow-sticker-sm' });

    expect(html).toContain('shadow-sticker-sm');
  });
});
