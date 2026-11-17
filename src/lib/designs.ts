import { getCollection } from 'astro:content';

const DESIGNS_PER_PAGE = 12;

export async function getDesignPages() {
  const designs = (await getCollection('designs')).sort(
    (a, b) => b.data.date.localeCompare(a.data.date) || a.id.localeCompare(b.id),
  );
  const pages = Array.from({ length: Math.ceil(designs.length / DESIGNS_PER_PAGE) }, (_, index) =>
    designs.slice(index * DESIGNS_PER_PAGE, (index + 1) * DESIGNS_PER_PAGE),
  );
  return { pages, total: designs.length };
}
