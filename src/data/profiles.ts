import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faBluesky, faGithub, faRavelry } from '@fortawesome/free-brands-svg-icons';
import { faRss } from '@fortawesome/free-solid-svg-icons';
import type { Accent } from '../lib/accent';

export type ProfileId = 'github' | 'bluesky' | 'ravelry' | 'rss';

export interface Profile {
  name: string;
  href: string;
  color: Accent;
  icon: IconDefinition;
}

export const profiles: Record<ProfileId, Profile> = {
  github: {
    name: 'GitHub',
    href: 'https://github.com/bekapod',
    color: 'ink',
    icon: faGithub,
  },
  bluesky: {
    name: 'Bluesky',
    href: 'https://bsky.app/profile/bekapod.dev',
    color: 'blue',
    icon: faBluesky,
  },
  ravelry: {
    name: 'Ravelry',
    href: 'https://www.ravelry.com/people/CraftyBekapod',
    color: 'coral',
    icon: faRavelry,
  },
  rss: {
    name: 'RSS',
    href: '/rss.xml',
    color: 'orange',
    icon: faRss,
  },
};
