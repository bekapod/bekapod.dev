import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Header from './Header.astro';

const render = (props: Record<string, unknown> = {}) =>
  AstroContainer.create().then((container) => container.renderToString(Header, { props }));

describe('Header', () => {
  it('renders a frosted header bar, static below sm and sticky from sm up', async () => {
    const html = await render();

    expect(html).toContain('<header');
    expect(html).toContain('static'); // not sticky on small screens
    expect(html).toContain('sm:sticky'); // sticks from the sm breakpoint up
    expect(html).toContain('top-0');
    expect(html).toContain('z-50');
    expect(html).toContain('bg-glass');
    expect(html).toContain('backdrop-blur');
    expect(html).toContain('border-b-[1.5px]');
    expect(html).toContain('border-line');
  });

  it('renders the logo as a real anchor to home with the wordmark', async () => {
    const html = await render();

    expect(html).toMatch(/<a[^>]*href="\/"/);
    expect(html).toContain('bekapod.dev');
    // the yellow logo square holds a bold "b"
    expect(html).toContain('bg-yellow');
    expect(html).toContain('>b<');
  });

  it('wraps the navigation in a labelled nav landmark', async () => {
    const html = await render();

    expect(html).toContain('<nav');
    expect(html).toContain('aria-label="Primary"');
  });

  it('drops the nav to its own row so the toggle stays beside the logo when wrapping', async () => {
    const html = await render();

    // the nav takes a full-width row of its own (pushing the toggle up beside
    // the logo) until lg, where it rejoins the bar as an inline item
    expect(html).toContain('basis-full');
    expect(html).toContain('lg:basis-auto');
  });

  it('renders each section link as a real anchor to its in-page id', async () => {
    const html = await render();

    for (const id of ['notes', 'blog', 'projects', 'making', 'now']) {
      expect(html).toMatch(new RegExp(`<a[^>]*href="#${id}"`));
    }
  });

  it('gives each nav link its section accent as a hover fill', async () => {
    const html = await render();

    expect(html).toContain('hover:bg-pink'); // notes
    expect(html).toContain('hover:bg-coral'); // blog
    expect(html).toContain('hover:bg-teal'); // projects
    expect(html).toContain('hover:bg-green'); // making
    expect(html).toContain('hover:bg-purple'); // now
    // the hover fill is the accent alone — no border on hover
    expect(html).not.toContain('hover:border-line');
    // ink text on the accent fill for contrast; never white
    expect(html).toContain('hover:text-ink');
    expect(html).not.toContain('hover:text-white');
  });

  it('renders a focus-visible ring on the section links', async () => {
    const html = await render();

    expect(html).toContain('focus-visible:outline-line');
  });

  it('renders "say hi" as a filled purple pill linking to the contact anchor', async () => {
    const html = await render();

    expect(html).toMatch(/<a[^>]*href="#contact"[^>]*>[\s\S]*?say hi/);
    expect(html).toContain('bg-purple');
  });

  it('renders the theme toggle', async () => {
    const html = await render();

    expect(html).toContain('data-theme-toggle');
    expect(html).toContain('aria-label="Toggle dark mode"');
  });
});
