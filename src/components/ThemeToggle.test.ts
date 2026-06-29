import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { describe, expect, it } from 'vitest';
import ThemeToggle from './ThemeToggle.astro';

describe('ThemeToggle', () => {
  it('renders an accessible toggle button', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ThemeToggle);

    expect(html).toContain('<button');
    expect(html).toContain('type="button"');
    expect(html).toContain('data-theme-toggle');
    expect(html).toContain('aria-label="Toggle dark mode"');
    expect(html).toContain('aria-pressed="false"');
  });

  it('renders the moon (light) and sun (dark) icons with theme-driven visibility', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ThemeToggle);
    const svgs = html.match(/<svg[\s\S]*?<\/svg>/g) ?? [];
    const moonSvg = svgs.find((s) => s.includes(faMoon.icon[4] as string));
    const sunSvg = svgs.find((s) => s.includes(faSun.icon[4] as string));

    expect(moonSvg).toBeDefined();
    expect(moonSvg).toContain('dark:hidden'); // moon shown in light
    expect(moonSvg).not.toContain('dark:block');

    expect(sunSvg).toBeDefined();
    expect(sunSvg).toContain('dark:block'); // sun shown in dark
    expect(sunSvg).not.toContain('dark:hidden');
  });
});
