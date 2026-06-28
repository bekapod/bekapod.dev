import type { RawRecord, Repo } from './shapes.ts';

export const HANDLE = 'bekapod.dev';
const HANDLE_RESOLVER = 'https://public.api.bsky.app';
const PLC_DIRECTORY = 'https://plc.directory';
const APPVIEW = 'https://public.api.bsky.app';

export type FetchImpl = typeof fetch;

export function buildGetBlobUrl(pdsHost: string, did: string, cid: string): string {
  const base = pdsHost.replace(/\/$/, '');
  return `${base}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${cid}`;
}

export function blobCid(blob: unknown): string | undefined {
  const ref = (blob as { ref?: { $link?: unknown } } | undefined)?.ref;
  return typeof ref?.$link === 'string' ? ref.$link : undefined;
}

export function descending(a: string, b: string): number {
  return a < b ? 1 : a > b ? -1 : 0;
}

async function fetchJson(url: string, fetchImpl: FetchImpl): Promise<unknown> {
  const res = await fetchImpl(url);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} fetching ${url}`);
  }
  return res.json();
}

export async function resolveDid(
  handle: string = HANDLE,
  fetchImpl: FetchImpl = fetch,
): Promise<string> {
  const data = (await fetchJson(
    `${HANDLE_RESOLVER}/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`,
    fetchImpl,
  )) as { did?: string };
  if (!data.did) {
    throw new Error(`Could not resolve a DID for ${handle}`);
  }
  return data.did;
}

export async function resolvePds(did: string, fetchImpl: FetchImpl = fetch): Promise<string> {
  const doc = (await fetchJson(`${PLC_DIRECTORY}/${did}`, fetchImpl)) as {
    service?: { id: string; serviceEndpoint: string }[];
  };
  const pds = doc.service?.find((s) => s.id === '#atproto_pds')?.serviceEndpoint;
  if (!pds) {
    throw new Error(`No atproto PDS endpoint in DID document for ${did}`);
  }
  return pds;
}

export async function resolveRepo(
  handle: string = HANDLE,
  fetchImpl: FetchImpl = fetch,
): Promise<Repo> {
  const did = await resolveDid(handle, fetchImpl);
  const pds = await resolvePds(did, fetchImpl);
  return { did, pds };
}

export async function listRecords(
  repo: Repo,
  collection: string,
  fetchImpl: FetchImpl = fetch,
): Promise<RawRecord[]> {
  const records: RawRecord[] = [];
  let cursor: string | undefined;
  do {
    const url = new URL(`${repo.pds}/xrpc/com.atproto.repo.listRecords`);
    url.searchParams.set('repo', repo.did);
    url.searchParams.set('collection', collection);
    url.searchParams.set('limit', '100');
    if (cursor) url.searchParams.set('cursor', cursor);
    const page = (await fetchJson(url.toString(), fetchImpl)) as {
      records?: RawRecord[];
      cursor?: string;
    };
    records.push(...(page.records ?? []));
    cursor = page.cursor;
  } while (cursor);
  return records;
}

export async function fetchAuthorFeed(
  did: string,
  limit = 50,
  fetchImpl: FetchImpl = fetch,
): Promise<unknown[]> {
  const url = new URL(`${APPVIEW}/xrpc/app.bsky.feed.getAuthorFeed`);
  url.searchParams.set('actor', did);
  url.searchParams.set('filter', 'posts_no_replies');
  url.searchParams.set('limit', String(limit));
  const data = (await fetchJson(url.toString(), fetchImpl)) as { feed?: unknown[] };
  return data.feed ?? [];
}
