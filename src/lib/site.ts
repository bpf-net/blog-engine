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
  /** Header navigation links, in order. Empty = no navigation. */
  nav: NavLink[];
  /** Footer links, in order (next to the copyright). Empty = none. */
  footerLinks: NavLink[];
}

export interface NavLink {
  label: string;
  href: string;
}

const defaults: SiteConfig = {
  url: 'http://localhost:4321',
  title: 'Blog',
  author: 'Author',
  lang: 'en',
  nav: [],
  footerLinks: [],
};

function validateLinks(links: unknown, field: string, file: string): NavLink[] {
  if (links === undefined) return [];
  const ok =
    Array.isArray(links) &&
    links.every((l) => l && typeof l === 'object' && typeof l.label === 'string' && typeof l.href === 'string');
  if (!ok) throw new Error(`${file}: "${field}" must be an array of { "label": string, "href": string }`);
  return links as NavLink[];
}

export function loadSiteConfig(): SiteConfig {
  const file = path.join(CONTENT_DIR, 'site.json');
  if (!fs.existsSync(file)) return { ...defaults };
  const data = JSON.parse(fs.readFileSync(file, 'utf8')) as Partial<SiteConfig>;
  return {
    ...defaults,
    ...data,
    nav: validateLinks(data.nav, 'nav', file),
    footerLinks: validateLinks(data.footerLinks, 'footerLinks', file),
  };
}
