import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/** Posts newest first; drafts only in `astro dev`. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** ISO date (YYYY-MM-DD), as shown in the design. */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
