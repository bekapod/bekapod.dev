import { describe, expect, it } from 'vitest';
import { buildGetBlobUrl } from './blob-url.ts';

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
