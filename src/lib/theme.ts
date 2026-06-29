export type Theme = 'light' | 'dark';

export const THEME_KEY = 'bekapod-theme';

export function nextTheme(current: Theme): Theme {
  return current === 'dark' ? 'light' : 'dark';
}

export function resolveInitialTheme(stored: string | null, prefersDark: boolean): Theme {
  if (stored === 'light' || stored === 'dark') return stored;
  return prefersDark ? 'dark' : 'light';
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // storage may be unavailable (private mode / blocked); the theme still applies this page
  }
}
