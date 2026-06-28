import removeMarkdown from 'remove-markdown';

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
  blob: unknown;
}

export interface BuildInput {
  frontmatter: PostFrontmatter;
  slug: string;
  body: string;
  siteUri: string;
  coverImage?: unknown;
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

export function buildGetBlobUrl(service: string, did: string, cid: string): string {
  const base = service.replace(/\/$/, '');
  return `${base}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${cid}`;
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

export function assertRequiredFrontmatter(fm: PostFrontmatter): void {
  const missing = (['title', 'date'] as const).filter((k) => !fm[k]);
  if (missing.length > 0) {
    throw new Error(`Missing required frontmatter: ${missing.join(', ')}`);
  }
}

function toIsoDatetime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return date.toISOString();
}

export function buildDocumentRecord(input: BuildInput): Record<string, unknown> {
  const { frontmatter: fm, slug, body, siteUri, coverImage, blobs, now } = input;

  assertRequiredFrontmatter(fm);

  const tags = fm.tags ?? [];

  const record: Record<string, unknown> = {
    $type: 'site.standard.document',
    site: siteUri,
    title: fm.title,
    publishedAt: toIsoDatetime(fm.date),
    path: `/blog/${slug}`,
    content: [{ $type: 'at.markpub.markdown', text: { markdown: body }, flavor: 'gfm' }],
    textContent: markdownToPlainText(body),
  };

  if (fm.excerpt) record.description = fm.excerpt;
  if (tags.length > 0) record.tags = tags;
  if (coverImage) record.coverImage = coverImage;
  if (blobs && blobs.length > 0) record.blobs = blobs;
  if (fm.rkey) record.updatedAt = now;

  return record;
}
