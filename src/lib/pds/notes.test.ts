import { describe, expect, it } from 'vitest';
import type { FetchImpl } from './client.ts';
import { deriveTag, getNotes, toNotes } from './notes.ts';

function routedFetch(
  routes: { match: string; body?: unknown; ok?: boolean; status?: number }[],
): FetchImpl {
  return (async (input: string | URL) => {
    const url = String(input);
    const route = routes.find((r) => url.includes(r.match));
    if (!route) throw new Error(`unrouted: ${url}`);
    return {
      ok: route.ok ?? true,
      status: route.status ?? 200,
      statusText: 'x',
      json: async () => route.body,
    } as Response;
  }) as unknown as FetchImpl;
}

function feedItem(
  record: Record<string, unknown>,
  post: Record<string, unknown> = {},
  reason?: string,
): unknown {
  const item: Record<string, unknown> = { post: { uri: 'at://p', record, ...post } };
  if (reason) item.reason = { $type: reason };
  return item;
}

const TAG_FACET = (tag: string) => ({
  features: [{ $type: 'app.bsky.richtext.facet#tag', tag }],
});

describe('deriveTag', () => {
  it('uses the first tags[] entry when present', () => {
    expect(deriveTag({ tags: ['shipped', 'other'], facets: [TAG_FACET('til')] })).toBe('shipped');
  });

  it('falls back to the first hashtag facet', () => {
    expect(deriveTag({ facets: [TAG_FACET('til')] })).toBe('til');
  });

  it('returns an empty string when there is no tag', () => {
    expect(deriveTag({})).toBe('');
  });
});

describe('toNotes', () => {
  it('maps a top-level post to a note', () => {
    const feed = [
      feedItem(
        { text: 'hello world', createdAt: '2026-06-01T00:00:00.000Z', tags: ['shipped'] },
        { uri: 'at://post/1', likeCount: 96, repostCount: 18, replyCount: 12 },
      ),
    ];
    expect(toNotes(feed)).toEqual([
      {
        text: 'hello world',
        tag: 'shipped',
        createdAt: '2026-06-01T00:00:00.000Z',
        replies: 12,
        reposts: 18,
        likes: 96,
        uri: 'at://post/1',
      },
    ]);
  });

  it('drops reposts', () => {
    const feed = [
      feedItem(
        { text: 'a repost', createdAt: '2026-06-01T00:00:00.000Z' },
        {},
        'app.bsky.feed.defs#reasonRepost',
      ),
    ];
    expect(toNotes(feed)).toEqual([]);
  });

  it('drops replies', () => {
    const feed = [
      feedItem({
        text: 'a reply',
        createdAt: '2026-06-01T00:00:00.000Z',
        reply: { parent: {}, root: {} },
      }),
    ];
    expect(toNotes(feed)).toEqual([]);
  });

  it('drops quote posts', () => {
    const record = feedItem({
      text: 'quoting',
      createdAt: '2026-06-01T00:00:00.000Z',
      embed: { $type: 'app.bsky.embed.record' },
    });
    const recordWithMedia = feedItem({
      text: 'quoting+media',
      createdAt: '2026-06-02T00:00:00.000Z',
      embed: { $type: 'app.bsky.embed.recordWithMedia' },
    });
    expect(toNotes([record, recordWithMedia])).toEqual([]);
  });

  it('keeps posts with non-quote embeds like images', () => {
    const feed = [
      feedItem({
        text: 'with a photo',
        createdAt: '2026-06-01T00:00:00.000Z',
        embed: { $type: 'app.bsky.embed.images' },
      }),
    ];
    expect(toNotes(feed)).toHaveLength(1);
  });

  it('drops posts without text', () => {
    const feed = [feedItem({ createdAt: '2026-06-01T00:00:00.000Z' })];
    expect(toNotes(feed)).toEqual([]);
  });

  it('sorts by createdAt descending', () => {
    const feed = [
      feedItem({ text: 'older', createdAt: '2026-06-01T00:00:00.000Z' }, { uri: 'at://old' }),
      feedItem({ text: 'newer', createdAt: '2026-06-05T00:00:00.000Z' }, { uri: 'at://new' }),
    ];
    expect(toNotes(feed).map((n) => n.text)).toEqual(['newer', 'older']);
  });

  it('caps the result to the limit', () => {
    const feed = Array.from({ length: 5 }, (_, i) =>
      feedItem({ text: `n${i}`, createdAt: `2026-06-0${i + 1}T00:00:00.000Z` }),
    );
    expect(toNotes(feed, 2)).toHaveLength(2);
  });

  it('defaults engagement counts to 0 when absent', () => {
    const feed = [feedItem({ text: 'plain', createdAt: '2026-06-01T00:00:00.000Z' })];
    const [note] = toNotes(feed);
    expect([note.replies, note.reposts, note.likes]).toEqual([0, 0, 0]);
  });
});

describe('getNotes', () => {
  it('resolves the did, fetches the author feed, and maps notes', async () => {
    const fetchImpl = routedFetch([
      { match: 'resolveHandle', body: { did: 'did:plc:abc' } },
      {
        match: 'getAuthorFeed',
        body: {
          feed: [
            feedItem({ text: 'hi', createdAt: '2026-06-01T00:00:00.000Z' }, { uri: 'at://n' }),
          ],
        },
      },
    ]);
    const notes = await getNotes(fetchImpl);
    expect(notes.map((n) => n.text)).toEqual(['hi']);
  });
});
