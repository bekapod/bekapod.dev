import { describe, expect, it } from 'vitest';
import type { FetchImpl } from './client.ts';
import { getBlogPosts, readTime, toBlogPosts } from './documents.ts';
import type { RawRecord, Repo } from './shapes.ts';

interface Route {
  match: string;
  body?: unknown;
  ok?: boolean;
  status?: number;
}

function routedFetch(routes: Route[]): FetchImpl {
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

const RESOLVE_ROUTES: Route[] = [
  { match: 'resolveHandle', body: { did: 'did:plc:abc' } },
  {
    match: 'plc.directory',
    body: { service: [{ id: '#atproto_pds', serviceEndpoint: 'https://pds.example' }] },
  },
];

describe('readTime', () => {
  it('rounds 200 words up to 1 minute', () => {
    expect(readTime(Array(200).fill('word').join(' '))).toBe(1);
  });

  it('rounds 201 words up to 2 minutes', () => {
    expect(readTime(Array(201).fill('word').join(' '))).toBe(2);
  });

  it('counts words ignoring extra whitespace and newlines', () => {
    expect(readTime('  one   two\n\nthree\tfour ')).toBe(1);
  });

  it('is 0 for empty or whitespace-only text', () => {
    expect(readTime('')).toBe(0);
    expect(readTime('   \n  ')).toBe(0);
  });
});

const repo: Repo = { did: 'did:plc:abc', pds: 'https://pds.example' };

function doc(overrides: Record<string, unknown> = {}): RawRecord {
  const value = {
    $type: 'site.standard.document',
    site: 'at://did:plc:abc/site.standard.publication/pub',
    title: 'Hello World',
    publishedAt: '2026-06-18T00:00:00.000Z',
    path: '/blog/hello-world',
    content: { $type: 'at.markpub.markdown', text: { markdown: 'x' }, flavor: 'gfm' },
    textContent: Array(400).fill('word').join(' '),
    description: 'an excerpt',
    tags: ['the web', 'meta'],
    ...overrides,
  };
  return { uri: `at://did:plc:abc/site.standard.document/${value.path}`, cid: 'cid', value };
}

describe('toBlogPosts', () => {
  it('maps a conforming document to a blog post', () => {
    const [post] = toBlogPosts([doc()], repo);
    expect(post).toEqual({
      slug: 'hello-world',
      title: 'Hello World',
      excerpt: 'an excerpt',
      date: '2026-06-18T00:00:00.000Z',
      tags: ['the web', 'meta'],
      readTime: 2,
      coverUrl: undefined,
    });
  });

  it('skips records that fail schema validation', () => {
    const bad = doc();
    delete (bad.value as Record<string, unknown>).publishedAt;
    expect(toBlogPosts([bad], repo)).toEqual([]);
  });

  it('skips documents without a /blog/ path', () => {
    expect(toBlogPosts([doc({ path: undefined })], repo)).toEqual([]);
    expect(toBlogPosts([doc({ path: '/about' })], repo)).toEqual([]);
  });

  it('sorts posts by publishedAt descending', () => {
    const older = doc({ path: '/blog/older', publishedAt: '2025-01-01T00:00:00.000Z' });
    const newer = doc({ path: '/blog/newer', publishedAt: '2026-01-01T00:00:00.000Z' });
    expect(toBlogPosts([older, newer], repo).map((p) => p.slug)).toEqual(['newer', 'older']);
  });

  it('builds coverUrl from the coverImage blob when present', () => {
    const cid = 'bafkreibme22gw2h7y2h7tg2fhqotaqjucnbc24deqo72b6mkl2egezxhvy';
    const withCover = doc({
      coverImage: { $type: 'blob', ref: { $link: cid }, mimeType: 'image/png', size: 100 },
    });
    const [post] = toBlogPosts([withCover], repo);
    expect(post.coverUrl).toBe(
      `https://pds.example/xrpc/com.atproto.sync.getBlob?did=did%3Aplc%3Aabc&cid=${cid}`,
    );
  });
});

describe('getBlogPosts', () => {
  it('resolves the repo, lists documents, and maps them', async () => {
    const fetchImpl = routedFetch([
      ...RESOLVE_ROUTES,
      { match: 'listRecords', body: { records: [doc()] } },
    ]);
    const posts = await getBlogPosts(fetchImpl);
    expect(posts.map((p) => p.slug)).toEqual(['hello-world']);
  });

  it('fails loudly when the fetch errors', async () => {
    const fetchImpl = routedFetch([
      ...RESOLVE_ROUTES,
      { match: 'listRecords', ok: false, status: 503 },
    ]);
    await expect(getBlogPosts(fetchImpl)).rejects.toThrow(/503/);
  });
});
