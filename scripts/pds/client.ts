import { Client, ok } from '@atcute/client';
import { PasswordSession } from '@atcute/password-session';
import type { Blob as AtBlob } from '@atcute/lexicons';
import type { PdsEnv } from './env.ts';

export type Nsid = `${string}.${string}.${string}`;

export interface Pds {
  did: string;
  listRecords(collection: Nsid): Promise<{ uri: string }[]>;
  createRecord(
    collection: Nsid,
    record: Record<string, unknown>,
  ): Promise<{ uri: string; rkey: string }>;
  putRecord(
    collection: Nsid,
    rkey: string,
    record: Record<string, unknown>,
  ): Promise<{ uri: string }>;
  uploadBlob(blob: Blob): Promise<AtBlob>;
}

export async function connect(env: PdsEnv): Promise<Pds> {
  const session = await PasswordSession.login({
    service: env.service,
    identifier: env.identifier,
    password: env.password,
  });
  const rpc = new Client({ handler: session });

  const { did } = await ok(rpc.get('com.atproto.server.getSession'));

  return {
    did,
    async listRecords(collection) {
      const data = await ok(
        rpc.get('com.atproto.repo.listRecords', {
          params: { repo: did, collection },
        }),
      );
      return data.records;
    },
    async createRecord(collection, record) {
      const data = await ok(
        rpc.post('com.atproto.repo.createRecord', {
          input: { repo: did, collection, record },
        }),
      );
      return { uri: data.uri, rkey: data.uri.split('/').pop()! };
    },
    async putRecord(collection, rkey, record) {
      const data = await ok(
        rpc.post('com.atproto.repo.putRecord', {
          input: { repo: did, collection, rkey, record },
        }),
      );
      return { uri: data.uri };
    },
    async uploadBlob(blob) {
      const data = await ok(rpc.post('com.atproto.repo.uploadBlob', { input: blob }));
      return data.blob;
    },
  };
}
