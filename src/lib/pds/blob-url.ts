/** Builds a `com.atproto.sync.getBlob` URL for a blob hosted on a PDS. */
export function buildGetBlobUrl(pdsHost: string, did: string, cid: string): string {
  const base = pdsHost.replace(/\/$/, '');
  return `${base}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${cid}`;
}
