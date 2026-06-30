import { descending, fetchAuthorFeed, HANDLE, resolveDid, type FetchImpl } from './client.ts';
import type { Note } from './shapes.ts';

const FEED_FETCH_LIMIT = 50;

interface FeedPostRecord {
  text?: string;
  createdAt?: string;
  reply?: unknown;
  embed?: { $type?: string };
  tags?: string[];
  facets?: { features?: { $type?: string; tag?: string }[] }[];
}

interface FeedItem {
  post?: {
    uri?: string;
    record?: FeedPostRecord;
    likeCount?: number;
    repostCount?: number;
    replyCount?: number;
  };
  reason?: { $type?: string };
}

const REPOST_REASON = 'app.bsky.feed.defs#reasonRepost';
const TAG_FACET = 'app.bsky.richtext.facet#tag';
const QUOTE_EMBEDS = ['app.bsky.embed.record', 'app.bsky.embed.recordWithMedia'];
const DEFAULT_LIMIT = 6;

export function deriveTag(record: FeedPostRecord): string {
  const first = record.tags?.[0];
  if (typeof first === 'string' && first) return first;
  for (const facet of record.facets ?? []) {
    for (const feature of facet.features ?? []) {
      if (feature.$type === TAG_FACET && feature.tag) return feature.tag;
    }
  }
  return '';
}

export function toNotes(feed: unknown[], limit = DEFAULT_LIMIT): Note[] {
  const notes: Note[] = [];

  for (const entry of feed) {
    const item = entry as FeedItem;
    if (item.reason?.$type === REPOST_REASON) continue;

    const post = item.post;
    if (!post) continue;
    const record = post.record;
    if (!record || typeof record.text !== 'string') continue;
    if (record.reply) continue;
    if (record.embed?.$type && QUOTE_EMBEDS.includes(record.embed.$type)) continue;

    notes.push({
      text: record.text,
      tag: deriveTag(record),
      createdAt: record.createdAt ?? '',
      replies: post.replyCount ?? 0,
      reposts: post.repostCount ?? 0,
      likes: post.likeCount ?? 0,
      uri: post.uri ?? '',
    });
  }

  notes.sort((a, b) => descending(a.createdAt, b.createdAt));
  return notes.slice(0, limit);
}

export async function getNotes(fetchImpl: FetchImpl = fetch): Promise<Note[]> {
  const did = await resolveDid(HANDLE, fetchImpl);
  const feed = await fetchAuthorFeed(did, FEED_FETCH_LIMIT, fetchImpl);
  return toNotes(feed);
}
