import type { Blob as AtBlob } from '@atcute/lexicons';
import { requireFields, toIsoDatetime } from './frontmatter.ts';

export const PROJECT_COLLECTION = 'dev.bekapod.project';

const TYPES = ['software', 'knit', 'grow'];
const STATUSES = ['active', 'completed', 'archived'];

export interface ProjectFrontmatter {
  type: string;
  title: string;
  description?: string;
  status?: string;
  startedAt?: string;
  completedAt?: string;
  link?: string;
  tags?: string[];
  image?: string;
  rkey?: string;
}

export interface ProjectBuildInput {
  frontmatter: ProjectFrontmatter;
  image?: AtBlob;
}

export function buildProjectRecord(input: ProjectBuildInput): Record<string, unknown> {
  const { frontmatter: fm, image } = input;

  requireFields(fm, ['type', 'title']);

  if (!TYPES.includes(fm.type)) {
    throw new Error(`Invalid type: ${fm.type} (expected ${TYPES.join(', ')})`);
  }
  if (fm.status && !STATUSES.includes(fm.status)) {
    throw new Error(`Invalid status: ${fm.status} (expected ${STATUSES.join(', ')})`);
  }

  const tags = fm.tags ?? [];

  const record: Record<string, unknown> = {
    $type: PROJECT_COLLECTION,
    type: fm.type,
    title: fm.title,
  };

  if (fm.description) record.description = fm.description;
  if (fm.status) record.status = fm.status;
  if (fm.startedAt) record.startedAt = toIsoDatetime(fm.startedAt);
  if (fm.completedAt) record.completedAt = toIsoDatetime(fm.completedAt);
  if (fm.link) record.link = fm.link;
  if (tags.length > 0) record.tags = tags;
  if (image) record.image = image;

  return record;
}
