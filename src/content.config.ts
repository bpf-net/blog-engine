import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CONTENT_DIR } from './lib/site';

/** Folders under CONTENT_DIR that hold other collections, not posts. */
const RESERVED_DIRS = ['games', 'modules'];

const tag = z.string().regex(/^[\p{L}\p{N}][\p{L}\p{N}-]*$/u, 'tag: letters, digits and hyphens only, no "#" or spaces');

const blog = defineCollection({
  // The first pattern alone would also pick up _template.md and _drafts/.
  loader: glob({
    pattern: ['**/*.{md,mdx}', '!**/_*', '!**/_*/**', ...RESERVED_DIRS.map((d) => `!${d}/**`)],
    base: CONTENT_DIR,
  }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    draft: z.boolean().default(false),
    /** Cover image next to the post (./cover.jpg): shown above the body and used for link previews. */
    cover: image().optional(),
    coverAlt: z.string().optional(),
    // Written without "#": letters, digits and hyphens, e.g. [magento2, open-source].
    tags: z.array(tag).default([]),
    /** Short summary shown in a box above the post body; `code` in backticks is supported. */
    tldr: z.string().optional(),
    /** Id of a module (file name in modules/) shown as "Related module" next to the post. */
    module: reference('modules').optional(),
    /** Id of a game (file name in games/); the post is listed in that game's devlog. */
    game: reference('games').optional(),
  }),
});

const games = defineCollection({
  loader: glob({ pattern: ['**/*.{md,mdx}', '!**/_*', '!**/_*/**'], base: `${CONTENT_DIR}/games` }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      /** Short tech line, e.g. "Godot · wasm". */
      engine: z.string().optional(),
      /** e.g. "prototype", "in progress". */
      status: z.string().optional(),
      /** Screenshot next to the file, e.g. ./cover.png (16:10 works best). */
      cover: image().optional(),
      /** Card link; defaults to the game page /games/<id>/. */
      href: z.string().optional(),
      /** URL of the game build loaded in the player; default /games/<id>/play/. */
      src: z.string().optional(),
      /** Threaded build (needs COOP/COEP): the page links to it in a new tab instead of embedding. */
      threads: z.boolean().default(false),
      /** Info panel on the game page (each row optional; `engine` above is shown there too). */
      platform: z.string().optional(),
      genre: z.string().optional(),
      version: z.string().optional(),
      updated: z.coerce.date().optional(),
      /** URL for bug reports / feedback, shown as a button under the info panel. */
      feedback: z.string().optional(),
      /** Note shown above the player on narrow screens, e.g. "Made for keyboard and mouse". */
      mobileNote: z.string().optional(),
      /** Shown as "Controls": e.g. [{ keys: [W, A, S, D], action: move the map }]. */
      controls: z.array(z.object({ keys: z.array(z.string()).min(1), action: z.string() })).default([]),
      /** Player aspect ratio. */
      width: z.number().positive().default(16),
      height: z.number().positive().default(9),
      /** Link text on the card. */
      cta: z.string().default('Play'),
      /** Lower first; games without it go last, by title. */
      order: z.number().optional(),
      draft: z.boolean().default(false),
    }),
});

const TONES = ['plain', 'muted', 'accent', 'amber', 'blue'] as const;

const modules = defineCollection({
  loader: glob({ pattern: ['**/*.{md,mdx}', '!**/_*', '!**/_*/**'], base: `${CONTENT_DIR}/modules` }),
  schema: z.object({
    /** Module name, shown in mono, e.g. "openmage-hreflang". */
    title: z.string(),
    description: z.string(),
    /** Platform / version line, e.g. "Magento 2.4.x · PHP 8.4". */
    platform: z.string().optional(),
    /** Pill text, e.g. "in progress". */
    status: z.string().optional(),
    statusTone: z.enum(TONES).default('muted'),
    /** Grey labels on the module page, e.g. [OpenMage, SEO, open source]. */
    tags: z.array(z.string().min(1)).default([]),
    /** Source code URL: "Code on GitHub" button on the module page. */
    repo: z.string().optional(),
    /** "Roadmap" button target, e.g. a GitHub project board. */
    roadmapHref: z.string().optional(),
    /** Info panel on the module page: release and licence (repo comes from `repo`). */
    version: z.string().optional(),
    license: z.string().optional(),
    /** Install command shown with a copy button, e.g. "composer require vendor/module". */
    install: z.string().optional(),
    /** "What it does": feature tiles. */
    features: z.array(z.object({ title: z.string(), text: z.string().optional() })).default([]),
    /** "Compatibility" table rows. */
    compatibility: z
      .array(
        z.object({
          platform: z.string(),
          versions: z.string().optional(),
          php: z.string().optional(),
          status: z.string().optional(),
          statusTone: z.enum(TONES).default('muted'),
        }),
      )
      .default([]),
    /** "Roadmap" milestones; the Roadmap button scrolls here unless roadmapHref is set. */
    roadmap: z
      .array(z.object({ stage: z.enum(['done', 'now', 'later']), text: z.string(), href: z.string().optional() }))
      .default([]),
    /** Card link; defaults to /modules/<id>/. */
    href: z.string().optional(),
    order: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, games, modules };
