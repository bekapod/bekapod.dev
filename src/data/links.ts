import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import type { Accent } from '../lib/accent';
import { profiles, type ProfileId } from './profiles';

export interface LinkEntry {
  label: string;
  sub: string;
  href: string;
  color: Accent;
  icon: IconDefinition;
}

const fromProfile = (id: ProfileId, label: string, sub: string): LinkEntry => {
  const { href, color, icon } = profiles[id];
  return { label, sub, href, color, icon };
};

export const links: LinkEntry[] = [
  fromProfile('github', 'GitHub', 'code & experiments'),
  fromProfile('bluesky', 'Bluesky', '@bekapod.dev'),
  fromProfile('rss', 'RSS feed', 'subscribe to the blog'),
  fromProfile('ravelry', 'Ravelry', 'my knits & queue'),
];
