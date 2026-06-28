import * as v from '@atcute/lexicons/validations';
import { DevBekapodProject } from '../../lexicons/index.ts';
import {
  blobCid,
  buildGetBlobUrl,
  descending,
  HANDLE,
  listRecords,
  resolveRepo,
  type FetchImpl,
} from './client.ts';
import type { MakingItem, Project, RawRecord, Repo } from './shapes.ts';

const PROJECT_COLLECTION = 'dev.bekapod.project';

function rkey(record: RawRecord): string {
  return record.uri.split('/').pop() ?? '';
}

export function toProjects(
  records: RawRecord[],
  repo: Repo,
): { projects: Project[]; making: MakingItem[] } {
  const projects: Project[] = [];
  const making: MakingItem[] = [];

  const sorted = [...records].sort((a, b) => descending(rkey(a), rkey(b)));

  for (const record of sorted) {
    const parsed = v.safeParse(DevBekapodProject.mainSchema, record.value);
    if (!parsed.ok) continue;

    const project = parsed.value;
    const image = (record.value as { image?: unknown }).image;
    const cid = image ? blobCid(image) : undefined;
    const imageUrl = cid ? buildGetBlobUrl(repo.pds, repo.did, cid) : undefined;

    if (project.type === 'software') {
      projects.push({
        title: project.title,
        description: project.description,
        link: project.link,
        tags: project.tags ? [...project.tags] : [],
        imageUrl,
      });
    } else {
      making.push({
        kind: project.type,
        title: project.title,
        caption: project.description,
        imageUrl,
      });
    }
  }

  return { projects, making };
}

export async function getProjects(
  fetchImpl: FetchImpl = fetch,
): Promise<{ projects: Project[]; making: MakingItem[] }> {
  const repo = await resolveRepo(HANDLE, fetchImpl);
  const records = await listRecords(repo, PROJECT_COLLECTION, fetchImpl);
  return toProjects(records, repo);
}
