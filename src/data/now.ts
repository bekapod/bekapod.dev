import type { Accent } from '../lib/accent';

export interface NowRow {
  label: string;
  value: string;
  color: Accent;
}

export const now: NowRow[] = [
  { label: 'building', value: 'my own shell in rust (still unnamed)', color: 'purple' },
  { label: 'knitting', value: 'my Tydes cardigan - almost at the sleeves!', color: 'coral' },
  { label: 'growing', value: 'tomatoes, chillies & basil', color: 'green' },
  { label: 'reading', value: "'Circe' by Madeline Miller", color: 'pink' },
  { label: 'based in', value: 'Liverpool, UK', color: 'yellow' },
];
