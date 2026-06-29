import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { faMoon } from '@fortawesome/free-solid-svg-icons';
import { describe, expect, it } from 'vitest';
import Icon from './Icon.astro';

describe('Icon', () => {
  it('renders the FontAwesome icon as an inline svg', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Icon, { props: { icon: faMoon } });
    const [width, height, , , pathData] = faMoon.icon;

    expect(html).toContain('<svg');
    expect(html).toContain(`viewBox="0 0 ${width} ${height}"`);
    expect(html).toContain(pathData as string);
    expect(html).toContain('fill="currentColor"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('width="1em"');
    expect(html).toContain('height="1em"');
    expect(html).toContain('focusable="false"');
  });

  it('passes through the class prop', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Icon, {
      props: { icon: faMoon, class: 'dark:hidden' },
    });
    expect(html).toContain('dark:hidden');
  });
});
