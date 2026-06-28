const HANDLE = 'bekapod.dev';
const HANDLE_RESOLVER = 'https://public.api.bsky.app';
const PLC_DIRECTORY = 'https://plc.directory';
const PUBLICATION_COLLECTION = 'site.standard.publication';

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} fetching ${url}`);
  }
  return res.json();
}

async function resolveDid(handle: string): Promise<string> {
  const data = (await fetchJson(
    `${HANDLE_RESOLVER}/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`,
  )) as { did: string };
  return data.did;
}

async function resolvePds(did: string): Promise<string> {
  const doc = (await fetchJson(`${PLC_DIRECTORY}/${did}`)) as {
    service?: { id: string; serviceEndpoint: string }[];
  };
  const pds = doc.service?.find((s) => s.id === '#atproto_pds')?.serviceEndpoint;
  if (!pds) {
    throw new Error(`No atproto PDS endpoint in DID document for ${did}`);
  }
  return pds;
}

export async function getPublicationUri(handle: string = HANDLE): Promise<string> {
  const did = await resolveDid(handle);
  const pds = await resolvePds(did);
  const data = (await fetchJson(
    `${pds}/xrpc/com.atproto.repo.listRecords?repo=${did}&collection=${PUBLICATION_COLLECTION}`,
  )) as { records: { uri: string }[] };
  const uri = data.records[0]?.uri;
  if (!uri) {
    throw new Error(`No ${PUBLICATION_COLLECTION} record found for ${handle}`);
  }
  return uri;
}
