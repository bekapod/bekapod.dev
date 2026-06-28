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

Records use **TID** rkeys. Required fields: `site`, `title`, `publishedAt`.

| Handoff frontmatter    | `site.standard.document` field | Notes                                                                                                                                                                          |
| ---------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `title`                | `title`                        | required                                                                                                                                                                       |
| `excerpt`              | `description`                  | excerpt / brief description                                                                                                                                                    |
| `date`                 | `publishedAt`                  | required, datetime                                                                                                                                                             |
| body blocks → markdown | `content[]` + `textContent`    | `content` carries `{ $type: "at.markpub.markdown", text: { markdown }, flavor: "gfm" }`; `textContent` carries a plaintext fallback for indexers that don't understand markpub |
| `category`             | `tags[0]`                      | primary tag; further tags may follow                                                                                                                                           |
| (slug)                 | `path`                         | leading slash, e.g. `/blog/owning-my-words-again`; canonical URL = publication `url` + `path`                                                                                  |
| (cover image)          | `coverImage`                   | blob, `image/*`, < 1MB                                                                                                                                                         |
| `readTime`             | —                              | derived at render from the body (word count) — not stored                                                                                                                      |
| `accent`               | —                              | site presentation, assigned at render — not stored                                                                                                                             |
| —                      | `site`                         | required; AT-URI of the publication record                                                                                                                                     |
| —                      | `bskyPostRef`                  | optional strong ref to the cross-posted Bluesky note ("discuss on Bluesky")                                                                                                    |

## Decisions

- **Body storage:** markdown in the open `content` union via `at.markpub.markdown`, plus a plaintext `textContent` fallback. Maximally portable; the PDS record is the source of truth for the body.
- **Extension fields:** none. `category` maps onto standard `tags`; `readTime` and `accent` are derived at render, keeping the record fully standard.
- **Validation openness:** AT Protocol ignores unexpected fields (treats them as warnings, never invalid), so the standard tolerates extension — but we avoid ad-hoc top-level props by deriving instead.
- **Content union registration:** `content` is an open union with no registered refs; the markpub member is registered via `@atcute/lexicons/ambient` augmentation when records are written.

## Publication record (`site.standard.publication`)

TID rkey. Required: `url`, `name`.

- `url`: `https://www.bekapod.dev`
- `name`: `bekapod.dev`
- `description`: `Software engineer building delightful things on the web.`
- `preferences.showInDiscover`: `true`
- `icon`, `basicTheme`: optional, deferred
