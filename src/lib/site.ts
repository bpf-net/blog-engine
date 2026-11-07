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
  /** Site description: home page meta/Open Graph and the RSS channel. */
  description?: string;
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
  /** Heading and optional header link of the home page modules section. */
  modules: SectionConfig;
  /** Optional card at the bottom of the home page (e.g. "hire me"). */
  callout?: Callout;
}

export interface Callout {
  /** Anchor id, so a nav link can point at "/#<id>". Default "callout". */
  id?: string;
  title: string;
  text?: string;
  button?: NavLink;
}

export interface SectionConfig {
  title: string;
  link?: NavLink;
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
  modules: { title: 'Modules' },
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

function validateSection(section: unknown, field: string, fallback: SectionConfig, file: string): SectionConfig {
  if (section === undefined) return fallback;
  const ok =
    isObj(section) &&
    (section.title === undefined || typeof section.title === 'string') &&
    (section.link === undefined ||
      (isObj(section.link) && typeof section.link.label === 'string' && typeof section.link.href === 'string'));
  if (!ok) throw new Error(`${file}: "${field}" must be { "title"?: string, "link"?: { "label", "href" } }`);
  return { ...fallback, ...(section as Partial<SectionConfig>) };
}

function validateCallout(callout: unknown, file: string): Callout | undefined {
  if (callout === undefined) return undefined;
  const ok =
    isObj(callout) &&
    typeof callout.title === 'string' &&
    ['id', 'text'].every((k) => callout[k] === undefined || typeof callout[k] === 'string') &&
    (callout.id === undefined || /^[A-Za-z][\w-]*$/.test(callout.id as string)) &&
    (callout.button === undefined ||
      (isObj(callout.button) && typeof callout.button.label === 'string' && typeof callout.button.href === 'string'));
  if (!ok) {
    throw new Error(`${file}: "callout" must be { "title": string, "id"?: string, "text"?: string, "button"?: { "label", "href" } }`);
  }
  return callout as unknown as Callout;
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
    modules: validateSection(data.modules, 'modules', defaults.modules, file),
    callout: validateCallout(data.callout, file),
  };
}
