export interface Repo {
  did: string;
  pds: string;
}

export interface RawRecord {
  uri: string;
  cid: string;
  value: unknown;
}

export interface Note {
  text: string;
  tag: string;
  createdAt: string;
  replies: number;
  reposts: number;
  likes: number;
  uri: string;
}

export interface Project {
  title: string;
  description?: string;
  link?: string;
  tags: string[];
  imageUrl?: string;
}

export interface MakingItem {
  kind: 'knit' | 'grow';
  title: string;
  caption?: string;
  imageUrl?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt?: string;
  date: string;
  tags: string[];
  readTime: number;
  coverUrl?: string;
}
