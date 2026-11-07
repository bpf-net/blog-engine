import type { APIRoute } from 'astro';
import { getPosts, getTags, tagHref, formatDate } from '../lib/posts';
import { getGames } from '../lib/games';
import { getModules } from '../lib/modules';

export const GET: APIRoute = async ({ site }) => {
  const posts = await getPosts();
  const entries: { path: string; lastmod?: Date }[] = [
    { path: '/', lastmod: posts[0]?.data.pubDate },
    ...posts.map((p) => ({ path: `/blog/${p.id}/`, lastmod: p.data.pubDate })),
    ...(await getGames()).map((g) => ({ path: `/games/${g.id}/`, lastmod: g.data.updated })),
    ...(await getModules()).map((m) => ({ path: `/modules/${m.id}/` })),
  ];
  const tags = await getTags();
  if (tags.length > 0) {
    entries.push({ path: '/tags/' }, ...tags.map(({ tag, posts }) => ({ path: tagHref(tag), lastmod: posts[0].data.pubDate })));
  }
  const urls = entries
    .map(({ path, lastmod }) => {
      const loc = new URL(path, site).href.replace(/&/g, '&amp;');
      return `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${formatDate(lastmod)}</lastmod>` : ''}</url>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
