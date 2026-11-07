import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/** Posts newest first; drafts only in `astro dev`. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Posts that name this game in their `game` field, oldest first (devlog order). */
export async function getDevlog(gameId: string): Promise<Post[]> {
  const posts = await getPosts();
  return posts.filter((p) => p.data.game?.id === gameId).reverse();
}

/** Posts that name this module in their `module` field, newest first. */
export async function getPostsAboutModule(moduleId: string): Promise<Post[]> {
  return (await getPosts()).filter((p) => p.data.module?.id === moduleId);
}

export const tagHref = (tag: string) => `/tags/${encodeURIComponent(tag)}/`;

/** Every tag with its posts (newest first), tags sorted by post count, then name. */
export async function getTags(): Promise<{ tag: string; posts: Post[] }[]> {
  const byTag = new Map<string, Post[]>();
  for (const post of await getPosts()) {
    for (const tag of post.data.tags ?? []) byTag.set(tag, [...(byTag.get(tag) ?? []), post]);
  }
  return [...byTag]
    .map(([tag, posts]) => ({ tag, posts }))
    .sort((a, b) => b.posts.length - a.posts.length || a.tag.localeCompare(b.tag));
}

/** ISO date (YYYY-MM-DD), as shown in the design. */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
