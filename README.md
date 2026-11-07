# blog-engine

Minimal static blog engine on [Astro](https://astro.build) + MDX. This repo holds no content and no secrets:
content is read from the directory given in `CONTENT_DIR`; without it, `example-content/` is built.

```sh
npm ci
npm run dev                                  # example-content/
CONTENT_DIR=/path/to/posts npm run build     # your content → dist/
```

`CONTENT_DIR` may be absolute or relative to the current working directory. It is resolved to an absolute
path once, in `src/lib/site.ts`, and that same path is used by `astro.config.mjs` and the content loader.

## Content contract

| Item | Rule |
| --- | --- |
| `site.json` | `url`, `title`, `author`, `lang`, `nav`, `footerLinks`, `hero`, `tagTones`; missing file or field = defaults |
| Single-file post | `2026-11-slug.md` or `.mdx` → `/blog/2026-11-slug/` |
| Folder post | `2026-11-slug/index.md(x)` + images next to it, linked relatively (`![](./image.png)`) |
| `_anything` | any file or folder starting with `_` is ignored (templates, notes) |

Frontmatter (validated; an invalid post fails the build):

| Field | Type |
| --- | --- |
| `title` | string, required |
| `description` | string, required (post list + meta description) |
| `pubDate` | date, required |
| `tags` | list, optional — `[magento2, open-source]`: letters, digits, hyphens, no `#` |
| `draft` | boolean, default `false` — shown in `astro dev` with a "draft" label, excluded from the build |

## Navigation

Header links come from `nav` in `site.json`, in order; without it the header shows only the logo.

```json
"nav": [
  { "label": "posts", "href": "/" },
  { "label": "games", "href": "/games/" },
  { "label": "rss", "href": "/rss.xml" }
]
```

A link is marked current (`aria-current="page"`, accent colour) on its exact path; a link ending in `/`
other than `/` is also current on every page below it. An invalid `nav` fails the build.

Footer links work the same way: `footerLinks` (same `{ "label", "href" }` shape), shown next to the copyright.

## Hero

Optional `hero` in `site.json` adds a hero above the post list on the home page; its title becomes the
page's `<h1>` and the list heading drops to `<h2>`. The post list has the anchor `#latest`.

```json
"hero": {
  "eyebrow": "// a short mono line",
  "title": "Two-line\nheadline.",
  "text": "One or two sentences.",
  "buttons": [{ "label": "Read posts", "href": "#latest" }, { "label": "GitHub", "href": "https://github.com/" }],
  "terminal": [
    { "cmd": "ls ~/site" },
    { "out": [{ "text": "posts/", "tone": "accent" }, { "text": "games/", "tone": "amber" }] },
    { "out": "plain output line" }
  ]
}
```

Only `title` is required; `\n` in it breaks the line. The first button is primary. `terminal` is decorative
(`aria-hidden`): `cmd` lines get a `$` prompt, `out` is plain text or spans with `tone`
(`plain`, `muted`, `accent`, `amber`, `blue`); a prompt with a cursor is appended. An invalid `hero` fails the build.

## Tags

Tags are shown as `#tag` in the post list (right column) and above the post title; they are not links.
They use the accent colour; `tagTones` in `site.json` colours individual tags with the hero's tones:

```json
"tagTones": { "gamedev": "amber", "graphql": "blue" }
```

## Pages

- `/` — blog title and post list (date, title, description), newest first.
- `/blog/<id>/` — post.
- `404.html`.

Output uses `build.format: 'directory'` (`…/index.html`).

## Components

### `<Game>`

```mdx
import Game from '@components/Game.astro';

<Game slug="my-game" title="My game" />
```

| Prop | Default | Meaning |
| --- | --- | --- |
| `slug` | required | game is served from `/games/<slug>/` |
| `title` | `slug` | iframe title / link text |
| `width`, `height` | `960`, `540` | aspect ratio of the frame |
| `poster` | — | background image URL for the launch button |
| `threads` | `false` | `true` → only a link opening the game in a new tab (threaded games need COOP/COEP on the top-level page) |

The iframe is created only after clicking "Play"; the small script is the only JS on the site and is included
only in posts that use the component. Games are not part of this build — locally the iframe shows a 404,
which is expected.

## Styling

Dark-only theme in one `src/styles/global.css` (colours as CSS variables on `:root`), no JS.

- Fonts are self-hosted variable woff2 in `public/fonts/` (latin + latin-ext): Inter (text), Bricolage Grotesque
  (headings), JetBrains Mono (logo, dates, code). All under SIL OFL 1.1, licence files next to them.
- Code is highlighted at build time by Shiki with the `bpf-dark` theme from `src/lib/shiki-theme.ts`;
  highlighted blocks get a small language strip.
- The logo is `site.title`; the part after the last dot is shown in the accent colour (`bpf.dev` → bpf**.dev**`_`).
