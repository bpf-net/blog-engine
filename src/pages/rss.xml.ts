import type { APIRoute } from 'astro';
import { getPosts } from '../lib/posts';
import { loadSiteConfig } from '../lib/site';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site: siteUrl }) => {
  const site = loadSiteConfig();
  const posts = await getPosts();
  const abs = (path: string) => new URL(path, siteUrl).href;
  const items = posts
    .map((post) => {
      const url = abs(`/blog/${post.id}/`);
      return [
        '    <item>',
        `      <title>${esc(post.data.title)}</title>`,
        `      <link>${esc(url)}</link>`,
        `      <guid isPermaLink="true">${esc(url)}</guid>`,
        `      <pubDate>${post.data.pubDate.toUTCString()}</pubDate>`,
        `      <description>${esc(post.data.description)}</description>`,
        ...(post.data.tags ?? []).map((t) => `      <category>${esc(t)}</category>`),
        '    </item>',
      ].join('\n');
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(site.title)}</title>
    <link>${esc(abs('/'))}</link>
    <description>${esc(site.description ?? site.title)}</description>
    <language>${esc(site.lang)}</language>
    <atom:link href="${esc(abs('/rss.xml'))}" rel="self" type="application/rss+xml" />
${posts[0] ? `    <lastBuildDate>${posts[0].data.pubDate.toUTCString()}</lastBuildDate>\n` : ''}${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
