import { getCollection, type CollectionEntry } from 'astro:content';

export type GameEntry = CollectionEntry<'games'>;

/** Games by `order`, then title; drafts only in `astro dev`. */
export async function getGames(): Promise<GameEntry[]> {
  const games = await getCollection('games', ({ data }) => import.meta.env.DEV || !data.draft);
  return games.sort(
    (a, b) =>
      (a.data.order ?? Infinity) - (b.data.order ?? Infinity) || a.data.title.localeCompare(b.data.title),
  );
}

export const gameHref = (game: GameEntry) => game.data.href ?? `/games/${game.id}/`;

/** Where a game build is served unless the game sets `src`. Shared with the <Game> component. */
export const gameBuildUrl = (slug: string) => `/games/${slug}/play/`;
export const gameSrc = (game: GameEntry) => game.data.src ?? gameBuildUrl(game.id);
