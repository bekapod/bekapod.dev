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
