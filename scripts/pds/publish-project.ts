import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import matter from 'gray-matter';
import { loadEnv } from './env.ts';
import { connect } from './client.ts';
import { uploadImage } from './images.ts';
import { fireBuildHook, parsePublishArgs, publishRecord } from './cli.ts';
import { requireFields } from './frontmatter.ts';
import { buildProjectRecord, PROJECT_COLLECTION, type ProjectFrontmatter } from './project.ts';

const USAGE = 'Usage: pnpm pds:project <entry.md> [--dry-run] [--no-build]';

async function main() {
  const { path: file, dryRun, noBuild } = parsePublishArgs(process.argv.slice(2), USAGE);

  const parsed = matter(await readFile(file, 'utf8'));
  const frontmatter = parsed.data as ProjectFrontmatter;

  requireFields(frontmatter, ['type', 'title']);

  if (dryRun) {
    console.log(JSON.stringify(buildProjectRecord({ frontmatter }), null, 2));
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

  const uri = await publishRecord({
    pds,
    collection: PROJECT_COLLECTION,
    record,
    rkey: frontmatter.rkey,
    frontmatter,
    sourceFile: file,
    sourceContent: parsed.content,
  });
  console.log(`Published: ${uri}`);

  if (!noBuild) {
    const status = await fireBuildHook(env);
    if (status !== null) console.log(`Build hook: ${status}`);
  }
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
