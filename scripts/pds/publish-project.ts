import { parseArgs } from 'node:util';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import matter from 'gray-matter';
import { loadEnv } from './env.ts';
import { connect } from './client.ts';
import { uploadImage } from './images.ts';
import {
  assertRequiredFrontmatter,
  buildProjectRecord,
  PROJECT_COLLECTION,
  type ProjectFrontmatter,
} from './project.ts';

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { 'dry-run': { type: 'boolean' }, 'no-build': { type: 'boolean' } },
  });

  const file = positionals[0];
  if (!file) {
    throw new Error('Usage: pnpm pds:project <entry.md> [--dry-run] [--no-build]');
  }

  const raw = await readFile(file, 'utf8');
  const parsed = matter(raw);
  const frontmatter = parsed.data as ProjectFrontmatter;
  const dryRun = Boolean(values['dry-run']);
  const noBuild = Boolean(values['no-build']);

  assertRequiredFrontmatter(frontmatter);

  if (dryRun) {
    const record = buildProjectRecord({ frontmatter });
    console.log(JSON.stringify(record, null, 2));
    const note = frontmatter.image ? `1 image (${frontmatter.image})` : 'no image';
    console.log(`[dry-run] no record written; would upload ${note}`);
    return;
  }

  const env = loadEnv({ requireBuildHook: !noBuild });
  const pds = await connect(env);

  const image = frontmatter.image
    ? await uploadImage(pds, join(dirname(file), frontmatter.image))
    : undefined;

  const record = buildProjectRecord({ frontmatter, image });

  let uri: string;
  if (frontmatter.rkey) {
    ({ uri } = await pds.putRecord(PROJECT_COLLECTION, frontmatter.rkey, record));
  } else {
    const created = await pds.createRecord(PROJECT_COLLECTION, record);
    uri = created.uri;
    try {
      const updated = matter.stringify(parsed.content, { ...frontmatter, rkey: created.rkey });
      await writeFile(file, updated);
    } catch (err) {
      console.error(
        `WARNING: record created at ${uri} but failed to write rkey back to ${file}. ` +
          `Add \`rkey: ${created.rkey}\` to the frontmatter manually to avoid a duplicate on the next run.`,
      );
      throw err;
    }
  }

  console.log(`Published: ${uri}`);

  if (!noBuild && env.buildHook) {
    const res = await fetch(env.buildHook, { method: 'POST' });
    console.log(`Build hook: ${res.status}`);
  }
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
