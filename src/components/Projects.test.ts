import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Projects from './Projects.astro';
import { accentCycle } from '../lib/accent-cycle';
import type { Project } from '../lib/pds/shapes';

const project = (overrides: Partial<Project> = {}): Project => ({
  title: 'skyline',
  description: 'A cozy reader for all your favourite RSS feeds.',
  link: 'https://example.com/skyline',
  tags: ['typescript', 'rss'],
  ...overrides,
});

const render = (projects: Project[]) =>
  AstroContainer.create().then((container) =>
    container.renderToString(Projects, { props: { projects } }),
  );

describe('Projects', () => {
  it('renders a labelled #projects section with the subtitle', async () => {
    const html = await render([project()]);

    expect(html).toContain('id="projects"');
    expect(html).toContain('aria-labelledby="projects-heading"');
    expect(html).toContain('things I&#39;ve made &amp; broken');
  });

  it('uses the teal section accent', async () => {
    const html = await render([project()]);

    expect(html).toContain('bg-teal');
  });

  it('lays the cards out in an auto-fill grid', async () => {
    const html = await render([project()]);

    expect(html).toContain('repeat(auto-fill,minmax(250px,1fr))');
  });

  it('links each card to the project', async () => {
    const html = await render([project({ link: 'https://example.com/tilde' })]);

    expect(html).toContain('href="https://example.com/tilde"');
  });

  it('shows the title, description, and tech tags', async () => {
    const html = await render([project()]);

    expect(html).toContain('skyline');
    expect(html).toContain('A cozy reader for all your favourite RSS feeds.');
    expect(html).toContain('typescript');
    expect(html).toContain('rss');
  });

  it('omits the description when the project has none', async () => {
    const html = await render([project({ description: undefined })]);

    expect(html).toContain('skyline');
    expect(html).not.toContain('text-soft');
  });

  it('rotates the banner accent across cards along the seeded cycle', async () => {
    const html = await render([project({ title: 'a' }), project({ title: 'b' })]);
    const cycle = accentCycle('projects');

    expect(html).toContain(`var(--color-${cycle[0]})`);
    expect(html).toContain(`var(--color-${cycle[1]})`);
  });

  it('renders a card without a link as a non-interactive element', async () => {
    const html = await render([project({ link: undefined })]);

    expect(html).not.toContain('href');
  });
});
