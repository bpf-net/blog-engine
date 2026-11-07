import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CONTENT_DIR } from './lib/site';

const blog = defineCollection({
  // The first pattern alone would also pick up _template.md and _drafts/.
  loader: glob({ pattern: ['**/*.{md,mdx}', '!**/_*', '!**/_*/**'], base: CONTENT_DIR }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    draft: z.boolean().default(false),
    // Written without "#": letters, digits and hyphens, e.g. [magento2, open-source].
    tags: z
      .array(z.string().regex(/^[\p{L}\p{N}][\p{L}\p{N}-]*$/u, 'tag: letters, digits and hyphens only, no "#" or spaces'))
      .default([]),
  }),
});

export const collections = { blog };
