import { describe, expect, it } from 'vitest';
import type { FetchImpl } from './client.ts';
import { getProjects, toProjects } from './projects.ts';
import type { RawRecord, Repo } from './shapes.ts';

const repo: Repo = { did: 'did:plc:abc', pds: 'https://pds.example' };

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

function proj(value: Record<string, unknown>, rkey = '3kaa'): RawRecord {
  return {
    uri: `at://did:plc:abc/dev.bekapod.project/${rkey}`,
    cid: 'cid',
    value: { $type: 'dev.bekapod.project', ...value },
  };
}

describe('toProjects', () => {
  it('maps a software project into the projects list', () => {
    const sw = proj({
      type: 'software',
      title: 'skyline',
      description: 'A cozy reader.',
      link: 'https://github.com/bekapod/skyline',
      tags: ['typescript', 'rss'],
    });
    const { projects, making } = toProjects([sw], repo);
    expect(making).toEqual([]);
    expect(projects).toEqual([
      {
        title: 'skyline',
        description: 'A cozy reader.',
        link: 'https://github.com/bekapod/skyline',
        tags: ['typescript', 'rss'],
        imageUrl: undefined,
      },
    ]);
  });

  it('maps knit and grow into the making list', () => {
    const knit = proj(
      {
        type: 'knit',
        title: 'wonky socks',
        description: 'warm.',
        link: 'https://www.ravelry.com/projects/bekapod/wonky-socks',
      },
      '3kbb',
    );
    const grow = proj({ type: 'grow', title: 'tomatoes' }, '3kaa');
    const { projects, making } = toProjects([knit, grow], repo);
    expect(projects).toEqual([]);
    expect(making).toEqual([
      {
        kind: 'knit',
        title: 'wonky socks',
        caption: 'warm.',
        link: 'https://www.ravelry.com/projects/bekapod/wonky-socks',
        imageUrl: undefined,
      },
      { kind: 'grow', title: 'tomatoes', caption: undefined, link: undefined, imageUrl: undefined },
    ]);
  });

  it('skips records that fail validation', () => {
    const bad = proj({ type: 'sewing', title: 'nope' });
    const good = proj({ type: 'software', title: 'ok' });
    expect(toProjects([bad, good], repo).projects.map((p) => p.title)).toEqual(['ok']);
  });

  it('sorts each list newest-first by TID rkey', () => {
    const older = proj({ type: 'software', title: 'older' }, '3kaa');
    const newer = proj({ type: 'software', title: 'newer' }, '3kzz');
    expect(toProjects([older, newer], repo).projects.map((p) => p.title)).toEqual([
      'newer',
      'older',
    ]);
  });

  it('builds imageUrl from the image blob when present', () => {
    const cid = 'bafkreibme22gw2h7y2h7tg2fhqotaqjucnbc24deqo72b6mkl2egezxhvy';
    const withImg = proj({
      type: 'software',
      title: 'p',
      image: { $type: 'blob', ref: { $link: cid }, mimeType: 'image/png', size: 100 },
    });
    expect(toProjects([withImg], repo).projects[0].imageUrl).toBe(
      `https://pds.example/xrpc/com.atproto.sync.getBlob?did=did%3Aplc%3Aabc&cid=${cid}`,
    );
  });
});

describe('getProjects', () => {
  it('resolves the repo, lists project records, and splits them', async () => {
    const fetchImpl = routedFetch([
      ...RESOLVE_ROUTES,
      {
        match: 'listRecords',
        body: {
          records: [
            proj({ type: 'software', title: 'skyline' }, '3kbb'),
            proj({ type: 'knit', title: 'socks' }, '3kaa'),
          ],
        },
      },
    ]);
    const { projects, making } = await getProjects(fetchImpl);
    expect(projects.map((p) => p.title)).toEqual(['skyline']);
    expect(making.map((m) => m.title)).toEqual(['socks']);
  });
});
