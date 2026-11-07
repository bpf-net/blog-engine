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
  /** Optional hero on the home page. */
  hero?: Hero;
  /** Colour of individual tags (without "#"); others use the accent. */
  tagTones: Record<string, Tone>;
}

export interface NavLink {
  label: string;
  href: string;
}

export type Tone = 'plain' | 'muted' | 'accent' | 'amber' | 'blue';
export interface TerminalSpan {
  text: string;
  tone?: Tone;
}
/** `cmd` = a line typed after the prompt, `out` = output (plain text or coloured spans). */
export type TerminalLine = { cmd: string } | { out: string | TerminalSpan[] };

export interface Hero {
  /** Small mono line above the title, e.g. "// notes on X". */
  eyebrow?: string;
  /** Headline; "\n" breaks the line. */
  title: string;
  text?: string;
  /** First button is primary, the rest secondary. */
  buttons?: NavLink[];
  /** Fake terminal window next to the text; a prompt with a cursor is appended. */
  terminal?: TerminalLine[];
}

const defaults: SiteConfig = {
  url: 'http://localhost:4321',
  title: 'Blog',
  author: 'Author',
  lang: 'en',
  nav: [],
  footerLinks: [],
  tagTones: {},
};

function validateLinks(links: unknown, field: string, file: string): NavLink[] {
  if (links === undefined) return [];
  const ok =
    Array.isArray(links) &&
    links.every((l) => l && typeof l === 'object' && typeof l.label === 'string' && typeof l.href === 'string');
  if (!ok) throw new Error(`${file}: "${field}" must be an array of { "label": string, "href": string }`);
  return links as NavLink[];
}

const TONES: readonly string[] = ['plain', 'muted', 'accent', 'amber', 'blue'];
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const isSpan = (v: unknown) =>
  isObj(v) && typeof v.text === 'string' && (v.tone === undefined || TONES.includes(v.tone as string));
const isLine = (v: unknown) =>
  isObj(v) &&
  (typeof v.cmd === 'string' || typeof v.out === 'string' || (Array.isArray(v.out) && v.out.every(isSpan)));

function validateHero(hero: unknown, file: string): Hero | undefined {
  if (hero === undefined) return undefined;
  const fail = (what: string): never => {
    throw new Error(`${file}: "hero" ${what}`);
  };
  if (!isObj(hero)) fail('must be an object');
  const h = hero as Record<string, unknown>;
  if (typeof h.title !== 'string') fail('needs "title": string');
  for (const k of ['eyebrow', 'text'] as const) {
    if (h[k] !== undefined && typeof h[k] !== 'string') fail(`"${k}" must be a string`);
  }
  validateLinks(h.buttons, 'hero.buttons', file);
  if (h.terminal !== undefined && !(Array.isArray(h.terminal) && h.terminal.every(isLine))) {
    fail(`"terminal" must be an array of { "cmd": string } or { "out": string | [{ "text", "tone"? }] }; tones: ${TONES.join(', ')}`);
  }
  return h as unknown as Hero;
}

function validateTagTones(tones: unknown, file: string): Record<string, Tone> {
  if (tones === undefined) return {};
  if (!isObj(tones) || !Object.values(tones).every((t) => TONES.includes(t as string))) {
    throw new Error(`${file}: "tagTones" must map tag → tone (${TONES.join(', ')})`);
  }
  return tones as Record<string, Tone>;
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
    hero: validateHero(data.hero, file),
    tagTones: validateTagTones(data.tagTones, file),
  };
}
