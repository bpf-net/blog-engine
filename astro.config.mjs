// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { fileURLToPath } from 'node:url';
import { CONTENT_DIR, loadSiteConfig } from './src/lib/site.ts';
import { bpfDark } from './src/lib/shiki-theme.ts';
import { codeTitle } from './src/lib/shiki-code-title.ts';

// Pin the resolved absolute path so bundled code (where import.meta.url points
// into dist/) and the content loader see exactly the same directory.
process.env.CONTENT_DIR = CONTENT_DIR;

export default defineConfig({
  site: loadSiteConfig().url,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      theme: bpfDark,
      transformers: [codeTitle],
    },
  },
  vite: {
    resolve: {
      // Posts live outside the project, so tsconfig "paths" does not cover them.
      alias: { '@components': fileURLToPath(new URL('./src/components', import.meta.url)) },
    },
    server: {
      // Without this `astro dev` refuses to serve images from an external CONTENT_DIR.
      fs: { allow: [fileURLToPath(new URL('.', import.meta.url)), CONTENT_DIR] },
    },
  },
});
