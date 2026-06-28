import { parseArgs } from 'node:util';
import { readFile, writeFile } from 'node:fs/promises';
import { openAsBlob } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import matter from 'gray-matter';
import { loadEnv } from './env.ts';
import { connect, type Pds } from './client.ts';
import {
  assertRequiredFrontmatter,
  buildDocumentRecord,
  buildGetBlobUrl,
  extractLocalImagePaths,
  rewriteImageLinks,
  type BlobEntry,
  type PostFrontmatter,
} from './document.ts';
import { PUBLICATION_COLLECTION } from './publication.ts';

const DOCUMENT_COLLECTION = 'site.standard.document';
const MARKDOWN_FILE = 'index.md';
const PLACEHOLDER_SITE = 'at://<did>/site.standard.publication/<rkey>';

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
};

async function resolveSiteUri(pds: Pds): Promise<string> {
  const pubs = await pds.listRecords(PUBLICATION_COLLECTION);
  if (!pubs[0]) {
    throw new Error('No publication record found. Run `pnpm pds:publication` first.');
  }
  return pubs[0].uri;
}

async function uploadImage(pds: Pds, path: string) {
  const mime = MIME_BY_EXT[extname(path).toLowerCase()];
  if (!mime) throw new Error(`Unsupported image type: ${path}`);
  const blob = await openAsBlob(path, { type: mime });
  if (blob.size >= 1_000_000) {
    throw new Error(`Image must be < 1MB: ${path} (${blob.size} bytes)`);
  }
  return pds.uploadBlob(blob);
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { 'dry-run': { type: 'boolean' }, 'no-build': { type: 'boolean' } },
  });

  const dir = positionals[0];
  if (!dir) {
    throw new Error('Usage: pnpm pds:publish <post-dir> [--dry-run] [--no-build]');
  }

  const mdPath = join(dir, MARKDOWN_FILE);
  const slug = basename(resolve(dir));
  const raw = await readFile(mdPath, 'utf8');
  const parsed = matter(raw);
  const frontmatter = parsed.data as PostFrontmatter;
  const body = parsed.content.trim();
  const now = new Date().toISOString();
  const dryRun = Boolean(values['dry-run']);
  const noBuild = Boolean(values['no-build']);

  assertRequiredFrontmatter(frontmatter);

  if (dryRun) {
    const record = buildDocumentRecord({
      frontmatter,
      slug,
      body,
      siteUri: PLACEHOLDER_SITE,
      now,
    });
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
  const content = rewriteImageLinks(body, urlByPath);

  const record = buildDocumentRecord({
    frontmatter,
    slug,
    body: content,
    siteUri,
    coverImage,
    blobs,
    now,
  });

  let uri: string;
  if (frontmatter.rkey) {
    ({ uri } = await pds.putRecord(DOCUMENT_COLLECTION, frontmatter.rkey, record));
  } else {
    const created = await pds.createRecord(DOCUMENT_COLLECTION, record);
    uri = created.uri;
    try {
      const updated = matter.stringify(body, { ...frontmatter, rkey: created.rkey });
      await writeFile(mdPath, updated);
    } catch (err) {
      console.error(
        `WARNING: record created at ${uri} but failed to write rkey back to ${mdPath}. ` +
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
