# Lexicons

AT Protocol schemas for bekapod.dev's PDS-driven content.

## What lives where

| Namespace         | Source                       | Notes                                                                                                            |
| ----------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `site.standard.*` | npm: `@atcute/standard-site` | Not vendored — types imported directly. Long-form publishing standard ([standard.site](https://standard.site)).  |
| `at.markpub.*`    | vendored here                | Markdown content member for `site.standard.document.content`. No npm package ships it, so the JSON is copied in. |
| `dev.bekapod.*`   | vendored here                | Our own lexicons (`dev.bekapod.project`).                                                                        |

### Vendored provenance

- `at/markpub/markdown.json`, `at/markpub/text.json` — copied verbatim from <https://markpub.at> on 2026-06-28, `lexicon: 1`. Refresh from source if upstream changes.

## Codegen

`pnpm lex` runs `@atcute/lex-cli generate` (config: `lex.config.js`) over `lexicons/**/*.json` and writes TypeScript schemas to `src/lexicons/` (generated; committed). The generated schemas validate against `@atcute/lexicons`.

## Blog post → `site.standard.document`

A post is a **directory** containing `index.md` plus its images; the publishing CLI (`pnpm pds:publish <dir>`) maps it to a record. Records use **TID** rkeys. Required fields: `site`, `title`, `publishedAt`.

| Source                     | `site.standard.document` field | Notes                                                                                                                                                  |
| -------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `title`                    | `title`                        | required                                                                                                                                               |
| `excerpt`                  | `description`                  | excerpt / brief description                                                                                                                            |
| `date`                     | `publishedAt`                  | required, datetime                                                                                                                                     |
| body markdown              | `content[]` + `textContent`    | `content` carries `{ $type: "at.markpub.markdown", text: { markdown }, flavor: "gfm" }`; `textContent` is a plaintext fallback for non-markpub readers |
| `tags`                     | `tags`                         | `tags[0]` is the primary tag, rendered as the category chip on the site                                                                                |
| directory name             | `path`                         | leading slash, e.g. `/blog/{dir}`; canonical URL = publication `url` + `path`                                                                          |
| `cover` (file in dir)      | `coverImage`                   | blob, `image/*`, < 1MB                                                                                                                                 |
| inline `![](local)` images | rewritten body + `blobs[]`     | uploaded as blobs; the markdown link is rewritten to a `getBlob` URL (host from `PDS_SERVICE`), and the blob is pinned in `blobs[]`                    |
| `readTime`                 | —                              | derived at render from the body — not stored                                                                                                           |
| `accent`                   | —                              | site presentation, assigned at render — not stored                                                                                                     |
| —                          | `site`                         | required; AT-URI of the publication record                                                                                                             |
| —                          | `bskyPostRef`                  | optional strong ref to the cross-posted Bluesky note                                                                                                   |

## Decisions

- **Body storage:** markdown in the open `content` union via `at.markpub.markdown`, plus a plaintext `textContent` fallback. The PDS record is the source of truth for the body.
- **Images (WhiteWind-style):** the cover goes in the native `coverImage` blob. Inline body images are uploaded as blobs, their markdown links rewritten to `getBlob` URLs (PDS host from `PDS_SERVICE`), and each is referenced in a `blobs[]` field (`{ name, blob }`) so the PDS pins it — a getBlob URL is plain text and does not count as a blob reference on its own.
- **Extension fields:** one — `blobs[]`, to pin inline-image blobs (mirrors `com.whtwnd.blog.entry`). `tags` map straight onto standard `tags` (the first is treated as the category); `readTime` and `accent` are derived at render, so no other extensions are needed.
- **Validation openness:** AT Protocol ignores unexpected fields (treats them as warnings, never invalid), so `blobs[]` is safe to add and is ignored by standard.site readers that don't know it.
- **Content construction:** `content` is an open union; the markpub member is built structurally. `@atcute/standard-site` (and `@atcute/atproto` for XRPC) are registered via tsconfig `types`; `createRecord`'s `record` is typed `unknown`, so there is no client-side content validation to satisfy.

## Publication record (`site.standard.publication`)

TID rkey. Required: `url`, `name`.

- `url`: `https://www.bekapod.dev`
- `name`: `bekapod.dev`
- `description`: `Software engineer building delightful things on the web.`
- `preferences.showInDiscover`: `true`
- `icon`, `basicTheme`: optional, deferred
