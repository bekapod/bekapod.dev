import { describe, expect, it } from 'vitest';
import type { FetchImpl } from './client.ts';
import { getPublicationUri } from './publication.ts';

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

const RESOLVE_ROUTES = [
  { match: 'resolveHandle', body: { did: 'did:plc:abc' } },
  {
    match: 'plc.directory',
    body: { service: [{ id: '#atproto_pds', serviceEndpoint: 'https://pds.example' }] },
  },
];

describe('getPublicationUri', () => {
  it('returns the uri of the publication record', async () => {
    const fetchImpl = routedFetch([
      ...RESOLVE_ROUTES,
      {
        match: 'listRecords',
        body: {
          records: [{ uri: 'at://did:plc:abc/site.standard.publication/pub', cid: 'c', value: {} }],
        },
      },
    ]);
    await expect(getPublicationUri('bekapod.dev', fetchImpl)).resolves.toBe(
      'at://did:plc:abc/site.standard.publication/pub',
    );
  });

  it('throws when no publication record exists', async () => {
    const fetchImpl = routedFetch([
      ...RESOLVE_ROUTES,
      { match: 'listRecords', body: { records: [] } },
    ]);
    await expect(getPublicationUri('bekapod.dev', fetchImpl)).rejects.toThrow(/publication/);
  });
});
