import { describe, expect, it } from 'vitest';
import {
  blobCid,
  buildGetBlobUrl,
  fetchAuthorFeed,
  listRecords,
  resolveDid,
  resolvePds,
  type FetchImpl,
} from './client.ts';

interface FakeResponse {
  ok?: boolean;
  status?: number;
  statusText?: string;
  body?: unknown;
}

function fakeFetch(responses: FakeResponse[]): { impl: FetchImpl; urls: string[] } {
  const urls: string[] = [];
  let i = 0;
  const impl = (async (input: string | URL) => {
    urls.push(String(input));
    const r = responses[Math.min(i++, responses.length - 1)];
    return {
      ok: r.ok ?? true,
      status: r.status ?? 200,
      statusText: r.statusText ?? 'OK',
      json: async () => r.body,
    } as Response;
  }) as unknown as FetchImpl;
  return { impl, urls };
}

describe('buildGetBlobUrl', () => {
  it('builds a getBlob URL from host, did, and cid', () => {
    expect(buildGetBlobUrl('https://pds.example', 'did:plc:abc', 'bafycid')).toBe(
      'https://pds.example/xrpc/com.atproto.sync.getBlob?did=did%3Aplc%3Aabc&cid=bafycid',
    );
  });

  it('strips a trailing slash from the host', () => {
    expect(buildGetBlobUrl('https://pds.example/', 'did:plc:abc', 'bafycid')).toBe(
      'https://pds.example/xrpc/com.atproto.sync.getBlob?did=did%3Aplc%3Aabc&cid=bafycid',
    );
  });
});

describe('blobCid', () => {
  it('extracts the $link cid from a blob ref', () => {
    expect(
      blobCid({ $type: 'blob', ref: { $link: 'bafycid' }, mimeType: 'image/png', size: 1 }),
    ).toBe('bafycid');
  });

  it('returns undefined when there is no usable ref', () => {
    expect(blobCid(undefined)).toBeUndefined();
    expect(blobCid({})).toBeUndefined();
    expect(blobCid({ ref: {} })).toBeUndefined();
  });
});

describe('resolveDid', () => {
  it('resolves a handle to its did', async () => {
    const { impl, urls } = fakeFetch([{ body: { did: 'did:plc:abc' } }]);
    await expect(resolveDid('bekapod.dev', impl)).resolves.toBe('did:plc:abc');
    expect(urls[0]).toContain('resolveHandle?handle=bekapod.dev');
  });

  it('throws when the handle does not resolve', async () => {
    const { impl } = fakeFetch([{ body: {} }]);
    await expect(resolveDid('nope.example', impl)).rejects.toThrow(/resolve/i);
  });
});

describe('resolvePds', () => {
  it('extracts the #atproto_pds service endpoint', async () => {
    const { impl } = fakeFetch([
      {
        body: {
          service: [
            { id: '#other', serviceEndpoint: 'https://nope' },
            { id: '#atproto_pds', serviceEndpoint: 'https://pds.example' },
          ],
        },
      },
    ]);
    await expect(resolvePds('did:plc:abc', impl)).resolves.toBe('https://pds.example');
  });

  it('throws when no atproto PDS endpoint is present', async () => {
    const { impl } = fakeFetch([{ body: { service: [] } }]);
    await expect(resolvePds('did:plc:abc', impl)).rejects.toThrow(/PDS/);
  });
});

describe('listRecords', () => {
  it('follows the cursor across pages and concatenates records', async () => {
    const { impl, urls } = fakeFetch([
      { body: { records: [{ uri: 'a', cid: 'c', value: {} }], cursor: 'CUR1' } },
      { body: { records: [{ uri: 'b', cid: 'c', value: {} }] } },
    ]);
    const recs = await listRecords(
      { did: 'did:plc:abc', pds: 'https://pds.example' },
      'x.y.z',
      impl,
    );
    expect(recs.map((r) => r.uri)).toEqual(['a', 'b']);
    expect(urls[0]).toContain('com.atproto.repo.listRecords');
    expect(urls[1]).toContain('cursor=CUR1');
  });

  it('throws on a non-ok response so the build fails loudly', async () => {
    const { impl } = fakeFetch([{ ok: false, status: 502, statusText: 'Bad Gateway' }]);
    await expect(
      listRecords({ did: 'did:plc:abc', pds: 'https://pds.example' }, 'x.y.z', impl),
    ).rejects.toThrow(/502/);
  });
});

describe('fetchAuthorFeed', () => {
  it('returns the feed array and requests posts_no_replies', async () => {
    const { impl, urls } = fakeFetch([{ body: { feed: [{ post: { uri: 'a' } }] } }]);
    const feed = await fetchAuthorFeed('did:plc:abc', 50, impl);
    expect(feed).toHaveLength(1);
    expect(urls[0]).toContain('app.bsky.feed.getAuthorFeed');
    expect(urls[0]).toContain('filter=posts_no_replies');
  });
});
