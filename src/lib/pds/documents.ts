import * as v from '@atcute/lexicons/validations';
import { mainSchema as docSchema } from '@atcute/standard-site/types/document';
import {
  blobCid,
  buildGetBlobUrl,
  descending,
  HANDLE,
  listRecords,
  resolveRepo,
  type FetchImpl,
} from './client.ts';
import type { BlogPost, RawRecord, Repo } from './shapes.ts';

const DOCUMENT_COLLECTION = 'site.standard.document';
const BLOG_PREFIX = '/blog/';

export function readTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.ceil(words / 200);
}

export function toBlogPosts(records: RawRecord[], repo: Repo): BlogPost[] {
  const posts: BlogPost[] = [];

  for (const record of records) {
    const parsed = v.safeParse(docSchema, record.value);
    if (!parsed.ok) continue;

    const doc = parsed.value;
    if (!doc.path?.startsWith(BLOG_PREFIX)) continue;
    const slug = doc.path.slice(BLOG_PREFIX.length);
    if (!slug) continue;

    const cover = (record.value as { coverImage?: unknown }).coverImage;
    const cid = cover ? blobCid(cover) : undefined;

    posts.push({
      slug,
      title: doc.title,
      excerpt: doc.description,
      date: doc.publishedAt,
      tags: doc.tags ? [...doc.tags] : [],
      readTime: readTime(doc.textContent ?? ''),
      coverUrl: cid ? buildGetBlobUrl(repo.pds, repo.did, cid) : undefined,
    });
  }

  posts.sort((a, b) => descending(a.date, b.date));
  return posts;
}

export async function getBlogPosts(fetchImpl: FetchImpl = fetch): Promise<BlogPost[]> {
  const repo = await resolveRepo(HANDLE, fetchImpl);
  const records = await listRecords(repo, DOCUMENT_COLLECTION, fetchImpl);
  return toBlogPosts(records, repo);
}
