import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import SectionBadge from './SectionBadge.astro';

const render = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) =>
  AstroContainer.create().then((container) =>
    container.renderToString(SectionBadge, { props, slots }),
  );

describe('SectionBadge', () => {
  it('renders an inline pill with ink border, hard shadow, and bold display text by default', async () => {
    const html = await render({ label: 'notes' });

    expect(html).toContain('<span');
    expect(html).toContain('inline-block');
    expect(html).toContain('rounded-pill');
    expect(html).toContain('border-[1.5px]');
    expect(html).toContain('border-line');
    expect(html).toContain('shadow-sticker-sm');
    expect(html).toContain('font-bold');
    expect(html).toContain('notes');
  });

  it('maps the color prop to a static accent background token', async () => {
    const html = await render({ label: 'notes', color: 'pink' });

    expect(html).toContain('bg-pink');
  });

  it('derives the text colour from the accent: ink on the default pink badge', async () => {
    const html = await render({ label: 'notes' });

    expect(html).toContain('text-ink');
    expect(html).not.toContain('text-white');
  });

  it('flips to white text on the dark ink accent, and honours an explicit override', async () => {
    const ink = await render({ label: 'github', color: 'ink' });
    expect(ink).toContain('text-white');

    const override = await render({ label: 'notes', color: 'pink', textColor: 'white' });
    expect(override).toContain('text-white');
  });

  it('renders the element named by `as` and forwards extra attributes', async () => {
    const html = await render({ as: 'h2', id: 'notes-heading', label: 'notes' });

    expect(html).toContain('<h2');
    expect(html).toContain('id="notes-heading"');
    expect(html).not.toContain('<span');
  });

  it('lets a slot override the label', async () => {
    const html = await render({ label: 'notes' }, { default: 'custom' });

    expect(html).toContain('custom');
    expect(html).not.toContain('notes');
  });

  it('merges a passthrough class', async () => {
    const html = await render({ label: 'notes', class: 'tracking-tight' });

    expect(html).toContain('tracking-tight');
  });
});
