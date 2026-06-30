import { readFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import matter from 'gray-matter';
import { buildGetBlobUrl } from '../../src/lib/pds/blob-url.ts';
import { loadEnv } from './env.ts';
import { connect, type Pds } from './client.ts';
import { uploadImage } from './images.ts';
import { fireBuildHook, parsePublishArgs, publishRecord } from './cli.ts';
import { requireFields } from './frontmatter.ts';
import {
  buildDocumentRecord,
  extractLocalImagePaths,
  rewriteImageLinks,
  type BlobEntry,
  type PostFrontmatter,
} from './document.ts';
import { PUBLICATION_COLLECTION } from './publication.ts';

const DOCUMENT_COLLECTION = 'site.standard.document';
const MARKDOWN_FILE = 'index.md';
const PLACEHOLDER_SITE = 'at://<did>/site.standard.publication/<rkey>';
const USAGE = 'Usage: pnpm pds:publish <post-dir> [--dry-run] [--no-build]';

async function resolveSiteUri(pds: Pds): Promise<string> {
  const pubs = await pds.listRecords(PUBLICATION_COLLECTION);
  if (!pubs[0]) {
    throw new Error('No publication record found. Run `pnpm pds:publication` first.');
  }
  return pubs[0].uri;
}

async function main() {
  const { path: dir, dryRun, noBuild } = parsePublishArgs(process.argv.slice(2), USAGE);

  const mdPath = join(dir, MARKDOWN_FILE);
  const slug = basename(resolve(dir));
  const parsed = matter(await readFile(mdPath, 'utf8'));
  const frontmatter = parsed.data as PostFrontmatter;
  const body = parsed.content.trim();
  const now = new Date().toISOString();

  requireFields(frontmatter, ['title', 'date']);

  if (dryRun) {
    const record = buildDocumentRecord({ frontmatter, slug, body, siteUri: PLACEHOLDER_SITE, now });
    console.log(JSON.stringify(record, null, 2));
    const images = [
      ...(frontmatter.cover ? [frontmatter.cover] : []),
      ...extractLocalImagePaths(body),
    ];
    console.log(`[dry-run] no record written; would upload ${images.length} image(s):`);
    for (const img of images) console.log(`  - ${img}`);
    return;
  }

  const env = loadEnv({ requireBuildHook: !noBuild });
  const pds = await connect(env);
  const siteUri = await resolveSiteUri(pds);

  const coverImage = frontmatter.cover
    ? await uploadImage(pds, join(dir, frontmatter.cover))
    : undefined;

  const urlByPath: Record<string, string> = {};
  const blobs: BlobEntry[] = [];
  for (const path of extractLocalImagePaths(body)) {
    const blob = await uploadImage(pds, join(dir, path));
    urlByPath[path] = buildGetBlobUrl(env.service, pds.did, blob.ref.$link);
    blobs.push({ name: path, blob });
  }

  const record = buildDocumentRecord({
    frontmatter,
    slug,
    body: rewriteImageLinks(body, urlByPath),
    siteUri,
    coverImage,
    blobs,
    now,
  });

  const uri = await publishRecord({
    pds,
    collection: DOCUMENT_COLLECTION,
    record,
    rkey: frontmatter.rkey,
    frontmatter,
    sourceFile: mdPath,
    // write back the original body, not the blob-rewritten one, so source stays portable
    sourceContent: body,
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
