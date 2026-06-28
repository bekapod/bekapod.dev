import { parseArgs } from 'node:util';
import { loadEnv } from './env.ts';
import { connect, type Pds } from './client.ts';

export const PUBLICATION_COLLECTION = 'site.standard.publication';

export function buildPublicationRecord(): Record<string, unknown> {
  return {
    $type: PUBLICATION_COLLECTION,
    url: 'https://www.bekapod.dev',
    name: 'bekapod.dev',
    description: 'Software engineer building delightful things on the web.',
    preferences: {
      $type: 'site.standard.publication#preferences',
      showInDiscover: true,
    },
  };
}

export async function upsertPublication(pds: Pds): Promise<{ uri: string; created: boolean }> {
  const record = buildPublicationRecord();
  const existing = await pds.listRecords(PUBLICATION_COLLECTION);
  if (existing[0]) {
    const rkey = existing[0].uri.split('/').pop()!;
    const { uri } = await pds.putRecord(PUBLICATION_COLLECTION, rkey, record);
    return { uri, created: false };
  }
  const { uri } = await pds.createRecord(PUBLICATION_COLLECTION, record);
  return { uri, created: true };
}

async function main() {
  const { values } = parseArgs({ options: { 'dry-run': { type: 'boolean' } } });

  if (values['dry-run']) {
    console.log(JSON.stringify(buildPublicationRecord(), null, 2));
    console.log('[dry-run] no record written');
    return;
  }

  const env = loadEnv();
  const pds = await connect(env);
  const { uri, created } = await upsertPublication(pds);
  console.log(`${created ? 'Created' : 'Updated'} publication: ${uri}`);
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
