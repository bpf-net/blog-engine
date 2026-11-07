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

/** ISO date (YYYY-MM-DD), as shown in the design. */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
