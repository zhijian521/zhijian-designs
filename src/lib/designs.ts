import { getCollection } from 'astro:content';

const DESIGNS_PER_PAGE = 12;

const DIGITS = ['', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];

// 卷次用中文数字，列表页与详情页共用：1-99 内都能拼出「拾贰」「贰拾叁」这样的写法。
export function volumeOf(index: number) {
  const n = index + 1;
  if (n < 10) return DIGITS[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  const prefix = tens === 1 ? '拾' : DIGITS[tens] + '拾';
  return prefix + DIGITS[ones];
}

export async function getDesignPages() {
  const designs = (await getCollection('designs')).sort(
    (a, b) => b.data.date.localeCompare(a.data.date) || a.id.localeCompare(b.id),
  );
  const pages = Array.from({ length: Math.ceil(designs.length / DESIGNS_PER_PAGE) }, (_, index) =>
    designs.slice(index * DESIGNS_PER_PAGE, (index + 1) * DESIGNS_PER_PAGE),
  );
  return { pages, total: designs.length };
}
