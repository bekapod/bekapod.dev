export type Accent =
  | 'pink'
  | 'coral'
  | 'teal'
  | 'yellow'
  | 'purple'
  | 'green'
  | 'orange'
  | 'blue'
  | 'ink';

export type OnAccent = 'white' | 'ink';

export const accentTextColor = (accent: Accent): OnAccent => (accent === 'ink' ? 'white' : 'ink');

const ACCENT_BG: Record<Accent, string> = {
  pink: 'bg-pink',
  coral: 'bg-coral',
  teal: 'bg-teal',
  yellow: 'bg-yellow',
  purple: 'bg-purple',
  green: 'bg-green',
  orange: 'bg-orange',
  blue: 'bg-blue',
  ink: 'bg-ink',
};

export const accentBg = (accent: Accent): string => ACCENT_BG[accent];
