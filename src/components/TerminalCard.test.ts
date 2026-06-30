import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import TerminalCard from './TerminalCard.astro';

const render = () =>
  AstroContainer.create().then((container) => container.renderToString(TerminalCard));

describe('TerminalCard', () => {
  it('fills its column but caps its width so it never overflows a narrow cell', async () => {
    const html = await render();

    expect(html).toContain('w-full');
    expect(html).toContain('max-w-[380px]');
  });

  it('keeps a dark fill while theming only its outline', async () => {
    const html = await render();

    expect(html).toContain('bg-[#1B1611]');
    expect(html).toContain('font-mono');
    expect(html).toContain('rounded-card');
    // border + shadow are the only themed (ink↔cream) parts
    expect(html).toContain('border-line');
    expect(html).toContain('shadow-sticker-lg');
  });

  it('renders the title bar with three traffic-light dots and the path label', async () => {
    const html = await render();

    expect(html).toContain('bg-[#2A231C]');
    expect(html).toContain('bg-coral');
    expect(html).toContain('bg-yellow');
    expect(html).toContain('bg-teal');
    expect(html).toContain('bekapod.dev — ~/about');
  });

  it('renders the faux whoami readout', async () => {
    const html = await render();

    expect(html).toContain("who's this?");
    expect(html).toContain('whoami');
    expect(html).toContain('handle');
    expect(html).toContain('bekapod.dev');
    expect(html).toContain('software engineer');
    expect(html).toContain('Liverpool, UK');
  });

  it('colours the syntax with accent tokens (keys yellow, strings teal, prompt pink)', async () => {
    const html = await render();

    expect(html).toContain('text-yellow');
    expect(html).toContain('text-teal');
    expect(html).toContain('text-pink');
  });

  it('exposes the decorative art as a single labelled image to assistive tech', async () => {
    const html = await render();

    expect(html).toMatch(/role="img"/);
    expect(html).toMatch(/aria-label="[^"]*Liverpool[^"]*"/);
  });
});
