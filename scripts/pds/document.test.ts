import * as v from '@atcute/lexicons/validations';
import type { Blob as AtBlob } from '@atcute/lexicons';
import { mainSchema as docSchema } from '@atcute/standard-site/types/document';
import { describe, expect, it } from 'vitest';
import {
  buildDocumentRecord,
  extractLocalImagePaths,
  markdownToPlainText,
  rewriteImageLinks,
} from './document.ts';

const base = {
  slug: 'example-post',
  siteUri: 'at://did:plc:example/site.standard.publication/rkey',
  now: '2020-01-01T00:00:00.000Z',
  body: '# Heading\n\nSome **bold** text.',
};

const fm = {
  title: 'Example Post',
  date: '2020-01-02T00:00:00.000Z',
  excerpt: 'A short summary.',
  tags: ['example', 'demo'],
};

describe('markdownToPlainText', () => {
  it('strips headings, emphasis and inline code', () => {
    expect(markdownToPlainText('# Heading\n\nSome **bold** `code` text.')).toBe(
      'Heading\n\nSome bold code text.',
    );
  });

  it('drops fenced code blocks', () => {
    expect(markdownToPlainText('Intro\n\n```js\nconst x = 1\n```\n\nOutro')).toBe('Intro\n\nOutro');
  });

  it('strips GFM alert markers and keeps later links intact', () => {
    expect(markdownToPlainText('> [!NOTE]\n> a note\n\nSee [here](https://x.test). Done.')).toBe(
      'a note\n\nSee here. Done.',
    );
  });
});

describe('extractLocalImagePaths', () => {
  it('returns unique local image paths, ignoring remote ones', () => {
    const md = '![a](photo.png)\n![b](sub/pic.jpg)\n![c](photo.png)\n![d](https://x.test/y.png)';
    expect(extractLocalImagePaths(md)).toEqual(['photo.png', 'sub/pic.jpg']);
  });
});

describe('rewriteImageLinks', () => {
  it('swaps local paths for resolved urls, leaving others untouched', () => {
    const md = '![a](photo.png) and ![b](https://x.test/y.png)';
    const out = rewriteImageLinks(md, { 'photo.png': 'https://pds.example/blob' });
    expect(out).toBe('![a](https://pds.example/blob) and ![b](https://x.test/y.png)');
  });
});

describe('buildDocumentRecord', () => {
  it('maps frontmatter + body to a standard.document record', () => {
    const rec = buildDocumentRecord({ frontmatter: fm, ...base });
    expect(rec).toMatchObject({
      $type: 'site.standard.document',
      site: base.siteUri,
      title: 'Example Post',
      publishedAt: '2020-01-02T00:00:00.000Z',
      description: 'A short summary.',
      path: '/blog/example-post',
      tags: ['example', 'demo'],
      content: { $type: 'at.markpub.markdown', text: { markdown: base.body }, flavor: 'gfm' },
    });
    expect(rec.textContent).toContain('Some bold text.');
    expect(rec.blobs).toBeUndefined();
    expect(rec.coverImage).toBeUndefined();
  });

  it('produces a record that conforms to the site.standard.document schema', () => {
    const rec = buildDocumentRecord({ frontmatter: fm, ...base });
    expect(v.safeParse(docSchema, rec).ok).toBe(true);
  });

  it('includes blobs and coverImage when provided', () => {
    const blob: AtBlob = { $type: 'blob', ref: { $link: 'x' }, mimeType: 'image/png', size: 1 };
    const rec = buildDocumentRecord({
      frontmatter: fm,
      ...base,
      coverImage: blob,
      blobs: [{ name: 'photo.png', blob }],
    });
    expect(rec.coverImage).toBe(blob);
    expect(rec.blobs).toEqual([{ name: 'photo.png', blob }]);
  });

  it('omits updatedAt on first publish, sets it on re-publish', () => {
    expect(buildDocumentRecord({ frontmatter: fm, ...base }).updatedAt).toBeUndefined();
    const updated = buildDocumentRecord({
      frontmatter: { ...fm, rkey: '3kabc' },
      ...base,
    });
    expect(updated.updatedAt).toBe(base.now);
  });

  it('normalizes publishedAt to an ISO datetime', () => {
    const rec = buildDocumentRecord({
      frontmatter: { ...fm, date: '2020-01-02' },
      ...base,
    });
    expect(rec.publishedAt).toBe('2020-01-02T00:00:00.000Z');
  });

  it('throws on an invalid date', () => {
    expect(() =>
      buildDocumentRecord({ frontmatter: { ...fm, date: 'not-a-date' }, ...base }),
    ).toThrow(/Invalid date/);
  });

  it('throws when required fields are missing', () => {
    expect(() => buildDocumentRecord({ frontmatter: { title: '', date: '' }, ...base })).toThrow(
      /title.*date/s,
    );
  });
});
