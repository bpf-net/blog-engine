import { getCollection, type CollectionEntry } from 'astro:content';

export type ModuleEntry = CollectionEntry<'modules'>;

/** Modules by `order`, then title; drafts only in `astro dev`. */
export async function getModules(): Promise<ModuleEntry[]> {
  const modules = await getCollection('modules', ({ data }) => import.meta.env.DEV || !data.draft);
  return modules.sort(
    (a, b) =>
      (a.data.order ?? Infinity) - (b.data.order ?? Infinity) || a.data.title.localeCompare(b.data.title),
  );
}

export const moduleHref = (mod: ModuleEntry) => mod.data.href ?? `/modules/${mod.id}/`;
