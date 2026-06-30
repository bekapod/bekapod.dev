import { HANDLE, listRecords, resolveRepo, type FetchImpl } from './client.ts';

const PUBLICATION_COLLECTION = 'site.standard.publication';

export async function getPublicationUri(
  handle: string = HANDLE,
  fetchImpl: FetchImpl = fetch,
): Promise<string> {
  const repo = await resolveRepo(handle, fetchImpl);
  const records = await listRecords(repo, PUBLICATION_COLLECTION, fetchImpl);
  const uri = records[0]?.uri;
  if (!uri) {
    throw new Error(`No ${PUBLICATION_COLLECTION} record found for ${handle}`);
  }
  return uri;
}
