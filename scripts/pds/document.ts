import removeMarkdown from 'remove-markdown';
import type { Blob as AtBlob } from '@atcute/lexicons';
import { requireFields, toIsoDatetime } from './frontmatter.ts';

export interface PostFrontmatter {
  title: string;
  date: string;
  excerpt?: string;
  tags?: string[];
  cover?: string;
  rkey?: string;
}

export interface BlobEntry {
  name: string;
  blob: AtBlob;
}

export interface BuildInput {
  frontmatter: PostFrontmatter;
  slug: string;
  body: string;
  siteUri: string;
  coverImage?: AtBlob;
  blobs?: BlobEntry[];
  now: string;
}

const IMAGE_LINK = /(!\[[^\]]*\]\()([^)]+)(\))/g;

function isLocalPath(target: string): boolean {
  return !/^(https?:|data:|\/\/)/i.test(target.trim());
}

export function extractLocalImagePaths(markdown: string): string[] {
  const paths = new Set<string>();
  for (const m of markdown.matchAll(IMAGE_LINK)) {
    const target = m[2].trim();
    if (isLocalPath(target)) paths.add(target);
  }
  return [...paths];
}

export function rewriteImageLinks(markdown: string, urlByPath: Record<string, string>): string {
  return markdown.replace(IMAGE_LINK, (whole, pre, target, post) => {
    const url = urlByPath[target.trim()];
    return url ? `${pre}${url}${post}` : whole;
  });
}

export function markdownToPlainText(markdown: string): string {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, '');
  const withoutAlerts = withoutCode.replace(
    /^\s*>?\s*\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/gim,
    '',
  );
  return removeMarkdown(withoutAlerts, { gfm: true })
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function buildDocumentRecord(input: BuildInput): Record<string, unknown> {
  const { frontmatter: fm, slug, body, siteUri, coverImage, blobs, now } = input;

  requireFields(fm, ['title', 'date']);

  const tags = fm.tags ?? [];

  const record: Record<string, unknown> = {
    $type: 'site.standard.document',
    site: siteUri,
    title: fm.title,
    publishedAt: toIsoDatetime(fm.date),
    path: `/blog/${slug}`,
    content: { $type: 'at.markpub.markdown', text: { markdown: body }, flavor: 'gfm' },
    textContent: markdownToPlainText(body),
  };

  if (fm.excerpt) record.description = fm.excerpt;
  if (tags.length > 0) record.tags = tags;
  if (coverImage) record.coverImage = coverImage;
  if (blobs && blobs.length > 0) record.blobs = blobs;
  if (fm.rkey) record.updatedAt = now;

  return record;
}
