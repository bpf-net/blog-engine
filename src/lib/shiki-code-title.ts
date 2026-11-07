// Shiki transformer: ```php title="app/etc/config.php" → <figure class="code-figure"> with a
// <figcaption> (file name left, language right) around the highlighted <pre>.
// Minimal HAST types, so the engine does not depend on `shiki` directly.
type HastText = { type: 'text'; value: string };
type HastElement = { type: 'element'; tagName: string; properties: Record<string, unknown>; children: HastNode[] };
type HastNode = HastElement | HastText | { type: string; [key: string]: unknown };
type HastRoot = { type: 'root'; children: HastNode[] };

const TITLE_RE = /(?:^|\s)title=(?:"([^"]*)"|'([^']*)'|(\S+))/;

const el = (tagName: string, className: string, children: HastNode[]): HastElement => ({
  type: 'element',
  tagName,
  properties: { className: [className] },
  children,
});
const text = (value: string): HastText => ({ type: 'text', value });

export const codeTitle = {
  name: 'blog-engine:code-title',
  root(this: { options: { lang?: string; meta?: { __raw?: string } } }, root: HastRoot) {
    const match = this.options.meta?.__raw?.match(TITLE_RE);
    const title = match && (match[1] ?? match[2] ?? match[3]);
    if (!title) return;
    const pre = root.children.find((n): n is HastElement => n.type === 'element' && (n as HastElement).tagName === 'pre');
    if (!pre) return;
    const lang = this.options.lang;
    const caption: HastNode[] = [el('span', 'code-figure-title', [text(title)])];
    if (lang && lang !== 'plaintext' && lang !== 'text') caption.push(el('span', 'code-figure-lang', [text(lang)]));
    root.children = root.children.map((n) =>
      n === pre ? el('figure', 'code-figure', [el('figcaption', 'code-figure-caption', caption), pre]) : n,
    );
  },
};
