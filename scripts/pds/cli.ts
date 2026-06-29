import { parseArgs } from 'node:util';
import { writeFile } from 'node:fs/promises';
import matter from 'gray-matter';
import type { Nsid, Pds } from './client.ts';
import type { PdsEnv } from './env.ts';

export interface PublishArgs {
  path: string;
  dryRun: boolean;
  noBuild: boolean;
}

/** Parses the positional path plus the `--dry-run` / `--no-build` flags shared by the publish CLIs. */
export function parsePublishArgs(argv: string[], usage: string): PublishArgs {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: { 'dry-run': { type: 'boolean' }, 'no-build': { type: 'boolean' } },
  });

  const path = positionals[0];
  if (!path) throw new Error(usage);

  return { path, dryRun: Boolean(values['dry-run']), noBuild: Boolean(values['no-build']) };
}

export type WriteFileImpl = (path: string, data: string) => Promise<void>;

export interface PublishRecordInput {
  pds: Pds;
  collection: Nsid;
  record: Record<string, unknown>;
  /** Existing rkey (from the source frontmatter); when set we update in place. */
  rkey: string | undefined;
  /** Full frontmatter, re-serialized with the new rkey when a record is created. */
  frontmatter: object;
  /** Markdown source file the record was built from; the new rkey is written back here. */
  sourceFile: string;
  /** Body to re-serialize alongside the frontmatter when writing the rkey back. */
  sourceContent: string;
  writeFileImpl?: WriteFileImpl;
}

/**
 * Writes `record` to the PDS. When `rkey` is set we update in place; otherwise we create a
 * new record and persist the generated rkey back into the source file so the next run
 * updates rather than creating a duplicate. A write-back failure is surfaced loudly (the
 * record already exists) rather than swallowed.
 */
export async function publishRecord(input: PublishRecordInput): Promise<string> {
  const { pds, collection, record, rkey, frontmatter, sourceFile, sourceContent } = input;
  const writeFileImpl = input.writeFileImpl ?? writeFile;

  if (rkey) {
    const { uri } = await pds.putRecord(collection, rkey, record);
    return uri;
  }

  const created = await pds.createRecord(collection, record);
  try {
    const updated = matter.stringify(sourceContent, { ...frontmatter, rkey: created.rkey });
    await writeFileImpl(sourceFile, updated);
  } catch (err) {
    console.error(
      `WARNING: record created at ${created.uri} but failed to write rkey back to ${sourceFile}. ` +
        `Add \`rkey: ${created.rkey}\` to the frontmatter manually to avoid a duplicate on the next run.`,
    );
    throw err;
  }
  return created.uri;
}

export type FetchImpl = typeof fetch;

/** Fires the Netlify build hook when configured, returning its HTTP status (or null if unset). */
export async function fireBuildHook(
  env: PdsEnv,
  fetchImpl: FetchImpl = fetch,
): Promise<number | null> {
  if (!env.buildHook) return null;
  const res = await fetchImpl(env.buildHook, { method: 'POST' });
  return res.status;
}
