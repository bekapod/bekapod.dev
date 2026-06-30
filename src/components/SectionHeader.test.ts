import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import SectionHeader from './SectionHeader.astro';

const render = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) =>
  AstroContainer.create().then((container) =>
    container.renderToString(SectionHeader, { props, slots }),
  );

describe('SectionHeader', () => {
  it('renders the badge label and the muted subtitle', async () => {
    const html = await render({
      label: 'notes',
      subtitle: 'little thoughts, posted straight to Bluesky',
    });

    expect(html).toContain('notes');
    expect(html).toContain('little thoughts, posted straight to Bluesky');
    expect(html).toContain('text-muted');
    expect(html).toContain('font-medium');
  });

  it('forwards the accent color to the badge', async () => {
    const html = await render({ label: 'blog', color: 'coral', subtitle: 'longer reads' });

    expect(html).toContain('bg-coral');
  });

  it('forwards heading semantics (`as` and `id`) to the badge', async () => {
    const html = await render({
      as: 'h2',
      id: 'notes-heading',
      label: 'notes',
      subtitle: 'sub',
    });

    expect(html).toContain('<h2');
    expect(html).toContain('id="notes-heading"');
  });

  it('wraps the row in a <header> as the section’s introductory content', async () => {
    const html = await render({ label: 'notes', subtitle: 'sub' });

    expect(html).toContain('<header');
  });

  it('lays the badge and subtitle out as a baseline-aligned row', async () => {
    const html = await render({ label: 'notes', subtitle: 'sub' });

    expect(html).toContain('flex');
    expect(html).toContain('items-baseline');
  });

  it('omits the subtitle paragraph when no subtitle is given', async () => {
    const html = await render({ label: 'now' });

    expect(html).not.toContain('<p');
  });

  it('merges a passthrough class on the wrapper', async () => {
    const html = await render({ label: 'notes', subtitle: 'sub', class: 'mb-0' });

    expect(html).toContain('mb-0');
  });
});
