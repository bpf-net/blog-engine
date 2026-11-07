import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const engineRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Absolute path to the content directory. Single source of truth for both
 * astro.config.mjs (fs.allow) and the content loader.
 * Relative CONTENT_DIR values are resolved against the current working directory.
 */
export const CONTENT_DIR = process.env.CONTENT_DIR
  ? path.resolve(process.env.CONTENT_DIR)
  : path.join(engineRoot, 'example-content');

export interface SiteConfig {
  url: string;
  title: string;
  author: string;
  lang: string;
}

const defaults: SiteConfig = {
  url: 'http://localhost:4321',
  title: 'Blog',
  author: 'Autor',
  lang: 'pl',
};

export function loadSiteConfig(): SiteConfig {
  const file = path.join(CONTENT_DIR, 'site.json');
  if (!fs.existsSync(file)) return { ...defaults };
  const data = JSON.parse(fs.readFileSync(file, 'utf8')) as Partial<SiteConfig>;
  return { ...defaults, ...data };
}
